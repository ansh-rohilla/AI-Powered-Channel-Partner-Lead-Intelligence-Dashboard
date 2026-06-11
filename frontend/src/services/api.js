import axios from 'axios';

// Create Axios client with base URL pointing to the Vite proxy endpoint
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Mock scoring engine helper to simulate backend XGBoost scoring in offline mode
const calculateMockLeadScore = (lead) => {
  let score = 25.0; // Base score
  
  // 1. Lead Source impact
  if (lead.lead_source === 'Referral') score += 28.5;
  else if (lead.lead_source === 'Cold Call') score -= 12.0;
  else if (lead.lead_source === 'Web') score += 5.0;
  
  // 2. Contact speed impact
  const ttc = lead.time_to_first_contact;
  if (ttc !== null && ttc !== undefined) {
    if (ttc <= 2) score += 20.0;
    else if (ttc >= 7) score -= 15.0;
  }
  
  // 3. Follow-up engagement
  const fups = lead.follow_up_count || 0;
  if (fups >= 5) score += 15.0;
  else if (fups <= 1) score -= 8.0;

  // 4. Deal Value weight
  const val = lead.deal_value_inr || 0;
  if (val >= 1000000) score += 12.0; // Big deal
  else if (val <= 100000) score -= 5.0;

  // Bound between 5 and 95
  score = Math.max(5.0, Math.min(95.0, score));
  return parseFloat(score.toFixed(2));
};

