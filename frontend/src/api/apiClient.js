import axios from 'axios';

// Base API URL from environment variable or fallback to default Express port
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds timeout
});

// Request Interceptor: Automatically attach Bearer token if present
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('kisan_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle global errors and unauthorized (401) sessions
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // 401 Unauthorized -> clear token if expired and redirect to login
      if (error.response.status === 401) {
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/login') && !currentPath.includes('/register') && currentPath !== '/') {
          localStorage.removeItem('kisan_auth_token');
          localStorage.removeItem('kisan_user');
          if (currentPath.startsWith('/admin')) {
            window.location.href = '/admin/login';
          } else {
            window.location.href = '/login';
          }
        }
      }
      
      const serverMessage = error.response.data?.message || error.response.data?.error;
      return Promise.reject(new Error(serverMessage || `Server Error (${error.response.status})`));
    } else if (error.request) {
      return Promise.reject(new Error('Unable to reach server. Please check your internet connection or backend server status.'));
    }
    return Promise.reject(error);
  }
);

export default apiClient;
