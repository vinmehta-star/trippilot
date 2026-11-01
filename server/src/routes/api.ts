import express from 'express';
import { z } from 'zod';
import {
  TripRequestSchema,
  NLEditRequestSchema,
  ItinerarySchema,
  LoginRequestSchema,
  RegisterRequestSchema,
} from '../types';
import { generateItinerary, processNLEdit, isGeminiAvailable } from '../services/geminiService';
import { calculateBudget, calculateReadinessScore, suggestCostSavings } from '../utils/budgetEngine';
import {
  saveTrip,
  updateTrip,
  getTripById,
  getAllTrips,
  deleteTrip,
  findUserByEmail,
  findUserById,
  createUser,
  verifyCredentials,
  restoreUser,
  saveTripWithId,
} from '../services/database';

const router = express.Router();

// ─── Health / Status ───────────────────────────────────────────────────────────
router.get('/status', (_req, res) => {
  const isAiOnline = isGeminiAvailable();
  res.json({
    status: 'ok',
    aiAvailable: isAiOnline,
    geminiAvailable: isAiOnline,
    weatherAvailable: !!process.env.WEATHER_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// ─── Token Persistence Helpers ────────────────────────────────────────────────
function generateAuthToken(user: any): string {
  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    travelStyle: user.travelStyle,
    homeCity: user.homeCity,
    passwordHash: user.passwordHash,
    createdAt: user.createdAt,
    iat: Date.now(),
  };
  return `tp_token_${Buffer.from(JSON.stringify(payload)).toString('base64url')}`;
}

function parseAuthToken(token: string): any {
  const clean = token.replace('tp_token_', '');
  try {
    const raw = Buffer.from(clean, 'base64url').toString('utf-8');
    if (raw.startsWith('{')) {
      return JSON.parse(raw);
    }
    const [userId] = raw.split(':');
    return { id: userId };
  } catch {
    try {
      const raw = Buffer.from(clean, 'base64').toString('utf-8');
      if (raw.startsWith('{')) {
        return JSON.parse(raw);
      }
      const [userId] = raw.split(':');
      return { id: userId };
    } catch {
      return null;
    }
  }
}

// ─── Authentication Routes ────────────────────────────────────────────────────
router.post('/auth/register', (req, res) => {
  try {
    const payload = RegisterRequestSchema.parse(req.body);
    const existing = findUserByEmail(payload.email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const newUser = createUser(payload);
    const token = generateAuthToken(newUser);

    return res.status(201).json({
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar,
        travelStyle: newUser.travelStyle,
        homeCity: newUser.homeCity,
        createdAt: newUser.createdAt,
      },
      token,
    });
  } catch (error: any) {
    if (error?.issues) {
      return res.status(400).json({ error: error.issues[0]?.message || 'Invalid registration data' });
    }
    return res.status(400).json({ error: error?.message || 'Registration failed' });
  }
});

router.post('/auth/login', (req, res) => {
  try {
    const { email, password } = LoginRequestSchema.parse(req.body);
    const user = verifyCredentials(email, password);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password. Use demo account or create a new one.' });
    }

    const token = generateAuthToken(user);

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        travelStyle: user.travelStyle,
        homeCity: user.homeCity,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error: any) {
    if (error?.issues) {
      return res.status(400).json({ error: error.issues[0]?.message || 'Invalid credentials format' });
    }
    return res.status(400).json({ error: error?.message || 'Login failed' });
  }
});

router.get('/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No authentication token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = parseAuthToken(token);
    if (!payload || !payload.id) {
      return res.status(401).json({ error: 'Invalid authentication token structure' });
    }

    let user = findUserById(payload.id);

    // If container redeployed, rehydrate user into server database from verified token payload!
    if (!user && payload.email) {
      user = restoreUser({
        id: payload.id,
        name: payload.name || 'Traveler',
        email: payload.email,
        passwordHash: payload.passwordHash,
        avatar: payload.avatar,
        travelStyle: payload.travelStyle,
        homeCity: payload.homeCity,
        createdAt: payload.createdAt,
      });
    }

    if (!user) {
      return res.status(401).json({ error: 'Session expired or invalid user' });
    }

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        travelStyle: user.travelStyle,
        homeCity: user.homeCity,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch {
    return res.status(401).json({ error: 'Invalid authentication token' });
  }
});

// ─── Sync Trips Route (Survives Ephemeral Teardowns) ───────────────────────────
router.post('/trips/sync', (req, res) => {
  try {
    const { trips } = req.body;
    if (Array.isArray(trips)) {
      trips.forEach((t) => {
        if (t && t.id && t.request && t.itinerary) {
          saveTripWithId(t);
        }
      });
    }
    return res.json({ status: 'ok', count: getAllTrips().length });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Sync failed' });
  }
});

// ─── Generate Itinerary ────────────────────────────────────────────────────────
router.post('/itinerary/generate', async (req, res) => {
  try {
    const tripRequest = TripRequestSchema.parse(req.body);

    // Validate date logic
    const dep = new Date(tripRequest.departureDate);
    const ret = new Date(tripRequest.returnDate);
    if (ret <= dep) {
      return res.status(400).json({ error: 'Return date must be after departure date' });
    }

    const itinerary = await generateItinerary(tripRequest);
    const budgetBreakdown = calculateBudget(tripRequest);
    const { score, factors } = calculateReadinessScore(itinerary, tripRequest);

    // Auto-save the generated trip
    const saved = saveTrip({
      request: tripRequest,
      itinerary,
      readinessScore: score,
      packingProgress: 0,
    });

    return res.json({
      trip: saved,
      readinessScore: score,
      readinessFactors: factors,
      budgetBreakdown,
      isDemo: itinerary.isDemo,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid trip data', details: error.issues });
    }
    console.error('Generate itinerary error:', error);
    return res.status(500).json({ error: 'Failed to generate itinerary. Please try again.' });
  }
});

// ─── Natural Language Edit ─────────────────────────────────────────────────────
router.post('/itinerary/nl-edit', async (req, res) => {
  try {
    const editReq = NLEditRequestSchema.parse(req.body);
    const result = await processNLEdit(editReq);
    return res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request', details: error.issues });
    }
    return res.status(500).json({ error: 'Failed to process edit request' });
  }
});

// ─── Budget Calculator ─────────────────────────────────────────────────────────
router.post('/budget/calculate', (req, res) => {
  try {
    const tripRequest = TripRequestSchema.parse(req.body);
    const breakdown = calculateBudget(tripRequest);
    const suggestions = breakdown.isOverBudget
      ? suggestCostSavings(breakdown, tripRequest.travelStyle, breakdown.overBudgetBy || 0)
      : [];

    return res.json({ breakdown, suggestions });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request', details: error.issues });
    }
    return res.status(500).json({ error: 'Budget calculation failed' });
  }
});

