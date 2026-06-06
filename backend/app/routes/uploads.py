import os
import pandas as pd
from flask import Blueprint, request, jsonify
from app.database import db
from app.models.partner import Partner
from app.models.lead import Lead
from app.schemas.partner_schema import PartnerSchema
from app.schemas.lead_schema import LeadSchema
from app.services.tier_service import calculate_tier
from marshmallow import ValidationError
from datetime import datetime, date

uploads_bp = Blueprint('uploads', __name__)

ALLOWED_EXTENSIONS = {'csv', 'xlsx', 'xls'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def sanitize_row(row_dict):
    """Convert NaN/Nat values in a dictionary to None for Marshmallow compatibility."""
    return {k: (None if pd.isna(v) else v) for k, v in row_dict.items()}

def parse_date_safely(val):
    if val is None:
        return None
    if isinstance(val, (date, datetime)):
        return val.strftime("%Y-%m-%d")
    try:
        # If it's a timestamp format or ISO format
        return str(val).split()[0]
    except Exception:
        return str(val)

@uploads_bp.route('/partners', methods=['POST'])
def upload_partners():
    if 'file' not in request.files:
        return jsonify({"success": False, "message": "No file part in request"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"success": False, "message": "No file selected"}), 400

    if not allowed_file(file.filename):
        return jsonify({"success": False, "message": "Unsupported file format. Use CSV or Excel (.xlsx/.xls)"}), 400

    try:
        # Load into Pandas DataFrame
        filename = file.filename.lower()
        if filename.endswith('.csv'):
            df = pd.read_csv(file)
        else:
            df = pd.read_excel(file)

        partner_schema = PartnerSchema()
        errors = []
        inserted = 0
        updated = 0

        # Enforce column schema checks
        required_cols = ['company_name', 'contact_name', 'contact_email', 'region', 'city', 'onboarded_date']
        missing_cols = [col for col in required_cols if col not in df.columns]
        if missing_cols:
            return jsonify({"success": False, "message": f"Missing required columns in sheet: {', '.join(missing_cols)}"}), 400

        for index, row in df.iterrows():
            row_dict = sanitize_row(row.to_dict())
            
            # Format dates properly
            if 'onboarded_date' in row_dict:
                row_dict['onboarded_date'] = parse_date_safely(row_dict['onboarded_date'])
            if 'last_activity_date' in row_dict:
                row_dict['last_activity_date'] = parse_date_safely(row_dict['last_activity_date'])

            row_num = index + 2  # 1-based index (accounting for header row)

            try:
                # Validate using Marshmallow schema
                validated = partner_schema.load(row_dict)
                
                # Check duplicate by partner_id or contact_email
                partner = None
                p_id = validated.get('partner_id')
                if p_id:
                    partner = db.session.get(Partner, p_id)
                
                if not partner:
                    partner = Partner.query.filter_by(contact_email=validated['contact_email']).first()

                # Recalculate tier dynamically
                rev = validated.get('annual_revenue_inr', 0.0)
                deals = validated.get('deal_count', 0)
                tier = calculate_tier(rev, deals)

                if partner:
                    # Update existing
                    partner.company_name = validated['company_name']
                    partner.contact_name = validated['contact_name']
                    partner.phone = validated.get('phone')
                    partner.region = validated['region']
                    partner.city = validated['city']
                    partner.tier = tier
                    partner.annual_revenue_inr = rev
                    partner.deal_count = deals
                    partner.active_leads = validated.get('active_leads', 0)
                    partner.last_activity_date = validated.get('last_activity_date')
                    partner.onboarded_date = validated['onboarded_date']
                    partner.product_categories = validated.get('product_categories')
                    partner.status = validated.get('status', 'Active')
                    updated += 1
                else:
                    # Create new
                    if not p_id:
                        count = Partner.query.count()
                        p_id = f"P-2024-{count + 1:03d}"
                        
                    new_partner = Partner(
                        partner_id=p_id,
                        company_name=validated['company_name'],
                        contact_name=validated['contact_name'],
                        contact_email=validated['contact_email'],
                        phone=validated.get('phone'),
                        region=validated['region'],
                        city=validated['city'],
                        tier=tier,
                        annual_revenue_inr=rev,
                        deal_count=deals,
                        active_leads=validated.get('active_leads', 0),
                        last_activity_date=validated.get('last_activity_date'),
                        onboarded_date=validated['onboarded_date'],
                        product_categories=validated.get('product_categories'),
                        status=validated.get('status', 'Active')
                    )
                    db.session.add(new_partner)
                    inserted += 1

            except ValidationError as val_err:
                errors.append({"row": row_num, "errors": val_err.messages})
            except Exception as e:
                errors.append({"row": row_num, "error": f"Row processing error: {str(e)}"})

        if inserted > 0 or updated > 0:
            db.session.commit()

        success = (inserted > 0 or updated > 0)
        return jsonify({
            "success": success,
            "message": "Partners data ingestion complete.",
            "inserted": inserted,
            "updated": updated,
            "failed": len(errors),
            "errors": errors
        }), 200 if success else 400

    except Exception as e:
        return jsonify({"success": False, "message": f"Ingestion pipeline error: {str(e)}"}), 500


@uploads_bp.route('/leads', methods=['POST'])
def upload_leads():
    if 'file' not in request.files:
        return jsonify({"success": False, "message": "No file part in request"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"success": False, "message": "No file selected"}), 400

    if not allowed_file(file.filename):
        return jsonify({"success": False, "message": "Unsupported file format. Use CSV or Excel (.xlsx/.xls)"}), 400

    try:
        filename = file.filename.lower()
        if filename.endswith('.csv'):
            df = pd.read_csv(file)
        else:
            df = pd.read_excel(file)

        lead_schema = LeadSchema()
        errors = []
        inserted = 0
        updated = 0

        # Enforce column schema checks
        required_cols = ['partner_id', 'company_name', 'contact_name', 'contact_email', 
                         'region', 'lead_source', 'product_interest', 'deal_value_inr', 'created_date']
        missing_cols = [col for col in required_cols if col not in df.columns]
        if missing_cols:
            return jsonify({"success": False, "message": f"Missing required columns in sheet: {', '.join(missing_cols)}"}), 400

        for index, row in df.iterrows():
            row_dict = sanitize_row(row.to_dict())
            
            # Format dates properly
            if 'created_date' in row_dict:
                row_dict['created_date'] = parse_date_safely(row_dict['created_date'])
            if 'last_contacted' in row_dict:
                row_dict['last_contacted'] = parse_date_safely(row_dict['last_contacted'])
            if 'conversion_date' in row_dict:
                row_dict['conversion_date'] = parse_date_safely(row_dict['conversion_date'])

            row_num = index + 2  # 1-based index (accounting for header row)

            try:
                # Validate using Marshmallow schema
                validated = lead_schema.load(row_dict)

                # Verify partner exists
                partner = db.session.get(Partner, validated['partner_id'])
                if not partner:
                    errors.append({"row": row_num, "errors": {"partner_id": ["Assigned Partner ID does not exist in master records."]}})
                    continue

                # Auto-calculate conversion properties
                status = validated.get('status', 'New')
                converted = 1 if status == 'Converted' else 0
                conversion_date = validated.get('conversion_date') if converted else None
                if converted and not conversion_date:
                    conversion_date = date.today()

                # Check duplicate by lead_id or email
                lead = None
                l_id = validated.get('lead_id')
                if l_id:
                    lead = db.session.get(Lead, l_id)
                if not lead:
                    lead = Lead.query.filter_by(contact_email=validated['contact_email']).first()

                if lead:
                    # Update existing
                    lead.partner_id = validated['partner_id']
                    lead.company_name = validated['company_name']
                    lead.contact_name = validated['contact_name']
                    lead.region = validated['region']
                    lead.lead_source = validated['lead_source']
                    lead.product_interest = validated['product_interest']
                    lead.deal_value_inr = validated['deal_value_inr']
                    lead.status = status
                    lead.created_date = validated.get('created_date') or lead.created_date
                    lead.last_contacted = validated.get('last_contacted')
                    lead.follow_up_count = validated.get('follow_up_count', 0)
                    lead.time_to_first_contact = validated.get('time_to_first_contact')
                    lead.converted = converted
                    lead.conversion_date = conversion_date
                    lead.ml_score = validated.get('ml_score')
                    lead.notes = validated.get('notes', '')
                    updated += 1
                else:
                    # Create new
                    if not l_id:
                        count = Lead.query.count()
                        l_id = f"L-2026-{count + 1:04d}"

                    new_lead = Lead(
                        lead_id=l_id,
                        partner_id=validated['partner_id'],
                        company_name=validated['company_name'],
                        contact_name=validated['contact_name'],
                        contact_email=validated['contact_email'],
                        region=validated['region'],
                        lead_source=validated['lead_source'],
                        product_interest=validated['product_interest'],
                        deal_value_inr=validated['deal_value_inr'],
                        status=status,
                        created_date=validated.get('created_date') or date.today(),
                        last_contacted=validated.get('last_contacted'),
                        follow_up_count=validated.get('follow_up_count', 0),
                        time_to_first_contact=validated.get('time_to_first_contact'),
                        converted=converted,
                        conversion_date=conversion_date,
                        ml_score=validated.get('ml_score'),
                        notes=validated.get('notes', '')
                    )
                    db.session.add(new_lead)
                    inserted += 1

            except ValidationError as val_err:
                errors.append({"row": row_num, "errors": val_err.messages})
            except Exception as e:
                errors.append({"row": row_num, "error": f"Row processing error: {str(e)}"})

        if inserted > 0 or updated > 0:
            db.session.commit()

        success = (inserted > 0 or updated > 0)
        return jsonify({
            "success": success,
            "message": "Leads data ingestion complete.",
            "inserted": inserted,
            "updated": updated,
            "failed": len(errors),
            "errors": errors
        }), 200 if success else 400

    except Exception as e:
        return jsonify({"success": False, "message": f"Ingestion pipeline error: {str(e)}"}), 500
