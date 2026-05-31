# Functional & Non-Functional Requirements Document

## Project: AI-Powered Channel Partner & Lead Intelligence Dashboard
**Version:** 1.0  
**Date:** June 2026  
**Author:** Ansh Rohilla | Vyana Innovations Pvt. Ltd.

---

## 1. Functional Requirements

*   **FR-01: CSV/Excel Data Ingestion**  
    The system must allow users to upload CSV or Excel files containing channel partner and lead data through a drag-and-drop web interface.
*   **FR-02: Data Validation Pipeline**  
    On file upload, the backend must validate the schema, check column types, detect duplicate records, and filter out corrupted or structurally invalid rows.
*   **FR-03: Channel Partner Tiering**  
    The system must automatically classify channel partners into tiers based on annual revenue and deal count:
    *   **Gold**: Revenue >= 2,000,000 INR AND Deal Count >= 12
    *   **Silver**: Revenue >= 800,000 INR AND Deal Count >= 5
    *   **Bronze**: All other active partners
*   **FR-04: Partners Directory Dashboard**  
    Provide a filterable and sortable data table of channel partners showing status, tier, region, annual revenue, and contact details.
*   **FR-05: Lead Pipeline Management**  
    Track leads across five standard pipeline stages: `New` -> `Contacted` -> `Qualified` -> `Converted` / `Lost`.
*   **FR-06: Machine Learning Lead Priority Scoring**  
    Using a trained XGBoost model, score every lead on a 0–100 scale indicating conversion probability, allowing sales reps to prioritize high-value leads.
*   **FR-07: KPI Executive Summary Cards**  
    Display high-level dashboard metrics:
    *   Total Active Partners
    *   Total Active Leads
    *   Lead Conversion Rate (%)
    *   Total Pipeline Value (INR)
*   **FR-08: Time-Series Lead Analytics**  
    Visualize weekly lead volume trends and historical conversion rates over a rolling 12-week period.
*   **FR-09: Data Export Utilities**  
    Enable exporting of filtered partners or leads directories directly into CSV formats for offline CRM imports.

---

## 2. Non-Functional Requirements

*   **NFR-01: Performance & Caching**  
    *   Analytics aggregation queries must return within 200ms.
    *   Use cache mechanisms (Flask-Caching) with a 5-minute TTL on expensive analytical endpoints to avoid database bottlenecks.
*   **NFR-02: Modern and Premium UI/UX**  
    *   Implement an interface with a professional color palette, glassmorphism elements, clear typography (e.g. Inter/Outfit), and hover micro-animations.
    *   Responsive layout supporting standard desktop resolutions and tablet viewports.
*   **NFR-03: Security & CORS**  
    *   Protect backend REST endpoints using Cross-Origin Resource Sharing (CORS) configurations to only allow requests from approved frontend origins.
    *   Secure secret keys and environment variables inside a `.env` configuration file that is gitignored.
*   **NFR-04: Scalability & Portability**  
    *   Scaffold the project so the database layer is abstract (using SQLAlchemy ORM), allowing a seamless transition from SQLite (local development) to PostgreSQL (production cloud).
