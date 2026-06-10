import axios from 'axios';

// Create Axios client with base URL pointing to the Vite proxy endpoint
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

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
      status: "Active",
      leads: [
        { lead_id: "L-2026-01", company_name: "Tata Steel Corp", deal_value_inr: 1500000.0, status: "Converted", created_date: "2026-04-12", conversion_date: "2026-05-01", ml_score: 84.70 },
        { lead_id: "L-2026-02", company_name: "Reliance Retail", deal_value_inr: 3200000.0, status: "Converted", created_date: "2026-04-20", conversion_date: "2026-05-18", ml_score: 92.50 },
        { lead_id: "L-2026-03", company_name: "Godrej Industries", deal_value_inr: 1800000.0, status: "Qualified", created_date: "2026-05-22", conversion_date: null, ml_score: 66.80 },
        { lead_id: "L-2026-04", company_name: "Wipro Tech Hub", deal_value_inr: 800000.0, status: "New", created_date: "2026-06-02", conversion_date: null, ml_score: 55.40 },
        { lead_id: "L-2026-05", company_name: "L&T Infrastructure", deal_value_inr: 450000.0, status: "Lost", created_date: "2026-03-10", conversion_date: null, ml_score: 24.30 }
      ]
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
      status: "Active",
      leads: [
        { lead_id: "L-2026-06", company_name: "Maruti Suzuki", deal_value_inr: 1200000.0, status: "Converted", created_date: "2026-04-05", conversion_date: "2026-04-30", ml_score: 78.40 },
        { lead_id: "L-2026-07", company_name: "Paytm Financials", deal_value_inr: 600000.0, status: "Contacted", created_date: "2026-05-15", conversion_date: null, ml_score: 42.10 },
        { lead_id: "L-2026-08", company_name: "Max Life Insurance", deal_value_inr: 2100000.0, status: "Qualified", created_date: "2026-05-28", conversion_date: null, ml_score: 71.90 }
      ]
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
      status: "Active",
      leads: [
        { lead_id: "L-2026-09", company_name: "ITC Food Division", deal_value_inr: 950000.0, status: "Converted", created_date: "2026-03-12", conversion_date: "2026-04-10", ml_score: 64.20 },
        { lead_id: "L-2026-10", company_name: "Bandhan Bank", deal_value_inr: 1400000.0, status: "Contacted", created_date: "2026-05-10", conversion_date: null, ml_score: 38.50 }
      ]
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
      status: "Active",
      leads: [
        { lead_id: "L-2026-11", company_name: "Infosys Campus Labs", deal_value_inr: 4500000.0, status: "Converted", created_date: "2026-04-18", conversion_date: "2026-05-22", ml_score: 89.10 },
        { lead_id: "L-2026-12", company_name: "Biocon Labs", deal_value_inr: 2800000.0, status: "Converted", created_date: "2026-05-02", conversion_date: "2026-05-29", ml_score: 82.30 },
        { lead_id: "L-2026-13", company_name: "Swiggy HQ", deal_value_inr: 1600000.0, status: "Qualified", created_date: "2026-05-24", conversion_date: null, ml_score: 75.80 }
      ]
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
      status: "Active",
      leads: [
        { lead_id: "L-2026-14", company_name: "Madhya Pradesh Police", deal_value_inr: 2500000.0, status: "Converted", created_date: "2026-03-20", conversion_date: "2026-04-18", ml_score: 72.10 },
        { lead_id: "L-2026-15", company_name: "Dainik Bhaskar Group", deal_value_inr: 850000.0, status: "Contacted", created_date: "2026-05-20", conversion_date: null, ml_score: 41.50 }
      ]
    },
    {
      partner_id: "P-2024-006",
      company_name: "Novus Tek",
      contact_name: "Emily Chang",
      contact_email: "emily@novustek.in",
      phone: "+91-9008007001",
      region: "West",
      city: "Pune",
      tier: "Gold",
      annual_revenue_inr: 22100000.0,
      deal_count: 62,
      active_leads: 10,
      last_activity_date: "2026-06-08",
      onboarded_date: "2024-11-12",
      status: "Active",
      leads: [
        { lead_id: "L-2026-16", company_name: "Bajaj Auto", deal_value_inr: 1950000.0, status: "Converted", created_date: "2026-04-10", conversion_date: "2026-05-02", ml_score: 87.60 },
        { lead_id: "L-2026-17", company_name: "Symbiosis Institute", deal_value_inr: 1050000.0, status: "Qualified", created_date: "2026-05-18", conversion_date: null, ml_score: 63.40 }
      ]
    },
    {
      partner_id: "P-2024-007",
      company_name: "Vanguard Tech Partners",
      contact_name: "Rahul Verma",
      contact_email: "rahul@vanguardtech.com",
      phone: "+91-9122334455",
      region: "North",
      city: "Chandigarh",
      tier: "Bronze",
      annual_revenue_inr: 3800000.0,
      deal_count: 14,
      active_leads: 2,
      last_activity_date: "2026-06-02",
      onboarded_date: "2025-04-01",
      status: "Inactive",
      leads: [
        { lead_id: "L-2026-18", company_name: "Verka Dairy Plant", deal_value_inr: 550000.0, status: "Converted", created_date: "2026-04-22", conversion_date: "2026-05-14", ml_score: 52.80 }
      ]
    },
    {
      partner_id: "P-2024-008",
      company_name: "Southern Firewall Co",
      contact_name: "Priya Patel",
      contact_email: "priya@southernfirewall.com",
      phone: "+91-9444055555",
      region: "South",
      city: "Chennai",
      tier: "Silver",
      annual_revenue_inr: 11400000.0,
      deal_count: 38,
      active_leads: 6,
      last_activity_date: "2026-06-06",
      onboarded_date: "2024-06-30",
      status: "Active",
      leads: [
        { lead_id: "L-2026-19", company_name: "MRF Tyres HQ", deal_value_inr: 1750000.0, status: "Converted", created_date: "2026-03-30", conversion_date: "2026-04-28", ml_score: 76.50 },
        { lead_id: "L-2026-20", company_name: "Apollo Hospitals", deal_value_inr: 2900000.0, status: "Qualified", created_date: "2026-05-12", conversion_date: null, ml_score: 81.10 }
      ]
    }
  ]
};

