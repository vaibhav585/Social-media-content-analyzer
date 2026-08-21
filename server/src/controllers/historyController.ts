import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../services/supabaseService';
import type { AnalysisHistoryResponse } from '../../shared/types';

export const getHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id || 'guest_user';
    
    // Default pagination params
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    let total = 0;
    let analyses: any[] = [];

    if (supabaseAdmin) {
      const { count } = await supabaseAdmin
        .from('analyses')
        .select('*', { count: 'exact', head: true })
        .eq('userId', userId);
        
      total = count || 0;

      const { data } = await supabaseAdmin
        .from('analyses')
        .select('*')
        .eq('userId', userId)
        .order('createdAt', { ascending: false })
        .range(offset, offset + limit - 1);
        
      if (data) analyses = data;
    }

    // Convert from camelCase to snake_case if necessary, 
    // but assuming DB mapping is handled or it matches type exactly.

    const response: AnalysisHistoryResponse = {
      analyses,
      total,
      page,
      limit,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};
