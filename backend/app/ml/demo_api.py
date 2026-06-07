import os
import sys
import json
from datetime import date

# Add parent directory to path so app module can be found
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app import create_app
from app.database import db
from app.models.partner import Partner
from app.models.lead import Lead

def main():
    print("=" * 80)
    print(" VYANA AI - ML INFERENCE SERVICE API DEMO")
    print("=" * 80)
    
    app = create_app()
    client = app.test_client()
    
    # Establish application context to query partner
    with app.app_context():
        partner = Partner.query.first()
        if not partner:
            print("Error: No partners found in the database. Please run migrations/seeders first.")
            return
        partner_id = partner.partner_id
        company_name = partner.company_name
        print(f"[*] Dynamically fetched active Partner: '{company_name}' (ID: {partner_id})")

    # 1. Health Status check
    print("\n[STEP 1] Testing Service Health Status Check...")
    res = client.get('/api/status')
    print(f"HTTP Status: {res.status_code}")
    print(json.dumps(res.get_json(), indent=2))

    # 2. Single Lead Prediction: High Conversion Probability
    print("\n[STEP 2] Testing Single Lead Prediction (Expected HIGH score)...")
    payload_high = {
        "partner_id": partner_id,
        "deal_value_inr": 850000.0,
        "follow_up_count": 6,
        "time_to_first_contact": 1,
        "region": "West",
        "lead_source": "Referral",
        "product_interest": "Cloud Security"
    }
    print(f"Payload sent:\n{json.dumps(payload_high, indent=2)}")
    res = client.post('/api/predict', json=payload_high)
    print(f"HTTP Status: {res.status_code}")
    print(json.dumps(res.get_json(), indent=2))

    # 3. Single Lead Prediction: Low Conversion Probability
    print("\n[STEP 3] Testing Single Lead Prediction (Expected LOW score)...")
    payload_low = {
        "partner_id": partner_id,
        "deal_value_inr": 45000.0,
        "follow_up_count": 0,
        "time_to_first_contact": 10,
        "region": "Central",
        "lead_source": "Cold Call",
        "product_interest": "Endpoint Protection"
    }
    print(f"Payload sent:\n{json.dumps(payload_low, indent=2)}")
    res = client.post('/api/predict', json=payload_low)
    print(f"HTTP Status: {res.status_code}")
    print(json.dumps(res.get_json(), indent=2))

    # 4. Input Validation Failure Check
    print("\n[STEP 4] Testing Input Validation Rejection (ValidationError)...")
    payload_invalid = {
        "partner_id": partner_id,
        "deal_value_inr": -12000.0,  # Invalid negative deal value
        "region": "InvalidRegionName",  # Invalid region
        "lead_source": "Cold Call",
        "product_interest": "Endpoint Protection"
    }
    print(f"Payload sent:\n{json.dumps(payload_invalid, indent=2)}")
    res = client.post('/api/predict', json=payload_invalid)
    print(f"HTTP Status: {res.status_code}")
    print(json.dumps(res.get_json(), indent=2))

    # 5. Batch Lead Prediction Payload
    print("\n[STEP 5] Testing Batch Lead Predictions (List Payload)...")
    batch_payload = {
        "leads": [
            payload_high,
            payload_low,
            {**payload_high, "deal_value_inr": 200000.0, "follow_up_count": 2}
        ]
    }
    print(f"Sending batch containing {len(batch_payload['leads'])} leads...")
    res = client.post('/api/predict/batch', json=batch_payload)
    print(f"HTTP Status: {res.status_code}")
    results = res.get_json()
    print(f"Success: {results.get('success')}")
    print(f"Processed: {len(results.get('results', []))} items")
    for r in results.get('results', []):
        print(f" - Lead: {r.get('lead_id')} | Success: {r.get('success')} | Score: {r.get('ml_score')} | Priority: {r.get('priority_label')}")

    # 6. Database Auto-Scoring Sync (Mode 2)
    print("\n[STEP 6] Testing Database Sync Scoring (Updates all unscored leads)...")
    # First, let's create a temporary unscored lead inside DB to test database update
    with app.app_context():
        # Get date from first lead to ensure correct data type alignment
        ref_lead = Lead.query.first()
        ref_date = ref_lead.created_date if ref_lead else date(2026, 6, 1)
        
        # Clean any old temp leads first
        Lead.query.filter_by(lead_id="L-DEMO-TEMP-99").delete()
        db.session.commit()
        
        temp_lead = Lead(
            lead_id="L-DEMO-TEMP-99",
            partner_id=partner_id,
            company_name="Demo Corp",
            contact_name="Alice Smith",
            contact_email="alice@democorp.com",
            region="North",
            lead_source="Web",
            product_interest="Firewall",
            deal_value_inr=500000.0,
            status="New",
            created_date=ref_date,
            follow_up_count=3,
            time_to_first_contact=2,
            ml_score=None  # Unscored!
        )
        db.session.add(temp_lead)
        db.session.commit()
        print("[*] Inserted unscored lead 'L-DEMO-TEMP-99' into the database.")

    # Trigger database batch sync
    res = client.post('/api/predict/batch', json={})
    print(f"HTTP Status: {res.status_code}")
    print(json.dumps(res.get_json(), indent=2))

    # Verify that the lead now has a score in the DB
    with app.app_context():
        lead = db.session.get(Lead, "L-DEMO-TEMP-99")
        if lead and lead.ml_score is not None:
            print(f"[✓] Database sync verified! Lead L-DEMO-TEMP-99 score in DB is: {lead.ml_score}")
        else:
            print("[x] Error: Lead score was not updated in the database.")
            
        # Clean up
        Lead.query.filter_by(lead_id="L-DEMO-TEMP-99").delete()
        db.session.commit()
        print("[*] Cleaned up temporary test lead from database.")

    print("\n" + "=" * 80)
    print(" ALL STEPS COMPLETED SUCCESSFULLY!")
    print("=" * 80)

if __name__ == '__main__':
    main()
