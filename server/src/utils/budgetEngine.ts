import { TripRequest, Itinerary, BudgetBreakdown } from '../types';
import { differenceInDays } from '../utils/dateUtils';

// Cost multipliers by travel style
const STYLE_MULTIPLIERS = {
  budget: 1,
  balanced: 1.8,
  comfort: 3,
  luxury: 6,
} as const;

// Base daily costs per person (USD) by style
const BASE_COSTS = {
  budget: {
    accommodation: 25,
    food: 20,
    localTransport: 5,
    activities: 15,
    miscellaneous: 10,
  },
  balanced: {
    accommodation: 70,
    food: 50,
    localTransport: 15,
    activities: 35,
    miscellaneous: 25,
  },
  comfort: {
    accommodation: 150,
    food: 100,
    localTransport: 30,
    activities: 75,
    miscellaneous: 50,
  },
  luxury: {
    accommodation: 400,
    food: 200,
    localTransport: 80,
    activities: 150,
    miscellaneous: 120,
  },
} as const;

// Transport cost estimates per person one-way (USD)
const TRANSPORT_BASE = {
  flight: 300,
  train: 80,
  bus: 40,
  car: 60,
  ferry: 50,
} as const;

// Region cost modifiers (rough relative cost of living)
const REGION_MODIFIERS: Record<string, number> = {
  'europe': 1.2,
  'north america': 1.3,
  'southeast asia': 0.6,
  'south asia': 0.5,
  'east asia': 0.9,
  'middle east': 1.0,
  'africa': 0.7,
  'south america': 0.8,
  'oceania': 1.4,
  'caribbean': 1.1,
};

function getRegionModifier(destination: string): number {
  const dest = destination.toLowerCase();
  for (const [region, mod] of Object.entries(REGION_MODIFIERS)) {
    if (
      dest.includes(region) ||
      (region === 'southeast asia' && ['thailand', 'vietnam', 'bali', 'indonesia', 'cambodia', 'malaysia', 'philippines'].some(c => dest.includes(c))) ||
      (region === 'south asia' && ['india', 'nepal', 'sri lanka', 'bangladesh'].some(c => dest.includes(c))) ||
      (region === 'east asia' && ['japan', 'china', 'korea', 'taiwan', 'hong kong'].some(c => dest.includes(c))) ||
      (region === 'europe' && ['france', 'germany', 'italy', 'spain', 'uk', 'portugal', 'amsterdam', 'paris', 'rome', 'barcelona', 'london', 'prague', 'vienna', 'budapest'].some(c => dest.includes(c))) ||
      (region === 'north america' && ['usa', 'canada', 'new york', 'los angeles', 'chicago', 'toronto', 'vancouver'].some(c => dest.includes(c))) ||
      (region === 'oceania' && ['australia', 'new zealand', 'sydney', 'melbourne', 'auckland'].some(c => dest.includes(c)))
    ) {
      return mod;
    }
  }
  return 1.0; // Default modifier
}

export function calculateBudget(request: TripRequest): BudgetBreakdown {
  const {
    departureDate,
    returnDate,
    numberOfTravellers,
    totalBudget,
    currency,
    travelStyle,
    preferredTransport,
  } = request;

  const nights = Math.max(1, differenceInDays(returnDate, departureDate));
  const regionMod = getRegionModifier(request.destination);
  const base = BASE_COSTS[travelStyle];
  const people = numberOfTravellers;

  // Transport: pick cheapest preferred, round trip, per person
  const transportModes = preferredTransport.length > 0 ? preferredTransport : ['flight' as const];
  const cheapestTransportCost = Math.min(...transportModes.map(t => TRANSPORT_BASE[t as keyof typeof TRANSPORT_BASE] || 100));
  const transport = cheapestTransportCost * 2 * people * regionMod;

  // Accommodation: nightly cost × nights × region mod (shared across group)
  const accommodation = base.accommodation * nights * regionMod * Math.ceil(people / 2);

  // Food: daily × nights × people × region
  const food = base.food * (nights + 1) * people * regionMod;

  // Activities: daily × nights × people
  const activities = base.activities * nights * people * regionMod;

  // Local transport
  const localTransport = base.localTransport * (nights + 1) * people * regionMod;

  // Miscellaneous
  const miscellaneous = base.miscellaneous * (nights + 1) * people * regionMod;

  // Emergency buffer (5% of total)
  const subtotal = transport + accommodation + food + activities + localTransport + miscellaneous;
  const emergencyBuffer = Math.round(subtotal * 0.05);

  const total = Math.round(subtotal + emergencyBuffer);
  const perPerson = Math.round(total / people);
  const isOverBudget = total > totalBudget;

  return {
    transport: Math.round(transport),
    accommodation: Math.round(accommodation),
    food: Math.round(food),
    activities: Math.round(activities),
    localTransport: Math.round(localTransport),
    miscellaneous: Math.round(miscellaneous),
    emergencyBuffer,
    total,
    perPerson,
    currency,
    isOverBudget,
    overBudgetBy: isOverBudget ? total - totalBudget : undefined,
  };
}

