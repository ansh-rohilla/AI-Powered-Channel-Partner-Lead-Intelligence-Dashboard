from marshmallow import Schema, fields, validate

class PartnerSchema(Schema):
    partner_id = fields.Str(required=False)  # Allowed on creation if specified, otherwise generated
    company_name = fields.Str(required=True, validate=validate.Length(min=1, max=255))
    contact_name = fields.Str(required=True, validate=validate.Length(min=1, max=255))
    contact_email = fields.Email(required=True, validate=validate.Length(max=255))
    phone = fields.Str(validate=validate.Length(max=20), allow_none=True)
    region = fields.Str(required=True, validate=validate.OneOf(["North", "South", "East", "West", "Central"]))
    city = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    tier = fields.Str(required=False, validate=validate.OneOf(["Gold", "Silver", "Bronze"]))
    annual_revenue_inr = fields.Float(validate=validate.Range(min=0.0))
    deal_count = fields.Int(validate=validate.Range(min=0))
    active_leads = fields.Int(validate=validate.Range(min=0))
    last_activity_date = fields.Date(allow_none=True)
    onboarded_date = fields.Date(required=True)
    product_categories = fields.Str(allow_none=True)
    status = fields.Str(validate=validate.OneOf(["Active", "Inactive"]))
