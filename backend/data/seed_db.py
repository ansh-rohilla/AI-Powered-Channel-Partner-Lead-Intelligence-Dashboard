import os
import sys
from datetime import datetime
import pandas as pd

# Add the parent directory to the Python path so app module can be found
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.database import db
from app.models.partner import Partner
from app.models.lead import Lead

def parse_date(date_str):
    if pd.isna(date_str) or not date_str or str(date_str).strip() in ('', 'nan', 'None'):
        return None
    try:
        # CSV dates are in YYYY-MM-DD format
        return datetime.strptime(str(date_str).split()[0], "%Y-%m-%d").date()
    except Exception as e:
        print(f"Error parsing date '{date_str}': {e}")
        return None

def seed_db_core():
    # Clear existing data to prevent duplicates
    print("Clearing existing data...")
    db.session.query(Lead).delete()
    db.session.query(Partner).delete()
    db.session.commit()

    # Load CSVs
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    partners_csv_path = os.path.join(base_dir, "data", "sample", "partners.csv")
    leads_csv_path = os.path.join(base_dir, "data", "sample", "leads.csv")

    if not os.path.exists(partners_csv_path) or not os.path.exists(leads_csv_path):
        print(f"Error: Mock CSV data files not found at {partners_csv_path} or {leads_csv_path}. Run generate_sample_data.py first.")
        return

    print(f"Reading partners from {partners_csv_path}...")
    df_partners = pd.read_csv(partners_csv_path)

    print(f"Reading leads from {leads_csv_path}...")
    df_leads = pd.read_csv(leads_csv_path)

    # Seed Partners
    print("Seeding partners table...")
    partners_inserted = 0
    for _, row in df_partners.iterrows():
        partner = Partner(
            partner_id=row['partner_id'],
            company_name=row['company_name'],
            contact_name=row['contact_name'],
            contact_email=row['contact_email'],
            phone=row.get('phone', None),
            region=row['region'],
            city=row['city'],
            tier=row['tier'],
            annual_revenue_inr=float(row['annual_revenue_inr']),
            deal_count=int(row['deal_count']),
            active_leads=int(row['active_leads']),
            last_activity_date=parse_date(row.get('last_activity_date', None)),
            onboarded_date=parse_date(row['onboarded_date']),
            product_categories=row.get('product_categories', None),
            status=row.get('status', 'Active')
        )
        db.session.add(partner)
        partners_inserted += 1

    db.session.commit()
    print(f"Successfully seeded {partners_inserted} partners.")

    # Seed Leads
    print("Seeding leads table...")
    leads_inserted = 0
    for _, row in df_leads.iterrows():
        lead = Lead(
            lead_id=row['lead_id'],
            partner_id=row['partner_id'],
            company_name=row['company_name'],
            contact_name=row['contact_name'],
            contact_email=row['contact_email'],
            region=row['region'],
            lead_source=row['lead_source'],
            product_interest=row['product_interest'],
            deal_value_inr=float(row['deal_value_inr']),
            status=row['status'],
            created_date=parse_date(row['created_date']),
            last_contacted=parse_date(row.get('last_contacted', None)),
            follow_up_count=int(row['follow_up_count']),
            time_to_first_contact=None if pd.isna(row.get('time_to_first_contact', None)) else int(row['time_to_first_contact']),
            converted=int(row['converted']),
            conversion_date=parse_date(row.get('conversion_date', None)),
            ml_score=None if pd.isna(row.get('ml_score', None)) else float(row['ml_score']),
            notes=row.get('notes', None)
        )
        db.session.add(lead)
        leads_inserted += 1

    db.session.commit()
    print(f"Successfully seeded {leads_inserted} leads.")
    print("Database seeding completed successfully.")

def seed_database():
    app = create_app()
    with app.app_context():
        seed_db_core()

if __name__ == "__main__":
    seed_database()
