import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Mail, 
  Phone, 
  Calendar, 
  X, 
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Award,
  Zap,
  Activity,
  Briefcase,
  ExternalLink,
  Target
} from 'lucide-react';
import { partnerService } from '../services/api';

function Partners() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering & Sorting State
  const [filters, setFilters] = useState({
    q: '',
    tier: '',
    region: '',
    status: ''
  });
  const [sortBy, setSortBy] = useState('company_name');
  const [sortDir, setSortDir] = useState('asc');
  
  // Heatmap State (toggled region/tier filter cell)
  const [activeHeatmapCell, setActiveHeatmapCell] = useState(null); // { region, tier }

  // Modal State
  const [selectedPartnerId, setSelectedPartnerId] = useState(null);
  const [partnerDetail, setPartnerDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const regions = ["North", "South", "East", "West", "Central"];
  const tiers = ["Gold", "Silver", "Bronze"];

  const fetchPartners = async () => {
    try {
      setLoading(true);
      // Construct params including search, filters, and sort
      const params = {
        q: filters.q,
        tier: filters.tier,
        region: filters.region,
        status: filters.status,
        sort_by: sortBy,
        sort_dir: sortDir
      };
      
      const res = await partnerService.getPartners(params);
      if (res.success) {
        setPartners(res.data);
      }
    } catch (err) {
      console.error('Error fetching partners', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, [filters, sortBy, sortDir]);

  // Load detailed partner profiles upon modal open
  useEffect(() => {
    if (selectedPartnerId) {
      const fetchDetail = async () => {
        try {
          setLoadingDetail(true);
          const res = await partnerService.getPartnerDetail(selectedPartnerId);
          if (res.success) {
            setPartnerDetail(res.data);
          }
        } catch (err) {
          console.error(`Error loading partner ${selectedPartnerId}`, err);
        } finally {
          setLoadingDetail(false);
        }
      };
      fetchDetail();
    } else {
      setPartnerDetail(null);
    }
  }, [selectedPartnerId]);

  // Handle heatmap click to filter table
  const handleHeatmapClick = (region, tier) => {
    if (activeHeatmapCell?.region === region && activeHeatmapCell?.tier === tier) {
      // Clear cell filter
      setActiveHeatmapCell(null);
      setFilters(prev => ({ ...prev, region: '', tier: '' }));
    } else {
      setActiveHeatmapCell({ region, tier });
      setFilters(prev => ({ ...prev, region, tier }));
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
  };

  const resetFilters = () => {
    setFilters({ q: '', tier: '', region: '', status: '' });
    setActiveHeatmapCell(null);
  };

  // Compute Heatmap counts & colors based on currently loaded partners list
  const getCellStats = (region, tier) => {
    const list = partners.filter(p => p.region === region && p.tier === tier);
    const count = list.length;
    const revenue = list.reduce((sum, p) => sum + p.annual_revenue_inr, 0);
    return { count, revenue };
  };

  const getHeatmapColor = (count) => {
    if (count === 0) return 'bg-slate-100/40 dark:bg-slate-900/10 border-slate-200/50 dark:border-white/5 text-slate-400 dark:text-slate-600';
    if (count === 1) return 'bg-brand-primary/10 border-brand-primary/20 text-brand-primary font-bold hover:bg-brand-primary/20 cursor-pointer';
    if (count === 2) return 'bg-brand-primary/20 border-brand-primary/40 text-brand-primary font-extrabold hover:bg-brand-primary/30 cursor-pointer shadow-[0_0_8px_rgba(99,102,241,0.06)] dark:shadow-[0_0_8px_rgba(99,102,241,0.1)]';
    return 'bg-brand-primary/30 border-brand-primary/60 text-slate-900 dark:text-white font-black hover:bg-brand-primary/45 cursor-pointer shadow-[0_0_12px_rgba(99,102,241,0.1)] dark:shadow-[0_0_12px_rgba(99,102,241,0.2)]';
  };

  // Formatter for Currency
  const formatCurrency = (value) => {
    if (!value) return '₹0.00';
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
  };

  // Compile timeline events from partner onboarding date and associated leads
  const compileTimeline = (partner) => {
    if (!partner) return [];
    
    const events = [];
    
    // 1. Partner Onboarding
    if (partner.onboarded_date) {
      events.push({
        date: partner.onboarded_date,
        title: 'Partner Onboarded',
        description: `Company registered under ${partner.tier} tier in ${partner.region} region.`,
        type: 'onboarding',
        icon: Calendar,
        color: 'text-brand-purple bg-brand-purple/10 border-brand-purple/20'
      });
    }

    // 2. Lead Events
    if (partner.leads && Array.isArray(partner.leads)) {
      partner.leads.forEach(lead => {
        // Creation Event
        if (lead.created_date) {
          events.push({
            date: lead.created_date,
            title: 'Lead Registered',
            description: `Registered lead for ${lead.company_name} (Est. value: ${formatCurrency(lead.deal_value_inr)}). ML Scoring: ${lead.ml_score || 'N/A'}%`,
            type: 'lead_created',
            icon: Target,
            color: 'text-brand-primary bg-brand-primary/10 border-brand-primary/20'
          });
        }
        // Conversion Event
        if (lead.status === 'Converted' && lead.conversion_date) {
          events.push({
            date: lead.conversion_date,
            title: 'Lead Successfully Converted',
            description: `Closed deal with ${lead.company_name} (Contract value: ${formatCurrency(lead.deal_value_inr)}).`,
            type: 'lead_converted',
            icon: Award,
            color: 'text-brand-success bg-brand-success/10 border-brand-success/20'
          });
        }
      });
    }

    // 3. Last Activity Date
    if (partner.last_activity_date) {
      events.push({
        date: partner.last_activity_date,
        title: 'Last Activity logged',
        description: 'System audit log captured outreach engagement or record sync.',
        type: 'activity',
        icon: Activity,
        color: 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200/60 dark:border-white/5'
      });
    }

    // Sort chronologically (descending)
    return events.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  // Compute stats for Funnel
  const getFunnelStats = (partner) => {
    if (!partner || !partner.leads || partner.leads.length === 0) return { total: 0, converted: 0, rate: 0 };
    const total = partner.leads.length;
    const converted = partner.leads.filter(l => l.status === 'Converted').count || partner.leads.filter(l => l.status === 'Converted').length;
    const rate = Math.round((converted / total) * 100);
    return { total, converted, rate };
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold font-outfit tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-650 dark:from-white dark:via-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
          Partner Intelligence Directory
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Perform channel sales monitoring, view tier metrics, analyze partner locations, and drill down into activity timelines.
        </p>
      </div>

      {/* Grid: Heatmap (Left) & Heatmap Summary (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heatmap Grid Panel */}
        <div className="glass-card p-6 lg:col-span-2 space-y-4">
          <div>
            <h2 className="text-base font-bold font-outfit text-slate-800 dark:text-slate-200">Regional Partner Density Heatmap</h2>
            <p className="text-xs text-slate-500">Click cells to filter table by region and tier. Glowing accents indicate high concentration.</p>
          </div>

          <div className="overflow-x-auto pt-2">
            <div className="min-w-[500px]">
              {/* Columns Header (Regions) */}
              <div className="grid grid-cols-6 gap-2 text-center text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-1">
                <div>Tier / Region</div>
                {regions.map(r => (
                  <div key={r} className="py-1">{r}</div>
                ))}
              </div>

              {/* Rows (Tiers) */}
              <div className="space-y-2">
                {tiers.map(t => (
                  <div key={t} className="grid grid-cols-6 gap-2 items-center">
                    {/* Row Header */}
                    <div className="text-right pr-3 text-xs font-bold text-slate-400 font-outfit">{t}</div>
                    
                    {/* Heatmap Cells */}
                    {regions.map(r => {
                      const stats = getCellStats(r, t);
                      const isSelected = activeHeatmapCell?.region === r && activeHeatmapCell?.tier === t;
                      return (
                        <div
                          key={`${r}-${t}`}
                          onClick={() => handleHeatmapClick(r, t)}
                          title={`${t} Tier in ${r}: ${stats.count} partners (${formatCurrency(stats.revenue)})`}
                          className={`h-14 rounded-xl border flex flex-col items-center justify-center transition-all duration-300 ${getHeatmapColor(stats.count)} ${
                            isSelected ? 'ring-2 ring-brand-primary ring-offset-2 ring-offset-[#070b13] scale-[1.03]' : ''
                          }`}
                        >
                          <span className="text-sm font-bold">{stats.count}</span>
                          <span className="text-[9px] opacity-60 tracking-tighter mt-0.5">{formatCurrency(stats.revenue)}</span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
        </div>

        {/* Heatmap filter summary widget */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold font-outfit text-slate-800 dark:text-slate-200">Heatmap Intelligence</h2>
            <p className="text-xs text-slate-500">Active metrics filter status</p>
          </div>

          <div className="py-4 space-y-4">
            {activeHeatmapCell ? (
              <div className="p-4 rounded-xl bg-brand-primary/10 border border-brand-primary/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-primary font-outfit uppercase">CELL FILTER ACTIVE</span>
                  <button 
                    onClick={() => {
                      setActiveHeatmapCell(null);
                      setFilters(prev => ({ ...prev, region: '', tier: '' }));
                    }}
                    className="p-1 rounded bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20"
                  >
                    <X size={10} />
                  </button>
                </div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {activeHeatmapCell.tier} Partners in {activeHeatmapCell.region}
                </p>
                <div className="grid grid-cols-2 gap-2 pt-2 text-[10px] text-slate-500 dark:text-slate-400 border-t border-brand-primary/10">
                  <div>
                    <p className="text-slate-500">Group Count</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5">
                      {partners.length} Partners
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Group Revenue</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5">
                      {formatCurrency(partners.reduce((sum, p) => sum + p.annual_revenue_inr, 0))}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-xl border border-dashed border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/10 text-center text-xs text-slate-550 dark:text-slate-500">
                No cells selected. Click a heatmap cell to filter the directory table by region and tier.
              </div>
            )}

            <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-900/20 p-3 rounded-lg border border-slate-200 dark:border-white/5">
              💡 <span className="font-semibold text-slate-800 dark:text-slate-300">Observation</span>: Gold partners reside heavily in West and South regions, directing high contract valuations. Consider allocating additional lead intelligence resources to these hubs.
            </div>
          </div>

          <button
            onClick={resetFilters}
            className="w-full py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-900/60 rounded-xl text-xs font-bold font-outfit text-slate-800 dark:text-slate-200 transition-all duration-300"
          >
            RESET ALL FILTERS
          </button>
        </div>   </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 flex flex-col md:flex-row items-center gap-4">
        {/* Search */}
        <div className="relative w-full md:flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            placeholder="Search partners by company or contact name..."
            className="w-full glass-input pl-11 text-xs"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Tier */}
          <select
            value={filters.tier}
            onChange={(e) => setFilters({ ...filters, tier: e.target.value })}
            className="glass-input text-xs py-2 pr-8 appearance-none cursor-pointer"
          >
            <option value="">All Tiers</option>
            {tiers.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          {/* Region */}
          <select
            value={filters.region}
            onChange={(e) => setFilters({ ...filters, region: e.target.value })}
            className="glass-input text-xs py-2 pr-8 appearance-none cursor-pointer"
          >
            <option value="">All Regions</option>
            {regions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          {/* Status */}
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="glass-input text-xs py-2 pr-8 appearance-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Partners Table Panel */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-2">
            <Activity className="animate-spin text-brand-primary" size={24} />
            <span className="text-xs">Loading partner directories...</span>
          </div>
        ) : partners.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No partners match the selected filter conditions.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200/60 dark:border-white/5 bg-slate-100/50 dark:bg-slate-900/30 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-outfit select-none">
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-800 dark:hover:text-white" onClick={() => handleSort('company_name')}>
                    <div className="flex items-center gap-1.5">
                      <span>Company Name</span>
                      {sortBy === 'company_name' && (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                    </div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-800 dark:hover:text-white" onClick={() => handleSort('contact_name')}>
                    <div className="flex items-center gap-1.5">
                      <span>Contact Partner</span>
                      {sortBy === 'contact_name' && (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                    </div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-800 dark:hover:text-white" onClick={() => handleSort('region')}>
                    <div className="flex items-center gap-1.5">
                      <span>Region</span>
                      {sortBy === 'region' && (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                    </div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-800 dark:hover:text-white" onClick={() => handleSort('tier')}>
                    <div className="flex items-center gap-1.5">
                      <span>Tier</span>
                      {sortBy === 'tier' && (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                    </div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-800 dark:hover:text-white text-right" onClick={() => handleSort('annual_revenue_inr')}>
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Annual Revenue</span>
                      {sortBy === 'annual_revenue_inr' && (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                    </div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-800 dark:hover:text-white text-right" onClick={() => handleSort('deal_count')}>
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Deals</span>
                      {sortBy === 'deal_count' && (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                    </div>
                  </th>
                  <th className="py-4 px-6 text-center">Active Leads</th>
                  <th className="py-4 px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-white/5 text-xs text-slate-650 dark:text-slate-300">
                {partners.map(p => (
                  <tr 
                    key={p.partner_id}
                    onClick={() => setSelectedPartnerId(p.partner_id)}
                    className="hover:bg-slate-100/60 dark:hover:bg-slate-900/30 transition-all cursor-pointer group"
                  >
                    <td className="py-4 px-6 font-semibold text-slate-950 dark:text-white group-hover:text-brand-primary transition-colors">
                      {p.company_name}
                    </td>
                    <td className="py-4 px-6">{p.contact_name}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={12} className="text-slate-500" />
                        <span>{p.city} ({p.region})</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {p.tier === 'Gold' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold border border-yellow-500/30 text-yellow-300 bg-yellow-500/10 shadow-[0_0_8px_rgba(234,179,8,0.1)]">
                          Gold
                        </span>
                      )}
                      {p.tier === 'Silver' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold border border-slate-400/30 text-slate-300 bg-slate-400/10">
                          Silver
                        </span>
                      )}
                      {p.tier === 'Bronze' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold border border-amber-700/30 text-amber-500 bg-amber-700/10">
                          Bronze
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right font-medium font-outfit text-slate-800 dark:text-slate-200">
                      {formatCurrency(p.annual_revenue_inr)}
                    </td>
                    <td className="py-4 px-6 text-right font-outfit">{p.deal_count}</td>
                    <td className="py-4 px-6 text-center font-bold text-brand-primary">{p.active_leads}</td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          p.status === 'Active' ? 'bg-brand-success shadow-[0_0_6px_#10b981]' : 'bg-slate-600'
                        }`} />
                        <span className="text-[10px] font-semibold">{p.status}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Drill-down Detail Drawer Modal */}
      {selectedPartnerId && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop Click */}
          <div 
            onClick={() => setSelectedPartnerId(null)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Body */}
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#090d16] border-l border-slate-200 dark:border-white/5 shadow-2xl h-full flex flex-col z-10 animate-slide-in">
            {/* Header */}
            <div className="h-20 flex items-center justify-between px-6 border-b border-slate-200 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-purple flex items-center justify-center shadow-md font-bold text-white text-base">
                  {partnerDetail ? partnerDetail.company_name.charAt(0) : '?'}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">{partnerDetail?.company_name || 'Loading Partner Detail...'}</h3>
                  <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">Partner intelligence profile</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPartnerId(null)}
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                <X size={18} />
              </button>
            </div>

            {loadingDetail ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-500">
                <Activity className="animate-spin text-brand-primary" size={24} />
                <span className="text-xs">Loading detailed leads history...</span>
              </div>
            ) : partnerDetail ? (
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Section 1: Contact Metadata Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-white/5 space-y-1.5">
                    <span className="text-[9px] font-bold text-slate-500 uppercase">Primary Contact</span>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">{partnerDetail.contact_name}</p>
                    <div className="flex flex-col gap-1 text-[11px] text-slate-500 dark:text-slate-400 pt-1.5 border-t border-slate-200 dark:border-white/5 mt-1">
                      <div className="flex items-center gap-1.5">
                        <Mail size={12} className="text-slate-500" />
                        <span className="truncate">{partnerDetail.contact_email}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone size={12} className="text-slate-500" />
                        <span>{partnerDetail.phone || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-white/5 space-y-1.5">
                    <span className="text-[9px] font-bold text-slate-500 uppercase">Operational Hub</span>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">{partnerDetail.city}</p>
                    <div className="flex flex-col gap-1 text-[11px] text-slate-500 dark:text-slate-400 pt-1.5 border-t border-slate-200 dark:border-white/5 mt-1">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={12} className="text-slate-500" />
                        <span>{partnerDetail.region} Region</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-slate-500" />
                        <span>Onboarded: {partnerDetail.onboarded_date}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Summary Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/10 text-center">
                    <span className="text-[9px] font-bold text-slate-500 uppercase">Annual Revenue</span>
                    <p className="text-lg font-bold font-outfit text-slate-900 dark:text-white mt-1">{formatCurrency(partnerDetail.annual_revenue_inr)}</p>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/10 text-center">
                    <span className="text-[9px] font-bold text-slate-500 uppercase">Total Deals</span>
                    <p className="text-lg font-bold font-outfit text-slate-900 dark:text-white mt-1">{partnerDetail.deal_count}</p>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/10 text-center">
                    <span className="text-[9px] font-bold text-slate-500 uppercase">Active Leads</span>
                    <p className="text-lg font-bold font-outfit text-brand-primary mt-1">{partnerDetail.active_leads}</p>
                  </div>
                </div>

                {/* Section 3: Performance Funnel Card */}
                {(() => {
                  const funnel = getFunnelStats(partnerDetail);
                  return (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-white/5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-slate-500 uppercase">Lead Conversion Funnel</span>
                        <span className="text-[10px] font-bold text-brand-success">{funnel.rate}% Performance Score</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                        <span>Converted: {funnel.converted} leads</span>
                        <span>Total Pipeline: {funnel.total} leads</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-300 dark:border-white/5 shadow-inner">
                        <div 
                          className="bg-brand-success h-full rounded-full shadow-[0_0_8px_#10b981]"
                          style={{ width: `${funnel.rate}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}

                {/* Section 4: Chronological Lead Timeline */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 font-outfit uppercase tracking-wider">Activity History Timeline</h4>
                  
                  {compileTimeline(partnerDetail).length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-200 dark:border-white/5 rounded-xl">
                      No activity registered for this partner yet.
                    </div>
                  ) : (
                    <div className="relative border-l border-slate-200 dark:border-white/10 pl-6 ml-3 space-y-6">
                      {compileTimeline(partnerDetail).map((event, idx) => {
                        const Icon = event.icon;
                        return (
                          <div key={idx} className="relative group/item">
                            {/* Bullet icon indicator */}
                            <span className={`absolute -left-[37px] top-0.5 w-6 h-6 rounded-lg border flex items-center justify-center shadow-md ${event.color}`}>
                              <Icon size={12} />
                            </span>
                            
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-900 dark:text-white group-hover/item:text-brand-primary transition-colors">
                                  {event.title}
                                </span>
                                <span className="text-[10px] text-slate-500 font-medium font-outfit">
                                  {event.date}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                                {event.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="p-12 text-center text-xs text-slate-500">
                Partner detail could not be loaded.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Partners;
