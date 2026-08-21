// =============================================================================
// Analysis Controller
// Handles /api/analyze request dispatching, input sanitation, & error handling.
// =============================================================================

import { Request, Response, NextFunction } from 'express';
import { analysisService } from '../services/analysisService';
import type { AnalyzeRequest } from '../types';

export class AnalysisController {
  /**
   * POST /api/analyze
   * Analyzes social media text via AI resilience pipeline.
   */
  public async analyze(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const body = req.body as AnalyzeRequest;
      const userId = (req as any).user?.id || 'anonymous-demo-user';

      const analysis = await analysisService.analyze({
        text: body.text,
        fileType: body.fileType,
        platform: body.platform,
        fileUrl: body.fileUrl,
        userId,
      });

      res.status(200).json({
        success: true,
        data: {
          analysis,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const analysisController = new AnalysisController();
