// =============================================================================
// API Service
// Axios instance with Supabase auth interceptor for backend API calls.
// =============================================================================

import axios from 'axios';
import { supabase } from './supabaseClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

/**
 * Pre-configured Axios instance that automatically attaches the
 * Supabase JWT token to every request.
 */
export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 60000, // 60s — AI analysis can take time
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor: Attach JWT ──────────────────────────────────────────

api.interceptors.request.use(
  async (config) => {
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    } else {
      // Check if we are in guest mode by checking localStorage or just sending guest_token
      // since the AuthStore state isn't directly available here without an import loop
      const storeState = localStorage.getItem('auth-storage'); // Assuming Zustand might persist it, or we just send guest_token if no session.
      // Actually, since we need to bypass 401s for guest in demo mode, let's just always fallback to guest_token if no session
      // The backend authMiddleware explicitly checks for 'guest_token' and assigns 'guest_user'.
      config.headers.Authorization = `Bearer guest_token`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: Handle common errors ───────────────────────────────

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If 401, try refreshing the session
    if (error.response?.status === 401) {
      const { data: { session } } = await supabase.auth.refreshSession();

      if (session) {
        // Retry the original request with new token
        error.config.headers.Authorization = `Bearer ${session.access_token}`;
        return api.request(error.config);
      }
    }

    return Promise.reject(error);
  }
);
