import { GoogleGenerativeAI } from '@google/generative-ai';
import { TripRequest, Itinerary, ItinerarySchema, NLEditRequest } from '../types';
import { calculateBudget } from '../utils/budgetEngine';
import { generateDemoItinerary } from '../utils/demoData';
import { differenceInDays, addDays, getDayName } from '../utils/dateUtils';
import { v4 as uuidv4 } from 'uuid';

let genAI: GoogleGenerativeAI | null = null;

// Modern, currently active Google Gemini model cascade
const CANDIDATE_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3-flash-preview',
  'gemini-flash-lite-latest',
];

function getGenAI(): GoogleGenerativeAI | null {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
}

export function isGeminiAvailable(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

export async function callGemini(prompt: string, jsonMode: boolean = false): Promise<string> {
  const client = getGenAI();
  if (!client) {
    throw new Error('No Gemini API key configured in server environment');
  }

  let lastError: any = null;

  for (const modelName of CANDIDATE_MODELS) {
    try {
      const model = client.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: jsonMode ? 'application/json' : undefined,
          maxOutputTokens: 8192,
        },
      });

      const response = await model.generateContent(prompt);
      const text = response.response.text();
      if (text && text.trim().length > 0) {
        return text;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`[TripPilot] Model ${modelName} returned error: ${err.message || err}. Trying next fallback candidate...`);
    }
  }

  throw lastError || new Error('All Gemini model candidates exhausted');
}

