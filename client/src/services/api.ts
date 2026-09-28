import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;

export function getErrorMessage(err: unknown): string {
  const anyErr = err as any;
  if (anyErr?.response?.data?.errors) {
    const first = Object.values(anyErr.response.data.errors)[0];
    return String(first);
  }
  if (anyErr?.response?.data?.message) return anyErr.response.data.message;
  if (anyErr?.message) return anyErr.message;
  return 'Something went wrong. Please try again.';
}
