from flask import Blueprint, request, jsonify
from app.database import db
from app.models.lead import Lead
from app.models.partner import Partner
from datetime import datetime, date

leads_bp = Blueprint('leads', __name__)

def parse_date(date_str):
    if not date_str or str(date_str).strip() in ('', 'None', 'null'):
        return None
    try:
        return datetime.strptime(str(date_str).split('T')[0], "%Y-%m-%d").date()
    except Exception:
        return None

@leads_bp.route('', methods=['GET'])
def get_leads():
    status = request.args.get('status')
    partner_id = request.args.get('partner')  # query param 'partner' maps to partner_id
    region = request.args.get('region')

    query = Lead.query

    if status:
        query = query.filter(Lead.status == status)
    if partner_id:
        query = query.filter(Lead.partner_id == partner_id)
    if region:
        query = query.filter(Lead.region == region)

    leads = query.all()
    return jsonify([l.to_dict() for l in leads]), 200

@leads_bp.route('', methods=['POST'])
def create_lead():
    data = request.get_json() or {}

    # Required fields validation
    required_fields = ['partner_id', 'company_name', 'contact_name', 'contact_email',
                       'region', 'lead_source', 'product_interest', 'deal_value_inr']
    
    missing = [f for f in required_fields if f not in data]
    if missing:
        return jsonify({"success": False, "message": f"Missing required fields: {', '.join(missing)}"}), 400

    # Verify partner exists
    partner = db.session.get(Partner, data['partner_id'])
    if not partner:
        return jsonify({"success": False, "message": "Assigned Partner ID does not exist"}), 404

    # Generate sequential ID if not provided
    lead_id = data.get('lead_id')
    if not lead_id:
        count = Lead.query.count()
        lead_id = f"L-2026-{count + 1:04d}"

    # Auto-calculate conversion status based on pipeline stage
    status = data.get('status', 'New')
    converted = 1 if status == 'Converted' else 0
    conversion_date = parse_date(data.get('conversion_date')) if converted else None
    if converted and not conversion_date:
        conversion_date = date.today()

    lead = Lead(
        lead_id=lead_id,
        partner_id=data['partner_id'],
        company_name=data['company_name'],
        contact_name=data['contact_name'],
        contact_email=data['contact_email'],
        region=data['region'],
        lead_source=data['lead_source'],
        product_interest=data['product_interest'],
        deal_value_inr=float(data['deal_value_inr']),
        status=status,
        created_date=parse_date(data.get('created_date')) or date.today(),
        last_contacted=parse_date(data.get('last_contacted')),
        follow_up_count=int(data.get('follow_up_count', 0)),
        time_to_first_contact=None if data.get('time_to_first_contact') is None else int(data['time_to_first_contact']),
        converted=converted,
        conversion_date=conversion_date,
        ml_score=None if data.get('ml_score') is None else float(data['ml_score']),
        notes=data.get('notes', '')
    )

    try:
        db.session.add(lead)
        db.session.commit()
        return jsonify({"success": True, "message": "Lead created successfully", "lead": lead.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": f"Error creating lead: {str(e)}"}), 500

@leads_bp.route('/<string:lead_id>', methods=['PUT'])
def update_lead(lead_id):
    lead = db.session.get(Lead, lead_id)
    if not lead:
        return jsonify({"success": False, "message": "Lead not found"}), 404

    data = request.get_json() or {}

    # List of allowed update fields
    allowed_fields = [
        'company_name', 'contact_name', 'contact_email', 'region',
        'lead_source', 'product_interest', 'deal_value_inr', 'status',
        'follow_up_count', 'time_to_first_contact', 'ml_score', 'notes'
    ]

    for field in allowed_fields:
        if field in data:
            val = data[field]
            if field == 'deal_value_inr':
                val = float(val) if val is not None else 0.0
            elif field == 'follow_up_count':
                val = int(val) if val is not None else 0
            elif field == 'time_to_first_contact':
                val = int(val) if val is not None else None
            elif field == 'ml_score':
                val = float(val) if val is not None else None
            setattr(lead, field, val)

    # Date fields parsing
    if 'last_contacted' in data:
        lead.last_contacted = parse_date(data['last_contacted'])

    # Special handling for pipeline conversion logic
    if 'status' in data:
        new_status = data['status']
        if new_status == 'Converted':
            lead.converted = 1
            if not lead.conversion_date:
                lead.conversion_date = parse_date(data.get('conversion_date')) or date.today()
        else:
            lead.converted = 0
            lead.conversion_date = None

    # Allow changing conversion_date directly
    if 'conversion_date' in data and lead.converted == 1:
        lead.conversion_date = parse_date(data['conversion_date']) or date.today()

    try:
        db.session.commit()
        return jsonify({"success": True, "message": "Lead updated successfully", "lead": lead.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": f"Error updating lead: {str(e)}"}), 500
