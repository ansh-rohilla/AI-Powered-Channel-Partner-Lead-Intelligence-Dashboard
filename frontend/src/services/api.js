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
    { week_start: "2026-04-20", lead_volume: 36, conversion_rate: 33.33 },
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
    
    // Check endpoints and resolve with structured mock envelope response to prevent UI crashing
    if (config?.url?.endsWith('/analytics/summary')) {
      return { success: true, data: MOCK_DATA.summary, isOfflineMock: true };
    }
    if (config?.url?.endsWith('/analytics/trends')) {
      return { success: true, data: MOCK_DATA.trends, isOfflineMock: true };
    }
    if (config?.url?.endsWith('/analytics/tier-breakdown')) {
      return { success: true, data: MOCK_DATA.tierBreakdown, isOfflineMock: true };
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

export default apiClient;
