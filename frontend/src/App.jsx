import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Overview from './pages/Overview.jsx';
import Partners from './pages/Partners.jsx';
import Leads from './pages/Leads.jsx';
import Reports from './pages/Reports.jsx';

const Insights = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold font-outfit mb-2">Explainable AI Insights</h1>
    <p className="text-slate-400">Analyze lead prioritization drivers and feature contributions.</p>
    <div className="mt-6 glass-card p-12 text-center text-slate-500 border-dashed border-white/5 bg-slate-900/10">
      Explainability analytics & feature impact grids coming in next sprint.
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}

export default App;
