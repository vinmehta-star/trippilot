import { create } from 'zustand';
import { User } from '../types';
import { api } from '../services/api';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<boolean>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    travelStyle?: any;
    homeCity?: string;
  }) => Promise<boolean>;
  demoLogin: () => Promise<boolean>;
  logout: () => void;
  initAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('trippilot_token'),
  isLoading: false,
  error: null,

  initAuth: async () => {
    const token = localStorage.getItem('trippilot_token');
    if (!token) return;

    try {
      set({ isLoading: true });
      const { user } = await api.getMe();
      set({ user, token, isLoading: false });
    } catch {
      localStorage.removeItem('trippilot_token');
      set({ user: null, token: null, isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await api.login(email, password);
      localStorage.setItem('trippilot_token', token);
      set({ user, token, isLoading: false });
      toast.success(`Welcome back, ${user.name.split(' ')[0]}! ✈️`);
      return true;
    } catch (e: any) {
      const msg = e.message || 'Login failed';
      set({ error: msg, isLoading: false });
      toast.error(msg);
      return false;
    }
  },

  register: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await api.register(payload);
      localStorage.setItem('trippilot_token', token);
      set({ user, token, isLoading: false });
      toast.success(`Passport created! Welcome aboard, ${user.name}! 🌟`);
      return true;
    } catch (e: any) {
      const msg = e.message || 'Registration failed';
      set({ error: msg, isLoading: false });
      toast.error(msg);
      return false;
    }
  },

  demoLogin: async () => {
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await api.login('alex@trippilot.ai', 'explorer123');
      localStorage.setItem('trippilot_token', token);
      set({ user, token, isLoading: false });
      toast.success(`⚡ Quick-switched to Demo Adventurer (${user.name})!`);
      return true;
    } catch (e: any) {
      const msg = e.message || 'Demo login failed';
      set({ error: msg, isLoading: false });
      toast.error(msg);
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('trippilot_token');
    set({ user: null, token: null });
    toast.success('Signed out. Your vault remains safe.');
  },

  clearError: () => set({ error: null }),
}));

