import axios from 'axios';

// Respect VITE_API_URL if configured, otherwise fallback to relative /api (works with Vite proxy and Vercel rewrites)
const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/api`
  : '/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Allow HTTP-only session cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach bearer token if present in localStorage as cross-origin backup
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('mm_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for graceful error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If backend returns a structured error, extract it
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    const err: any = new Error(message);
    err.status = error.response?.status;
    err.response = error.response;
    return Promise.reject(err);
  }
);
