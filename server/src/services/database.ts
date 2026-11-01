import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { SavedTrip } from '../types';
import { enrichItineraryCoordinates } from '../utils/cityCoordinates';

const DB_DIR = process.env.DATA_DIR || path.join(__dirname, '../../data');
const DB_FILE = process.env.DB_FILE || path.join(DB_DIR, 'trippilot_db.json');

interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  travelStyle?: string;
  homeCity?: string;
  createdAt: string;
}

interface Schema {
  trips: SavedTrip[];
  preferences: Record<string, string>;
  users: StoredUser[];
}

export const PERMANENT_DEFAULT_USERS: StoredUser[] = [
  {
    id: 'usr-alex-mercer',
    name: 'Alex Mercer',
    email: 'alex@trippilot.ai',
    passwordHash: 'explorer123',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    travelStyle: 'balanced',
    homeCity: 'San Francisco, CA',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'usr-vinay-mehta',
    name: 'Vinay Mehta',
    email: 'vinay@trippilot.ai',
    passwordHash: 'explorer123',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    travelStyle: 'balanced',
    homeCity: 'New Delhi, India',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'usr-examiner',
    name: 'Project Examiner',
    email: 'examiner@trippilot.ai',
    passwordHash: 'explorer123',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    travelStyle: 'comfort',
    homeCity: 'London, UK',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'usr-demo',
    name: 'Demo Traveler',
    email: 'demo@trippilot.ai',
    passwordHash: 'explorer123',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    travelStyle: 'luxury',
    homeCity: 'Tokyo, Japan',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

function loadData(): Schema {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initial: Schema = { trips: [], preferences: {}, users: [...PERMANENT_DEFAULT_USERS] };
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<Schema>;
    if (!parsed.users || !Array.isArray(parsed.users)) {
      parsed.users = [...PERMANENT_DEFAULT_USERS];
    } else {
      // Ensure all permanent default users are always preserved
      PERMANENT_DEFAULT_USERS.forEach((pu) => {
        if (!parsed.users!.some(u => u.email.toLowerCase() === pu.email.toLowerCase())) {
          parsed.users!.push(pu);
        }
      });
    }
    if (parsed.trips && Array.isArray(parsed.trips)) {
      parsed.trips.forEach((trip) => {
        if (trip.itinerary) {
          enrichItineraryCoordinates(trip.itinerary);
        }
      });
    }
    return parsed as Schema;
  } catch (err) {
    console.error('[TripPilot DB] Error loading database file:', err);
    return { trips: [], preferences: {}, users: [...PERMANENT_DEFAULT_USERS] };
  }
}

function saveData(data: Schema): void {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('[TripPilot DB] Error saving database file:', err);
  }
}

export function saveTrip(trip: Omit<SavedTrip, 'id' | 'createdAt' | 'updatedAt'>): SavedTrip {
  const data = loadData();
  const id = uuidv4();
  const now = new Date().toISOString();

  if (trip.itinerary) {
    enrichItineraryCoordinates(trip.itinerary);
  }

  const newTrip: SavedTrip = {
    id,
    createdAt: now,
    updatedAt: now,
    request: trip.request,
    itinerary: trip.itinerary,
    readinessScore: trip.readinessScore || 0,
    packingProgress: trip.packingProgress || 0,
  };

  data.trips.unshift(newTrip);
  saveData(data);
  return newTrip;
}

export function updateTrip(
  id: string,
  updates: Partial<Pick<SavedTrip, 'itinerary' | 'readinessScore' | 'packingProgress'>>
): SavedTrip | null {
  const data = loadData();
  const index = data.trips.findIndex(t => t.id === id);
  if (index === -1) return null;

  if (updates.itinerary) {
    enrichItineraryCoordinates(updates.itinerary);
  }

  const existing = data.trips[index];
  const updated: SavedTrip = {
    ...existing,
    updatedAt: new Date().toISOString(),
    itinerary: updates.itinerary || existing.itinerary,
    readinessScore: updates.readinessScore ?? existing.readinessScore ?? 0,
    packingProgress: updates.packingProgress ?? existing.packingProgress ?? 0,
  };

  data.trips[index] = updated;
  saveData(data);
  return updated;
}

export function getTripById(id: string): SavedTrip | null {
  const data = loadData();
  return data.trips.find(t => t.id === id) || null;
}

export function getAllTrips(): SavedTrip[] {
  const data = loadData();
  return data.trips.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function deleteTrip(id: string): boolean {
  const data = loadData();
  const initialLength = data.trips.length;
  data.trips = data.trips.filter(t => t.id !== id);
  if (data.trips.length !== initialLength) {
    saveData(data);
    return true;
  }
  return false;
}

export function savePreference(key: string, value: string): void {
  const data = loadData();
  data.preferences[key] = value;
  saveData(data);
}

export function getPreference(key: string): string | null {
  const data = loadData();
  return data.preferences[key] || null;
}

// ─── Authentication & User Store ──────────────────────────────────────────────
export function findUserByEmail(email: string): StoredUser | null {
  const data = loadData();
  return data.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim()) || null;
}

export function findUserById(id: string): StoredUser | null {
  const data = loadData();
  return data.users.find(u => u.id === id) || null;
}

export function createUser(payload: {
  name: string;
  email: string;
  password: string;
  travelStyle?: string;
  homeCity?: string;
}): StoredUser {
  const data = loadData();
  const existing = data.users.find(u => u.email.toLowerCase() === payload.email.toLowerCase().trim());
  if (existing) {
    throw new Error('An account with this email address already exists');
  }

  const id = `usr-${uuidv4().slice(0, 8)}`;
  const newUser: StoredUser = {
    id,
    name: payload.name.trim(),
    email: payload.email.toLowerCase().trim(),
    passwordHash: payload.password,
    avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80`,
    travelStyle: payload.travelStyle || 'balanced',
    homeCity: payload.homeCity || 'New York, USA',
    createdAt: new Date().toISOString(),
  };

  data.users.push(newUser);
  saveData(data);
  return newUser;
}

export function verifyCredentials(email: string, password: string): StoredUser | null {
  const user = findUserByEmail(email);
  if (!user) return null;
  if (user.passwordHash !== password) return null;
  return user;
}

export function restoreUser(userData: {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  avatar?: string;
  travelStyle?: string;
  homeCity?: string;
  createdAt?: string;
}): StoredUser {
  const data = loadData();
  const existing = data.users.find(
    u => u.id === userData.id || u.email.toLowerCase() === userData.email.toLowerCase().trim()
  );
  if (existing) {
    return existing;
  }

  const restored: StoredUser = {
    id: userData.id || `usr-${uuidv4().slice(0, 8)}`,
    name: userData.name || 'Traveler',
    email: userData.email.toLowerCase().trim(),
    passwordHash: userData.passwordHash || 'vault_persisted',
    avatar: userData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    travelStyle: userData.travelStyle || 'balanced',
    homeCity: userData.homeCity || 'New York, USA',
    createdAt: userData.createdAt || new Date().toISOString(),
  };

  data.users.push(restored);
  saveData(data);
  return restored;
}

export function saveTripWithId(trip: SavedTrip): SavedTrip {
  const data = loadData();
  const existingIndex = data.trips.findIndex(t => t.id === trip.id);
  if (trip.itinerary) {
    enrichItineraryCoordinates(trip.itinerary);
  }
  if (existingIndex !== -1) {
    data.trips[existingIndex] = trip;
  } else {
    data.trips.unshift(trip);
  }
  saveData(data);
  return trip;
}
