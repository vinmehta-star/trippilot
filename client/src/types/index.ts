// ─── Frontend Type Definitions ────────────────────────────────────────────────

export type TravelStyle = 'budget' | 'balanced' | 'comfort' | 'luxury';
export type Interest = 'adventure' | 'nature' | 'food' | 'culture' | 'shopping' | 'relaxation' | 'nightlife';
export type Transport = 'flight' | 'train' | 'bus' | 'car' | 'ferry';
export type Accommodation = 'hostel' | 'guesthouse' | 'hotel' | 'boutique' | 'resort' | 'airbnb';
export type ActivityCategory = 'sightseeing' | 'adventure' | 'food' | 'culture' | 'shopping' | 'nature' | 'nightlife' | 'relaxation' | 'transport';

export interface ActivityLocation {
  name: string;
  lat?: number;
  lng?: number;
  address?: string;
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  category: ActivityCategory;
  startTime: string;
  durationMinutes: number;
  estimatedCost: number;
  location: ActivityLocation;
  imageKeyword?: string;
  reasonForRecommendation?: string;
  isOptional: boolean;
  travelTimeToNextMinutes?: number;
  notes?: string;
}

export interface AccommodationDetails {
  name: string;
  type: Accommodation;
  pricePerNight: number;
  location: { name: string; lat?: number; lng?: number };
}

export interface Day {
  dayNumber: number;
  date: string;
  theme: string;
  activities: Activity[];
  accommodation?: AccommodationDetails;
  notes?: string;
}

export interface BudgetBreakdown {
  transport: number;
  accommodation: number;
  food: number;
  activities: number;
  localTransport: number;
  miscellaneous: number;
  emergencyBuffer: number;
  total: number;
  perPerson: number;
  currency: string;
  isOverBudget: boolean;
  overBudgetBy?: number;
}

export interface PackingItem {
  id: string;
  name: string;
  checked: boolean;
  essential: boolean;
}

export interface PackingCategory {
  category: string;
  items: PackingItem[];
}

export interface EmergencyContact {
  name: string;
  number: string;
  type: string;
}

export interface Itinerary {
  destination: string;
  overview: string;
  days: Day[];
  budgetBreakdown: BudgetBreakdown;
  packingList: PackingCategory[];
  topTips: string[];
  bestTimeToVisit?: string;
  localCurrency?: string;
  emergencyContacts?: EmergencyContact[];
  isDemo: boolean;
}

export interface TripRequest {
  startingCity: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  numberOfTravellers: number;
  totalBudget: number;
  currency: string;
  travelStyle: TravelStyle;
  interests: Interest[];
  preferredTransport: Transport[];
  preferredAccommodation: Accommodation;
  dietaryRequirements?: string[];
  accessibilityNeeds?: string;
  additionalNotes?: string;
}

export interface SavedTrip {
  id: string;
  createdAt: string;
  updatedAt: string;
  request: TripRequest;
  itinerary: Itinerary;
  readinessScore?: number;
  packingProgress?: number;
}

export interface ReadinessFactor {
  label: string;
  score: number;
  maxScore: number;
  description: string;
}

export interface WeatherDay {
  date: string;
  condition: string;
  temperatureHigh: number;
  temperatureLow: number;
  precipitation: number;
  icon: string;
  isAdverse: boolean;
  affectedActivities?: string[];
}

export interface NLEditResult {
  interpretation: string;
  changes: Array<{
    type: 'replace' | 'add' | 'remove' | 'modify';
    dayNumber: number;
    activityId?: string;
    description: string;
    newActivity?: Activity;
  }>;
  budgetImpact: number;
  explanation: string;
}

export interface WizardFormData extends Partial<TripRequest> {
  step: number;
}

// Budget simulator scenario
export interface BudgetScenario {
  id: string;
  label: string;
  description: string;
  delta: Partial<BudgetBreakdown>;
  totalDelta: number;
}

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
];

export const CATEGORY_COLORS: Record<ActivityCategory, string> = {
  sightseeing: '#6372f5',
  adventure: '#f84b4b',
  food: '#f59e0b',
  culture: '#8b5cf6',
  shopping: '#ec4899',
  nature: '#10b981',
  nightlife: '#3b82f6',
  relaxation: '#14b8a6',
  transport: '#94a3b8',
};

export const CATEGORY_ICONS: Record<ActivityCategory, string> = {
  sightseeing: '🏛️',
  adventure: '🏔️',
  food: '🍜',
  culture: '🎭',
  shopping: '🛍️',
  nature: '🌿',
  nightlife: '🌙',
  relaxation: '🧘',
  transport: '🚌',
};

// ─── User & Authentication ────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  travelStyle?: TravelStyle;
  homeCity?: string;
  token?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

