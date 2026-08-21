import { Router } from 'express';
import { getHistory } from '../controllers/historyController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Endpoint: GET /api/analyses
router.get('/', authMiddleware, getHistory);

export default router;
