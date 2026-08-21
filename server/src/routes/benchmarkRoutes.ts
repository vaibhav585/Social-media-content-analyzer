import { Router } from 'express';
import { runBenchmark } from '../controllers/benchmarkController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Endpoint: POST /api/benchmark
router.post('/', authMiddleware, runBenchmark);

export default router;
