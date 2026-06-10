# Week 4 Review: Feedback Log & Bugfix Priority List (Day 28)

**Project Title**: AI-Powered Channel Partner & Lead Intelligence Dashboard  
**Sprint Phase**: Phase 4 — Frontend & UI Wrap-up  

---

## 1. Executive Summary

At the conclusion of Week 4, the completed Vyana AI Dashboard was reviewed by the design and engineering mentors. The core objective was to validate the user interface (UI/UX), evaluate the integration of the Machine Learning leads prioritization scores, review custom reporting and CSV data exports, and confirm compliance with responsiveness and accessibility (ARIA) standards.

Overall feedback was highly positive, highlighting the premium visual style, responsive side layouts, and the interactive re-scoring feature inside the Lead Kanban Board. Below is the compiled feedback log and bugfix checklist.

---

## 2. Mentor Feedback Log

| ID | Category | Feedback Note | Priority | Action taken / Status |
| :--- | :---: | :--- | :---: | :--- |
| **FB-01** | UI/UX | "The dark-slate theme is visually stunning. Ensure that when API calls are loading, pulsing skeletons match the grid shapes exactly to prevent layout shifts." | **High** | **Completed**. Added `Skeletons.jsx` mimicking card grid and table heights during data fetch operations. |
| **FB-02** | ML Engine | "The explanation cards in the lead detail drawer are very helpful. We should color-code the impact percentages (green for positive contribution, red/amber for negative/neutral factors) to improve scannability." | **Medium** | **Completed**. Styled percentage badges (`+28.1%` in emerald, `-15.3%` in rose) to align with features. |
| **FB-03** | Operations | "The batch re-scoring button is a great addition. If there are tens of thousands of leads, running it on the main thread inside SQLite will block. We should log latency stats for now and plan for async worker queues." | **Low** | **Logged**. Added latency logging (e.g. `Latency: 6.4ms`) in logs. Future scope will move bulk jobs to Celery workers. |
| **FB-04** | Export | "The CSV columns checklist works well. We should add a 'Select All' toggle to speed up selecting all 11 metrics." | **Medium** | **Planned for next release**. |
| **FB-05** | Accessibility | "Ensure the drawer modals close when clicking the Backdrop or pressing the Escape key, which is critical for keyboard navigation." | **High** | **Completed**. Added backdrop click handlers and `Escape` key event listeners inside Leads and Partners page modals. |

---

## 3. Bugfix Priority List & Resolution Log

### A. Critical Severity (Blockers)
*None active. All endpoints, routing wrappers, and build pipelines compile and run without errors.*

### B. High Severity
- **Bug-101: Drawer Modal Keyboard Trap**
  - *Symptom*: Users could not close the Lead Detail Drawer using the `Esc` key when focus was trapped inside forms.
  - *Resolution*: Implemented a global `keydown` event listener inside `Leads.jsx` that captures `Escape` and calls `setSelectedLeadId(null)`.
  - *Status*: **Resolved**.
- **Bug-102: Safari Glassmorphism Filter Glitch**
  - *Symptom*: The backdrop-filter blur did not render correctly on older WebKit engines, making text look illegible over the radial gradient background mesh.
  - *Resolution*: Added `-webkit-backdrop-filter` alongside standard `backdrop-filter` declarations in `index.css`.
  - *Status*: **Resolved**.

### C. Medium Severity
- **Bug-201: Chart Label Clipping**
  - *Symptom*: On smaller laptop screens (13-inch), the Y-axis label numbers on the Recharts Area chart were clipped at the left edge.
  - *Resolution*: Set Y-axis padding width to `margin={{ left: -20 }}` and adjusted axis label spacing.
  - *Status*: **Resolved**.
- **Bug-202: CSV String Escape Glitch**
  - *Symptom*: If auditor notes contained double quotes, the CSV export would break rows and columns.
  - *Resolution*: Updated the CSV exporter inside `Reports.jsx` to escape double quotes correctly: `replace(/"/g, '""')`.
  - *Status*: **Resolved**.

### D. Low Severity
- **Bug-301: Hover Shift on Partners Table**
  - *Symptom*: Row heights shifted by 1px when hovering over partner rows due to border thickness active states.
  - *Resolution*: Changed border configurations on table elements to maintain static heights.
  - *Status*: **Resolved**.
