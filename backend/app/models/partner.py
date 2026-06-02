from app.database import db
from datetime import datetime

class Partner(db.Model):
    __tablename__ = 'partners'

    partner_id = db.Column(db.String(36), primary_key=True)
    company_name = db.Column(db.String(255), nullable=False)
    contact_name = db.Column(db.String(255), nullable=False)
    contact_email = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(20))
    region = db.Column(db.String(50), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    tier = db.Column(db.String(20), nullable=False)
    annual_revenue_inr = db.Column(db.Float, nullable=False, default=0.0)
    deal_count = db.Column(db.Integer, nullable=False, default=0)
    active_leads = db.Column(db.Integer, nullable=False, default=0)
    last_activity_date = db.Column(db.Date)
    onboarded_date = db.Column(db.Date, nullable=False)
    product_categories = db.Column(db.Text)
    status = db.Column(db.String(20), nullable=False, default='Active')

    # Relationship to Leads
    leads = db.relationship('Lead', backref='partner', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "partner_id": self.partner_id,
            "company_name": self.company_name,
            "contact_name": self.contact_name,
            "contact_email": self.contact_email,
            "phone": self.phone,
            "region": self.region,
            "city": self.city,
            "tier": self.tier,
            "annual_revenue_inr": self.annual_revenue_inr,
            "deal_count": self.deal_count,
            "active_leads": self.active_leads,
            "last_activity_date": self.last_activity_date.isoformat() if self.last_activity_date else None,
            "onboarded_date": self.onboarded_date.isoformat() if self.onboarded_date else None,
            "product_categories": self.product_categories,
            "status": self.status
        }
