# Bug Fix Log v2 (Day 29)

This log records bugs identified during Week 4 design reviews and Week 5 edge-case E2E testing, along with their resolutions.

---

## 🐛 Week 4 Feedback & UI Bugfixes

### 1. Bug-101: Drawer Modal Keyboard Trap (High Priority)
- **Symptom**: Users could not close the detail drawer using the `Esc` key when focus was inside text areas or selectors.
- **Resolution**: Added a global keydown event listener inside `Leads.jsx` and `Partners.jsx` to close drawer modals upon pressing `Escape`.
- **File**: `frontend/src/pages/Leads.jsx` & `frontend/src/pages/Partners.jsx`
- **Status**: **Resolved**.

### 2. Bug-102: Safari WebKit Glassmorphism Glitch (High Priority)
- **Symptom**: Background blurs (`backdrop-blur`) on cards did not render on older Safari versions, making text unreadable over radial gradient meshes.
- **Resolution**: Appended `-webkit-backdrop-filter` rules to all `.glass-*` CSS utilities.
- **File**: `frontend/src/index.css`
- **Status**: **Resolved**.

### 3. Bug-203: Reports Checklist Manual Overhead (Medium Priority - FB-04)
- **Symptom**: No quick toggle was available to select or deselect all columns inside the report exporter, requiring 11 individual clicks.
- **Resolution**: Integrated "Select All" and "Clear All" buttons next to the metrics selection header, updating the active metrics array programmatically.
- **File**: `frontend/src/pages/Reports.jsx`
- **Status**: **Resolved**.

### 4. Bug-204: Missing RefreshCw Import in Leads Drawer (Medium Priority)
- **Symptom**: When opening a lead drawer while detailed data was fetching, the system would crash due to `RefreshCw` not being defined/imported.
- **Resolution**: Imported `RefreshCw` from `lucide-react` at the top of the file.
- **File**: `frontend/src/pages/Leads.jsx`
- **Status**: **Resolved**.

---

## 🐛 Week 5 Edge-Case & Ingestion Bugfixes

### 5. Bug-401: Empty File Upload Server Crash (Medium Priority)
- **Symptom**: Uploading an empty CSV file caused the pandas parsing script to raise `EmptyDataError`, resulting in a `500 Internal Server Error`.
- **Resolution**: Wrapped file loading inside a try-catch block catching `EmptyDataError` and returning a clean `400 Bad Request` with validation warning.
- **File**: `backend/app/routes/uploads.py`
- **Status**: **Resolved**.

### 6. Bug-402: In-File Duplicates SQL Integrity Constraint Failure (High Priority)
- **Symptom**: If an uploaded sheet contained duplicate email keys, SQLite would crash with a Unique/Integrity Constraint violation because commits were run at the end of the loop, bypassing the database-check `.first()` queries.
- **Resolution**: Created `processed_emails` and `processed_ids` sets to filter out duplicates in-memory during sheet iteration.
- **File**: `backend/app/routes/uploads.py`
- **Status**: **Resolved**.

### 7. Bug-403: Cache Invalidation Lag on CSV Bulk Uploads (Medium Priority)
- **Symptom**: Homepage Overview cards remained un-updated for 5 minutes after a bulk CSV ingestion due to active route caching.
- **Resolution**: Imported `cache` and triggered `cache.clear()` upon successful commits in uploads routes.
- **File**: `backend/app/routes/uploads.py`
- **Status**: **Resolved**.