export function calculateItineraryBudget(itinerary: Itinerary, currency: string, totalBudget: number): BudgetBreakdown {
  let activities = 0;
  let accommodation = 0;

  for (const day of itinerary.days) {
    for (const act of day.activities) {
      activities += act.estimatedCost;
    }
    if (day.accommodation) {
      accommodation += day.accommodation.pricePerNight;
    }
  }

  const existing = itinerary.budgetBreakdown;
  const total = Math.round(
    existing.transport + accommodation + existing.food + activities +
    existing.localTransport + existing.miscellaneous + existing.emergencyBuffer
  );

  const perPerson = Math.round(total / Math.max(1, (existing.total / existing.perPerson)));
  const isOverBudget = total > totalBudget;

  return {
    ...existing,
    accommodation: Math.round(accommodation),
    activities: Math.round(activities),
    total,
    perPerson,
    currency,
    isOverBudget,
    overBudgetBy: isOverBudget ? total - totalBudget : undefined,
  };
}

export function calculateReadinessScore(itinerary: Itinerary, tripRequest: TripRequest): {
  score: number;
  factors: Array<{ label: string; score: number; maxScore: number; description: string }>;
} {
  const factors = [];

  // Itinerary completeness (30 pts)
  const totalDays = itinerary.days.length;
  const daysWithActivities = itinerary.days.filter(d => d.activities.length >= 2).length;
  const itineraryScore = Math.round((daysWithActivities / Math.max(1, totalDays)) * 30);
  factors.push({
    label: 'Itinerary Completeness',
    score: itineraryScore,
    maxScore: 30,
    description: `${daysWithActivities}/${totalDays} days have 2+ activities planned`,
  });

  // Budget validity (25 pts)
  const budgetScore = itinerary.budgetBreakdown.isOverBudget ? 5 :
    itinerary.budgetBreakdown.total < tripRequest.totalBudget * 0.5 ? 15 : 25;
  factors.push({
    label: 'Budget Validity',
    score: budgetScore,
    maxScore: 25,
    description: itinerary.budgetBreakdown.isOverBudget
      ? 'Plan exceeds your budget — consider adjustments'
      : 'Budget is within your specified range',
  });

  // Transport planning (20 pts)
  const hasTransport = tripRequest.preferredTransport.length > 0;
  const transportScore = hasTransport ? 20 : 10;
  factors.push({
    label: 'Transport Planning',
    score: transportScore,
    maxScore: 20,
    description: hasTransport
      ? `Transport mode specified: ${tripRequest.preferredTransport.join(', ')}`
      : 'No transport preference set — add one for a better plan',
  });

  // Packing checklist (15 pts)
  const totalItems = itinerary.packingList.reduce((sum, cat) => sum + cat.items.length, 0);
  const checkedItems = itinerary.packingList.reduce((sum, cat) => sum + cat.items.filter(i => i.checked).length, 0);
  const packingScore = totalItems === 0 ? 0 : Math.round((checkedItems / totalItems) * 15);
  factors.push({
    label: 'Packing Checklist',
    score: packingScore,
    maxScore: 15,
    description: `${checkedItems}/${totalItems} packing items checked off`,
  });

  // Accommodation planned (10 pts)
  const daysWithAccom = itinerary.days.filter(d => d.accommodation).length;
  const accomScore = Math.round((daysWithAccom / Math.max(1, totalDays)) * 10);
  factors.push({
    label: 'Accommodation',
    score: accomScore,
    maxScore: 10,
    description: `${daysWithAccom}/${totalDays} nights have accommodation planned`,
  });

  const score = factors.reduce((sum, f) => sum + f.score, 0);
  return { score, factors };
}

export function suggestCostSavings(
  budgetBreakdown: BudgetBreakdown,
  travelStyle: TravelStyle,
  overBudgetBy: number
): string[] {
  const suggestions: string[] = [];

  if (budgetBreakdown.accommodation > budgetBreakdown.total * 0.35) {
    suggestions.push(`Accommodation is your largest cost (${Math.round((budgetBreakdown.accommodation / budgetBreakdown.total) * 100)}% of budget). Consider a simpler option like a guesthouse or shared room.`);
  }

  if (travelStyle !== 'budget') {
    const saving = Math.round(overBudgetBy * 0.4);
    suggestions.push(`Switching from "${travelStyle}" to "balanced" travel style could save approximately $${saving}.`);
  }

  if (budgetBreakdown.activities > budgetBreakdown.total * 0.25) {
    suggestions.push('Reduce paid activities and replace 1–2 with free alternatives like parks, walking tours, or local markets.');
  }

  suggestions.push('Book transport and accommodation 4–6 weeks in advance to lock in lower prices.');
  suggestions.push('Eat at local restaurants and street food stalls instead of tourist-facing venues to cut food costs by 40–60%.');

  return suggestions.slice(0, 4);
}

// Type alias needed in this file
type TravelStyle = 'budget' | 'balanced' | 'comfort' | 'luxury';

