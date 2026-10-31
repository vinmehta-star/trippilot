# TripPilot — AI-Powered Adaptive Travel Planner 🌍✈️

TripPilot is a production-quality, responsive travel planning web application designed with an **Adaptive Travel Engine**. It personalizes itineraries based on starting city, destination, budget, dates, group size, travel style, and interests—and dynamically recalibrates when circumstances, weather, or budgets change.

---

## 🌟 Key Features

### 1. 🤖 Adaptive Trip Engine
- **Dynamic Recalculations**: Modify activities, dates, or group size and instantly see the real-time impact on budget, schedule, and category breakdowns.
- **Budget Trade-Off Simulator**: Interactive scenarios to evaluate tradeoffs (e.g. Save 20% on accommodation, swap to free cultural sights, or upgrade dining).

### 2. ⚡ Multi-Step Trip Creation Wizard
- **Step 1: Destination** — Origin, destination, with one-click popular destination pills.
- **Step 2: Dates** — Departure & return dates, stay duration calculations, and quick stay duration presets.
- **Step 3: Group Planning** — Group size stepper with per-person budget distribution.
- **Step 4: Smart Budget** — Multi-currency support (USD, EUR, GBP, INR, JPY, etc.) with real-time per-person estimates.
- **Step 5: Travel Style** — Backpacker Budget, Balanced, Comfort, or Luxury.
- **Step 6: Interests** — Adventure, Nature, Food, Culture, Shopping, Relaxation, Nightlife.
- **Step 7: Transport & Preferences** — Flight/train/car/bus preferences, accommodation types, and dietary requirements.
- **Step 8: Summary & AI Generation** — Instant estimate preview, custom trip notes, and one-click AI itinerary synthesis.

### 3. 📅 Interactive Day-by-Day Itinerary Builder
- Visual vertical timeline with category indicators and travel time estimates between stops.
- Full manual control: **Add**, **Edit**, **Delete**, and **Reorder** activities.
- Real-time recalculation of total and daily expenses upon manual modification.

### 4. 💰 True Budget Intelligence
- Deterministic calculation engine in TypeScript (never relying on AI arithmetic hallucinations).
- Itemized breakdown across Transport, Lodging, Food, Activities, Local Commute, Misc, and a 5% Emergency Reserve.
- Interactive Recharts visualization with budget utilization indicators and over-budget warnings.

### 5. 🗺️ Destination Map (Leaflet & OpenStreetMap)
- Interactive map populated with verified points of interest and hotel coordinates.
- Day-coded markers, synchronized popups with cost and timing, and smooth pan/zoom controls.

### 6. 🎒 Smart Packing Assistant
- Contextual packing checklist categorized by Documents, Clothing, Tech, Health, and Comfort.
- Interactive check-off progress tracking with persisted state.

### 7. ⛅ Weather-Aware Plan B
- Integration with OpenWeather API (with graceful fallback when no key is set).
- Identifies adverse weather conditions (storms, heavy rain) and suggests instant indoor alternatives.

### 8. 💬 Natural-Language Trip Editing (Gemini AI)
- Chat with the itinerary: *"Make day 2 cheaper and replace outdoor sights with an art museum."*
- Gemini analyzes the current trip context and proposes specific itemized changes with budget impact for user approval.

### 9. 🛡️ Trip Readiness Score
- Transparent scoring metric evaluating itinerary completeness, budget validity, transport logistics, and packing readiness.

### 10. 🔐 Full Authentication & Traveler Passports
- Complete user registration and sign-in with email and password.
- **1-Click Hackathon Fast Pass**: Instant evaluator login as *Alex Mercer (Demo Adventurer)* with zero typing.
- Interactive profile menu with personalized travel archetype badge, saved vault count, and session management.

### 11. 🌌 Sunset Explorer Luxe Design System
- Dark-luxe aesthetic inspired by twilight horizons, cyber-flight coordinates, and high-altitude alpine vistas.
- Dynamic glowing aurora orbs, supersonic trajectory matrices, and glassmorphism cards.

### 12. 🎭 Resilient Offline Demo Mode
- If no Gemini API key is configured, the application functions in **Demo Mode** with realistic itineraries, explicit demo banners, and complete persistence.

---

## 🏗️ Architecture & Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Recharts, React-Leaflet, Zustand, Framer Motion, React Hot Toast |
| **Backend** | Node.js, Express, TypeScript, Zod Schema Validation, Helmet, Rate Limiting |
| **AI Engine** | Google Gemini API (`gemini-3.5-flash-lite`, `gemini-3-flash-preview`) with structured JSON mode |
| **Persistence** | Auto-managed, zero-configuration file JSON database (`trippilot_db.json`) |
| **DevOps / Deployment** | Multi-stage `Dockerfile`, `docker-compose.yml`, single-port production server |
| **Testing** | Node.js native test runner (`node --test`), assert module (18 unit tests) |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ (tested on Node.js v23.3.0)
- **npm** v9+

### 2. Environment Configuration
Create a `.env` file in the root directory (or in `server/`):
```bash
# Server configuration
PORT=3001
CORS_ORIGIN=http://localhost:5173

# Google Gemini API Key (leaves app in realistic Demo Mode if omitted)
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: OpenWeatherMap API Key
WEATHER_API_KEY=your_openweather_key_here
```

### 3. Start the Backend Server
```bash
cd server
npm install
npm run build
npm start
# Or for live development:
npm run dev
```
Backend API will start on: `http://localhost:3001`

### 4. Start the Frontend Application
In a separate terminal:
```bash
cd client
npm install
npm run dev
```
Open your browser at: `http://localhost:5173`

---

## 🐳 Docker Deployment (Zero-Config)

Deploy the entire app (Frontend + Backend + Auto-Managed DB) on a single port with one command:

```bash
docker compose up --build -d
```
Access the application immediately at: `http://localhost:3001`

---

## 🧪 Running Unit Tests

Run the backend test suite covering budget calculations, over-budget detection, date math, readiness scoring, and cost-saving suggestions:

```bash
cd server
npm test
```
All 18 tests execute in sub-200ms using the built-in Node test runner.