// Response Interceptor with automatic offline fallback handling
apiClient.interceptors.response.use(
  (response) => {
    // If request succeeded, return envelope data field directly
    return response.data;
  },
  async (error) => {
    const { config } = error;
    
    // Log warnings for debugging purposes
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
    
    // Handle Partners List fallback (supporting simple mock query emulation)
    if (config?.url?.includes('/partners') && !config?.url?.includes('/partners/')) {
      let urlStr = config.url;
      // Resolve relative url
      if (urlStr.startsWith('/')) {
        urlStr = `http://localhost${urlStr}`;
      } else if (!urlStr.startsWith('http')) {
        urlStr = `http://localhost/api${urlStr}`;
      }
      
      let tier = null;
      let region = null;
      let status = null;
      let q = null;
      let sortBy = 'company_name';
      let sortDir = 'asc';
      
      try {
        const url = new URL(urlStr);
        tier = url.searchParams.get('tier');
        region = url.searchParams.get('region');
        status = url.searchParams.get('status');
        q = url.searchParams.get('q');
        sortBy = url.searchParams.get('sort_by') || 'company_name';
        sortDir = url.searchParams.get('sort_dir') || 'asc';
      } catch (e) {
        // Fallback if URL parsing fails
      }
      
      let filtered = [...MOCK_DATA.partners];
      if (tier) filtered = filtered.filter(p => p.tier === tier);
      if (region) filtered = filtered.filter(p => p.region === region);
      if (status) filtered = filtered.filter(p => p.status === status);
      if (q) {
        const query = q.toLowerCase();
        filtered = filtered.filter(p => 
          p.company_name.toLowerCase().includes(query) || 
          p.contact_name.toLowerCase().includes(query)
        );
      }
      
      // Emulate sort
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
    
    // Handle Partner Detail fallback
    const detailMatch = config?.url?.match(/\/partners\/([A-Za-z0-9\-]+)/);
    if (detailMatch) {
      const partnerId = detailMatch[1];
      const partner = MOCK_DATA.partners.find(p => p.partner_id === partnerId);
      if (partner) {
        return { success: true, data: partner, isOfflineMock: true };
      } else {
        return Promise.reject({ response: { status: 404, data: { success: false, message: "Partner not found" } } });
      }
    }
    
    // Return standard error if no mock fallback exists
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

export default apiClient;
