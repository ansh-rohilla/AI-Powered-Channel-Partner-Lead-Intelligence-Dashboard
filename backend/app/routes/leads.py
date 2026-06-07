from flask import Blueprint, request, jsonify
from app.database import db
from app.models.lead import Lead
from app.models.partner import Partner
from app.schemas.lead_schema import LeadSchema
from datetime import date

leads_bp = Blueprint('leads', __name__)

@leads_bp.route('', methods=['GET'])
def get_leads():
    # 1. Parse filter parameters
    status = request.args.get('status')
    partner_id = request.args.get('partner')
    region = request.args.get('region')
    search_query = request.args.get('q')

    # 2. Parse sorting parameters
    sort_by = request.args.get('sort_by', 'created_date')
    sort_dir = request.args.get('sort_dir', 'desc')

    # 3. Parse pagination parameters
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    query = Lead.query

    # Apply filters
    if status:
        query = query.filter(Lead.status == status)
    if partner_id:
        query = query.filter(Lead.partner_id == partner_id)
    if region:
        query = query.filter(Lead.region == region)
    if search_query:
        query = query.filter(
            (Lead.company_name.ilike(f"%{search_query}%")) |
            (Lead.contact_name.ilike(f"%{search_query}%"))
        )

    # Apply sorting
    sort_column = getattr(Lead, sort_by, None)
    if sort_column is None:
        sort_column = Lead.created_date

    if sort_dir == 'desc':
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())

    # Execute pagination
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    leads = pagination.items

    # Serialize
    schema = LeadSchema(many=True)
    serialized_leads = schema.dump(leads)

    return jsonify({
        "success": True,
        "data": serialized_leads,
        "pagination": {
            "page": pagination.page,
            "per_page": pagination.per_page,
            "total_items": pagination.total,
            "total_pages": pagination.pages,
            "has_next": pagination.has_next,
            "has_prev": pagination.has_prev
        }
    }), 200

@leads_bp.route('/<string:lead_id>', methods=['GET'])
def get_lead(lead_id):
    lead = db.session.get(Lead, lead_id)
    if not lead:
        return jsonify({"success": False, "message": "Lead not found"}), 404
    
    return jsonify({
        "success": True,
        "data": LeadSchema().dump(lead)
    }), 200

@leads_bp.route('', methods=['POST'])
def create_lead():
    data = request.get_json() or {}

    # Load and validate using Marshmallow (raises ValidationError if invalid)
    schema = LeadSchema()
    validated_data = schema.load(data)

    # Verify partner exists
    partner = db.session.get(Partner, validated_data['partner_id'])
    if not partner:
        return jsonify({"success": False, "message": "Assigned Partner ID does not exist"}), 404

    # Generate sequential ID if not provided
    lead_id = validated_data.get('lead_id')
    if not lead_id:
        count = Lead.query.count()
        lead_id = f"L-2026-{count + 1:04d}"

    # Auto-calculate conversion status based on pipeline stage
    status = validated_data.get('status', 'New')
    converted = 1 if status == 'Converted' else 0
    conversion_date = validated_data.get('conversion_date') if converted else None
    if converted and not conversion_date:
        conversion_date = date.today()

    # Calculate ML score automatically
    try:
        from app.services.prediction_service import predict_single_lead
        pred_data = {
            "partner_id": validated_data['partner_id'],
            "deal_value_inr": validated_data['deal_value_inr'],
            "follow_up_count": validated_data.get('follow_up_count', 0),
            "time_to_first_contact": validated_data.get('time_to_first_contact'),
            "region": validated_data['region'],
            "lead_source": validated_data['lead_source'],
            "product_interest": validated_data['product_interest']
        }
        res = predict_single_lead(pred_data)
        ml_score = res['ml_score']
    except Exception:
        ml_score = validated_data.get('ml_score')

    lead = Lead(
        lead_id=lead_id,
        partner_id=validated_data['partner_id'],
        company_name=validated_data['company_name'],
        contact_name=validated_data['contact_name'],
        contact_email=validated_data['contact_email'],
        region=validated_data['region'],
        lead_source=validated_data['lead_source'],
        product_interest=validated_data['product_interest'],
        deal_value_inr=validated_data['deal_value_inr'],
        status=status,
        created_date=validated_data.get('created_date') or date.today(),
        last_contacted=validated_data.get('last_contacted'),
        follow_up_count=validated_data.get('follow_up_count', 0),
        time_to_first_contact=validated_data.get('time_to_first_contact'),
        converted=converted,
        conversion_date=conversion_date,
        ml_score=ml_score,
        notes=validated_data.get('notes', '')
    )

    try:
        db.session.add(lead)
        db.session.commit()
        return jsonify({"success": True, "message": "Lead created successfully", "lead": schema.dump(lead)}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": f"Error creating lead: {str(e)}"}), 500

@leads_bp.route('/<string:lead_id>', methods=['PUT'])
def update_lead(lead_id):
    lead = db.session.get(Lead, lead_id)
    if not lead:
        return jsonify({"success": False, "message": "Lead not found"}), 404

    data = request.get_json() or {}

    # Partial load and validation using Marshmallow
    schema = LeadSchema(partial=True)
    validated_data = schema.load(data)

    # Update fields
    for field, val in validated_data.items():
        setattr(lead, field, val)

    # Special handling for pipeline conversion logic
    if 'status' in validated_data:
        new_status = validated_data['status']
        if new_status == 'Converted':
            lead.converted = 1
            if not lead.conversion_date:
                lead.conversion_date = validated_data.get('conversion_date') or date.today()
        else:
            lead.converted = 0
            lead.conversion_date = None

    # Recalculate ML score dynamically if features changed
    trigger_fields = ['deal_value_inr', 'follow_up_count', 'time_to_first_contact', 'region', 'lead_source', 'product_interest']
    if any(f in validated_data for f in trigger_fields):
        try:
            from app.services.prediction_service import predict_single_lead
            pred_data = {
                "partner_id": lead.partner_id,
                "deal_value_inr": lead.deal_value_inr,
                "follow_up_count": lead.follow_up_count,
                "time_to_first_contact": lead.time_to_first_contact,
                "region": lead.region,
                "lead_source": lead.lead_source,
                "product_interest": lead.product_interest
            }
            res = predict_single_lead(pred_data)
            lead.ml_score = res['ml_score']
        except Exception:
            pass

    try:
        db.session.commit()
        return jsonify({
            "success": True,
            "message": "Lead updated successfully",
            "lead": LeadSchema().dump(lead)
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": f"Error updating lead: {str(e)}"}), 500

@leads_bp.route('/<string:lead_id>', methods=['DELETE'])
def delete_lead(lead_id):
    lead = db.session.get(Lead, lead_id)
    if not lead:
        return jsonify({"success": False, "message": "Lead not found"}), 404

    try:
        db.session.delete(lead)
        db.session.commit()
        return jsonify({"success": True, "message": f"Lead '{lead_id}' deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": f"Error deleting lead: {str(e)}"}), 500
