from flask import Blueprint, request, jsonify
from app.database import db
from app.models.partner import Partner
from datetime import datetime

partners_bp = Blueprint('partners', __name__)

def parse_date(date_str):
    if not date_str or str(date_str).strip() in ('', 'None', 'null'):
        return None
    try:
        return datetime.strptime(str(date_str).split('T')[0], "%Y-%m-%d").date()
    except Exception:
        return None

@partners_bp.route('', methods=['GET'])
def get_partners():
    tier = request.args.get('tier')
    region = request.args.get('region')
    status = request.args.get('status')

    query = Partner.query

    if tier:
        query = query.filter(Partner.tier == tier)
    if region:
        query = query.filter(Partner.region == region)
    if status:
        query = query.filter(Partner.status == status)

    partners = query.all()
    return jsonify([p.to_dict() for p in partners]), 200

@partners_bp.route('/<string:partner_id>', methods=['GET'])
def get_partner(partner_id):
    partner = db.session.get(Partner, partner_id)
    if not partner:
        return jsonify({"success": False, "message": "Partner not found"}), 404

    # Build response with detailed partner info and lead history
    partner_data = partner.to_dict()
    partner_data['leads'] = [lead.to_dict() for lead in partner.leads]

    return jsonify(partner_data), 200

@partners_bp.route('/<string:partner_id>', methods=['PUT'])
def update_partner(partner_id):
    partner = db.session.get(Partner, partner_id)
    if not partner:
        return jsonify({"success": False, "message": "Partner not found"}), 404

    data = request.get_json() or {}

    # List of allowed update fields
    allowed_fields = [
        'company_name', 'contact_name', 'contact_email', 'phone',
        'region', 'city', 'tier', 'annual_revenue_inr', 'deal_count',
        'active_leads', 'product_categories', 'status'
    ]

    for field in allowed_fields:
        if field in data:
            val = data[field]
            # Handle float and int parsing safely
            if field == 'annual_revenue_inr':
                val = float(val) if val is not None else 0.0
            elif field == 'deal_count':
                val = int(val) if val is not None else 0
            elif field == 'active_leads':
                val = int(val) if val is not None else 0
            setattr(partner, field, val)

    # Date fields need parsing
    if 'last_activity_date' in data:
        partner.last_activity_date = parse_date(data['last_activity_date'])
    if 'onboarded_date' in data:
        parsed_onboarded = parse_date(data['onboarded_date'])
        if parsed_onboarded:
            partner.onboarded_date = parsed_onboarded

    try:
        db.session.commit()
        return jsonify({"success": True, "message": "Partner updated successfully", "partner": partner.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": f"Error updating partner: {str(e)}"}), 500
