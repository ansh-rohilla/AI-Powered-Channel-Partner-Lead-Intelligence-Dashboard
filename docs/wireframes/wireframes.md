# UI/UX Wireframe Specifications

## Project: AI-Powered Channel Partner & Lead Intelligence Dashboard
**Version:** 1.0  
**Date:** June 2026

This document presents the visual design and layout blueprint for the primary views of the application using ASCII wireframes.

---

## Page 1: Overview Dashboard

The Overview page serves as the entry point, displaying KPI summaries, lead trends, partner tier distribution, and a top-performing partners table.

```text
 ┌──────────────────────────────────────────────────────────────┐
 │  [V] Vyana BI Dashboard             [Search]  [Upload Data ↑]│
 ├──────────────────────────────────────────────────────────────┤
 │  Overview │ Partners │ Leads │ ML Insights │ Reports         │
 ├──────────────────────────────────────────────────────────────┤
 │ ┌────────┐ ┌────────┐ ┌─────────┐ ┌───────────────────────┐ │
 │ │  72    │ │  287   │ │  21.3%  │ │  ₹1.25 Cr             │ │
 │ │Active  │ │Active  │ │Conversion│ │Pipeline Value         │ │
 │ │Partners│ │ Leads  │ │  Rate   │ │                       │ │
 │ └────────┘ └────────┘ └─────────┘ └───────────────────────┘ │
 │                                                               │
 │ ┌────────────────────────────┐ ┌──────────────────────────┐  │
 │ │  Lead Volume  (Bar Chart)  │ │  Partner Tiers (Donut)   │  │
 │ │  Weekly — last 12 weeks    │ │  Gold 18 | Silver 29     │  │
 │ │                            │ │  Bronze 33               │  │
 │ └────────────────────────────┘ └──────────────────────────┘  │
 │                                                               │
 │ ┌───────────────────────────────────────────────────────────┐ │
 │ │ Top 5 Partners by Revenue                                 │ │
 │ │ Rank | Company | Tier | Revenue | Active Leads | Trend    │ │
 │ └───────────────────────────────────────────────────────────┘ │
 └──────────────────────────────────────────────────────────────┘
```

---

## Page 2: Partners Directory (Not Shown in ASCII)
- **Top Bar:** Search input, Region filter (North, South, East, West, Central), Tier filter (Gold, Silver, Bronze), status selector.
- **Main Content:** Clean data table displaying partner details, revenue, deal count, active leads, last activity, and status.
- **Actions:** View Details button per row (leads to Partner Details view), and Export CSV button.

---

## Page 3: Leads (Kanban Pipeline)

The Leads view provides a visual pipeline tracking opportunities through four primary columns.

```text
 ┌──────────────────────────────────────────────────────────────┐
 │  Leads   [+ New Lead]   [Export CSV ↓]   [Search...]         │
 ├──────────────────────────────────────────────────────────────┤
 │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌─────────────┐  │
 │  │  New (45) │ │Contacted  │ │ Qualified │ │ Converted   │  │
 │  │           │ │  (72)     │ │  (38)     │ │   (85)      │  │
 │  │ ┌───────┐ │ │ ┌───────┐ │ │ ┌───────┐ │ │ ┌─────────┐ │  │
 │  │ │InfoGd │ │ │ │DataFt │ │ │ │NetArm │ │ │ │CyberCsl │ │  │
 │  │ │Score  │ │ │ │Score  │ │ │ │Score  │ │ │ │Score    │ │  │
 │  │ │[██ 73]│ │ │ │[█ 61] │ │ │ │[███88]│ │ │ │[██ 91]  │ │  │
 │  │ └───────┘ │ │ └───────┘ │ │ └───────┘ │ │ └─────────┘ │  │
 │  └───────────┘ └───────────┘ └───────────┘ └─────────────┘  │
 └──────────────────────────────────────────────────────────────┘
```

---

## Page 4: ML Insights

The ML Insights page visualizes model metrics (XGBoost), lead ranking, and features that impact conversion probability.

```text
 ┌──────────────────────────────────────────────────────────────┐
 │  ML Insights — Lead Scoring Engine                            │
 │  Model: XGBoost v1.0  |  AUC-ROC: 0.84  |  F1: 0.76         │
 ├──────────────────────────────────────────────────────────────┤
 │  Top 10 High-Priority Leads (score > 75)                      │
 │  Lead    | Company       | Score      | Value  | Action       │
 │  L-0042  | InfoGuard     | [████ 88]  | ₹4.5L  | Call Now    │
 │  L-0187  | SecureVault   | [████ 85]  | ₹3.2L  | Schedule    │
 ├──────────────────────────────────────────────────────────────┤
 │  Feature Importance (horizontal bar chart)                    │
 │  follow_up_count  ████████████████ 0.31                       │
 │  time_to_contact  ████████████     0.24                       │
 │  lead_source      ████████         0.18                       │
 │  partner_tier     ██████           0.14                       │
 │  deal_value       ████             0.13                       │
 └──────────────────────────────────────────────────────────────┘
```
