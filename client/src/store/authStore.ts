// =============================================================================
// Auth Store (Zustand)
// Manages authentication state with Supabase session.
// =============================================================================

import { create } from 'zustand';
import { supabase } from '../services/supabaseClient';
import type { User } from '@supabase/supabase-js';

interface AuthUser {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
}

interface AuthStore {
  // State
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  initialize: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<void>;
  signInAsGuest: () => void;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
}

/**
 * Maps a Supabase User object to our AuthUser shape.
 */
function mapUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email || '',
    fullName: user.user_metadata?.full_name || user.user_metadata?.name || null,
    avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
  };
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  /**
   * Initialize auth state from existing session + listen for changes.
   */
  initialize: async () => {
    try {
      // Check for existing session
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        set({
          user: mapUser(session.user),
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }

      // Listen for auth state changes (login, logout, token refresh)
      supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          set({
            user: mapUser(session.user),
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      });
    } catch (error) {
      console.error('[Auth Store] Initialization error:', error);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  /**
   * Sign in with Google OAuth — redirects to Google login page.
   */
  signInWithGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      throw new Error(error.message);
    }
  },

  /**
   * Sign in with email and password.
   */
  signInWithEmail: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data.user) {
      set({
        user: mapUser(data.user),
        isAuthenticated: true,
      });
    }
  },

  /**
   * Sign up with email, password, and full name.
   */
  signUpWithEmail: async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data.user) {
      set({
        user: mapUser(data.user),
        isAuthenticated: true,
      });
    }
  },

  /**
   * Quick guest/demo sign in to preview all dashboard and analysis features without external setup.
   */
  signInAsGuest: () => {
    set({
      user: {
        id: 'demo-user-123',
        email: 'demo.creator@example.com',
        fullName: 'Alex Morgan',
        avatarUrl: null,
      },
      isAuthenticated: true,
      isLoading: false,
    });
  },

  /**
   * Sign out the current user.
   */
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
    set({ user: null, isAuthenticated: false });
  },

  /**
   * Manually set user (used by auth state change listener).
   */
  setUser: (user: User | null) => {
    if (user) {
      set({ user: mapUser(user), isAuthenticated: true, isLoading: false });
    } else {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
