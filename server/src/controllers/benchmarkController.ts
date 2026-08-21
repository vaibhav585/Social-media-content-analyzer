import { Request, Response, NextFunction } from 'express';
import { benchmarkService } from '../services/benchmarkService';
import type { BenchmarkRequest } from '../../shared/types';

export const runBenchmark = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id || 'guest_user';
    const payload = req.body as BenchmarkRequest;

    const response = await benchmarkService.benchmark(userId, payload);
    res.json(response);
  } catch (error) {
    next(error);
  }
};
