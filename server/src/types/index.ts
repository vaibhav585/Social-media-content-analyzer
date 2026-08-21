// =============================================================================
// Server Types
// Backend-specific types that extend shared types.
// =============================================================================

export * from '../../../shared/types';

import type { Request } from 'express';

/**
 * Authenticated user attached to requests after JWT verification.
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
}

/**
 * Express Request with authenticated user context.
 */
export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

/**
 * AI Provider identifiers used in the resilience pipeline.
 */
export type AIProvider =
  | 'gemini-2.0-flash'
  | 'gemini-1.5-flash'
  | 'groq-llama-3.3-70b'
  | 'groq-llama-3.1-8b'
  | 'local-heuristic';

/**
 * Result from an AI provider call.
 */
export interface AIProviderResult<T> {
  data: T;
  provider: AIProvider;
  latencyMs: number;
}

/**
 * Circuit breaker states for AI providers.
 */
export type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

/**
 * Rate limit tracking per provider.
 */
export interface RateLimitState {
  requestsThisMinute: number;
  requestsToday: number;
  minuteWindowStart: number;
  dayWindowStart: number;
}

/**
 * Pagination query parameters.
 */
export interface PaginationQuery {
  page: number;
  limit: number;
}

/**
 * Standard API response envelope.
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: unknown;
  };
}
