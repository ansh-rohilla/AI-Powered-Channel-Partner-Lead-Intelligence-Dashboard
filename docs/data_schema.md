# Data Schema Specifications

## Project: AI-Powered Channel Partner & Lead Intelligence Dashboard
**Version:** 1.0  
**Date:** June 2026

---

## 1. Partners Table Schema

The `partners` table tracks registered channel partners, their contact info, location, tiering metrics, and performance metrics.

| Column | Type | Constraints | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| **partner_id** | VARCHAR(36) | PRIMARY KEY | Unique partner identifier | `P-2024-001` |
| **company_name** | VARCHAR(255)| NOT NULL | Partner corporate name | `TechSecure Solutions` |
| **contact_name** | VARCHAR(255)| NOT NULL | Direct contact name | `Rajesh Kumar` |
| **contact_email**| VARCHAR(255)| NOT NULL | Direct contact email | `rajesh@techsecure.com` |
| **phone** | VARCHAR(20) | | Telephone contact number | `+91-9876543210` |
| **region** | VARCHAR(50) | NOT NULL | Geographical area of operation | `North` |
| **city** | VARCHAR(100) | NOT NULL | Headquarter city | `Delhi` |
| **tier** | VARCHAR(20) | NOT NULL | Calculated tier (Gold/Silver/Bronze) | `Gold` |
| **annual_revenue_inr** | FLOAT | NOT NULL | Annual revenue generated | `2500000.0` |
| **deal_count** | INTEGER | NOT NULL | Number of closed deals | `18` |
| **active_leads** | INTEGER | NOT NULL | Number of currently active leads | `6` |
| **last_activity_date**| DATE | | Last date of contact or deal closed | `2026-05-15` |
| **onboarded_date** | DATE | NOT NULL | Onboarding date of partner | `2024-01-10` |
| **product_categories**| TEXT | | Comma-separated list of product categories | `Firewall, EDR, SIEM` |
| **status** | VARCHAR(20) | NOT NULL | Operational status (Active/Inactive) | `Active` |

---

## 2. Leads Table Schema

The `leads` table tracks potential sales opportunities (leads), their source, value, status, assignment to partner, and ML scores.

| Column | Type | Constraints | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| **lead_id** | VARCHAR(36) | PRIMARY KEY | Unique lead identifier | `L-2026-0042` |
| **partner_id** | VARCHAR(36) | FOREIGN KEY | Assigned channel partner ID | `P-2024-001` |
| **company_name** | VARCHAR(255)| NOT NULL | Lead company name | `InfoGuard Corp` |
| **contact_name** | VARCHAR(255)| NOT NULL | Point of contact name | `Sanjay Verma` |
| **contact_email**| VARCHAR(255)| NOT NULL | Point of contact email | `sanjay@infoguard.co.in` |
| **region** | VARCHAR(50) | NOT NULL | Lead geographical region | `North` |
| **lead_source** | VARCHAR(50) | NOT NULL | Source of lead creation | `Referral` |
| **product_interest**| VARCHAR(100)| NOT NULL | Security product category of interest| `Firewall` |
| **deal_value_inr**| FLOAT | NOT NULL | Expected monetary deal value | `450000.0` |
| **status** | VARCHAR(50) | NOT NULL | Current status stage in the pipeline | `Qualified` |
| **created_date** | DATE | NOT NULL | Creation date of lead | `2026-04-20` |
| **last_contacted** | DATE | | Last interaction date | `2026-05-28` |
| **follow_up_count**| INTEGER | NOT NULL | Count of follow-up outreach attempts | `4` |
| **time_to_first_contact** | INTEGER | | Days elapsed from creation to contact | `2` |
| **converted** | INTEGER | NOT NULL (0 or 1)| Conversion flag (0=No, 1=Yes) | `0` |
| **conversion_date**| DATE | | Date of conversion to customer | `2026-05-30` |
| **ml_score** | FLOAT | | Predictive conversion priority 0-100| `73.2` |
| **notes** | TEXT | | Actionable notes or CRM remarks | `Strong interest in firewall audit` |