function cleanJsonText(raw: string): string {
  let cleaned = raw.trim();
  // Strip ```json and ``` fences
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

const ITINERARY_PROMPT = (request: TripRequest, budgetBreakdown: ReturnType<typeof calculateBudget>) => {
  const nights = differenceInDays(request.returnDate, request.departureDate);
  return `You are TripPilot's AI travel planner. Generate a detailed, realistic ${nights}-day trip itinerary.

TRIP DETAILS:
- From: ${request.startingCity}
- Destination: ${request.destination}
- Dates: ${request.departureDate} to ${request.returnDate} (${nights} nights)
- Travellers: ${request.numberOfTravellers}
- Total Budget: ${request.currency} ${request.totalBudget}
- Travel Style: ${request.travelStyle}
- Interests: ${request.interests.join(', ')}
- Transport: ${request.preferredTransport.join(', ')}
- Accommodation: ${request.preferredAccommodation}
- Dietary: ${request.dietaryRequirements?.join(', ') || 'None specified'}
- Notes: ${request.additionalNotes || 'None'}

BUDGET ESTIMATES (use these as references):
- Transport: ${request.currency} ${budgetBreakdown.transport}
- Accommodation: ${request.currency} ${budgetBreakdown.accommodation}  
- Food: ${request.currency} ${budgetBreakdown.food}
- Activities: ${request.currency} ${budgetBreakdown.activities}
- Local Transport: ${request.currency} ${budgetBreakdown.localTransport}
- Misc: ${request.currency} ${budgetBreakdown.miscellaneous}

INSTRUCTIONS:
1. Create a realistic day-by-day itinerary with 3-5 activities per day
2. Include real locations in ${request.destination} with approximate coordinates where known
3. Avoid scheduling overlapping activities or impossible travel times
4. Match activities to stated interests: ${request.interests.join(', ')}
5. Keep activity costs realistic for ${request.travelStyle} style travel
6. Each activity needs a clear "reasonForRecommendation" explaining why it suits this traveller
7. Include accommodation details for each night
8. Generate a contextual packing list based on destination and activities
9. Mark activities as optional if they're bonus add-ons
10. Provide 3-5 actionable local travel tips

Return ONLY valid JSON matching this exact structure (no markdown, no explanation):
{
  "destination": "${request.destination}",
  "overview": "2-3 sentence overview of the trip",
  "days": [
    {
      "dayNumber": 1,
      "date": "${request.departureDate}",
      "theme": "Day theme",
      "activities": [
        {
          "id": "unique-id",
          "name": "Activity name",
          "description": "2-3 sentence description",
          "category": "sightseeing|adventure|food|culture|shopping|nature|nightlife|relaxation|transport",
          "startTime": "09:00",
          "durationMinutes": 120,
          "estimatedCost": 25,
          "location": {
            "name": "Location name",
            "lat": 48.8566,
            "lng": 2.3522,
            "address": "Optional address"
          },
          "imageKeyword": "relevant image keyword for unsplash",
          "reasonForRecommendation": "Why this suits this traveller",
          "isOptional": false,
          "travelTimeToNextMinutes": 15
        }
      ],
      "accommodation": {
        "name": "Hotel/Hostel name",
        "type": "hostel|guesthouse|hotel|boutique|resort|airbnb",
        "pricePerNight": 80,
        "location": {
          "name": "Neighborhood",
          "lat": 48.8566,
          "lng": 2.3522
        }
      }
    }
  ],
  "budgetBreakdown": {
    "transport": ${budgetBreakdown.transport},
    "accommodation": ${budgetBreakdown.accommodation},
    "food": ${budgetBreakdown.food},
    "activities": ${budgetBreakdown.activities},
    "localTransport": ${budgetBreakdown.localTransport},
    "miscellaneous": ${budgetBreakdown.miscellaneous},
    "emergencyBuffer": ${budgetBreakdown.emergencyBuffer},
    "total": ${budgetBreakdown.total},
    "perPerson": ${budgetBreakdown.perPerson},
    "currency": "${request.currency}",
    "isOverBudget": ${budgetBreakdown.isOverBudget},
    "overBudgetBy": ${budgetBreakdown.overBudgetBy || 0}
  },
  "packingList": [
    {
      "category": "Category name",
      "items": [
        { "id": "unique-id", "name": "Item name", "checked": false, "essential": true }
      ]
    }
  ],
  "topTips": ["Tip 1", "Tip 2", "Tip 3"],
  "localCurrency": "Currency name",
  "emergencyContacts": [
    { "name": "Emergency Services", "number": "112", "type": "Emergency" }
  ],
  "isDemo": false
}`;
};

const NL_EDIT_PROMPT = (req: NLEditRequest) => {
  const { prompt, currentItinerary, tripRequest } = req;
  const itinerarySummary = currentItinerary.days.map(d =>
    `Day ${d.dayNumber} (${d.date}): ${d.activities.map(a => a.name).join(', ')}`
  ).join('\n');

  return `You are TripPilot's AI assistant. A user wants to modify their existing travel itinerary.

CURRENT ITINERARY SUMMARY:
${itinerarySummary}

TRIP CONTEXT:
- Destination: ${tripRequest.destination}
- Budget: ${tripRequest.currency} ${tripRequest.totalBudget}
- Style: ${tripRequest.travelStyle}
- Interests: ${tripRequest.interests.join(', ')}

USER REQUEST: "${prompt}"

Analyze the request and suggest specific changes. Return ONLY valid JSON:
{
  "interpretation": "What the user wants in plain English",
  "changes": [
    {
      "type": "replace|add|remove|modify",
      "dayNumber": 1,
      "activityId": "existing-activity-id-if-applicable",
      "description": "What change to make",
      "newActivity": {
        "id": "new-unique-id",
        "name": "Activity name",
        "description": "Description",
        "category": "category",
        "startTime": "10:00",
        "durationMinutes": 90,
        "estimatedCost": 20,
        "location": { "name": "Location", "lat": null, "lng": null },
        "imageKeyword": "keyword",
        "reasonForRecommendation": "Why this fits the request",
        "isOptional": false,
        "travelTimeToNextMinutes": 15
      }
    }
  ],
  "budgetImpact": 0,
  "explanation": "Brief explanation of the changes"
}`;
};

export async function generateItinerary(request: TripRequest): Promise<Itinerary> {
  const budgetBreakdown = calculateBudget(request);

  if (!isGeminiAvailable()) {
    console.log('[TripPilot] No Gemini API key - generating deterministic demo itinerary');
    return generateDemoItinerary(request);
  }

  try {
    const prompt = ITINERARY_PROMPT(request, budgetBreakdown);
    const rawText = await callGemini(prompt, true);
    const jsonText = cleanJsonText(rawText);

    const parsed = JSON.parse(jsonText);

    // Ensure all activities and days have valid IDs and locations
    if (parsed.days && Array.isArray(parsed.days)) {
      for (const day of parsed.days) {
        if (!day.theme) day.theme = `Day ${day.dayNumber || 1} Exploration`;
        if (day.activities && Array.isArray(day.activities)) {
          for (const act of day.activities) {
            if (!act.id) act.id = uuidv4();
            if (!act.location) {
              act.location = { name: request.destination, lat: null, lng: null };
            }
          }
        } else {
          day.activities = [];
        }
      }
    }

    if (!parsed.packingList || !Array.isArray(parsed.packingList)) {
      parsed.packingList = [];
    }
    if (!parsed.topTips || !Array.isArray(parsed.topTips)) {
      parsed.topTips = [];
    }
    if (!parsed.emergencyContacts || !Array.isArray(parsed.emergencyContacts)) {
      parsed.emergencyContacts = [
        { name: 'Emergency Services', number: '112', type: 'Emergency' }
      ];
    }

    // Validate with Zod
    const validated = ItinerarySchema.parse(parsed);

    // Always enforce exact server-calculated budget breakdown to prevent math hallucinations
    validated.budgetBreakdown = budgetBreakdown;
    validated.isDemo = false;

    console.log(`[TripPilot] Successfully generated live Gemini AI itinerary for ${request.destination}!`);
    return validated;
  } catch (error: any) {
    console.error('[TripPilot] Gemini itinerary generation failed, falling back to demo:', error?.message || error);
    const demo = generateDemoItinerary(request);
    demo.isDemo = true; // Mark explicitly as demo
    return demo;
  }
}

export async function processNLEdit(req: NLEditRequest): Promise<{
  interpretation: string;
  changes: Array<{
    type: 'replace' | 'add' | 'remove' | 'modify';
    dayNumber: number;
    activityId?: string;
    description: string;
    newActivity?: any;
  }>;
  budgetImpact: number;
  explanation: string;
}> {
  if (!isGeminiAvailable()) {
    return {
      interpretation: 'AI editing is offline (no API key configured)',
      changes: [],
      budgetImpact: 0,
      explanation: 'Please configure a Gemini API key to use natural language trip editing.',
    };
  }

  try {
    const prompt = NL_EDIT_PROMPT(req);
    const rawText = await callGemini(prompt, true);
    const jsonText = cleanJsonText(rawText);
    return JSON.parse(jsonText);
  } catch (error: any) {
    console.error('[TripPilot] NL Edit error:', error?.message || error);
    return {
      interpretation: 'Could not process your modification request',
      changes: [],
      budgetImpact: 0,
      explanation: 'An error occurred while contacting the AI engine. Please try again or edit manually.',
    };
  }
}

export async function generatePackingList(
  destination: string,
  interests: string[],
  duration: number,
  travelStyle: string
): Promise<Array<{ category: string; items: Array<{ id: string; name: string; checked: boolean; essential: boolean }> }>> {
  if (!isGeminiAvailable()) {
    return [];
  }

  const prompt = `Generate a smart packing list for a ${duration}-day ${travelStyle} trip to ${destination}.
Activities planned: ${interests.join(', ')}.
Return ONLY valid JSON array: [{"category": "...", "items": [{"id": "uuid", "name": "...", "checked": false, "essential": true}]}]`;

  try {
    const rawText = await callGemini(prompt, true);
    const jsonText = cleanJsonText(rawText);
    const parsed = JSON.parse(jsonText);
    return parsed.map((cat: any) => ({
      ...cat,
      items: (cat.items || []).map((item: any) => ({ ...item, id: item.id || uuidv4() })),
    }));
  } catch (error: any) {
    console.warn('[TripPilot] Packing list generation fallback:', error?.message || error);
    return [];
  }
}

