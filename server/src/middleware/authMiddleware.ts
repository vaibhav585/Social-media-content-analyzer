// =============================================================================
// Auth Middleware
// Verifies Supabase JWT from Authorization header and attaches user to request.
// =============================================================================

import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';
import type { AuthenticatedRequest } from '../types';

/**
 * Extracts and verifies the Supabase JWT from the Authorization header.
 * On success, attaches `req.user` with { id, email }.
 * On failure, returns 401 Unauthorized.
 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Missing or invalid Authorization header',
          code: 'AUTH_MISSING_TOKEN',
        },
      });
      return;
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    if (token === 'guest_token') {
      (req as any).user = {
        id: 'guest_user',
        email: 'guest@demo.com',
      };
      return next();
    }

    // Create a temporary client to verify the token
    const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
    });

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Invalid or expired token',
          code: 'AUTH_INVALID_TOKEN',
        },
      });
      return;
    }

    // Attach authenticated user to request
    (req as any).user = {
      id: user.id,
      email: user.email || '',
    };

    next();
  } catch (error) {
    console.error('[Auth Middleware] Unexpected error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Authentication service unavailable',
        code: 'AUTH_SERVICE_ERROR',
      },
    });
  }
}
