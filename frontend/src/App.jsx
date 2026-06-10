import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Overview from './pages/Overview.jsx';
import Partners from './pages/Partners.jsx';
import Leads from './pages/Leads.jsx';
import Insights from './pages/Insights.jsx';
import Reports from './pages/Reports.jsx';

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
