import { z } from 'zod';

// ─── Core Enums ────────────────────────────────────────────────────────────────
export const TravelStyleSchema = z.enum(['budget', 'balanced', 'comfort', 'luxury']);
export type TravelStyle = z.infer<typeof TravelStyleSchema>;

export const InterestSchema = z.enum([
  'adventure', 'nature', 'food', 'culture', 'shopping', 'relaxation', 'nightlife'
]);
export type Interest = z.infer<typeof InterestSchema>;

export const TransportSchema = z.enum(['flight', 'train', 'bus', 'car', 'ferry']);
export type Transport = z.infer<typeof TransportSchema>;

export const AccommodationSchema = z.enum(['hostel', 'guesthouse', 'hotel', 'boutique', 'resort', 'airbnb']);
export type Accommodation = z.infer<typeof AccommodationSchema>;

export const ActivityCategorySchema = z.enum([
  'sightseeing', 'adventure', 'food', 'culture', 'shopping', 'nature', 'nightlife', 'relaxation', 'transport'
]);
export type ActivityCategory = z.infer<typeof ActivityCategorySchema>;

// ─── Traveller ─────────────────────────────────────────────────────────────────
export const TravellerSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  budget: z.number().min(0).optional(),
  interests: z.array(InterestSchema).optional(),
  dietaryRequirements: z.array(z.string()).optional(),
  accessibilityNeeds: z.array(z.string()).optional(),
});
export type Traveller = z.infer<typeof TravellerSchema>;

// ─── Activity ──────────────────────────────────────────────────────────────────
export const ActivitySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: ActivityCategorySchema,
  startTime: z.string(), // HH:MM
  durationMinutes: z.number().min(0),
  estimatedCost: z.number().min(0),
  location: z.object({
    name: z.string(),
    lat: z.number().nullable().optional(),
    lng: z.number().nullable().optional(),
    address: z.string().nullable().optional(),
  }),
  imageKeyword: z.string().nullable().optional(),
  reasonForRecommendation: z.string().nullable().optional(),
  isOptional: z.boolean().default(false),
  travelTimeToNextMinutes: z.number().min(0).nullable().optional(),
  notes: z.string().nullable().optional(),
});
export type Activity = z.infer<typeof ActivitySchema>;

// ─── Day ───────────────────────────────────────────────────────────────────────
export const DaySchema = z.object({
  dayNumber: z.number().min(1),
  date: z.string(), // ISO date string
  theme: z.string(),
  activities: z.array(ActivitySchema),
  accommodation: z.object({
    name: z.string(),
    type: AccommodationSchema,
    pricePerNight: z.number().min(0),
    location: z.object({
      name: z.string(),
      lat: z.number().nullable().optional(),
      lng: z.number().nullable().optional(),
    }),
  }).nullable().optional(),
  notes: z.string().nullable().optional(),
});
export type Day = z.infer<typeof DaySchema>;

// ─── Budget Breakdown ──────────────────────────────────────────────────────────
export const BudgetBreakdownSchema = z.object({
  transport: z.number().min(0),
  accommodation: z.number().min(0),
  food: z.number().min(0),
  activities: z.number().min(0),
  localTransport: z.number().min(0),
  miscellaneous: z.number().min(0),
  emergencyBuffer: z.number().min(0),
  total: z.number().min(0),
  perPerson: z.number().min(0),
  currency: z.string(),
  isOverBudget: z.boolean(),
  overBudgetBy: z.number().optional(),
});
export type BudgetBreakdown = z.infer<typeof BudgetBreakdownSchema>;

// ─── Trip Request (from wizard) ────────────────────────────────────────────────
export const TripRequestSchema = z.object({
  startingCity: z.string().min(2).max(100),
  destination: z.string().min(2).max(100),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  numberOfTravellers: z.number().int().min(1).max(20),
  totalBudget: z.number().min(0),
  currency: z.string().length(3),
  travelStyle: TravelStyleSchema,
  interests: z.array(InterestSchema).min(1),
  preferredTransport: z.array(TransportSchema),
  preferredAccommodation: AccommodationSchema,
  dietaryRequirements: z.array(z.string()).optional().default([]),
  accessibilityNeeds: z.string().optional(),
  travellers: z.array(TravellerSchema).optional(),
  additionalNotes: z.string().optional(),
});
export type TripRequest = z.infer<typeof TripRequestSchema>;

// ─── Itinerary (full AI-generated plan) ───────────────────────────────────────
export const ItinerarySchema = z.object({
  destination: z.string(),
  overview: z.string(),
  days: z.array(DaySchema),
  budgetBreakdown: BudgetBreakdownSchema,
  packingList: z.array(z.object({
    category: z.string(),
    items: z.array(z.object({
      id: z.string(),
      name: z.string(),
      checked: z.boolean().default(false),
      essential: z.boolean().default(false),
    })),
  })),
  topTips: z.array(z.string()),
  bestTimeToVisit: z.string().optional(),
  localCurrency: z.string().optional(),
  emergencyContacts: z.array(z.object({
    name: z.string(),
    number: z.string(),
    type: z.string(),
  })).optional(),
  isDemo: z.boolean().default(false),
});
export type Itinerary = z.infer<typeof ItinerarySchema>;

// ─── Saved Trip ────────────────────────────────────────────────────────────────
export const SavedTripSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  request: TripRequestSchema,
  itinerary: ItinerarySchema,
  readinessScore: z.number().min(0).max(100).optional(),
  packingProgress: z.number().min(0).max(100).optional(),
});
export type SavedTrip = z.infer<typeof SavedTripSchema>;

// ─── Natural Language Edit Request ────────────────────────────────────────────
export const NLEditRequestSchema = z.object({
  tripId: z.string(),
  prompt: z.string().min(3).max(500),
  currentItinerary: ItinerarySchema,
  tripRequest: TripRequestSchema,
});
export type NLEditRequest = z.infer<typeof NLEditRequestSchema>;

// ─── Weather ──────────────────────────────────────────────────────────────────
export const WeatherSchema = z.object({
  date: z.string(),
  condition: z.string(),
  temperatureHigh: z.number(),
  temperatureLow: z.number(),
  precipitation: z.number(),
  icon: z.string(),
  isAdverse: z.boolean(),
  affectedActivities: z.array(z.string()).optional(),
});
export type Weather = z.infer<typeof WeatherSchema>;

// ─── User & Authentication ────────────────────────────────────────────────────
export const UserSchema = z.object({
  id: z.string(),
  name: z.string().min(2),
  email: z.string().email(),
  avatar: z.string().optional(),
  travelStyle: TravelStyleSchema.optional(),
  homeCity: z.string().optional(),
  token: z.string().optional(),
  createdAt: z.string(),
});
export type User = z.infer<typeof UserSchema>;

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const RegisterRequestSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  travelStyle: TravelStyleSchema.optional(),
  homeCity: z.string().optional(),
});
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

