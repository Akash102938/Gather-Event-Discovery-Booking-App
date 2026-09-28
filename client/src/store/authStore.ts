import { create } from 'zustand';
import api from '../services/api';
import { User } from '../types';

interface RegisterPayload {
  name: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
  role: 'user' | 'organizer';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  updateProfile: (data: { name?: string; mobile?: string }) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,

  init: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data.user, isAuthenticated: true });
      localStorage.setItem('user', JSON.stringify(data.user));
    } catch {
      get().logout();
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.response?.data?.message || 'Login failed.' });
      throw err;
    }
  },

  register: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/register', payload);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.response?.data?.message || 'Registration failed.' });
      throw err;
    }
  },

  updateProfile: async (data) => {
    const res = await api.put('/auth/me', data);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    set({ user: res.data.user });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, isAuthenticated: false });
  },

  clearError: () => set({ error: null }),
}));
