import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';

const Overview = lazy(() => import('./pages/Overview.jsx'));
const Partners = lazy(() => import('./pages/Partners.jsx'));
const Leads = lazy(() => import('./pages/Leads.jsx'));
const Insights = lazy(() => import('./pages/Insights.jsx'));
const Reports = lazy(() => import('./pages/Reports.jsx'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={
        <div className="flex h-screen items-center justify-center bg-[#070b13] text-slate-400">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-[#6366f1] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold font-outfit uppercase tracking-wider">Loading Section...</span>
          </div>
        </div>
      }>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Overview />} />
            <Route path="partners" element={<Partners />} />
            <Route path="leads" element={<Leads />} />
            <Route path="insights" element={<Insights />} />
            <Route path="reports" element={<Reports />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
