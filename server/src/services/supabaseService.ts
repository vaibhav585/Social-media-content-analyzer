// =============================================================================
// Supabase Admin Service
// Server-side Supabase client with service role key for DB operations.
// =============================================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '../config/env';

let supabaseAdmin: SupabaseClient;

/**
 * Returns the Supabase admin client (singleton).
 * Uses the service role key for full database access — bypasses RLS.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return supabaseAdmin;
}

/**
 * Creates a Supabase client scoped to a specific user's JWT.
 * This client respects RLS policies.
 */
export function getSupabaseClient(accessToken: string): SupabaseClient {
  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}
