import time
from flask import Blueprint, request, jsonify, current_app
from marshmallow import ValidationError
from app.database import db
from app import cache
from app.models.lead import Lead
from app.models.partner import Partner
from app.schemas.lead_schema import LeadSchema
from app.services.prediction_service import predict_single_lead

predictions_bp = Blueprint('predictions', __name__)

@predictions_bp.route('', methods=['POST'])
def predict_lead():
    start_time = time.time()
    data = request.get_json() or {}
    
    # 1. Check required partner_id explicitly
    if not data.get('partner_id'):
        return jsonify({"success": False, "message": "Missing required field 'partner_id'"}), 400
        
    # 2. Schema validation via Marshmallow
    try:
        schema = LeadSchema(partial=True)
        validated_data = schema.load(data)
    except ValidationError as err:
        return jsonify({
            "success": False,
            "error": "ValidationError",
            "message": "Input validation failed for features",
            "details": err.messages
        }), 400

    try:
        result = predict_single_lead(validated_data)
        latency = (time.time() - start_time) * 1000
        
        return jsonify({
            "success": True,
            "lead_id": data.get('lead_id', 'L-2026-TEMP'),
            "ml_score": result['ml_score'],
            "priority_label": result['priority_label'],
            "explanation": result['explanation'],
            "latency_ms": round(latency, 2)
        }), 200
    except Exception as e:
        current_app.logger.error(f"Prediction error for payload {data}: {str(e)}", exc_info=True)
        return jsonify({"success": False, "message": f"Prediction error: {str(e)}"}), 500

@predictions_bp.route('/batch', methods=['POST'])
def predict_batch():
    start_time = time.time()
    data = request.get_json() or {}
    
    # Mode 1: Array of leads provided in the payload
    if 'leads' in data and isinstance(data['leads'], list):
        results = []
        schema = LeadSchema(partial=True)
        
        for idx, item in enumerate(data['leads']):
            lead_id = item.get('lead_id', f'L-2026-TEMP-{idx}')
            if not item.get('partner_id'):
                results.append({
                    "success": False, 
                    "lead_id": lead_id,
                    "message": "Missing 'partner_id'"
                })
                continue
                
            try:
                # Validate item schema
                validated_item = schema.load(item)
                res = predict_single_lead(validated_item)
                results.append({
                    "success": True,
                    "lead_id": lead_id,
                    "ml_score": res['ml_score'],
                    "priority_label": res['priority_label'],
                    "explanation": res['explanation']
                })
            except ValidationError as err:
                results.append({
                    "success": False,
                    "lead_id": lead_id,
                    "error": "ValidationError",
                    "details": err.messages
                })
            except Exception as e:
                results.append({
                    "success": False, 
                    "lead_id": lead_id,
                    "message": str(e)
                })
                
        latency = (time.time() - start_time) * 1000
        current_app.logger.info(f"API Batch Prediction | Processed {len(data['leads'])} items | Latency: {latency:.2f}ms")
        
        return jsonify({
            "success": True,
            "results": results,
            "latency_ms": round(latency, 2)
        }), 200
        
    # Mode 2: Trigger batch scoring and updating of all unscored leads (ml_score is NULL) in DB
    try:
        # Optimized with joinedload to fetch lead and partner tier in a single query
        unscored_leads = db.session.query(Lead).options(db.joinedload(Lead.partner)).filter(Lead.ml_score.is_(None)).all()
        scored_count = 0
        
        for lead in unscored_leads:
            lead_dict = {
                "lead_id": lead.lead_id,
                "partner_id": lead.partner_id,
                "partner_tier": lead.partner.tier if lead.partner else "Bronze",
                "deal_value_inr": lead.deal_value_inr,
                "follow_up_count": lead.follow_up_count,
                "time_to_first_contact": lead.time_to_first_contact,
                "region": lead.region,
                "lead_source": lead.lead_source,
                "product_interest": lead.product_interest
            }
            # Predict (skips DB query inside predict_single_lead because partner_tier is provided)
            res = predict_single_lead(lead_dict)
            lead.ml_score = res['ml_score']
            scored_count += 1
            
        if scored_count > 0:
            db.session.commit()
            try:
                cache.clear()
            except Exception:
                pass
            
        latency = (time.time() - start_time) * 1000
        current_app.logger.info(
            f"DB Sync Batch Prediction | Scored {scored_count} leads in database | Latency: {latency:.2f}ms"
        )
        
        return jsonify({
            "success": True,
            "message": f"Successfully batch-scored and updated {scored_count} leads in the database.",
            "scored_count": scored_count,
            "latency_ms": round(latency, 2)
        }), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Batch DB prediction error: {str(e)}", exc_info=True)
        return jsonify({"success": False, "message": f"Batch database prediction error: {str(e)}"}), 500
