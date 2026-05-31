# Project Risk Register

## Project: AI-Powered Channel Partner & Lead Intelligence Dashboard
**Version:** 1.0  
**Date:** June 2026

---

The table below lists the core technical and organizational risks identified for this implementation, along with mitigation strategies.

| Risk Description | Likelihood | Impact | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **Real company data not available or delayed** | Medium | High | Rely on the synthetically generated sample datasets (`partners.csv` and `leads.csv`) built in Week 1, and ensure database seed scripts can easily swap in live exports later. |
| **ML model accuracy below 70%** | Medium | Medium | Train and compare 3 models (Logistic Regression, Random Forest, XGBoost) and implement class balancing techniques (such as SMOTE/imbalanced-learn) during training. |
| **Flask-React CORS connection issues** | Low | Medium | Pre-configure the Flask backend with `flask-cors` wrapper, specifying permitted frontend origins in standard development settings. |
| **SQLite bottleneck for 50,000+ lead records** | Low | Medium | Index frequently queried lookup columns (`partner_id`, `status`, `ml_score`); support easy environment variable configurations to swap SQLite with PostgreSQL. |
| **Mentor availability and review bottlenecks** | Medium | Low | Establish structured 30-minute status check-ins at the start of each week, with pre-drafted status guides and roadmaps. |
| **Project scope creep due to new dashboard requests** | Medium | High | Rely on frozen Requirements Document v1.0 signed off in Week 1; schedule any additional feature requests as phase 2 deliverables. |
