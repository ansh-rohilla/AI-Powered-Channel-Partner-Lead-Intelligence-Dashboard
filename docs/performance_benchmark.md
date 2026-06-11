# Performance Benchmark Report (Day 30)

This report details the performance benchmarking metrics for the Vyana AI Dashboard across backend caching, machine learning inference speed, and frontend build optimization.

---

## ⚡ 1. Backend API Analytics Caching

We utilize **Flask-Caching** with an in-memory `SimpleCache` backend to cache database-heavy query results.

| Metric | Without Caching (Database Query) | With Caching (SimpleCache Hit) | Performance Lift |
| :--- | :---: | :---: | :---: |
| **`/api/analytics/summary`** | 34.09 ms | 0.39 ms | **87.4x faster** |
| **`/api/analytics/trends`** | 15.08 ms | 0.08 ms | **188.5x faster** |
| **`/api/analytics/tier-breakdown`** | 3.46 ms | 0.06 ms | **57.6x faster** |
| **`/api/analytics/regional`** | 1.84 ms | 0.05 ms | **36.8x faster** |

### Cache Coherency
- Caches are automatically invalidated using `cache.clear()` when leads are **created**, **updated**, **deleted**, **batch-scored**, or **bulk CSV files are uploaded**, guaranteeing immediate data updates on the dashboard while maintaining ultra-fast load times for read-only operations.

---

## 🧠 2. Machine Learning Inference Latency

The XGBoost model conversion scoring pipeline was profiled on single lead calculations.

- **Target Latency Threshold**: < 200 ms
- **Profiled Single Prediction Latency**: **1.38 ms – 5.90 ms** (Average: **2.32 ms**)
- **Database Batch Sync Scoring (100+ items)**: **3.45 ms** total latency
- **ML Optimization Status**: **Excellent**. Well below target thresholds due to pre-loading models and preprocessing pipelines in memory at flask server startup.

---

## 🎨 3. Frontend Bundle & Render Optimization

### Route Lazy-Loading & Code Splitting
We implemented route-level code splitting using `React.lazy` and `Suspense` inside [App.jsx](file:///Users/anshrohilla/Documents/AI-Powered%20Channel%20Partner%20&%20Lead%20Intelligence%20Dashboard/frontend/src/App.jsx).

| Bundle Chunk | Before Lazy Loading | After Lazy Loading (Split Chunk) | Code-Splitting Status |
| :--- | :---: | :---: | :---: |
| **Initial Bundle Size** | 739.20 kB | **179.79 kB** | **75.6% reduction in startup payload** |
| `/pages/Leads.jsx` | Inline | 24.42 kB | Lazy Loaded on routing |
| `/pages/Overview.jsx` | Inline | 55.04 kB | Lazy Loaded on routing |
| `/pages/Partners.jsx` | Inline | 21.98 kB | Lazy Loaded on routing |
| `/pages/Insights.jsx` | Inline | 14.90 kB | Lazy Loaded on routing |
| `/pages/Reports.jsx` | Inline | 14.88 kB | Lazy Loaded on routing |

### Memoized Rendering
- Extracted card render code into a `LeadCard` component memoized via `React.memo`. This limits React component updates strictly to the card being dragged and the drop stages, preventing redraws of all 200+ cards when hovering over Kanban columns.
