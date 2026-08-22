import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from localStorage to every request if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vortex_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified error format
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const customError = {
      message: error.response?.data?.message || error.response?.data?.error || error.message || 'An unexpected error occurred',
      statusCode: error.response?.status || 500,
      code: error.response?.data?.code || 'UNKNOWN_ERROR',
      details: error.response?.data?.details || null,
    };

    // Auto logout on token expiration / unauthorized
    if (error.response?.status === 401) {
      if (localStorage.getItem('vortex_token')) {
        localStorage.removeItem('vortex_token');
        localStorage.removeItem('vortex_user');
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }

    return Promise.reject(customError);
  }
);

export default api;
