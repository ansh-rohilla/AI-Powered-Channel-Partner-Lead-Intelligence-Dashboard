import os
import sys
import unittest
import json
from io import BytesIO
from datetime import date

# Add parent directory to path so app module can be found
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.database import db
from app.models.partner import Partner
from app.models.lead import Lead

class TestEndpoints(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()
        self.app_context = self.app.app_context()
        self.app_context.push()

    def tearDown(self):
        self.app_context.pop()

    def test_status_endpoint(self):
        res = self.client.get('/api/status')
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertEqual(data['status'], 'healthy')

    def test_get_partners(self):
        res = self.client.get('/api/partners')
        self.assertEqual(res.status_code, 200)
        res_data = json.loads(res.data)
        self.assertTrue(res_data['success'])
        partners = res_data['data']
        self.assertGreater(len(partners), 0)
        self.assertIn('pagination', res_data)

        # Test filtering
        res_gold = self.client.get('/api/partners?tier=Gold')
        self.assertEqual(res_gold.status_code, 200)
        gold_data = json.loads(res_gold.data)['data']
        for p in gold_data:
            self.assertEqual(p['tier'], 'Gold')

        # Test search
        res_search = self.client.get('/api/partners?q=Secure')
        self.assertEqual(res_search.status_code, 200)
        search_data = json.loads(res_search.data)['data']
        for p in search_data:
            self.assertTrue('secure' in p['company_name'].lower() or 'secure' in p['contact_name'].lower())

    def test_get_single_partner(self):
        res = self.client.get('/api/partners')
        res_data = json.loads(res.data)
        first_id = res_data['data'][0]['partner_id']

        res_detail = self.client.get(f'/api/partners/{first_id}')
        self.assertEqual(res_detail.status_code, 200)
        detail_data = json.loads(res_detail.data)
        self.assertTrue(detail_data['success'])
        partner = detail_data['data']
        self.assertEqual(partner['partner_id'], first_id)
        self.assertIn('leads', partner)

    def test_update_partner_valid_and_invalid(self):
        res = self.client.get('/api/partners')
        res_data = json.loads(res.data)
        first_id = res_data['data'][0]['partner_id']

        # Valid Update
        res_update = self.client.put(f'/api/partners/{first_id}', json={
            "company_name": "Test Company Refactored"
        })
        self.assertEqual(res_update.status_code, 200)
        update_data = json.loads(res_update.data)
        self.assertTrue(update_data['success'])
        self.assertEqual(update_data['partner']['company_name'], "Test Company Refactored")

        # Invalid Email Validation check
        res_invalid_email = self.client.put(f'/api/partners/{first_id}', json={
            "contact_email": "not-an-email"
        })
        self.assertEqual(res_invalid_email.status_code, 400)
        invalid_data = json.loads(res_invalid_email.data)
        self.assertFalse(invalid_data['success'])
        self.assertEqual(invalid_data['error'], 'ValidationError')
        self.assertIn('contact_email', invalid_data['details'])

    def test_get_leads(self):
        res = self.client.get('/api/leads')
        self.assertEqual(res.status_code, 200)
        res_data = json.loads(res.data)
        self.assertTrue(res_data['success'])
        self.assertGreater(len(res_data['data']), 0)

    def test_create_and_update_lead(self):
        # Get a partner ID
        res_partners = self.client.get('/api/partners')
        partners = json.loads(res_partners.data)['data']
        partner_id = partners[0]['partner_id']

        # Create lead (valid payload)
        new_lead_data = {
            "partner_id": partner_id,
            "company_name": "Test Lead Inc",
            "contact_name": "John Doe",
            "contact_email": "john@testlead.com",
            "region": "North",
            "lead_source": "Web",
            "product_interest": "Firewall",
            "deal_value_inr": 150000.0,
            "status": "New",
            "created_date": "2026-06-01"
        }
        res_create = self.client.post('/api/leads', json=new_lead_data)
        self.assertEqual(res_create.status_code, 201)
        create_data = json.loads(res_create.data)
        self.assertTrue(create_data['success'])
        lead_id = create_data['lead']['lead_id']

        # Create lead (invalid payload - missing required)
        invalid_lead_data = new_lead_data.copy()
        invalid_lead_data.pop('contact_email')
        res_create_invalid = self.client.post('/api/leads', json=invalid_lead_data)
        self.assertEqual(res_create_invalid.status_code, 400)

        # Update lead to Converted state
        res_update = self.client.put(f'/api/leads/{lead_id}', json={
            "status": "Converted",
            "notes": "Excellent prospect, closed deal."
        })
        self.assertEqual(res_update.status_code, 200)
        update_data = json.loads(res_update.data)
        self.assertTrue(update_data['success'])
        updated_lead = update_data['lead']
        self.assertEqual(updated_lead['status'], 'Converted')
        self.assertEqual(updated_lead['converted'], 1)
        self.assertIsNotNone(updated_lead['conversion_date'])

    def test_analytics_endpoints(self):
        # 1. Summary
        res_sum = self.client.get('/api/analytics/summary')
        self.assertEqual(res_sum.status_code, 200)
        data_sum = json.loads(res_sum.data)
        self.assertTrue(data_sum['success'])
        self.assertIn('active_partners', data_sum['data'])
        self.assertIn('pipeline_value_inr', data_sum['data'])

        # 2. Regional
        res_reg = self.client.get('/api/analytics/regional')
        self.assertEqual(res_reg.status_code, 200)
        data_reg = json.loads(res_reg.data)
        self.assertTrue(data_reg['success'])
        self.assertEqual(len(data_reg['data']), 5)  # 5 regions

        # 3. Trends
        res_trends = self.client.get('/api/analytics/trends')
        self.assertEqual(res_trends.status_code, 200)
        data_trends = json.loads(res_trends.data)
        self.assertTrue(data_trends['success'])

        # 4. Tier Breakdown
        res_tier = self.client.get('/api/analytics/tier-breakdown')
        self.assertEqual(res_tier.status_code, 200)
        data_tier = json.loads(res_tier.data)
        self.assertTrue(data_tier['success'])

    def test_upload_endpoints(self):
        # 1. Partners upload CSV
        csv_partners = (
            "company_name,contact_name,contact_email,phone,region,city,annual_revenue_inr,deal_count,onboarded_date\n"
            "Bulk Upload Partner Inc,Alice Miller,alice@bulkpartner.com,+91-9000800700,North,Jaipur,950000.0,6,2025-03-01\n"
        )
        file_partners = (BytesIO(csv_partners.encode('utf-8')), 'partners.csv')
        res_p = self.client.post('/api/upload/partners', data={'file': file_partners}, content_type='multipart/form-data')
        self.assertEqual(res_p.status_code, 200)
        data_p = json.loads(res_p.data)
        self.assertTrue(data_p['success'])
        self.assertEqual(data_p['inserted'], 1)

        # Get the inserted partner's ID to upload a lead for them
        new_partner = Partner.query.filter_by(contact_email='alice@bulkpartner.com').first()
        self.assertIsNotNone(new_partner)
        self.assertEqual(new_partner.tier, 'Silver')  # 950000 rev & 6 deals -> Silver

        # 2. Leads upload CSV
        csv_leads = (
            "partner_id,company_name,contact_name,contact_email,region,lead_source,product_interest,deal_value_inr,status,created_date\n"
            f"{new_partner.partner_id},Bulk Lead Ltd,Bob Johnson,bob@bulklead.com,North,Web,Firewall,200000.0,New,2026-05-15\n"
        )
        file_leads = (BytesIO(csv_leads.encode('utf-8')), 'leads.csv')
        res_l = self.client.post('/api/upload/leads', data={'file': file_leads}, content_type='multipart/form-data')
        self.assertEqual(res_l.status_code, 200)
        data_l = json.loads(res_l.data)
        self.assertTrue(data_l['success'])
        self.assertEqual(data_l['inserted'], 1)

    def test_delete_endpoints(self):
        # Create temporary partner
        p = Partner(
            partner_id="P-TEMP-99",
            company_name="Delete Partner",
            contact_name="Temp",
            contact_email="temp@deletepartner.com",
            region="North",
            city="Delhi",
            tier="Bronze",
            onboarded_date=date(2025, 1, 1),
            status="Active"
        )
        db.session.add(p)
        db.session.commit()

        # Delete it
        res_del = self.client.delete(f'/api/partners/P-TEMP-99')
        self.assertEqual(res_del.status_code, 200)
        data_del = json.loads(res_del.data)
        self.assertTrue(data_del['success'])

        # Verify gone
        partner_check = db.session.get(Partner, "P-TEMP-99")
        self.assertIsNone(partner_check)

if __name__ == '__main__':
    unittest.main()
