// =============================================================================
// Global Error Handler
// Catches all unhandled errors and returns structured JSON responses.
// =============================================================================

import { Request, Response, NextFunction } from 'express';
import { isProduction } from '../config/env';

/**
 * Custom application error with status code and error code.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Common error factory methods.
 */
export const Errors = {
  badRequest: (message: string) => new AppError(message, 400, 'BAD_REQUEST'),
  unauthorized: (message: string) => new AppError(message, 401, 'UNAUTHORIZED'),
  forbidden: (message: string) => new AppError(message, 403, 'FORBIDDEN'),
  notFound: (message: string) => new AppError(message, 404, 'NOT_FOUND'),
  tooManyRequests: (message: string) => new AppError(message, 429, 'TOO_MANY_REQUESTS'),
  internal: (message: string) => new AppError(message, 500, 'INTERNAL_ERROR'),
};

/**
 * Global error handler middleware.
 * Must be registered LAST in the middleware chain.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log the full error in development
  if (!isProduction) {
    console.error('[Error Handler]', err);
  } else {
    console.error('[Error Handler]', err.message);
  }

  // Handle known application errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        code: err.code,
      },
    });
    return;
  }

  // Handle Zod validation errors
  if (err.name === 'ZodError') {
    res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: (err as any).errors,
      },
    });
    return;
  }

  // Handle multer file upload errors
  if (err.name === 'MulterError') {
    res.status(400).json({
      success: false,
      error: {
        message: `File upload error: ${err.message}`,
        code: 'FILE_UPLOAD_ERROR',
      },
    });
    return;
  }

  // Unknown errors — don't leak internals in production
  res.status(500).json({
    success: false,
    error: {
      message: isProduction ? 'Internal server error' : err.message,
      code: 'INTERNAL_ERROR',
    },
  });
}
