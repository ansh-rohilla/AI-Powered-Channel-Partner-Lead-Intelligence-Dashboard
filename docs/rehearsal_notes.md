# Demo Rehearsal & Q&A Prep Notes (Day 34)

This guide outlines the 3-5 minute live demonstration walkthrough script and contains responses for anticipated executive Q&A.

---

## 🎭 1. Demo Walkthrough Script (Step-by-Step)

### Scene 1: Dashboard Overview (0:00 - 1:00)
- **Action**: Load `http://localhost:3000`. Point out the glassmorphic KPI cards (Active Partners: 36, Active Leads: 198, etc.). Highlight the custom Recharts Dual-Axis chart representing weekly leads and conversion rate trends.
- **Narrative**:
  > *"Here is the Vyana AI Operational dashboard. At a single glance, sales operations directors gain full visibility into the active pipeline, partner numbers, and conversion rates. Below, our trends chart visualizes weekly sales volumes mapped directly against historical conversion metrics."*

### Scene 2: Partner Directory & Heatmap (1:00 - 2:00)
- **Action**: Navigate to the `/partners` tab. Click a cell on the 5x3 Density Heatmap (e.g. Gold tier in West). Show the directory table filtering dynamically. Click a row to slide out the operational hub profile and Lead Activity Timeline.
- **Narrative**:
  > *"Next is our Partner Directory. Rather than digging through spreadsheets, the regional density heatmap provides immediate visual density tracking. Tapping a cell filters partners instantly. Drilling down on a partner slides out their complete contact profile, deal counts, conversion funnel, and a chronological history of lead events."*

### Scene 3: Lead Kanban Board & Drag-and-Drop (2:00 - 3:00)
- **Action**: Navigate to `/leads`. Drag a lead card (e.g., *HDFC Bank*) from the "New" column to "Contacted". Wait for the floating notification to appear. Open the card drawer, and tweak the deal value. Note the Live Model Score Preview shift, then click save.
- **Narrative**:
  > *"Moving to the Leads Pipeline. Operations directors can drag-and-drop lead cards to move them through pipeline stages. This triggers an optimistic update and busts backend analytics query caches. In the detail drawer, we see our key conversion drivers, local preview score, and AI Partner recommendations matching the lead's region and capacity."*

### Scene 4: Reports & Print (3:00 - 4:00)
- **Action**: Navigate to `/reports`. Click "Clear All" then "Select All" in the columns selection checklist. Click "PRINT REPORT" to trigger the print preview layout.
- **Narrative**:
  > *"Finally, we have the Reports page. We've added toggles to easily configure checklist fields. Users can download custom-sliced CSV sheets or click print to convert the dark interface into a clean, paper-ready executive PDF report."*

---

## 💬 2. Anticipated Executive Q&A Preparation

### Q1: Why was XGBoost selected over a simpler model like Logistic Regression?
- **Answer**:
  > *"While Logistic Regression provides a linear baseline, our lead metrics (like time to contact and follow-ups) exhibit non-linear interactions. XGBoost captures complex decision trees, resulting in an AUC-ROC of 80.2% compared to 71.4% from Logistic Regression, without any latency overhead (<3ms execution time)."*

### Q2: How is data privacy maintained in lead processing?
- **Answer**:
  > *"Lead records (names, emails, notes) are stored entirely on-premise within the local SQLite database. The ML model runs locally inside the Flask process using pre-loaded Joblib artifacts, meaning zero lead data is uploaded to third-party cloud engines."*

### Q3: How does the caching layer prevent stale data when bulk edits occur?
- **Answer**:
  > *"We utilize dynamic cache invalidation. Whenever a lead is added, edited, batch-scored, or uploaded via CSV, the backend calls `cache.clear()` before committing. This busts the SimpleCache, forcing subsequent page reads to fetch fresh metrics instantly."*
