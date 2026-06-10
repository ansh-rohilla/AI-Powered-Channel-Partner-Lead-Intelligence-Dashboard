import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Calendar, 
  Sliders, 
  CheckCircle2, 
  PieChart as ChartIcon, 
  Briefcase,
  Layers
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { leadService, partnerService } from '../services/api';

function Reports() {
  const [dataType, setDataType] = useState('leads'); // 'leads' or 'partners'
  const [loading, setLoading] = useState(true);
  const [leadsData, setLeadsData] = useState([]);
  const [partnersData, setPartnersData] = useState([]);
  
  // Report filters
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-06-30');
  const [region, setRegion] = useState('');
  
  // Checklist for columns to export
  const [selectedMetrics, setSelectedMetrics] = useState({
    leads: ['lead_id', 'company_name', 'deal_value_inr', 'status', 'created_date', 'ml_score'],
    partners: ['partner_id', 'company_name', 'tier', 'annual_revenue_inr', 'deal_count', 'status']
  });

  const availableColumns = {
    leads: [
      { id: 'lead_id', label: 'Lead ID' },
      { id: 'company_name', label: 'Company Name' },
      { id: 'contact_name', label: 'Contact Person' },
      { id: 'contact_email', label: 'Email Address' },
      { id: 'region', label: 'Region' },
      { id: 'lead_source', label: 'Lead Source' },
      { id: 'product_interest', label: 'Product Interest' },
      { id: 'deal_value_inr', label: 'Deal Value (INR)' },
      { id: 'status', label: 'Status' },
      { id: 'created_date', label: 'Date Created' },
      { id: 'ml_score', label: 'AI Score (%)' }
    ],
    partners: [
      { id: 'partner_id', label: 'Partner ID' },
      { id: 'company_name', label: 'Company Name' },
      { id: 'contact_name', label: 'Contact Person' },
      { id: 'contact_email', label: 'Email Address' },
      { id: 'region', label: 'Region' },
      { id: 'city', label: 'City' },
      { id: 'tier', label: 'Partner Tier' },
      { id: 'annual_revenue_inr', label: 'Annual Revenue (INR)' },
      { id: 'deal_count', label: 'Total Deals Completed' },
      { id: 'active_leads', label: 'Active Leads' },
      { id: 'status', label: 'Status' }
    ]
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [leadsRes, partnersRes] = await Promise.all([
        leadService.getLeads(),
        partnerService.getPartners()
      ]);
      if (leadsRes.success) setLeadsData(leadsRes.data);
      if (partnersRes.success) setPartnersData(partnersRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter lists based on date ranges and regions
  const getFilteredLeads = () => {
    return leadsData.filter(l => {
      const dateMatch = (!startDate || l.created_date >= startDate) && (!endDate || l.created_date <= endDate);
      const regionMatch = !region || l.region === region;
      return dateMatch && regionMatch;
    });
  };

  const getFilteredPartners = () => {
    return partnersData.filter(p => {
      // For partners, filter by onboarded date if available
      const dateMatch = !p.onboarded_date || ((!startDate || p.onboarded_date >= startDate) && (!endDate || p.onboarded_date <= endDate));
      const regionMatch = !region || p.region === region;
      return dateMatch && regionMatch;
    });
  };

  const currentFilteredData = dataType === 'leads' ? getFilteredLeads() : getFilteredPartners();

  // Toggle metric selection checkbox
  const handleMetricToggle = (colId) => {
    setSelectedMetrics(prev => {
      const currentList = prev[dataType];
      const newList = currentList.includes(colId)
        ? currentList.filter(id => id !== colId)
        : [...currentList, colId];
      return { ...prev, [dataType]: newList };
    });
  };

  // CSV Generator Logic
  const handleExportCSV = () => {
    const activeCols = availableColumns[dataType].filter(c => selectedMetrics[dataType].includes(c.id));
    
    // 1. Headers Row
    const headers = activeCols.map(c => `"${c.label}"`).join(',');
    
    // 2. Data Rows
    const rows = currentFilteredData.map(item => {
      return activeCols.map(col => {
        let val = item[col.id];
        if (val === null || val === undefined) return '""';
        if (typeof val === 'string') return `"${val.replace(/"/g, '""')}"`;
        return val;
      }).join(',');
    });

    const csvContent = [headers, ...rows].join('\n');
    
    // 3. Trigger Browser Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const filename = `vyana_${dataType}_report_${new Date().toISOString().split('T')[0]}.csv`;
    
    if (navigator.msSaveBlob) { // IE 10+
      navigator.msSaveBlob(blob, filename);
    } else {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Trigger window print executive report
  const handlePrint = () => {
    window.print();
  };

  // Compile Chart data (leads volume by region)
  const getChartData = () => {
    const list = getFilteredLeads();
    const regions = ["North", "South", "East", "West", "Central"];
    return regions.map(r => {
      const regionLeads = list.filter(l => l.region === r);
      const val = regionLeads.reduce((sum, l) => sum + l.deal_value_inr, 0);
      return {
        name: r,
        "Leads Count": regionLeads.length,
        "Pipeline (INR Lakhs)": Math.round(val / 100000)
      };
    });
  };

  // Formatter for Currency
  const formatCurrency = (value) => {
    if (!value) return '₹0.00';
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)} L`;
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12 print-container">
      {/* Inject print stylesheet overrides dynamically */}
      <style>{`
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          aside, header, button, .no-print {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
          .glass-card {
            background: #ffffff !important;
            border: 1px solid #e2e8f0 !important;
            box-shadow: none !important;
            color: #000000 !important;
          }
          .text-slate-400, .text-slate-500 {
            color: #475569 !important;
          }
          .text-white {
            color: #0f172a !important;
          }
          .print-header {
            display: block !important;
            border-bottom: 2px solid #000 !important;
            padding-bottom: 8px !important;
            margin-bottom: 24px !important;
          }
          .chart-container {
            filter: invert(0) !important;
          }
        }
        .print-header {
          display: none;
        }
      `}</style>

      {/* Printable Report Header */}
      <div className="print-header">
        <h1 className="text-2xl font-bold font-outfit text-slate-900">VYANA AI EXECUTIVE INTELLIGENCE REPORT</h1>
        <p className="text-xs text-slate-600">Filters: Date Range ({startDate} to {endDate}) | Region: {region || 'All'}</p>
        <p className="text-[10px] text-slate-500 mt-0.5">Generated: {new Date().toLocaleString()}</p>
      </div>

      {/* Header (No print) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-3xl font-extrabold font-outfit tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Executive Report Exports
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Generate custom data exports, download audit CSV files, and print structured executive pipelines.
          </p>
        </div>
        
        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-slate-900/40 hover:bg-slate-900/80 text-xs font-semibold font-outfit transition-all duration-300"
          >
            <Printer size={14} className="text-brand-purple" />
            <span>PRINT REPORT / PDF</span>
          </button>
          
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/80 text-xs font-semibold font-outfit transition-all duration-300 shadow-lg shadow-brand-primary/20"
          >
            <Download size={14} />
            <span>EXPORT CSV DATA</span>
          </button>
        </div>
      </div>

      {/* Section 1: Filters Bar (No print) */}
      <div className="glass-card p-6 grid grid-cols-1 md:grid-cols-4 gap-6 no-print">
        {/* DataType selection */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Report Scope</label>
          <div className="flex rounded-xl bg-slate-950 p-1 border border-white/5">
            <button
              onClick={() => setDataType('leads')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold font-outfit transition-all ${
                dataType === 'leads' ? 'bg-slate-900 text-white border border-white/5 shadow-inner' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Leads Pipeline
            </button>
            <button
              onClick={() => setDataType('partners')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold font-outfit transition-all ${
                dataType === 'partners' ? 'bg-slate-900 text-white border border-white/5 shadow-inner' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Partners List
            </button>
          </div>
        </div>

        {/* Start Date */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Start Date</label>
          <div className="relative">
            <Calendar size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full glass-input pl-11 text-xs py-2"
            />
          </div>
        </div>

        {/* End Date */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">End Date</label>
          <div className="relative">
            <Calendar size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full glass-input pl-11 text-xs py-2"
            />
          </div>
        </div>

        {/* Region */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Filter Region</label>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="glass-input text-xs py-2 pr-8 cursor-pointer"
          >
            <option value="">All Regions</option>
            <option value="North">North</option>
            <option value="South">South</option>
            <option value="East">East</option>
            <option value="West">West</option>
            <option value="Central">Central</option>
          </select>
        </div>
      </div>

      {/* Section 2: Metric checklist (No print) */}
      <div className="glass-card p-6 space-y-4 no-print">
        <div className="flex items-center gap-2">
          <Sliders size={14} className="text-brand-primary" />
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Custom Fields Selection Checklist</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {availableColumns[dataType].map(col => {
            const isChecked = selectedMetrics[dataType].includes(col.id);
            return (
              <button
                key={col.id}
                onClick={() => handleMetricToggle(col.id)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-2 transition-all ${
                  isChecked 
                    ? 'bg-brand-primary/10 border-brand-primary/40 text-brand-primary shadow-sm' 
                    : 'bg-slate-900/40 border-white/5 text-slate-400 hover:text-slate-200'
                }`}
              >
                <CheckCircle2 size={12} className={isChecked ? 'opacity-100' : 'opacity-20'} />
                <span>{col.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 3: Summary Stat Cards for Executive Print-Friendly View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 text-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Filtered Lead count</span>
          <p className="text-2xl font-bold font-outfit text-white mt-1">
            {getFilteredLeads().length} leads
          </p>
        </div>
        <div className="glass-card p-6 text-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Total Pipeline Valuation</span>
          <p className="text-2xl font-bold font-outfit text-brand-primary mt-1">
            {formatCurrency(getFilteredLeads().reduce((sum, l) => sum + l.deal_value_inr, 0))}
          </p>
        </div>
        <div className="glass-card p-6 text-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Active Partners Scoped</span>
          <p className="text-2xl font-bold font-outfit text-white mt-1">
            {getFilteredPartners().length} partners
          </p>
        </div>
      </div>

      {/* Section 4: Print chart */}
      <div className="glass-card p-6 space-y-4 chart-container">
        <div>
          <h2 className="text-base font-bold font-outfit text-slate-200">Regional Sales Valuation Breakdown</h2>
          <p className="text-xs text-slate-500">Pipeline totals and total leads count scoped by region</p>
        </div>
        <div className="h-[250px] w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={getChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} />
              <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip />
              <Legend verticalAlign="top" height={36} iconSize={12} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Leads Count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Pipeline (INR Lakhs)" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Section 5: Data Preview list */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-slate-900/30 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Export Preview</h2>
            <p className="text-[10px] text-slate-500">Showing first 5 scoped records matching filters</p>
          </div>
          <span className="text-[10px] font-bold text-slate-400">Total Scoped: {currentFilteredData.length}</span>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">
            Fetching report records...
          </div>
        ) : currentFilteredData.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No records matched current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/5 bg-slate-900/20 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  {availableColumns[dataType]
                    .filter(c => selectedMetrics[dataType].includes(c.id))
                    .map(col => (
                      <th key={col.id} className="py-3 px-4">{col.label}</th>
                    ))
                  }
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[11px] text-slate-300">
                {currentFilteredData.slice(0, 5).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/10">
                    {availableColumns[dataType]
                      .filter(c => selectedMetrics[dataType].includes(c.id))
                      .map(col => {
                        let val = row[col.id];
                        if (col.id.includes('revenue') || col.id.includes('value')) {
                          val = formatCurrency(val);
                        }
                        if (col.id === 'ml_score') {
                          val = val ? `${val}%` : 'N/A';
                        }
                        return <td key={col.id} className="py-3 px-4 truncate max-w-[150px]">{val}</td>;
                      })
                    }
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Reports;