// High-fidelity Mock Data for local offline demonstration fallback
const MOCK_DATA = {
  summary: {
    active_partners: 36,
    active_leads: 198,
    conversion_rate: 34.25,
    pipeline_value_inr: 124850000.0
  },
  trends: [
    { week_start: "2026-03-09", lead_volume: 24, conversion_rate: 25.00 },
    { week_start: "2026-03-16", lead_volume: 28, conversion_rate: 28.57 },
    { week_start: "2026-03-23", lead_volume: 32, conversion_rate: 31.25 },
    { week_start: "2026-03-30", lead_volume: 30, conversion_rate: 30.00 },
    { week_start: "2026-04-06", lead_volume: 38, conversion_rate: 34.21 },
    { week_start: "2026-04-13", lead_volume: 42, conversion_rate: 35.71 },
    { week_start: "2026-04-20", lead_volume: 36, usage_rate: 33.33, conversion_rate: 33.33 },
    { week_start: "2026-04-27", lead_volume: 44, conversion_rate: 36.36 },
    { week_start: "2026-05-04", lead_volume: 48, conversion_rate: 37.50 },
    { week_start: "2026-05-11", lead_volume: 54, conversion_rate: 38.89 },
    { week_start: "2026-05-18", lead_volume: 50, conversion_rate: 36.00 },
    { week_start: "2026-05-25", lead_volume: 58, conversion_rate: 39.66 }
  ],
  tierBreakdown: [
    { tier: "Bronze", partners_count: 20, total_revenue_inr: 14500000.0, total_deals: 68 },
    { tier: "Silver", partners_count: 11, total_revenue_inr: 42200000.0, total_deals: 154 },
    { tier: "Gold", partners_count: 5, total_revenue_inr: 68150000.0, total_deals: 242 }
  ],
  partners: [
    {
      partner_id: "P-2024-001",
      company_name: "Apex CyberSolutions",
      contact_name: "Rohan Sharma",
      contact_email: "rohan@apexcyber.com",
      phone: "+91-9876543210",
      region: "West",
      city: "Mumbai",
      tier: "Gold",
      annual_revenue_inr: 28500000.0,
      deal_count: 82,
      active_leads: 12,
      last_activity_date: "2026-06-08",
      onboarded_date: "2024-03-15",
      status: "Active"
    },
    {
      partner_id: "P-2024-002",
      company_name: "Shield Infosec Ltd",
      contact_name: "Neha Gupta",
      contact_email: "neha@shieldinfosec.in",
      phone: "+91-9988776655",
      region: "North",
      city: "New Delhi",
      tier: "Silver",
      annual_revenue_inr: 14200000.0,
      deal_count: 44,
      active_leads: 8,
      last_activity_date: "2026-06-07",
      onboarded_date: "2024-08-20",
      status: "Active"
    },
    {
      partner_id: "P-2024-003",
      company_name: "Eastern Cloud Integrators",
      contact_name: "Amit Banerjee",
      contact_email: "amit@eastcloud.com",
      phone: "+91-9830012345",
      region: "East",
      city: "Kolkata",
      tier: "Bronze",
      annual_revenue_inr: 4500000.0,
      deal_count: 18,
      active_leads: 3,
      last_activity_date: "2026-06-01",
      onboarded_date: "2025-01-10",
      status: "Active"
    },
    {
      partner_id: "P-2024-004",
      company_name: "Silicon Bangalore Tech",
      contact_name: "Suresh Gowda",
      contact_email: "suresh@silicontech.co.in",
      phone: "+91-9448012345",
      region: "South",
      city: "Bengaluru",
      tier: "Gold",
      annual_revenue_inr: 32500000.0,
      deal_count: 98,
      active_leads: 15,
      last_activity_date: "2026-06-09",
      onboarded_date: "2024-01-05",
      status: "Active"
    },
    {
      partner_id: "P-2024-005",
      company_name: "Central Security Systems",
      contact_name: "Vikram Singh",
      contact_email: "vikram@centralsecurity.com",
      phone: "+91-8889990000",
      region: "Central",
      city: "Bhopal",
      tier: "Silver",
      annual_revenue_inr: 9800000.0,
      deal_count: 28,
      active_leads: 5,
      last_activity_date: "2026-06-05",
      onboarded_date: "2025-02-14",
      status: "Active"
    }
  ],
  leads: [
    {
      lead_id: "L-2026-0001",
      partner_id: "P-2024-001",
      company_name: "HDFC Bank HQ",
      contact_name: "Vikram Mehta",
      contact_email: "vikram.mehta@hdfc.com",
      region: "West",
      lead_source: "Referral",
      product_interest: "SIEM Suite",
      deal_value_inr: 3800000.0,
      status: "New",
      created_date: "2026-06-01",
      last_contacted: "2026-06-03",
      follow_up_count: 2,
      time_to_first_contact: 2,
      converted: 0,
      conversion_date: null,
      ml_score: 84.70,
      notes: "High priority banking prospect. Requires enterprise cloud firewall compliance review."
    },
    {
      lead_id: "L-2026-0002",
      partner_id: "P-2024-001",
      company_name: "Sun Pharmaceutical",
      contact_name: "Karan Johar",
      contact_email: "karan@sunpharma.in",
      region: "West",
      lead_source: "Web",
      product_interest: "Endpoint Security",
      deal_value_inr: 1500000.0,
      status: "Contacted",
      created_date: "2026-05-24",
      last_contacted: "2026-05-28",
      follow_up_count: 4,
      time_to_first_contact: 3,
      converted: 0,
      conversion_date: null,
      ml_score: 61.20,
      notes: "Followed up regarding anti-ransomware endpoint solution licensing."
    },
    {
      lead_id: "L-2026-0003",
      partner_id: "P-2024-002",
      company_name: "Bharat Petroleum",
      contact_name: "Ramesh Kumar",
      contact_email: "ramesh@bpcl.gov.in",
      region: "North",
      lead_source: "Cold Call",
      product_interest: "Database Shield",
      deal_value_inr: 950000.0,
      status: "Qualified",
      created_date: "2026-05-10",
      last_contacted: "2026-05-20",
      follow_up_count: 1,
      time_to_first_contact: 8,
      converted: 0,
      conversion_date: null,
      ml_score: 28.50,
      notes: "Low engagement. Representative outreach took 8 days. Schedule secondary check."
    },
    {
      lead_id: "L-2026-0004",
      partner_id: "P-2024-004",
      company_name: "Razorpay Systems",
      contact_name: "Siddharth Nair",
      contact_email: "sid@razorpay.com",
      region: "South",
      lead_source: "Referral",
      product_interest: "Web Application Firewall",
      deal_value_inr: 4500000.0,
      status: "Converted",
      created_date: "2026-04-18",
      last_contacted: "2026-05-10",
      follow_up_count: 6,
      time_to_first_contact: 1,
      converted: 1,
      conversion_date: "2026-05-20",
      ml_score: 92.30,
      notes: "Successfully onboarded. Customer fully satisfied with custom API firewall deployment."
    },
    {
      lead_id: "L-2026-0005",
      partner_id: "P-2024-003",
      company_name: "Haldia Petrochemicals",
      contact_name: "Rajesh Sen",
      contact_email: "rajesh@haldia.co.in",
      region: "East",
      lead_source: "Event",
      product_interest: "Network Guard",
      deal_value_inr: 1200000.0,
      status: "Lost",
      created_date: "2026-03-01",
      last_contacted: "2026-03-24",
      follow_up_count: 2,
      time_to_first_contact: 5,
      converted: 0,
      conversion_date: null,
      ml_score: 34.60,
      notes: "Closed due to budget cuts. Re-engage in Q4."
    },
    {
      lead_id: "L-2026-0006",
      partner_id: "P-2024-005",
      company_name: "MP Housing Board",
      contact_name: "Anil Deshmukh",
      contact_email: "anil@mphousing.org",
      region: "Central",
      lead_source: "Web",
      product_interest: "SIEM Suite",
      deal_value_inr: 2700000.0,
      status: "New",
      created_date: "2026-06-03",
      last_contacted: null,
      follow_up_count: 0,
      time_to_first_contact: null,
      converted: 0,
      conversion_date: null,
      ml_score: 48.00,
      notes: "Government tender inquiry. Requires proposal draft by Monday."
    },
    {
      lead_id: "L-2026-0007",
      partner_id: "P-2024-004",
      company_name: "Ola Electric HQ",
      contact_name: "Anjali Rao",
      contact_email: "anjali@olaelectric.in",
      region: "South",
      lead_source: "LinkedIn",
      product_interest: "IoT Security Shield",
      deal_value_inr: 5800000.0,
      status: "Qualified",
      created_date: "2026-05-15",
      last_contacted: "2026-06-01",
      follow_up_count: 5,
      time_to_first_contact: 2,
      converted: 0,
      conversion_date: null,
      ml_score: 86.60,
      notes: "Warm contact. High value deal. Recommends direct onsite technical demonstration."
    }
  ]
};

