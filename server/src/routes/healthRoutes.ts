// =============================================================================
// Health Routes
// Server health check + AI provider status endpoint with circuit breaker telemetry.
// =============================================================================

import { Router, Request, Response } from 'express';
import { aiOrchestrator } from '../services/ai/aiOrchestrator';

const router = Router();
const startTime = Date.now();

/**
 * GET /api/health
 * Returns server status, uptime, and live AI provider availability telemetry.
 */
router.get('/', (_req: Request, res: Response) => {
  const uptimeMs = Date.now() - startTime;
  const providers = aiOrchestrator.getHealthTelemetry();
  const allDown = providers.filter((p) => p.name !== 'Local Heuristics').every((p) => !p.isAvailable);

  res.json({
    success: true,
    data: {
      status: allDown ? 'degraded' : 'ok',
      uptime: uptimeMs,
      uptimeHuman: formatUptime(uptimeMs),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      providers,
    },
  });
});

function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

/**
 * POST /api/health/reset-breakers
 * Manually resets all AI circuit breakers to CLOSED state.
 */
router.post('/reset-breakers', (_req: Request, res: Response) => {
  aiOrchestrator.resetBreakers();
  res.json({ success: true, message: 'All circuit breakers reset to CLOSED.' });
});

export default router;
