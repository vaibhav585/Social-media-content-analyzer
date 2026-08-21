// =============================================================================
// Analysis Routes
// Express router for /api/analyze endpoints with validation & rate limiting.
// =============================================================================

import { Router } from 'express';
import { analysisController } from '../controllers/analysisController';
import { validateBody, analyzeBodySchema } from '../middleware/validation';
import { aiRateLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * POST /api/analyze
 * Body: { text: string, fileType: 'pdf' | 'image' | 'text', platform: 'instagram' | 'linkedin' | 'twitter' | 'facebook', fileUrl?: string }
 */
router.post(
  '/',
  aiRateLimiter,
  validateBody(analyzeBodySchema),
  analysisController.analyze.bind(analysisController)
);

export default router;
