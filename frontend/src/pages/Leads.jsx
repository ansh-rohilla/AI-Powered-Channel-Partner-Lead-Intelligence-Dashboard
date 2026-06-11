import React, { useState, useEffect } from 'react';
import { 
  Target, 
  MapPin, 
  DollarSign, 
  Zap, 
  X, 
  Clock, 
  PhoneCall, 
  User, 
  Mail, 
  BookOpen,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { leadService, partnerService } from '../services/api';

const LeadCard = React.memo(({ lead, colId, getScoreColor, formatCurrency, setSelectedLeadId, handleDragStart, handleQuickMove }) => {
  const colors = getScoreColor(lead.ml_score);
  return (
    <div 
      draggable="true"
      onDragStart={(e) => handleDragStart(e, lead.lead_id)}
      onClick={() => setSelectedLeadId(lead.lead_id)}
      className="glass-card p-4 hover:border-slate-350 dark:hover:border-white/10 hover:shadow-md cursor-pointer relative group transition-all duration-300 active:cursor-grabbing"
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <span className="text-[11px] font-bold text-slate-900 dark:text-white leading-tight truncate flex-1 group-hover:text-brand-primary transition-colors font-sans">
            {lead.company_name}
          </span>
          <span className={`text-[8px] px-1.5 py-0.5 rounded font-extrabold tracking-wider font-outfit ${colors.bg} ${colors.text}`}>
            {lead.ml_score ? `${Math.round(lead.ml_score)}%` : 'N/A'}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
          <span className="font-outfit font-semibold">{formatCurrency(lead.deal_value_inr)}</span>
          <div className="flex items-center gap-1">
            <MapPin size={8} />
            <span>{lead.region}</span>
          </div>
        </div>

        {/* Quick movement selectors */}
        <div className="pt-2 border-t border-slate-200/60 dark:border-white/5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[8px] text-slate-550 dark:text-slate-500 uppercase font-semibold">Quick Move</span>
          <div className="flex items-center gap-1">
            {colId === 'New' && (
              <button 
                onClick={(e) => { e.stopPropagation(); handleQuickMove(lead, 'Contacted'); }}
                className="p-1 rounded bg-slate-100 dark:bg-slate-900 hover:bg-brand-primary/20 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                title="Move to Contacted"
              >
                <ArrowRight size={10} />
              </button>
            )}
            {colId === 'Contacted' && (
              <button 
                onClick={(e) => { e.stopPropagation(); handleQuickMove(lead, 'Qualified'); }}
                className="p-1 rounded bg-slate-100 dark:bg-slate-900 hover:bg-brand-primary/20 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                title="Move to Qualified"
              >
                <ArrowRight size={10} />
              </button>
            )}
            {colId === 'Qualified' && (
              <div className="flex gap-1">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleQuickMove(lead, 'Converted'); }}
                  className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 hover:bg-brand-success/20 text-slate-500 dark:text-slate-400 hover:text-brand-success dark:hover:text-brand-success text-[8px] font-bold"
                  title="Close Won"
                >
                  Won
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleQuickMove(lead, 'Lost'); }}
                  className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 hover:bg-brand-danger/20 text-slate-500 dark:text-slate-400 hover:text-brand-danger dark:hover:text-brand-danger text-[8px] font-bold"
                  title="Close Lost"
                >
                  Lost
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

LeadCard.displayName = 'LeadCard';

function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Detail Modal/Drawer
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [leadDetail, setLeadDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  
  // Edit Form state
  const [editForm, setEditForm] = useState({
    status: '',
    deal_value_inr: 0,
    follow_up_count: 0,
    time_to_first_contact: 0,
    notes: ''
  });
  const [updating, setUpdating] = useState(false);

  const columns = [
    { id: 'New', title: 'New Leads', color: 'border-t-brand-primary' },
    { id: 'Contacted', title: 'Contacted', color: 'border-t-brand-purple' },
    { id: 'Qualified', title: 'Qualified', color: 'border-t-brand-warning' },
    { id: 'Converted', title: 'Converted', color: 'border-t-brand-success' },
    { id: 'Lost', title: 'Lost', color: 'border-t-slate-700' }
  ];

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await leadService.getLeads();
      if (res.success) {
        setLeads(res.data);
      }
    } catch (err) {
      setError('Failed to fetch lead pipeline data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Fetch detailed lead information on select
  useEffect(() => {
    if (selectedLeadId) {
      const fetchDetail = async () => {
        try {
          setLoadingDetail(true);
          const res = await leadService.getLeadDetail(selectedLeadId);
          if (res.success) {
            setLeadDetail(res.data);
            setEditForm({
              status: res.data.status,
              deal_value_inr: res.data.deal_value_inr,
              follow_up_count: res.data.follow_up_count || 0,
              time_to_first_contact: res.data.time_to_first_contact || 0,
              notes: res.data.notes || ''
            });
          }
        } catch (err) {
          console.error(`Error loading lead detail ${selectedLeadId}`, err);
        } finally {
          setLoadingDetail(false);
        }
      };
      fetchDetail();
    } else {
      setLeadDetail(null);
    }
  }, [selectedLeadId]);

  // Handle Edit Save
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedLeadId) return;

    try {
      setUpdating(true);
      const res = await leadService.updateLead(selectedLeadId, {
        status: editForm.status,
        deal_value_inr: parseFloat(editForm.deal_value_inr),
        follow_up_count: parseInt(editForm.follow_up_count),
        time_to_first_contact: parseInt(editForm.time_to_first_contact),
        notes: editForm.notes
      });

      if (res.success) {
        // Update local list
        setLeads(prev => prev.map(l => l.lead_id === selectedLeadId ? res.lead : l));
        setLeadDetail(res.lead);
        
        // Success notification
        const alertDiv = document.createElement('div');
        alertDiv.className = 'fixed bottom-6 right-6 p-4 rounded-xl border bg-emerald-950/90 border-emerald-500/30 text-emerald-200 backdrop-blur-md shadow-2xl z-50 animate-slide-in';
        alertDiv.innerHTML = `<p class="text-xs font-bold">Pipeline Updated</p><p class="text-[10px] opacity-80 mt-0.5">ML score recalculated to ${res.lead.ml_score}%</p>`;
        document.body.appendChild(alertDiv);
        setTimeout(() => alertDiv.remove(), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  // Move Lead Status directly via arrow button
  const handleQuickMove = async (lead, newStatus) => {
    try {
      const res = await leadService.updateLead(lead.lead_id, { status: newStatus });
      if (res.success) {
        setLeads(prev => prev.map(l => l.lead_id === lead.lead_id ? res.lead : l));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const [draggedOverCol, setDraggedOverCol] = useState(null);

  const [partners, setPartners] = useState([]);
  const [loadingPartners, setLoadingPartners] = useState(false);

  // Fetch partners list when lead detail opens
  useEffect(() => {
    if (selectedLeadId) {
      const loadPartners = async () => {
        try {
          setLoadingPartners(true);
          const res = await partnerService.getPartners();
          if (res.success) {
            setPartners(res.data);
          }
        } catch (err) {
          console.error("Failed to fetch partners for matchmaker", err);
        } finally {
          setLoadingPartners(false);
        }
      };
      loadPartners();
    }
  }, [selectedLeadId]);

  const getRecommendedPartners = (lead) => {
    if (!lead || partners.length === 0) return [];
    
    const scored = partners.map(partner => {
      let score = 30; // base score
      const isRegionMatch = partner.region === lead.region;
      if (isRegionMatch) score += 40;
      if (partner.tier === 'Gold') score += 30;
      else if (partner.tier === 'Silver') score += 15;
      
      const workloadPenalty = (partner.active_leads || 0) * 2;
      score = Math.max(0, score - workloadPenalty);
      
      return {
        ...partner,
        matchScore: Math.min(99, score),
        isRegionMatch
      };
    });
    
    return scored.sort((a, b) => b.matchScore - a.matchScore).slice(0, 3);
  };

  const handleAssignPartner = async (partnerId, partnerName) => {
    if (!selectedLeadId) return;
    try {
      setUpdating(true);
      const res = await leadService.updateLead(selectedLeadId, { partner_id: partnerId });
      if (res.success) {
        setLeads(prev => prev.map(l => l.lead_id === selectedLeadId ? res.lead : l));
        setLeadDetail(res.lead);
        
        // Success notification
        const alertDiv = document.createElement('div');
        alertDiv.className = 'fixed bottom-6 right-6 p-4 rounded-xl border bg-emerald-950/90 border-emerald-500/30 text-emerald-200 backdrop-blur-md shadow-2xl z-50 animate-slide-in';
        alertDiv.innerHTML = `<p class="text-xs font-bold font-outfit">Lead Reassigned</p><p class="text-[10px] opacity-80 mt-0.5">Assigned to ${partnerName}. ML score recalculated to ${res.lead.ml_score}%</p>`;
        document.body.appendChild(alertDiv);
        setTimeout(() => alertDiv.remove(), 4000);
      }
    } catch (err) {
      console.error("Error assigning partner", err);
    } finally {
      setUpdating(false);
    }
  };

  const getPreviewScore = () => {
    if (!leadDetail) return 0;
    
    const testLead = {
      ...leadDetail,
      deal_value_inr: parseFloat(editForm.deal_value_inr) || 0,
      follow_up_count: parseInt(editForm.follow_up_count) || 0,
      time_to_first_contact: parseInt(editForm.time_to_first_contact) || 0,
    };
    
    let base = 25.0;
    if (testLead.lead_source === 'Referral') base += 28.5;
    else if (testLead.lead_source === 'Cold Call') base -= 12.0;
    else if (testLead.lead_source === 'Web') base += 5.0;
    
    const ttc = testLead.time_to_first_contact;
    if (ttc !== null && ttc !== undefined) {
      if (ttc <= 2) base += 20.0;
      else if (ttc >= 7) base -= 15.0;
    }
    
    const fups = testLead.follow_up_count || 0;
    if (fups >= 5) base += 15.0;
    else if (fups <= 1) base -= 8.0;

    const val = testLead.deal_value_inr || 0;
    if (val >= 1000000) base += 12.0;
    else if (val <= 100000) base -= 5.0;

    base = Math.max(5.0, Math.min(95.0, base));
    return parseFloat(base.toFixed(1));
  };

  const handleDragStart = (e, leadId) => {
    e.dataTransfer.setData('text/plain', leadId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    setDraggedOverCol(colId);
  };

  const handleDragLeave = () => {
    setDraggedOverCol(null);
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    setDraggedOverCol(null);
    const leadId = e.dataTransfer.getData('text/plain');
    if (!leadId) return;

    const targetLead = leads.find(l => l.lead_id === leadId);
    if (!targetLead || targetLead.status === newStatus) return;

    // Optimistically update status in local state
    const originalLeads = [...leads];
    setLeads(prev => prev.map(l => l.lead_id === leadId ? { ...l, status: newStatus } : l));

    try {
      const res = await leadService.updateLead(leadId, { status: newStatus });
      if (res.success) {
        setLeads(prev => prev.map(l => l.lead_id === leadId ? res.lead : l));
        
        // Custom floating notification
        const alertDiv = document.createElement('div');
        alertDiv.className = 'fixed bottom-6 right-6 p-4 rounded-xl border bg-emerald-950/90 border-emerald-500/30 text-emerald-200 backdrop-blur-md shadow-2xl z-50 animate-slide-in';
        alertDiv.innerHTML = `<p class="text-xs font-bold font-outfit">Pipeline Updated</p><p class="text-[10px] opacity-80 mt-0.5">${targetLead.company_name} moved to ${newStatus}. Score: ${res.lead.ml_score ? Math.round(res.lead.ml_score) : 'N/A'}%</p>`;
        document.body.appendChild(alertDiv);
        setTimeout(() => alertDiv.remove(), 4000);
      } else {
        setLeads(originalLeads);
      }
    } catch (err) {
      console.error(err);
      setLeads(originalLeads);
    }
  };

  // Format currency in Lakhs/Crores
  const formatCurrency = (value) => {
    if (!value && value !== 0) return '₹0.00';
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)} L`;
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
  };

  // Determine ML score progress bar color styling
  const getScoreColor = (score) => {
    if (!score && score !== 0) return { bar: 'bg-slate-700', text: 'text-slate-400', bg: 'bg-slate-800/10' };
    if (score >= 75) return { bar: 'bg-brand-success shadow-[0_0_8px_#10b981]', text: 'text-brand-success', bg: 'bg-brand-success/10' };
    if (score >= 40) return { bar: 'bg-brand-warning shadow-[0_0_8px_#f59e0b]', text: 'text-brand-warning', bg: 'bg-brand-warning/10' };
    return { bar: 'bg-brand-danger shadow-[0_0_8px_#ef4444]', text: 'text-brand-danger', bg: 'bg-brand-danger/10' };
  };

  const getScoreLabel = (score) => {
    if (!score && score !== 0) return 'UNSCORED';
    if (score >= 75) return 'HIGH PRIORITY';
    if (score >= 40) return 'MEDIUM PRIORITY';
    return 'LOW PRIORITY';
  };

  const getRecommendedAction = (score) => {
    if (!score) return { title: 'Pending Evaluation', desc: 'Ensure all lead features are logged to run prediction.' };
    if (score >= 75) {
      return {
        title: 'Immediate Sales Outreach',
        desc: 'Assigned representative must call the contact within 4 hours. Connect with Gold-tier partners for accelerated deal closure.',
        style: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
      };
    }
    if (score >= 40) {
      return {
        title: 'Schedule Regular Follow-up',
        desc: 'Schedule a standard product demonstration. Follow up within 48 hours to gauge interest.',
        style: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-300'
      };
    }
    return {
      title: 'Email Marketing Nurturing',
      desc: 'Channel sales reps should not spend primary calling hours. Place in the email drip campaign list to nurture over time.',
      style: 'bg-slate-100 dark:bg-slate-900/60 border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400'
    };
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold font-outfit tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-650 dark:from-white dark:via-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
          Lead Prioritization Pipeline
        </h1>
        <p className="text-sm text-slate-550 dark:text-slate-400 mt-1">
          Monitor your channel leads pipeline. ML scores calculate conversion probability based on source channel, contact speed, and follow-up activities.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="glass-card p-4 h-[400px] animate-pulse flex flex-col gap-4">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-28" />
              <div className="h-24 bg-slate-100/50 dark:bg-slate-800/40 rounded-xl" />
              <div className="h-24 bg-slate-100/50 dark:bg-slate-800/40 rounded-xl" />
            </div>
          ))}
        </div>
      ) : (
        /* Kanban Pipeline Layout */
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 overflow-x-auto min-w-[900px] pb-4">
          {columns.map(col => {
            const colLeads = leads.filter(l => l.status === col.id);
            return (
              <div key={col.id} className="flex flex-col gap-4 min-w-[200px]">
                {/* Column Title Card */}
                <div className={`p-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-100/50 dark:bg-slate-900/20 border-t-2 ${col.color} flex justify-between items-center`}>
                  <span className="text-xs font-bold text-slate-850 dark:text-slate-200 font-outfit tracking-wide">{col.title}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-955 text-slate-600 dark:text-slate-400">
                    {colLeads.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div 
                  onDragOver={(e) => handleDragOver(e, col.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, col.id)}
                  className={`space-y-3 flex-1 min-h-[450px] rounded-2xl p-2 border transition-all duration-200 ${
                    draggedOverCol === col.id 
                      ? 'bg-slate-100 dark:bg-slate-900/40 border-brand-primary/40 shadow-[0_0_12px_rgba(99,102,241,0.1)]' 
                      : 'bg-slate-100/35 dark:bg-slate-950/20 border-slate-200 dark:border-white/5'
                  }`}
                >
                  {colLeads.map(lead => (
                    <LeadCard 
                      key={lead.lead_id}
                      lead={lead}
                      colId={col.id}
                      getScoreColor={getScoreColor}
                      formatCurrency={formatCurrency}
                      setSelectedLeadId={setSelectedLeadId}
                      handleDragStart={handleDragStart}
                      handleQuickMove={handleQuickMove}
                    />
                  ))}
                  {colLeads.length === 0 && (
                    <div className="h-full flex items-center justify-center p-6 text-center text-[10px] text-slate-400 dark:text-slate-600 border border-dashed border-slate-200 dark:border-white/5 rounded-xl">
                      No Leads in this stage.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lead Detail Panel / Drawer Modal */}
      {selectedLeadId && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop Click */}
          <div 
            onClick={() => setSelectedLeadId(null)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Body */}
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#090d16] border-l border-slate-200 dark:border-white/5 shadow-2xl h-full flex flex-col z-10 animate-slide-in">
            {/* Header */}
            <div className="h-20 flex items-center justify-between px-6 border-b border-slate-200 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-purple flex items-center justify-center shadow-md font-bold text-white text-base">
                  L
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">{leadDetail?.company_name || 'Loading Lead Detail...'}</h3>
                  <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">Lead intelligence summary</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedLeadId(null)}
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                <X size={18} />
              </button>
            </div>

            {loadingDetail ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-500">
                <RefreshCw className="animate-spin text-brand-primary" size={24} />
                <span className="text-xs">Loading AI intelligence models...</span>
              </div>
            ) : leadDetail ? (
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* 1. ML Scoring Dashboard Card */}
                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">AI Conversion Probability</span>
                      <h4 className="text-2xl font-bold font-outfit text-slate-900 dark:text-white mt-0.5">
                        {leadDetail.ml_score ? `${leadDetail.ml_score}%` : 'Pending'}
                      </h4>
                    </div>
                    
                    {/* Priority label badge */}
                    {(() => {
                      const colors = getScoreColor(leadDetail.ml_score);
                      return (
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${colors.bg} ${colors.text} border-slate-200/50 dark:border-white/5`}>
                          {getScoreLabel(leadDetail.ml_score)}
                        </span>
                      );
                    })()}
                  </div>

                  {/* Progress bar */}
                  {leadDetail.ml_score && (
                    <div className="w-full bg-slate-200 dark:bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-300 dark:border-white/5 shadow-inner">
                      <div 
                        className={`h-full rounded-full ${getScoreColor(leadDetail.ml_score).bar}`}
                        style={{ width: `${leadDetail.ml_score}%` }}
                      />
                    </div>
                  )}

                  {/* Explainability driver cards */}
                  <div className="pt-2 border-t border-slate-200 dark:border-white/5">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Key Scoring Drivers</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      {leadDetail.lead_source === 'Referral' && (
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250/20 dark:border-emerald-500/10 text-[10px] text-emerald-800 dark:text-emerald-300">
                          <TrendingUp size={12} />
                          <span>Warm referral channels: +28% probability</span>
                        </div>
                      )}
                      {leadDetail.time_to_first_contact <= 2 && leadDetail.time_to_first_contact !== null && (
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250/20 dark:border-emerald-500/10 text-[10px] text-emerald-800 dark:text-emerald-300">
                          <Clock size={12} />
                          <span>Rapid contact latency: +20% probability</span>
                        </div>
                      )}
                      {leadDetail.follow_up_count >= 5 && (
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250/20 dark:border-emerald-500/10 text-[10px] text-emerald-800 dark:text-emerald-300">
                          <PhoneCall size={12} />
                          <span>High outreach follow-ups: +15% probability</span>
                        </div>
                      )}
                      {leadDetail.lead_source === 'Cold Call' && (
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-250/20 dark:border-rose-500/10 text-[10px] text-rose-800 dark:text-rose-300">
                          <AlertTriangle size={12} />
                          <span>Low-yield Cold Call channels: -12% probability</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Recommended Action Card */}
                {(() => {
                  const action = getRecommendedAction(leadDetail.ml_score);
                  return (
                    <div className={`p-4 rounded-xl border ${action.style} space-y-1.5`}>
                      <span className="text-[9px] font-bold uppercase tracking-wider">Recommended Action</span>
                      <p className="text-xs font-bold text-white">{action.title}</p>
                      <p className="text-[11px] opacity-80 leading-relaxed">{action.desc}</p>
                    </div>
                  );
                })()}

                {/* 3. Lead Parameters & Demographics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-white/5 space-y-2">
                    <span className="text-[9px] font-bold text-slate-500 uppercase">Contact Information</span>
                    <div className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        <User size={12} className="text-slate-550 dark:text-slate-500" />
                        <span>{leadDetail.contact_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail size={12} className="text-slate-550 dark:text-slate-500" />
                        <span className="truncate">{leadDetail.contact_email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-white/5 space-y-2">
                    <span className="text-[9px] font-bold text-slate-500 uppercase">Pipeline Parameters</span>
                    <div className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Source:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{leadDetail.lead_source}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Product:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{leadDetail.product_interest}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Assigned Partner:</span>
                        <span className="font-semibold text-brand-primary truncate max-w-[120px]" title={partners.find(p => p.partner_id === leadDetail.partner_id)?.company_name || leadDetail.partner_id}>
                          {partners.find(p => p.partner_id === leadDetail.partner_id)?.company_name || leadDetail.partner_id}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3.5 AI Partner Matchmaker Recommendations */}
                <div className="p-4 rounded-xl bg-slate-55 dark:bg-slate-900/30 border border-slate-200 dark:border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 font-outfit uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles size={12} className="text-brand-primary" />
                      AI Partner Recommendation
                    </h4>
                    <span className="text-[8px] font-bold text-slate-500 uppercase">Automated Matchmaker</span>
                  </div>

                  {loadingPartners ? (
                    <div className="text-center py-2 text-[10px] text-slate-500">Loading candidate matches...</div>
                  ) : (
                    <div className="space-y-2">
                      {getRecommendedPartners(leadDetail).map(p => {
                        const isCurrentlyAssigned = p.partner_id === leadDetail.partner_id;
                        return (
                          <div 
                            key={p.partner_id}
                            className={`p-2.5 rounded-lg border flex items-center justify-between transition-all ${
                              isCurrentlyAssigned 
                                ? 'bg-brand-primary/5 border-brand-primary/20' 
                                : 'bg-slate-100/40 dark:bg-slate-950/40 border-slate-200 dark:border-white/5 hover:border-slate-350 dark:hover:border-white/10'
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{p.company_name}</span>
                                <span className={`text-[8px] px-1.5 py-0.2 rounded font-extrabold ${
                                  p.tier === 'Gold' ? 'bg-amber-950/40 text-brand-warning' : p.tier === 'Silver' ? 'bg-indigo-950/40 text-brand-primary' : 'bg-slate-200 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                                }`}>
                                  {p.tier}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-[9px] text-slate-500">
                                <span>Region: {p.region}</span>
                                <span>•</span>
                                <span>Active Leads: {p.active_leads || 0}</span>
                                <span>•</span>
                                <span className="text-emerald-500 font-semibold">{p.isRegionMatch ? 'Direct regional fit' : 'Regional delegation'}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <span className={`text-xs font-black font-outfit ${
                                p.matchScore >= 80 ? 'text-brand-success' : p.matchScore >= 50 ? 'text-brand-warning' : 'text-slate-500'
                              }`}>
                                {p.matchScore}% Match
                              </span>
                              
                              {isCurrentlyAssigned ? (
                                <span className="text-[9px] font-bold text-brand-primary uppercase px-2 py-1 bg-brand-primary/10 rounded">Assigned</span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleAssignPartner(p.partner_id, p.company_name)}
                                  className="px-2 py-1 bg-slate-200 dark:bg-slate-900 hover:bg-brand-primary hover:text-white rounded text-[9px] font-bold text-slate-500 dark:text-slate-400 transition-all"
                                >
                                  Assign
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 4. Edit Lead / Parameter Tweak Form (Real-time recalculation) */}
                <form onSubmit={handleSaveEdit} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-white/5 space-y-4">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 font-outfit uppercase tracking-wider">Tweak Model Features & Status</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Status */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-slate-500 uppercase font-semibold">Lead Status</label>
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        className="glass-input text-xs"
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Qualified">Qualified</option>
                        <option value="Converted">Converted</option>
                        <option value="Lost">Lost</option>
                      </select>
                    </div>

                    {/* Deal Value */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-slate-500 uppercase font-semibold">Deal Value (INR)</label>
                      <input
                        type="number"
                        value={editForm.deal_value_inr}
                        onChange={(e) => setEditForm({ ...editForm, deal_value_inr: e.target.value })}
                        className="glass-input text-xs"
                      />
                    </div>

                    {/* Follow Up Count */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-slate-500 uppercase font-semibold">Follow Up Count</label>
                      <input
                        type="number"
                        value={editForm.follow_up_count}
                        onChange={(e) => setEditForm({ ...editForm, follow_up_count: e.target.value })}
                        className="glass-input text-xs"
                      />
                    </div>

                    {/* Time to Contact */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-slate-500 uppercase font-semibold">Contact Latency (Days)</label>
                      <input
                        type="number"
                        value={editForm.time_to_first_contact}
                        onChange={(e) => setEditForm({ ...editForm, time_to_first_contact: e.target.value })}
                        className="glass-input text-xs"
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-500 uppercase font-semibold">Auditor Notes</label>
                    <textarea
                      value={editForm.notes}
                      onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                      className="glass-input text-xs h-16 resize-none"
                    />
                  </div>

                  {/* Live ML Score preview */}
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Live Model Score Preview</span>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Estimated probability prior to database synchronization</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 line-through">
                        {leadDetail.ml_score ? `${Math.round(leadDetail.ml_score)}%` : 'Pending'}
                      </span>
                      <span className="text-xs font-bold text-brand-primary animate-pulse">
                        → {getPreviewScore()}%
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={updating}
                    className="w-full py-2.5 bg-brand-primary hover:bg-brand-primary/80 rounded-xl text-xs font-bold font-outfit text-white transition-all duration-300"
                  >
                    {updating ? 'SAVING & RE-CALCULATING AI SCORE...' : 'SAVE CHANGES & SYNC MODEL'}
                  </button>
                </form>

              </div>
            ) : (
              <div className="p-12 text-center text-xs text-slate-500">
                Lead detail could not be loaded.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Leads;
