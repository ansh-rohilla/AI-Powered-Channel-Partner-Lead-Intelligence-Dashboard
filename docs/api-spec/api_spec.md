# API Endpoint Specifications

## Project: AI-Powered Channel Partner & Lead Intelligence Dashboard
**Version:** 1.0  
**Date:** June 2026

---

## 1. Summary of Endpoints

The Flask REST API backend exposes 17 endpoints categorized into uploads, partners, leads, analytics, prediction, and exports.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/api/upload/partners` | Upload partners CSV/Excel file |
| **POST** | `/api/upload/leads` | Upload leads CSV/Excel file |
| **GET** | `/api/partners` | List partners (filter: tier, region, status) |
| **GET** | `/api/partners/:id` | Single partner + lead history |
| **PUT** | `/api/partners/:id` | Update partner record |
| **GET** | `/api/leads` | List leads (filter: status, partner, region) |
| **POST**| `/api/leads` | Create new lead |
| **PUT** | `/api/leads/:id` | Update lead (status, notes) |
| **GET** | `/api/analytics/summary` | KPI cards: partners, leads, conversion rate, revenue |
| **GET** | `/api/analytics/regional` | Partner and lead count by region |
| **GET** | `/api/analytics/trends` | Weekly lead volume + conversion over time |
| **GET** | `/api/analytics/tier-breakdown` | Revenue and deal count by tier |
| **POST**| `/api/predict` | Score single lead → `{score, label, explanation}` |
| **POST**| `/api/predict/batch` | Score multiple leads at once |
| **GET** | `/api/export/leads` | Download filtered leads as CSV |
| **GET** | `/api/export/partners` | Download filtered partners as CSV |

---

## 2. Detailed Request/Response Payloads

### POST `/api/upload/partners`
- **Request Type:** `multipart/form-data`
- **Payload:** File input under key `file`. Accepts `.csv`, `.xlsx`.
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Successfully uploaded and parsed partners file.",
    "records_inserted": 80
  }
  ```

### GET `/api/partners`
- **Query Params (Optional):** `tier` (Gold/Silver/Bronze), `region`, `status` (Active/Inactive)
- **Response (200 OK):**
  ```json
  [
    {
      "partner_id": "P-2024-001",
      "company_name": "TechSecure Solutions",
      "region": "North",
      "tier": "Gold",
      "annual_revenue_inr": 2500000.0,
      "deal_count": 18,
      "status": "Active"
    }
  ]
  ```

### GET `/api/analytics/summary`
- **Response (200 OK):**
  ```json
  {
    "active_partners": 72,
    "active_leads": 287,
    "conversion_rate": 22.3,
    "pipeline_value_inr": 12500000.0
  }
  ```

### POST `/api/predict`
- **Request Body:**
  ```json
  {
    "partner_id": "P-2024-001",
    "lead_source": "Referral",
    "deal_value_inr": 450000.0,
    "time_to_first_contact": 2,
    "follow_up_count": 4
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "lead_id": "L-2026-TEMP",
    "ml_score": 73.2,
    "priority_label": "High",
    "explanation": "High score driven by referral source and prompt contact time (<2 days)."
  }
  ```
