import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { SavedTrip } from '../types';

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

const DEFAULT_DEMO_USER: StoredUser = {
  id: 'usr-alex-mercer',
  name: 'Alex Mercer',
  email: 'alex@trippilot.ai',
  passwordHash: 'explorer123',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  travelStyle: 'balanced',
  homeCity: 'San Francisco, CA',
  createdAt: '2026-01-01T00:00:00.000Z',
};

function loadData(): Schema {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initial: Schema = { trips: [], preferences: {}, users: [DEFAULT_DEMO_USER] };
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<Schema>;
    if (!parsed.users || !Array.isArray(parsed.users) || parsed.users.length === 0) {
      parsed.users = [DEFAULT_DEMO_USER];
    }
    return parsed as Schema;
  } catch (err) {
    console.error('[TripPilot DB] Error loading database file:', err);
    return { trips: [], preferences: {}, users: [DEFAULT_DEMO_USER] };
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
