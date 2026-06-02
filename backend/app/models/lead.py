from app.database import db
from datetime import datetime

class Lead(db.Model):
    __tablename__ = 'leads'

    lead_id = db.Column(db.String(36), primary_key=True)
    partner_id = db.Column(db.String(36), db.ForeignKey('partners.partner_id'), nullable=False)
    company_name = db.Column(db.String(255), nullable=False)
    contact_name = db.Column(db.String(255), nullable=False)
    contact_email = db.Column(db.String(255), nullable=False)
    region = db.Column(db.String(50), nullable=False)
    lead_source = db.Column(db.String(50), nullable=False)
    product_interest = db.Column(db.String(100), nullable=False)
    deal_value_inr = db.Column(db.Float, nullable=False, default=0.0)
    status = db.Column(db.String(50), nullable=False, default='New')
    created_date = db.Column(db.Date, nullable=False)
    last_contacted = db.Column(db.Date)
    follow_up_count = db.Column(db.Integer, nullable=False, default=0)
    time_to_first_contact = db.Column(db.Integer)
    converted = db.Column(db.Integer, nullable=False, default=0)  # 0 or 1
    conversion_date = db.Column(db.Date)
    ml_score = db.Column(db.Float)
    notes = db.Column(db.Text)

    def to_dict(self):
        return {
            "lead_id": self.lead_id,
            "partner_id": self.partner_id,
            "company_name": self.company_name,
            "contact_name": self.contact_name,
            "contact_email": self.contact_email,
            "region": self.region,
            "lead_source": self.lead_source,
            "product_interest": self.product_interest,
            "deal_value_inr": self.deal_value_inr,
            "status": self.status,
            "created_date": self.created_date.isoformat() if self.created_date else None,
            "last_contacted": self.last_contacted.isoformat() if self.last_contacted else None,
            "follow_up_count": self.follow_up_count,
            "time_to_first_contact": self.time_to_first_contact,
            "converted": self.converted,
            "conversion_date": self.conversion_date.isoformat() if self.conversion_date else None,
            "ml_score": self.ml_score,
            "notes": self.notes
        }
