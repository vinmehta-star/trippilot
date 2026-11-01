import { create } from 'zustand';
import { User } from '../types';
import { api } from '../services/api';
import toast from 'react-hot-toast';

const VAULT_ACCOUNTS_KEY = 'trippilot_vault_accounts';

function saveToVault(creds: {
  email: string;
  password?: string;
  name: string;
  travelStyle?: any;
  homeCity?: string;
}) {
  try {
    const raw = localStorage.getItem(VAULT_ACCOUNTS_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[creds.email.toLowerCase().trim()] = creds;
    localStorage.setItem(VAULT_ACCOUNTS_KEY, JSON.stringify(map));
  } catch {}
}

function getFromVault(email: string) {
  try {
    const raw = localStorage.getItem(VAULT_ACCOUNTS_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw);
    return map[email.toLowerCase().trim()] || null;
  } catch {
    return null;
  }
}

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
  demoLogin: (email?: string, password?: string) => Promise<boolean>;
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
      saveToVault({ email, password, name: user.name, travelStyle: user.travelStyle, homeCity: user.homeCity });
      set({ user, token, isLoading: false });
      toast.success(`Welcome back, ${user.name.split(' ')[0]}! ✈️`);
      return true;
    } catch (e: any) {
      // If the backend ephemeral container restarted, check local credentials vault
      const vaultAcc = getFromVault(email);
      if (vaultAcc && vaultAcc.password === password) {
        try {
          const { user, token } = await api.register({
            name: vaultAcc.name || 'Traveler',
            email: vaultAcc.email,
            password: vaultAcc.password,
            travelStyle: vaultAcc.travelStyle,
            homeCity: vaultAcc.homeCity,
          });
          localStorage.setItem('trippilot_token', token);
          set({ user, token, isLoading: false });
          toast.success(`Passport synchronized! Welcome back, ${user.name.split(' ')[0]}! ✈️`);
          return true;
        } catch {}
      }

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
      saveToVault(payload);
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

  demoLogin: async (email = 'alex@trippilot.ai', password = 'explorer123') => {
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await api.login(email, password);
      localStorage.setItem('trippilot_token', token);
      set({ user, token, isLoading: false });
      toast.success(`⚡ Quick-switched to Explorer (${user.name})!`);
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

