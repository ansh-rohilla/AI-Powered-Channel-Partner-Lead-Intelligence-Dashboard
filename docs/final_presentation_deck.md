# Vyana AI: Final Internship Presentation Deck (Day 33)

**Author**: Ansh Rohilla (AI & BI Intern)  
**Company**: Vyana Innovations Pvt. Ltd.  
**Sprint Phase**: Phase 5 — Delivery  
**Format**: Presentation Slide Outline with Presenter/Speaker Notes

---

## 🛝 Slide 1: Cover Slide
- **Title**: Vyana AI: Channel Partner & Lead Intelligence Platform
- **Subtitle**: Machine Learning Prioritization & Real-Time Operational BI
- **Presenter**: Ansh Rohilla (AI & BI Intern)
- **Organization**: Vyana Innovations Pvt. Ltd.
- **Date**: July 2026
- **Speaker Notes**:
  > *"Good morning mentors and members of the board. Today, I am excited to present Vyana AI, an intelligent pipeline orchestration platform built during my internship to solve lead processing delays and enhance partner allocation using machine learning."*

---

## 🛝 Slide 2: The Core Problem
- **Bullet Points**:
  - **Manual Bottlenecks**: Operations director manually screened and prioritized leads, taking 20 minutes per lead.
  - **Response Latency**: Contact latency averaged 4.2 days, cooling warm prospects.
  - **Channel Mismatches**: Leads assigned ad-hoc to partners without evaluating region, tier, or active workload.
  - **Zero Real-time Analytics**: Sales operations relied on static weekly Excel sheets.
- **Speaker Notes**:
  > *"Our legacy process had serious bottlenecks. Directors spent hours screening spreadsheets, meaning partners took days to contact prospects. Furthermore, assignments were ad-hoc, leading to overloaded partners and lost opportunities. We needed automated speed."*

---

## 🛝 Slide 3: The Vyana AI Solution
- **Bullet Points**:
  - **XGBoost Scoring Engine**: Computes conversion probability instantly (<3ms) on a 0-100 scale.
  - **HTML5 Drag-and-Drop Pipeline**: Interactive Kanban pipeline board to visually move and update leads.
  - **AI Partner Matchmaker**: Evaluates regional fit and workloads to recommend the top 3 channel partners.
  - **Executive Analytics**: Live cached charts tracking summary KPIs and regional sales trends.
- **Speaker Notes**:
  > *"Vyana AI introduces a pre-loaded XGBoost model to score incoming leads instantly. We matched this with a gorgeous, high-end React dashboard, enabling sales ops to drag-and-drop leads, view matchmaker recommendations, and visualize pipelines in real-time."*

---

## 🛝 Slide 4: System Architecture
- **Bullet Points**:
  - **Three-Tier Architecture**:
    - *Frontend*: Single Page React App built with Vite, styled with custom glassmorphism.
    - *API Middleware*: Flask REST service with Flask-Caching SimpleCache.
    - *Database/ML*: SQLite DB with pre-loaded Scikit-Learn/XGBoost models.
  - **Cache Busting Strategy**: Memory cache is invalidated automatically upon DB updates or CSV bulk uploads.
- **Speaker Notes**:
  > *"Architecturally, the system is designed for high performance. The React UI communicates with a Flask API. Heavy analytics requests are cached in-memory, yielding sub-millisecond response times, and are busted dynamically whenever data mutations occur."*

---

## 🛝 Slide 5: Machine Learning Model (XGBoost)
- **Bullet Points**:
  - **Primary Metric (AUC-ROC)**: **80.2%** on test data.
  - **Features Processed**: Deal value, follow-up touchpoints, contact latency, partner tier, and region.
  - **Imbalance Handling**: Hyperparameter scale-pos-weight tuned to handle conversion class imbalances.
  - **Preprocessing**: Pipeline standardizes numerical features and encodes categoricals dynamically via Joblib.
- **Speaker Notes**:
  > *"We selected and tuned an XGBoost classifier which achieved an outstanding 80.2% AUC-ROC score. The model handles raw parameters like contact latency and touchpoints, normalizes them, and outputs high-fidelity conversion scores."*

---

## 🛝 Slide 6: Explainable AI (XAI) & Insights
- **Bullet Points**:
  - **Global Feature Weights**: Recharts bar chart showing impact of variables.
  - **SHAP Density Beeswarm Plot**: Glow SVG showing how values (like latency) shift outcomes.
  - **Interactive Scoring Simulator**: Sliders to test hypothetical inputs and preview neural dial output.
- **Speaker Notes**:
  > *"Corporate officials require explainability. We built a dedicated AI Insights page showing feature contributions and a custom SHAP beeswarm SVG plot. We also added an interactive scoring simulator to preview model decisions."*

---

## 🛝 Slide 7: Live Demo Walkthrough
- **Visual Description**:
  - Screenshot of the Dashboard Overview (Area Chart and Donut breakdown).
  - Screenshot of Kanban Drag-and-Drop Board.
  - Screenshot of the AI Partner Recommendation Drawer.
- **Speaker Notes**:
  > *"In this slide, you see the live platform. Sales ops can drag cards between pipeline columns. Tapping a card slides out the intelligence drawer, displaying the AI conversion probability, key drivers, and the matchmaker recommendation panel."*

---

## 🛝 Slide 8: Quantitative Business Impact
- **Bullet Points**:
  - **2,416 Operational Hours Saved** annually (screening and coordination).
  - **$105,800 USD** projected annual operational cost reduction.
  - **88% Faster response speeds** (reducing prospect cooling).
  - **First-Year ROI**: **450%+** recovery of development costs.
- **Speaker Notes**:
  > *"The numbers speak for themselves. By replacing manual screening and ad-hoc emails with automated scoring and matchmaker assignments, we save over 2,400 operational hours annually, achieving a first-year ROI of over 450%."*

---

## 🛝 Slide 9: Performance Benchmarks
- **Bullet Points**:
  - **Inference Speed**: **2.3ms** single prediction latency (Threshold: 200ms).
  - **Caching Lift**: Analytics load times improved by up to **188x** (0.08ms vs 15ms).
  - **Frontend Footprint**: Route lazy-loading cut the initial JS bundle from **739kB to 179kB** (75.6% reduction).
- **Speaker Notes**:
  > *"Performance was optimized on both ends. Caching speeds up dashboard views by up to 180 times. Our ML model scores leads in under 3 milliseconds. Additionally, front-end route code-splitting cut the initial bundle footprint by 75%."*

---

## 🛝 Slide 10: Future Scope & Roadmap
- **Bullet Points**:
  - **Celery Worker Integration**: Move bulk database updates to background celery queues.
  - **Active CRM Synced Ingestion**: Trigger API scoring directly via webhook integrations with Salesforce/Hubspot.
  - **retraining Loops**: Implement MLflow monitoring to automatically retrain models when drift is detected.
- **Speaker Notes**:
  > *"For future work, we plan to shift bulk DB syncs to Celery queues, build direct integrations for Salesforce webhooks, and automate model retraining when pipeline data drifts over time."*

---

## 🛝 Slide 11: Conclusion & Q&A
- **Content**:
  - **Thank You!**
  - Open for Questions and Answers.
  - *Email*: ansh@vyanainnovations.com
- **Speaker Notes**:
  > *"I want to thank my mentors at Vyana Innovations for their invaluable guidance. I am now open to any questions you may have about model tuning, data privacy, or backend scaling. Thank you."*
