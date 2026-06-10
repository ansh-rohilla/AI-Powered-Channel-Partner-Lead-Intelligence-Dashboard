# Demo Recording Guide: Vyana AI Dashboard (Day 28)

Use this guide to record your **3-5 minute screen walkthrough video** for the executive team and mentors. It is structured scene-by-scene to demonstrate all features and highlight the business impact of the machine learning integration.

---

## 🎥 Recording Pre-requisites
1. **Ensure the servers are running**:
   - Backend on `http://127.0.0.1:5000`
   - Frontend on `http://localhost:3000`
2. **Open the browser** and expand to full-screen mode at `http://localhost:3000`.
3. **Screen recorder settings**: Set resolution to 1080p and verify your microphone audio.

---

## ⏱️ Video Script Timeline

### Scene 1: Dashboard Overview (0:00 - 0:45)
- **On Screen**: The dashboard home page (`/`) with KPI cards and charts loaded.
- **Narrative Script**:
  > *"Hello, my name is Ansh Rohilla, and today I am thrilled to present the completed AI-Powered Channel Partner & Lead Intelligence Dashboard built for Vyana Innovations.*
  > *Starting on our Executive Dashboard, the system gives leadership an instant view of key metrics: Total Active Partners, Active Pipeline Leads, Aggregate Conversion Rate, and our total Pipeline Value in Rupees, formatted dynamically in Crores or Lakhs.*
  > *Below, our dual-axis trends chart maps lead intake volume against conversion rates over a rolling 12-week timeline. To the right, our Partner Tier Distribution donut chart details Bronze, Silver, and Gold allocations. Everything you see here is designed with a premium, responsive dark-slate glassmorphism aesthetic."*
- **Action**: Hover over the KPI cards to show the subtle card-lift effect and trace the Recharts lines to show tooltip responsiveness.

---

### Scene 2: Partner Heatmap & Filtering (0:45 - 1:45)
- **On Screen**: Click "Partners" in the sidebar to load the Partner Intelligence Directory.
- **Narrative Script**:
  > *"Next, let's navigate to the Partner Directory. Here we have a sortable list of our channel partners, including their primary contact cards, regions, and tiers.*
  > *To help sales managers identify regional density immediately, we built this interactive Regional Partner Heatmap. The grid columns represent our 5 regions, and the rows represent partner tiers. The color intensity of each cell indicates partner density.*
  > *Tapping a cell—for example, Gold partners in the West region—instantly filters our directory table below. This gives sales ops the ability to locate regional hubs in a single click."*
- **Action**: Click the **Gold/West** cell in the heatmap grid. Show the table filter in real-time. Click a row to open the partner detail drawer modal.
  > *"Clicking a partner slides open their comprehensive profile drawer. Here we can analyze contact cards, evaluate their lead conversion funnel progress bar, and review a sorted, chronological history timeline tracking onboarding, lead registrations, and won closures."*

---

### Scene 3: Leads Kanban Board & AI Drawer (1:45 - 2:45)
- **On Screen**: Click "Leads" in the sidebar to open the Kanban pipeline.
- **Narrative Script**:
  > *"Moving to our Leads Pipeline, we have a Kanban-style pipeline representing stages from New to Converted or Lost.*
  > *Each card features a color-coded AI Conversion Score calculated by our XGBoost classifier, running with an 80.2% AUC-ROC performance.*
  > *Hovering over a card reveals quick-movement arrows to advance leads. Clicking a card opens our Lead Detail Drawer. This is where explainable AI comes in: we present the exact features used, list the scoring drivers—such as warm referrals or low contact latency—and display a custom Recommended Action card. If we modify lead features—for example, increasing follow-up count—and click save, the backend instantly recalculates the score in real-time."*
- **Action**: Tweak the follow-up count from `2` to `6` in the drawer form, click save, and point out the sliding notification displaying the updated score.

---

### Scene 4: Reports, CSV Export & PDF Print (2:45 - 3:30)
- **On Screen**: Click "Reports" in the sidebar.
- **Narrative Script**:
  > *"Finally, let's look at the Reports page. Sales operations can scope data to Leads or Partners, select specific date ranges, and use a checkboxes checklist to choose exactly which columns to export.*
  > *Clicking 'Export CSV' generates and triggers a client-side download of the filtered spreadsheet immediately.*
  > *For board meetings, tapping 'Print Report' activates our custom print stylesheets. It hides all sidebars and buttons, turning our dark-themed dashboard into a clean, print-friendly black-and-white executive PDF summary."*
- **Action**: Click **Export CSV** to download the spreadsheet, then click **Print Report** to trigger the browser's PDF print layout preview.

---

### Scene 5: Conclusion (3:30 - 4:00)
- **On Screen**: Return to the main Dashboard (`/`).
- **Narrative Script**:
  > *"To summarize, this platform brings machine learning models directly to the sales floor, helping Vyana Innovations prioritize high-yielding leads, optimize partner distribution, and maximize overall pipeline value. Thank you for your time."*

---
*End of recording.*
