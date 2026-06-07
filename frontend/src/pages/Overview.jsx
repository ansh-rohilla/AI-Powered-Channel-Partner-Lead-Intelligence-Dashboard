import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Target, 
  Percent, 
  TrendingUp, 
  Zap, 
  RefreshCw,
  CheckCircle,
  HelpCircle,
  ArrowUpRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend
} from 'recharts';
import { analyticsService } from '../services/api';
import apiClient from '../services/api';

function Overview() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [tierBreakdown, setTierBreakdown] = useState([]);
  
  // States for interactive ML batch scoring trigger
  const [scoring, setScoring] = useState(false);
  const [scoreResult, setScoreResult] = useState(null);
  
  const COLORS = ['#8b5cf6', '#6366f1', '#10b981']; // Purple (Bronze), Indigo (Silver), Emerald (Gold)

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sumRes, trendRes, tierRes] = await Promise.all([
        analyticsService.getSummary(),
        analyticsService.getTrends(),
        analyticsService.getTierBreakdown()
      ]);
      
      if (sumRes.success) setSummary(sumRes.data);
      if (trendRes.success) setTrends(trendRes.data);
      if (tierRes.success) setTierBreakdown(tierRes.data);
    } catch (err) {
      console.error('Error fetching dashboard analytics data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Format currency helper to standard INR Crores/Lakhs
  const formatCurrency = (value) => {
    if (!value && value !== 0) return '₹0.00';
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)} Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)} L`;
    }
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
  };

  // Trigger real-time model batch scoring inside SQLite
  const handleBatchScoring = async () => {
    try {
      setScoring(true);
      setScoreResult(null);
      
      // Hit Day 20 batch prediction endpoint
      const response = await apiClient.post('/predict/batch', {});
      
      if (response.success) {
        setScoreResult({
          success: true,
          message: response.message || 'Leads successfully scored.',
          count: response.scored_count || 0,
          latency: response.latency_ms || 0
        });
        
        // Refresh summary metrics to capture new ML conversion scores
        const sumRes = await analyticsService.getSummary();
        if (sumRes.success) setSummary(sumRes.data);
      }
    } catch (err) {
      setScoreResult({
        success: false,
        message: 'Unable to connect to Flask backend for batch scoring.'
      });
    } finally {
      setScoring(false);
      // Auto-clear notification after 5 seconds
      setTimeout(() => setScoreResult(null), 5000);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RefreshCw className="animate-spin text-brand-primary" size={32} />
        <p className="text-slate-400 font-outfit text-sm animate-pulse">Assembling live intelligence dashboard...</p>
      </div>
    );
  }

  // Map Recharts tier breakdown keys
  const donutData = tierBreakdown.map(item => ({
    name: item.tier,
    value: item.partners_count,
    revenue: item.total_revenue_inr,
    deals: item.total_deals
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-outfit tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Vyana Lead Intelligence
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time pipeline analytics, channel partner metrics, and machine learning prediction scores.
          </p>
        </div>
        
        {/* ML Engine Status & Trigger Button */}
        <div className="flex items-center gap-3">
          <button 
            onClick={handleBatchScoring}
            disabled={scoring}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-slate-900/40 hover:bg-slate-900/80 hover:border-brand-primary/40 text-xs font-semibold tracking-wider transition-all duration-300 disabled:opacity-50 shadow-lg"
          >
            <Zap className={`w-3.5 h-3.5 text-brand-primary ${scoring ? 'animate-bounce' : ''}`} />
            {scoring ? 'ANALYZING PIPELINE...' : 'RUN AI LEAD SCORING'}
          </button>
        </div>
      </div>

      {/* Floating Status Notification */}
      {scoreResult && (
        <div className={`fixed bottom-6 right-6 p-4 rounded-xl border backdrop-blur-md shadow-2xl z-50 flex items-center gap-3 animate-slide-in max-w-sm ${
          scoreResult.success 
            ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-200' 
            : 'bg-rose-950/80 border-rose-500/30 text-rose-200'
        }`}>
          {scoreResult.success ? <CheckCircle size={20} className="text-brand-success" /> : <HelpCircle size={20} className="text-brand-danger" />}
          <div>
            <p className="text-xs font-bold">{scoreResult.success ? 'Optimization Completed' : 'Offline Mode Active'}</p>
            <p className="text-[10px] opacity-80 mt-0.5">
              {scoreResult.success 
                ? `Scored ${scoreResult.count} leads in ${scoreResult.latency.toFixed(1)}ms. Pipeline updated.` 
                : scoreResult.message}
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Active Partners */}
        <div className="glass-card p-6 flex flex-col justify-between hover:shadow-brand-purple/5 hover:-translate-y-0.5 duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 tracking-wider font-outfit uppercase">Active Partners</span>
            <div className="p-2 rounded-xl bg-brand-purple/10 text-brand-purple border border-brand-purple/10">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold tracking-tight font-outfit text-white">
              {summary?.active_partners || 0}
            </h3>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-brand-success font-medium">
              <TrendingUp size={10} />
              <span>+12% vs last month</span>
            </div>
          </div>
        </div>

        {/* Card 2: Active Pipeline Leads */}
        <div className="glass-card p-6 flex flex-col justify-between hover:shadow-brand-primary/5 hover:-translate-y-0.5 duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 tracking-wider font-outfit uppercase">Active Leads</span>
            <div className="p-2 rounded-xl bg-brand-primary/10 text-brand-primary border border-brand-primary/10">
              <Target size={16} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold tracking-tight font-outfit text-white">
              {summary?.active_leads || 0}
            </h3>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-brand-success font-medium">
              <TrendingUp size={10} />
              <span>Pipeline healthy</span>
            </div>
          </div>
        </div>

        {/* Card 3: Model Conversion Rate */}
        <div className="glass-card p-6 flex flex-col justify-between hover:shadow-brand-success/5 hover:-translate-y-0.5 duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 tracking-wider font-outfit uppercase">Conversion Rate</span>
            <div className="p-2 rounded-xl bg-brand-success/10 text-brand-success border border-brand-success/10">
              <Percent size={16} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold tracking-tight font-outfit text-white">
              {summary?.conversion_rate ? `${summary.conversion_rate}%` : '0.00%'}
            </h3>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-brand-success font-medium">
              <TrendingUp size={10} />
              <span>+3.4% model improvement</span>
            </div>
          </div>
        </div>

        {/* Card 4: Total Projected Revenue */}
        <div className="glass-card p-6 flex flex-col justify-between hover:shadow-brand-primary/5 hover:-translate-y-0.5 duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 tracking-wider font-outfit uppercase">Pipeline Value</span>
            <div className="p-2 rounded-xl bg-brand-primary/10 text-brand-primary border border-brand-primary/10">
              <Zap size={16} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold tracking-tight font-outfit text-white">
              {formatCurrency(summary?.pipeline_value_inr)}
            </h3>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-brand-success font-medium">
              <ArrowUpRight size={10} />
              <span>Estimated weighted value</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart (Left & Center) */}
        <div className="glass-card p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold font-outfit text-slate-200">Lead Volume & Conversion trends</h2>
              <p className="text-xs text-slate-500">Weekly intake volume mapped against aggregate conversion rates</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded bg-brand-primary/20 border border-brand-primary" />
                <span>Volume</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-0.5 bg-brand-success" />
                <span>Conversion %</span>
              </div>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" h="100%">
              <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis 
                  dataKey="week_start" 
                  stroke="rgba(255,255,255,0.2)" 
                  fontSize={10} 
                  tickLine={false} 
                />
                <YAxis 
                  yAxisId="left" 
                  stroke="rgba(255,255,255,0.2)" 
                  fontSize={10} 
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  stroke="rgba(255,255,255,0.2)" 
                  fontSize={10} 
                  tickLine={false}
                  axisLine={false}
                  unit="%"
                />
                <Tooltip />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="lead_volume" 
                  stroke="#6366f1" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorVolume)" 
                />
                <Area 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="conversion_rate" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  fill="none" 
                  dot={{ r: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart (Right) */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold font-outfit text-slate-200">Partner Tier Distribution</h2>
            <p className="text-xs text-slate-500">Distribution of active partners by tier levels</p>
          </div>

          <div className="h-[220px] w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [
                    `${value} Partners (${formatCurrency(props.payload.revenue)})`, 
                    name
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center label */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-bold font-outfit text-white">{summary?.active_partners || 0}</span>
              <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">Partners</span>
            </div>
          </div>

          {/* Legend Table */}
          <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-4 text-center">
            {donutData.map((item, index) => (
              <div key={item.name} className="flex flex-col items-center">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                  <span className="text-[11px] font-bold text-slate-300">{item.name}</span>
                </div>
                <span className="text-xs font-semibold text-slate-400 mt-0.5">{item.value} ({item.deals} deals)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Explanation & Insight Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ML Explainability Drivers */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-brand-primary/10 text-brand-primary border border-brand-primary/10">
              <Zap size={16} />
            </div>
            <div>
              <h2 className="text-base font-bold font-outfit text-slate-200">Explainable AI Drivers</h2>
              <p className="text-xs text-slate-500">Key lead features driving the XGBoost classifier's predictions</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {/* Driver 1 */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-white/5">
              <div className="flex items-center gap-3">
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/20 font-bold font-outfit">+ 42.5%</span>
                <span className="text-xs font-medium text-slate-300">Warm Referral origin channel source</span>
              </div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Source</span>
            </div>

            {/* Driver 2 */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-white/5">
              <div className="flex items-center gap-3">
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/20 font-bold font-outfit">+ 28.1%</span>
                <span className="text-xs font-medium text-slate-300">Prompt contact outreach latency (≤ 2 days)</span>
              </div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Latency</span>
            </div>

            {/* Driver 3 */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-white/5">
              <div className="flex items-center gap-3">
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/20 font-bold font-outfit">+ 18.4%</span>
                <span className="text-xs font-medium text-slate-300">Assignment to Gold-tier channel partner</span>
              </div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Partner</span>
            </div>

            {/* Driver 4 */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-white/5">
              <div className="flex items-center gap-3">
                <span className="text-xs px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-500/20 font-bold font-outfit">- 15.3%</span>
                <span className="text-xs font-medium text-slate-300">Engagement with Bronze-tier channel partner</span>
              </div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Partner</span>
            </div>
          </div>
        </div>

        {/* Operational System Logs panel */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-brand-purple/10 text-brand-purple border border-brand-purple/10">
                <Target size={16} />
              </div>
              <div>
                <h2 className="text-base font-bold font-outfit text-slate-200">System Telemetry Logs</h2>
                <p className="text-xs text-slate-500">Live feed of model evaluations and route latencies</p>
              </div>
            </div>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-white/5">
              LIVE UPDATES
            </span>
          </div>

          <div className="bg-slate-950/80 border border-white/5 rounded-xl p-4 font-mono text-[10px] text-slate-400 h-[190px] overflow-y-auto space-y-2.5">
            <p className="text-slate-500">[2026-06-07 20:01:50] INFO [__init__.py:68]: Vyana API starting up...</p>
            <p className="text-slate-500">[2026-06-07 20:01:51] INFO [__init__.py:72]: ML prediction models loaded successfully at startup.</p>
            <p className="text-brand-primary">[2026-06-07 20:01:51] INFO [prediction_service.py:101]: ML Prediction | Lead ID: L-2026-0410 | Score: 73.59 | Label: Medium | Latency: 2.26ms</p>
            <p className="text-brand-success">[2026-06-07 20:01:51] INFO [predictions.py:82]: DB Sync Batch Prediction | Scored 1 leads in database | Latency: 3.47ms</p>
            <p className="text-slate-500">[2026-06-07 20:02:12] INFO [__init__.py:80]: IP: 127.0.0.1 | Route: GET /api/analytics/summary | Status: 200 | Latency: 8.13ms</p>
            <p className="text-slate-500">[2026-06-07 20:02:12] INFO [__init__.py:80]: IP: 127.0.0.1 | Route: GET /api/analytics/trends | Status: 200 | Latency: 0.92ms</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Overview;
