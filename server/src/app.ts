// =============================================================================
// Express Application
// Main server entry point with full middleware stack.
// =============================================================================

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { apiRateLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import healthRoutes from './routes/healthRoutes';
import analysisRoutes from './routes/analysisRoutes';
import rewriteRoutes from './routes/rewriteRoutes';
import benchmarkRoutes from './routes/benchmarkRoutes';
import historyRoutes from './routes/historyRoutes';
import personaRoutes from './routes/personaRoutes';

const app = express();

// ── Security Middleware ──────────────────────────────────────────────────────

app.use(helmet());

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow any origin to accommodate Vercel dynamic preview URLs
      // and prevent "Network Error" CORS failures in deployment.
      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ── Body Parsing ─────────────────────────────────────────────────────────────

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Rate Limiting ────────────────────────────────────────────────────────────

app.use('/api/', apiRateLimiter);

// ── Routes ───────────────────────────────────────────────────────────────────

app.use('/api/health', healthRoutes);
app.use('/api/analyze', analysisRoutes);

app.use('/api/rewrite', rewriteRoutes);
app.use('/api/benchmark', benchmarkRoutes);
app.use('/api/analyses', historyRoutes);
app.use('/api/personas', personaRoutes);

// Catch unhandled API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, error: { message: 'API Route Not Found' } });
});

// ── Global Error Handler (must be last) ──────────────────────────────────────

app.use(errorHandler);

// ── Start Server ─────────────────────────────────────────────────────────────

app.listen(env.port, () => {
  console.log(`
  ╔══════════════════════════════════════════════╗
  ║   ContentPulse — Backend                     ║
  ║──────────────────────────────────────────────║
  ║   Port:        ${String(env.port).padEnd(29)}║
  ║   Environment: ${env.nodeEnv.padEnd(29)}║
  ║   Health:      http://localhost:${env.port}/api/health ║
  ╚══════════════════════════════════════════════╝
  `);
});

export default app;
