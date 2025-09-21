import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('supabase.auth.token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Alerts API
export const alertsAPI = {
  getAll: () => api.get('/alerts'),
  create: (data: any) => api.post('/alerts', data),
  updateStatus: (id: string, status: string) => api.patch(`/alerts/${id}/status`, { status }),
  getBySeverity: (level: string) => api.get(`/alerts/severity/${level}`),
};

// Incidents API
export const incidentsAPI = {
  getAll: () => api.get('/incidents'),
  create: (data: any) => api.post('/incidents', data),
  verify: (id: string, verified: boolean, verified_by: string) => 
    api.patch(`/incidents/${id}/verify`, { verified, verified_by }),
  getByLocation: (location: string) => api.get(`/incidents/location/${location}`),
};

// Resources API
export const resourcesAPI = {
  getAll: (params?: any) => api.get('/resources', { params }),
  updateAvailability: (id: string, data: any) => api.patch(`/resources/${id}/availability`, data),
  getNearby: (params: any) => api.get('/resources/nearby', { params }),
  getCapacityStatus: () => api.get('/resources/capacity-status'),
  create: (data: any) => api.post('/resources', data),
};

// Evacuation API
export const evacuationAPI = {
  getRoutes: (params?: any) => api.get('/evacuation', { params }),
  optimizeRoute: (data: any) => api.post('/evacuation/optimize', data),
  updateRouteStatus: (id: string, data: any) => api.patch(`/evacuation/${id}/status`, data),
  getRoutesByLocation: (location: string) => api.get(`/evacuation/from/${location}`),
  getCapacityStatus: () => api.get('/evacuation/capacity-status'),
  createRoute: (data: any) => api.post('/evacuation', data),
};

// AI API
export const aiAPI = {
  calculateSeverity: (data: any) => api.post('/ai/severity', data),
  predictResources: (data: any) => api.post('/ai/predict-resources', data),
  assessRisk: (data: any) => api.post('/ai/risk-assessment', data),
  getEvacuationRecommendations: (data: any) => api.post('/ai/evacuation-recommendations', data),
};

// Notifications API
export const notificationsAPI = {
  sendEmergency: (data: any) => api.post('/notifications/emergency', data),
  sendSMS: (data: any) => api.post('/notifications/sms', data),
  sendPush: (data: any) => api.post('/notifications/push', data),
  getHistory: (params?: any) => api.get('/notifications/history', { params }),
  broadcast: (data: any) => api.post('/notifications/broadcast', data),
};

export default api;
