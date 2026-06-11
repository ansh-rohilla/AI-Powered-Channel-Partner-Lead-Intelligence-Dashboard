# E2E Test Checklist: Vyana AI Dashboard (Day 29)

This document contains the End-to-End (E2E) testing checklist used to validate the data ingestion pipeline, partner directory, leads scoring, and reporting system.

---

## 📋 Ingestion Pipeline & File Ingestion Verification

- [x] **File Ingestion - Successful CSV Upload**
  - *Action*: Upload a valid `partners.csv` sheet containing 5 clean records.
  - *Expected*: Returns `200 OK` with JSON outlining number of inserted and updated partners.
  - *Status*: **Passed**.

- [x] **Edge Case - Empty File Ingestion**
  - *Action*: Upload `docs/sample_edge_case_empty.csv` (0 bytes).
  - *Expected*: Returns `400 Bad Request` with message `"The uploaded file is empty or invalid."`.
  - *Status*: **Passed**.

- [x] **Edge Case - Duplicate In-File Records**
  - *Action*: Upload `docs/sample_edge_case_duplicates.csv` containing two rows with the same contact email.
  - *Expected*: Ingests the first record and skips/rejects the second as a duplicate validation error in the JSON response, without failing the database transaction.
  - *Status*: **Passed**.

- [x] **Edge Case - Missing Required Columns**
  - *Action*: Upload `docs/sample_edge_case_missing.csv` (missing `onboarded_date`).
  - *Expected*: Returns `400 Bad Request` outlining missing columns.
  - *Status*: **Passed**.

---

## 📋 Dashboard Navigation & Pipeline Verification

- [x] **Partner Directory Display**
  - *Action*: Open the `/partners` page. Click a cell in the Regional Partner Density Heatmap.
  - *Expected*: Heatmap filters the partners list correctly. Click a row to open the drill-down drawer.
  - *Status*: **Passed**.

- [x] **HTML5 Drag-and-Drop Pipeline**
  - *Action*: Open the `/leads` page. Drag a lead card from the "New Leads" stage and drop it into "Contacted".
  - *Expected*: Card updates stage optimistically, highlights the drop zone, triggers a background API call to update the lead's status in SQLite, recalculates ML scores, and shows a floating notification.
  - *Status*: **Passed**.

- [x] **AI Matchmaker Verification**
  - *Action*: Open a lead detail drawer. Locate the "AI Partner Recommendation" card.
  - *Expected*: Evaluates and recommends the Top 3 match partners. Click "Assign" on a candidate.
  - *Status*: **Passed**.

- [x] **Live Parameter Preview**
  - *Action*: Tweak ranges in the lead parameter edit form.
  - *Expected*: The live preview badge reflects estimated score changes in real time.
  - *Status*: **Passed**.

---

## 📋 Reporting & Exporting Verification

- [x] **Select/Clear All Checklist Toggle**
  - *Action*: Open the `/reports` page. Click "Clear All" then "Select All".
  - *Expected*: Selects and deselects all 11 checkboxes instantly.
  - *Status*: **Passed**.

- [x] **CSV Data Export**
  - *Action*: Click "EXPORT CSV DATA".
  - *Expected*: File triggers download in the browser with selected columns and escaped double quotes.
  - *Status*: **Passed**.

- [x] **PDF Printing Style Verification**
  - *Action*: Click "PRINT REPORT / PDF" or trigger print (`Ctrl+P` / `Cmd+P`).
  - *Expected*: Main layouts, sidebars, and buttons disappear. Shows clean paper-style report.
  - *Status*: **Passed**.
