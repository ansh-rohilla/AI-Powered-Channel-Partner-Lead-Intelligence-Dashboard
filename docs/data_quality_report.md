# Data Quality & Audit Report

**Project:** AI-Powered Channel Partner & Lead Intelligence Dashboard  
**Date:** June 2026  
**Author:** Ansh Rohilla | Vyana Innovations Pvt. Ltd.

---

## 1. Executive Summary
This document summarizes the audit performed on the channel partner and lead datasets. The goal of this audit is to identify potential data anomalies, define validation rules, and establish cleaning pipelines to ensure that the AI priority scoring model (XGBoost) and the analytics dashboard process clean and structurally sound inputs.

---

## 2. Identified Data Quality Risks & Issues

During the audit of CRM exports and mock data profiles, the following categories of data quality issues were evaluated:

### A. Missing or Null Values
*   **Critical Fields:** In past entries, fields like `company_name`, `contact_name`, and `contact_email` were occasionally blank or contained generic placeholders (e.g., "unknown", "N/A").
*   **Optional Fields:** Fields like `phone`, `notes`, and `last_contacted` have permissible null values, which must be handled safely by the database ORM and ML models.

### B. Inconsistent Data Formats
*   **Phone Numbers:** Inconsistent formats including country code prefix variants (e.g., `+91-XXXXX`, `91-XXXXX`, `0XXXXX`, or standard 10-digit formats).
*   **Dates:** Varying date serial formats (`YYYY-MM-DD` vs `DD/MM/YYYY` vs Excel numeric timestamps) which could crash date-parsing APIs.
*   **Product Categories:** Comma-separated categories sometimes contain leading/trailing whitespaces (e.g., `" Firewall , EDR"` vs `"Firewall, EDR"`).

### C. Structural & Logic Anomalies
*   **Negative Values:** Revenue, deal counts, or follow-up counts containing negative numbers due to manual spreadsheet entry errors.
*   **Tier Mismatches:** Discrepancies where a partner's recorded tier (e.g., "Gold") does not mathematically match their actual metrics (Revenue >= 2M INR and Deal Count >= 12).
*   **Orphaned Leads:** Leads assigned to partner IDs that do not exist in the master database.

---

## 3. Data Cleaning & Ingestion Validation Rules

To resolve these issues, the ingestion validation pipeline (built in the backend) enforces the following constraints:

| Table | Column | Validation Rule | Action on Failure |
| :--- | :--- | :--- | :--- |
| **Partners / Leads** | `contact_email` | Valid email regex pattern (`[^@]+@[^@]+\.[^@]+`) | Reject record / flag invalid |
| **Partners / Leads** | `phone` | Standardized to `+91-XXXXXXXXXX` format | Strip spaces, auto-correct prefix |
| **Partners** | `tier` | Re-evaluated using actual metrics (Revenue/Deals) | Auto-compute and correct |
| **Partners** | `annual_revenue_inr` | Must be a positive floating number ($\ge 0$) | Set to 0.0 or reject if negative |
| **Partners** | `deal_count` | Must be a positive integer ($\ge 0$) | Set to 0 or reject if negative |
| **Leads** | `partner_id` | Must exist in the `partners` master table | Reject record (foreign key check) |
| **Leads** | `converted` | Must be strictly `0` or `1` | Default to `0` based on `status` |

---

## 4. Normalization Status
All generated development datasets (`partners.csv` and `leads.csv` in `backend/data/sample/`) have been successfully normalized and validated against the above constraints. The SQLite database seeding script ([seed_db.py](file:///Users/anshrohilla/Documents/AI-Powered%20Channel%20Partner%20&%20Lead%20Intelligence%20Dashboard/backend/data/seed_db.py)) parses and applies these validation sanitizations before saving records to the database.
