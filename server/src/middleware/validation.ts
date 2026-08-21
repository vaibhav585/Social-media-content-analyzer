// =============================================================================
// Validation Middleware
// Zod-based request validation for body, query, and params.
// =============================================================================

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { z } from 'zod';

/**
 * Creates a middleware that validates req.body against a Zod schema.
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: error.errors.map((e) => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          },
        });
        return;
      }
      next(error);
    }
  };
}

/**
 * Creates a middleware that validates req.query against a Zod schema.
 */
export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.query = schema.parse(req.query) as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Invalid query parameters',
            code: 'VALIDATION_ERROR',
            details: error.errors.map((e) => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          },
        });
        return;
      }
      next(error);
    }
  };
}

// ── Validation Schemas ───────────────────────────────────────────────────────

const platformEnum = z.enum(['instagram', 'linkedin', 'twitter', 'facebook']);
const fileTypeEnum = z.enum(['pdf', 'image', 'text']);
const rewriteGoalEnum = z.enum(['max_reach', 'max_engagement', 'professional']);

export const analyzeBodySchema = z.object({
  text: z.string().min(1, 'Content text is required').max(10000, 'Text too long (max 10,000 characters)'),
  fileType: fileTypeEnum,
  platform: platformEnum,
  fileUrl: z.string().url().optional(),
});

export const rewriteBodySchema = z.object({
  analysisId: z.string().uuid('Invalid analysis ID'),
  text: z.string().min(1, 'Content text is required').max(10000),
  goal: rewriteGoalEnum,
  platform: platformEnum,
});

export const benchmarkBodySchema = z.object({
  analysisId: z.string().uuid('Invalid analysis ID'),
  competitorText: z.string().min(1, 'Competitor text is required').max(10000),
  platform: platformEnum,
});

export const historyQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  platform: platformEnum.optional(),
});

export const trendsQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(30),
});
