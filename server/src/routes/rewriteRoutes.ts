import { Router } from 'express';
import { rewriteContent } from '../controllers/rewriteController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Endpoint: POST /api/rewrite
// Using authMiddleware if strictly authenticated, but allowing guest_user for demo fallback logic
// is fine. Let's make it optional like in analysis.
router.post('/', authMiddleware, rewriteContent);

export default router;
