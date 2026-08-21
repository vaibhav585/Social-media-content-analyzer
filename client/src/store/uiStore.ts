// =============================================================================
// UI Store (Zustand)
// Manages theme, sidebar state, and toast notifications.
// =============================================================================

import { create } from 'zustand';
import type { Theme, SidebarView, ToastMessage } from '../types';

interface UIStore {
  // Theme
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;

  // Sidebar
  sidebarOpen: boolean;
  sidebarView: SidebarView;
  toggleSidebar: () => void;
  setSidebarView: (view: SidebarView) => void;

  // Toasts
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;

  // Loading States
  isAnalyzing: boolean;
  isRewriting: boolean;
  setAnalyzing: (value: boolean) => void;
  setRewriting: (value: boolean) => void;
}

/**
 * Generates a unique ID for toast messages.
 */
function generateId(): string {
  return `toast_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Detects the user's system color scheme preference.
 */
function getSystemTheme(): Theme {
  return 'light'; // Forced Light Mode
}

export const useUIStore = create<UIStore>((set) => ({
  // ── Theme ────────────────────────────────────────────────────────────────
  theme: getSystemTheme(),

  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      return { theme: newTheme };
    }),

  setTheme: (theme: Theme) => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    set({ theme });
  },

  // ── Sidebar ──────────────────────────────────────────────────────────────
  sidebarOpen: true,
  sidebarView: 'analyze',

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSidebarView: (view: SidebarView) => set({ sidebarView: view }),

  // ── Toasts ───────────────────────────────────────────────────────────────
  toasts: [],

  addToast: (toast) =>
    set((state) => {
      const id = generateId();
      const newToast: ToastMessage = { ...toast, id };

      // Auto-remove after duration (default 5 seconds)
      setTimeout(() => {
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
      }, toast.duration || 5000);

      return { toasts: [...state.toasts, newToast] };
    }),

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  // ── Loading States ───────────────────────────────────────────────────────
  isAnalyzing: false,
  isRewriting: false,
  setAnalyzing: (value) => set({ isAnalyzing: value }),
  setRewriting: (value) => set({ isRewriting: value }),
}));