// Response Interceptor with automatic offline fallback handling
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const { config } = error;
    console.warn(`[API Connection warning] Request failed: ${config?.method?.toUpperCase()} ${config?.url}. Falling back to client-side offline mock data.`);
    
    // Handle Summary fallback
    if (config?.url?.endsWith('/analytics/summary')) {
      return { success: true, data: MOCK_DATA.summary, isOfflineMock: true };
    }
    // Handle Trends fallback
    if (config?.url?.endsWith('/analytics/trends')) {
      return { success: true, data: MOCK_DATA.trends, isOfflineMock: true };
    }
    // Handle Tier breakdown fallback
    if (config?.url?.endsWith('/analytics/tier-breakdown')) {
      return { success: true, data: MOCK_DATA.tierBreakdown, isOfflineMock: true };
    }
    
    // Handle Partners List fallback
    if (config?.url?.includes('/partners') && !config?.url?.includes('/partners/')) {
      let urlStr = config.url;
      if (urlStr.startsWith('/')) urlStr = `http://localhost${urlStr}`;
      else if (!urlStr.startsWith('http')) urlStr = `http://localhost/api${urlStr}`;
      
      let tier = null, region = null, status = null, q = null;
      let sortBy = 'company_name', sortDir = 'asc';
      
      try {
        const url = new URL(urlStr);
        tier = url.searchParams.get('tier');
        region = url.searchParams.get('region');
        status = url.searchParams.get('status');
        q = url.searchParams.get('q');
        sortBy = url.searchParams.get('sort_by') || 'company_name';
        sortDir = url.searchParams.get('sort_dir') || 'asc';
      } catch (e) {}
      
      let filtered = [...MOCK_DATA.partners];
      if (tier) filtered = filtered.filter(p => p.tier === tier);
      if (region) filtered = filtered.filter(p => p.region === region);
      if (status) filtered = filtered.filter(p => p.status === status);
      if (q) {
        const query = q.toLowerCase();
        filtered = filtered.filter(p => p.company_name.toLowerCase().includes(query) || p.contact_name.toLowerCase().includes(query));
      }
      
      filtered.sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];
        if (typeof valA === 'string') {
          return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return sortDir === 'asc' ? valA - valB : valB - valA;
      });
      
      return {
        success: true,
        data: filtered,
        pagination: { page: 1, per_page: 20, total_items: filtered.length, total_pages: 1 },
        isOfflineMock: true
      };
    }
    
    // Handle Partner Detail fallback (attaches their leads)
    const partnerDetailMatch = config?.url?.match(/\/partners\/([A-Za-z0-9\-]+)/);
    if (partnerDetailMatch) {
      const partnerId = partnerDetailMatch[1];
      const partner = MOCK_DATA.partners.find(p => p.partner_id === partnerId);
      if (partner) {
        const partnerLeads = MOCK_DATA.leads.filter(l => l.partner_id === partnerId);
        return { success: true, data: { ...partner, leads: partnerLeads }, isOfflineMock: true };
      } else {
        return Promise.reject({ response: { status: 404, data: { success: false, message: "Partner not found" } } });
      }
    }

    // Handle Leads List fallback
    if (config?.url?.includes('/leads') && !config?.url?.match(/\/leads\/[A-Za-z0-9\-]+/)) {
      let urlStr = config.url;
      if (urlStr.startsWith('/')) urlStr = `http://localhost${urlStr}`;
      else if (!urlStr.startsWith('http')) urlStr = `http://localhost/api${urlStr}`;
      
      let status = null, partner_id = null, region = null, q = null;
      let sortBy = 'created_date', sortDir = 'desc';
      
      try {
        const url = new URL(urlStr);
        status = url.searchParams.get('status');
        partner_id = url.searchParams.get('partner');
        region = url.searchParams.get('region');
        q = url.searchParams.get('q');
        sortBy = url.searchParams.get('sort_by') || 'created_date';
        sortDir = url.searchParams.get('sort_dir') || 'desc';
      } catch (e) {}
      
      let filtered = [...MOCK_DATA.leads];
      if (status) filtered = filtered.filter(l => l.status === status);
      if (partner_id) filtered = filtered.filter(l => l.partner_id === partner_id);
      if (region) filtered = filtered.filter(l => l.region === region);
      if (q) {
        const query = q.toLowerCase();
        filtered = filtered.filter(l => l.company_name.toLowerCase().includes(query) || l.contact_name.toLowerCase().includes(query));
      }
      
      filtered.sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];
        if (!valA && valA !== 0) return 1;
        if (!valB && valB !== 0) return -1;
        if (typeof valA === 'string') {
          return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return sortDir === 'asc' ? valA - valB : valB - valA;
      });
      
      return {
        success: true,
        data: filtered,
        pagination: { page: 1, per_page: 50, total_items: filtered.length, total_pages: 1 },
        isOfflineMock: true
      };
    }

    // Handle Lead Update fallback (updates status, re-scores lead, and syncs summary)
    const leadUpdateMatch = config?.url?.match(/\/leads\/([A-Za-z0-9\-]+)/);
    if (leadUpdateMatch && (config.method === 'put' || config.method === 'PUT')) {
      const leadId = leadUpdateMatch[1];
      const data = JSON.parse(config.data || '{}');
      const idx = MOCK_DATA.leads.findIndex(l => l.lead_id === leadId);
      
      if (idx !== -1) {
        const oldLead = MOCK_DATA.leads[idx];
        const updatedLead = { ...oldLead, ...data };
        
        // Emulate conversion logic
        if (data.status === 'Converted') {
          updatedLead.converted = 1;
          updatedLead.conversion_date = new Date().toISOString().split('T')[0];
        } else if (data.status && data.status !== 'Converted') {
          updatedLead.converted = 0;
          updatedLead.conversion_date = null;
        }

        // Re-score ML values if features change
        const triggerFields = ['deal_value_inr', 'follow_up_count', 'time_to_first_contact', 'region', 'lead_source', 'product_interest'];
        if (triggerFields.some(f => f in data)) {
          updatedLead.ml_score = calculateMockLeadScore(updatedLead);
        }

        MOCK_DATA.leads[idx] = updatedLead;

        // Recalculate summary metrics to sync numbers on Overview cards
        const allActiveLeads = MOCK_DATA.leads.filter(l => ['New', 'Contacted', 'Qualified'].includes(l.status));
        MOCK_DATA.summary.active_leads = allActiveLeads.length;
        MOCK_DATA.summary.pipeline_value_inr = allActiveLeads.reduce((sum, l) => sum + l.deal_value_inr, 0);
        const convertedCount = MOCK_DATA.leads.filter(l => l.converted === 1).length;
        MOCK_DATA.summary.conversion_rate = parseFloat(((convertedCount / MOCK_DATA.leads.length) * 100).toFixed(2));

        return { success: true, message: "Lead updated successfully", lead: updatedLead, isOfflineMock: true };
      } else {
        return Promise.reject({ response: { status: 404, data: { success: false, message: "Lead not found" } } });
      }
    }

    return Promise.reject(error);
  }
);

export const analyticsService = {
  getSummary: () => apiClient.get('/analytics/summary'),
  getTrends: () => apiClient.get('/analytics/trends'),
  getTierBreakdown: () => apiClient.get('/analytics/tier-breakdown')
};

export const partnerService = {
  getPartners: (params) => apiClient.get('/partners', { params }),
  getPartnerDetail: (id) => apiClient.get(`/partners/${id}`),
  updatePartner: (id, data) => apiClient.put(`/partners/${id}`, data),
  deletePartner: (id) => apiClient.delete(`/partners/${id}`)
};

export const leadService = {
  getLeads: (params) => apiClient.get('/leads', { params }),
  getLeadDetail: (id) => apiClient.get(`/leads/${id}`),
  createLead: (data) => apiClient.post('/leads', data),
  updateLead: (id, data) => apiClient.put(`/leads/${id}`, data),
  deleteLead: (id) => apiClient.delete(`/leads/${id}`)
};

export default apiClient;
