import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import apiRouter from './routes/api';

dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware - relaxed CSP to allow OpenStreetMap tiles & Unsplash photos
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));

// CORS - allow dev server or same-origin production requests
app.use(cors({
  origin: process.env.CORS_ORIGIN || true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: { error: 'AI requests are limited. Please wait a moment.' },
});

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Apply general rate limit
app.use('/api', apiLimiter);

// Apply stricter limit on AI endpoints
app.use('/api/itinerary/generate', aiLimiter);
app.use('/api/itinerary/nl-edit', aiLimiter);

// Routes
app.use('/api', apiRouter);

// Serve production client build if available (single-service deploy)
const clientDist = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('index.html')) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
    }
  }));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      return res.sendFile(path.join(clientDist, 'index.html'));
    }
    next();
  });
}

// 404 handler for unmatched API routes
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[TripPilot Server Error]', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🌍 TripPilot running on http://0.0.0.0:${PORT}`);
  console.log(`   Gemini AI: ${process.env.GEMINI_API_KEY ? '✅ Configured' : '⚠️  Not configured (demo mode)'}`);
  console.log(`   Weather:   ${process.env.WEATHER_API_KEY ? '✅ Configured' : '⚠️  Not configured'}`);
  console.log(`   Database:  Auto-Managed JSON Store (${process.env.DB_FILE || 'data/trippilot_db.json'})`);
});

export default app;

