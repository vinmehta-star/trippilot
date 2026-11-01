import axios from 'axios';
import { TripRequest, SavedTrip, Itinerary, NLEditResult, ReadinessFactor, User, AuthResponse } from '../types';

const client = axios.create({
  baseURL: '/api',
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach auth token if available
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('trippilot_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error normalization
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export const api = {
  // Status
  getStatus: async () => {
    const { data } = await client.get('/status');
    return data as { geminiAvailable: boolean; weatherAvailable: boolean; timestamp: string };
  },

  // Itinerary generation
  generateItinerary: async (request: TripRequest) => {
    const { data } = await client.post('/itinerary/generate', request);
    return data as {
      trip: SavedTrip;
      readinessScore: number;
      readinessFactors: ReadinessFactor[];
      budgetBreakdown: any;
      isDemo: boolean;
    };
  },

  // Natural language edit
  nlEdit: async (tripId: string, prompt: string, currentItinerary: Itinerary, tripRequest: TripRequest) => {
    const { data } = await client.post('/itinerary/nl-edit', {
      tripId,
      prompt,
      currentItinerary,
      tripRequest,
    });
    return data as NLEditResult;
  },

  // Budget calculation
  calculateBudget: async (request: TripRequest) => {
    const { data } = await client.post('/budget/calculate', request);
    return data as { breakdown: any; suggestions: string[] };
  },

  // Trip CRUD
  getTrips: async () => {
    const { data } = await client.get('/trips');
    return data as { trips: SavedTrip[] };
  },

  getTrip: async (id: string) => {
    const { data } = await client.get(`/trips/${id}`);
    return data as { trip: SavedTrip; readinessScore: number; readinessFactors: ReadinessFactor[] };
  },

  updateTrip: async (id: string, updates: { itinerary?: Itinerary; readinessScore?: number; packingProgress?: number }) => {
    const { data } = await client.put(`/trips/${id}`, updates);
    return data as { trip: SavedTrip; readinessScore: number; readinessFactors: ReadinessFactor[] };
  },

  deleteTrip: async (id: string) => {
    const { data } = await client.delete(`/trips/${id}`);
    return data as { success: boolean };
  },

  syncTrips: async (trips: SavedTrip[]) => {
    const { data } = await client.post('/trips/sync', { trips });
    return data as { status: string; count: number };
  },

  // Weather
  getWeather: async (destination: string, startDate: string) => {
    const { data } = await client.get('/weather', { params: { destination, startDate } });
    return data as { available: boolean; message?: string; forecast: any[] };
  },

  // Geocoding
  geocode: async (query: string) => {
    const { data } = await client.get('/geocode', { params: { q: query } });
    return data as { found: boolean; lat?: number; lng?: number; name?: string };
  },

  // Auth
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await client.post('/auth/login', { email, password });
    return data as AuthResponse;
  },

  register: async (payload: {
    name: string;
    email: string;
    password: string;
    travelStyle?: string;
    homeCity?: string;
  }): Promise<AuthResponse> => {
    const { data } = await client.post('/auth/register', payload);
    return data as AuthResponse;
  },

  getMe: async (): Promise<AuthResponse> => {
    const { data } = await client.get('/auth/me');
    return data as AuthResponse;
  },
};

