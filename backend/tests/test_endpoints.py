import os
import sys
import unittest
import json

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
        data = json.loads(res.data)
        self.assertGreater(len(data), 0)

        # Test filtering
        res_gold = self.client.get('/api/partners?tier=Gold')
        self.assertEqual(res_gold.status_code, 200)
        data_gold = json.loads(res_gold.data)
        for p in data_gold:
            self.assertEqual(p['tier'], 'Gold')

    def test_get_single_partner(self):
        # Retrieve first partner
        res = self.client.get('/api/partners')
        data = json.loads(res.data)
        first_id = data[0]['partner_id']

        res_detail = self.client.get(f'/api/partners/{first_id}')
        self.assertEqual(res_detail.status_code, 200)
        data_detail = json.loads(res_detail.data)
        self.assertEqual(data_detail['partner_id'], first_id)
        self.assertIn('leads', data_detail)

    def test_update_partner(self):
        res = self.client.get('/api/partners')
        data = json.loads(res.data)
        first_id = data[0]['partner_id']

        # Update company_name
        res_update = self.client.put(f'/api/partners/{first_id}', json={
            "company_name": "Test Company Updated"
        })
        self.assertEqual(res_update.status_code, 200)
        data_update = json.loads(res_update.data)
        self.assertTrue(data_update['success'])
        self.assertEqual(data_update['partner']['company_name'], "Test Company Updated")

    def test_get_leads(self):
        res = self.client.get('/api/leads')
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertGreater(len(data), 0)

    def test_create_and_update_lead(self):
        # Get a partner ID
        res_partners = self.client.get('/api/partners')
        partners = json.loads(res_partners.data)
        partner_id = partners[0]['partner_id']

        # Create lead
        new_lead_data = {
            "partner_id": partner_id,
            "company_name": "Test Lead Inc",
            "contact_name": "John Doe",
            "contact_email": "john@testlead.com",
            "region": "North",
            "lead_source": "Web",
            "product_interest": "Firewall",
            "deal_value_inr": 150000.0,
            "status": "New"
        }
        res_create = self.client.post('/api/leads', json=new_lead_data)
        self.assertEqual(res_create.status_code, 201)
        data_create = json.loads(res_create.data)
        self.assertTrue(data_create['success'])
        lead_id = data_create['lead']['lead_id']

        # Update lead
        res_update = self.client.put(f'/api/leads/{lead_id}', json={
            "status": "Converted",
            "notes": "Excellent prospect, closed deal."
        })
        self.assertEqual(res_update.status_code, 200)
        data_update = json.loads(res_update.data)
        self.assertTrue(data_update['success'])
        updated_lead = data_update['lead']
        self.assertEqual(updated_lead['status'], 'Converted')
        self.assertEqual(updated_lead['converted'], 1)
        self.assertIsNotNone(updated_lead['conversion_date'])

if __name__ == '__main__':
    unittest.main()
