import { Request, Response, NextFunction } from 'express';
import { rewriteService } from '../services/rewriteService';
import type { RewriteRequest } from '../../shared/types';

export const rewriteContent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id || 'guest_user';
    const payload = req.body as RewriteRequest;

    const response = await rewriteService.rewrite(userId, payload);
    res.json(response);
  } catch (error) {
    next(error);
  }
};
