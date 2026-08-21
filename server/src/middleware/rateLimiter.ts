// =============================================================================
// Rate Limiter Middleware
// IP-based rate limiting using express-rate-limit.
// =============================================================================

import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter — 100 requests per minute per IP.
 */
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: true, // Return RateLimit-* headers
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many requests. Please try again in a minute.',
      code: 'RATE_LIMIT_EXCEEDED',
    },
  },
});

/**
 * Stricter rate limiter for AI-intensive endpoints — 20 requests per minute.
 */
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many analysis requests. Please wait before trying again.',
      code: 'AI_RATE_LIMIT_EXCEEDED',
    },
  },
});

/**
 * Auth rate limiter — 10 attempts per 15 minutes to prevent brute force.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many authentication attempts. Please try again later.',
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
    },
  },
});
