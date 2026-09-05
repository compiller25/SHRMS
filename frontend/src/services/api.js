import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('access_token', access);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register/', userData),
  login: (credentials) => api.post('/auth/login/', credentials),
  logout: (refreshToken) => api.post('/auth/logout/', { refresh_token: refreshToken }),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.patch('/auth/profile/', data),
};

// Properties API
export const propertiesAPI = {
  getAll: (params) => api.get('/properties/', { params }),
  getOne: (id) => api.get(`/properties/${id}/`),
  // Allow multipart upload (FormData with an image file) by letting axios set
  // the Content-Type + boundary instead of the default application/json.
  create: (data) => api.post('/properties/', data,
    data instanceof FormData ? { headers: { 'Content-Type': undefined } } : undefined),
  update: (id, data) => api.patch(`/properties/${id}/`, data),
  delete: (id) => api.delete(`/properties/${id}/`),
  getAvailableUnits: (id) => api.get(`/properties/${id}/available_units/`),
};

// Marketplace API
export const marketplaceAPI = {
  getProperties: (params) => api.get('/marketplace/', { params }),
  getProperty: (id) => api.get(`/marketplace/${id}/`),
  getPropertyById: (id) => api.get(`/marketplace/${id}/`),
  getPropertyUnits: (id) => api.get(`/properties/${id}/available_units/`),
};

// Units API
export const unitsAPI = {
  getAll: (params) => api.get('/units/', { params }),
  getOne: (id) => api.get(`/units/${id}/`),
  create: (data) => api.post('/units/', data),
  update: (id, data) => api.patch(`/units/${id}/`, data),
  delete: (id) => api.delete(`/units/${id}/`),
  updateStatus: (id, status) => api.post(`/units/${id}/update_status/`, { status }),
};

// Rentals API
export const rentalsAPI = {
  getAll: (params) => api.get('/rentals/agreements/', { params }),
  getOne: (id) => api.get(`/rentals/agreements/${id}/`),
  apply: (data) => api.post('/rentals/agreements/apply/', data),
  applyForRental: (data) => api.post('/rentals/agreements/apply/', data),
  processApplication: (id, action, reason = '') => 
    api.post(`/rentals/agreements/${id}/process_application/`, { action, rejection_reason: reason }),
  terminate: (id) => api.post(`/rentals/agreements/${id}/terminate/`),
  getMyApplications: () => api.get('/rentals/agreements/my_applications/'),
  getPendingApplications: () => api.get('/rentals/agreements/pending_applications/'),
};

// Alias for consistency
export const rentalAPI = rentalsAPI;

// Payments API
export const paymentsAPI = {
  getAll: (params) => api.get('/payments/', { params }),
  getOne: (id) => api.get(`/payments/${id}/`),
  recordPayment: (id, data) => api.post(`/payments/${id}/record_payment/`, data),
  initiatePayment: (id, data) => api.post(`/payments/${id}/initiate_payment/`, data),
  checkPaymentStatus: (id) => api.get(`/payments/${id}/check_status/`),
  downloadInvoice: (id) => api.get(`/payments/${id}/invoice/`, { responseType: 'blob' }),
  downloadReport: (params) => api.get('/payments/report/', { params, responseType: 'blob' }),
  getMyPayments: () => api.get('/payments/my_payments/'),
  getOverdue: () => api.get('/payments/overdue/'),
  getStatistics: () => api.get('/payments/statistics/'),
};

export default api;
