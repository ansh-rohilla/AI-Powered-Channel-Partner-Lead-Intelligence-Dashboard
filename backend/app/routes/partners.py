from flask import Blueprint, request, jsonify
from app.database import db
from app.models.partner import Partner
from app.schemas.partner_schema import PartnerSchema
from app.schemas.lead_schema import LeadSchema
from app.services.tier_service import calculate_tier

partners_bp = Blueprint('partners', __name__)

@partners_bp.route('', methods=['GET'])
def get_partners():
    # 1. Parse filter parameters
    tier = request.args.get('tier')
    region = request.args.get('region')
    status = request.args.get('status')
    search_query = request.args.get('q')
    
    # 2. Parse sorting parameters
    sort_by = request.args.get('sort_by', 'company_name')
    sort_dir = request.args.get('sort_dir', 'asc')
    
    # 3. Parse pagination parameters
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    query = Partner.query

    # Apply filters
    if tier:
        query = query.filter(Partner.tier == tier)
    if region:
        query = query.filter(Partner.region == region)
    if status:
        query = query.filter(Partner.status == status)
    if search_query:
        query = query.filter(
            (Partner.company_name.ilike(f"%{search_query}%")) |
            (Partner.contact_name.ilike(f"%{search_query}%"))
        )

    # Apply sorting
    sort_column = getattr(Partner, sort_by, None)
    if sort_column is None:
        sort_column = Partner.company_name
        
    if sort_dir == 'desc':
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())

    # Execute pagination
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    partners = pagination.items

    # Serialize
    schema = PartnerSchema(many=True)
    serialized_partners = schema.dump(partners)

    return jsonify({
        "success": True,
        "data": serialized_partners,
        "pagination": {
            "page": pagination.page,
            "per_page": pagination.per_page,
            "total_items": pagination.total,
            "total_pages": pagination.pages,
            "has_next": pagination.has_next,
            "has_prev": pagination.has_prev
        }
    }), 200

@partners_bp.route('/<string:partner_id>', methods=['GET'])
def get_partner(partner_id):
    partner = db.session.get(Partner, partner_id)
    if not partner:
        return jsonify({"success": False, "message": "Partner not found"}), 404

    # Serialize partner details and lead history
    partner_schema = PartnerSchema()
    lead_schema = LeadSchema(many=True)

    partner_data = partner_schema.dump(partner)
    partner_data['leads'] = lead_schema.dump(partner.leads)

    return jsonify({
        "success": True,
        "data": partner_data
    }), 200

@partners_bp.route('/<string:partner_id>', methods=['PUT'])
def update_partner(partner_id):
    partner = db.session.get(Partner, partner_id)
    if not partner:
        return jsonify({"success": False, "message": "Partner not found"}), 404

    data = request.get_json() or {}

    # Partial load and validation using Marshmallow
    schema = PartnerSchema(partial=True)
    validated_data = schema.load(data)

    # Update columns
    for field, val in validated_data.items():
        setattr(partner, field, val)

    # Auto-calculate tier if revenue or deals changed
    if 'annual_revenue_inr' in validated_data or 'deal_count' in validated_data:
        partner.tier = calculate_tier(partner.annual_revenue_inr, partner.deal_count)

    try:
        db.session.commit()
        return jsonify({
            "success": True,
            "message": "Partner updated successfully",
            "partner": PartnerSchema().dump(partner)
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": f"Error updating partner: {str(e)}"}), 500

@partners_bp.route('/<string:partner_id>', methods=['DELETE'])
def delete_partner(partner_id):
    partner = db.session.get(Partner, partner_id)
    if not partner:
        return jsonify({"success": False, "message": "Partner not found"}), 404

    try:
        db.session.delete(partner)
        db.session.commit()
        return jsonify({"success": True, "message": f"Partner '{partner_id}' and all associated leads deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": f"Error deleting partner: {str(e)}"}), 500