// ─── CRUD: Trips ───────────────────────────────────────────────────────────────
router.get('/trips', (_req, res) => {
  const trips = getAllTrips();
  return res.json({ trips });
});

router.get('/trips/:id', (req, res) => {
  const trip = getTripById(req.params.id);
  if (!trip) return res.status(404).json({ error: 'Trip not found' });

  const { score, factors } = calculateReadinessScore(trip.itinerary, trip.request);
  return res.json({ trip, readinessScore: score, readinessFactors: factors });
});

router.put('/trips/:id', (req, res) => {
  try {
    const { itinerary, readinessScore, packingProgress } = req.body;

    let validatedItinerary = itinerary;
    if (itinerary) {
      validatedItinerary = ItinerarySchema.parse(itinerary);
    }

    const updated = updateTrip(req.params.id, {
      itinerary: validatedItinerary,
      readinessScore,
      packingProgress,
    });

    if (!updated) return res.status(404).json({ error: 'Trip not found' });

    const trip = getTripById(req.params.id);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    const { score, factors } = calculateReadinessScore(trip.itinerary, trip.request);
    return res.json({ trip: updated, readinessScore: score, readinessFactors: factors });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid itinerary data', details: error.issues });
    }
    return res.status(500).json({ error: 'Failed to update trip' });
  }
});

router.delete('/trips/:id', (req, res) => {
  const deleted = deleteTrip(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Trip not found' });
  return res.json({ success: true });
});

// ─── Readiness Score ───────────────────────────────────────────────────────────
router.post('/trips/:id/readiness', (req, res) => {
  const trip = getTripById(req.params.id);
  if (!trip) return res.status(404).json({ error: 'Trip not found' });
  const { score, factors } = calculateReadinessScore(trip.itinerary, trip.request);
  return res.json({ score, factors });
});

// ─── Weather (stub / live if configured) ──────────────────────────────────────
router.get('/weather', async (req, res) => {
  const { destination, startDate } = req.query as { destination: string; startDate: string };

  if (!destination || !startDate) {
    return res.status(400).json({ error: 'destination and startDate are required' });
  }

  if (!process.env.WEATHER_API_KEY) {
    return res.json({
      available: false,
      message: 'Weather data unavailable — configure WEATHER_API_KEY for live forecasts',
      forecast: [],
    });
  }

  try {
    // OpenWeatherMap 5-day forecast
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(destination)}&appid=${process.env.WEATHER_API_KEY}&units=metric&cnt=40`
    );

    if (!response.ok) {
      return res.json({ available: false, message: 'Could not fetch weather data', forecast: [] });
    }

    const data = await response.json() as any;
    const forecast = data.list
      .filter((_: any, i: number) => i % 8 === 0) // One per day
      .slice(0, 7)
      .map((item: any) => ({
        date: item.dt_txt.split(' ')[0],
        condition: item.weather[0].description,
        temperatureHigh: Math.round(item.main.temp_max),
        temperatureLow: Math.round(item.main.temp_min),
        precipitation: item.rain?.['3h'] || 0,
        icon: item.weather[0].icon,
        isAdverse: ['thunderstorm', 'heavy rain', 'blizzard', 'heavy snow'].some(w =>
          item.weather[0].description.toLowerCase().includes(w)
        ),
      }));

    return res.json({ available: true, forecast });
  } catch (error) {
    return res.json({ available: false, message: 'Weather service temporarily unavailable', forecast: [] });
  }
});

// ─── Geocoding via Nominatim (OpenStreetMap) ───────────────────────────────────
router.get('/geocode', async (req, res) => {
  const { q } = req.query as { q: string };
  if (!q) return res.status(400).json({ error: 'Query required' });

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`,
      { headers: { 'User-Agent': 'TripPilot/1.0 (travel planner app)' } }
    );
    const data = await response.json() as any[];
    if (!data || data.length === 0) {
      return res.json({ found: false });
    }
    return res.json({
      found: true,
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      name: data[0].display_name,
    });
  } catch {
    return res.json({ found: false });
  }
});

export default router;

