// =============================================================================
// UI Store (Zustand)
// Manages theme, sidebar state, and toast notifications.
// =============================================================================

import { create } from 'zustand';
import toast from 'react-hot-toast';
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

  addToast: (newToast) => {
    // We map our custom toast interface to react-hot-toast
    const toastConfig = {
      duration: newToast.duration || 5000,
      position: 'bottom-right' as const,
    };

    if (newToast.type === 'success') {
      toast.success(newToast.message || newToast.title, toastConfig);
    } else if (newToast.type === 'error') {
      toast.error(newToast.message || newToast.title, toastConfig);
    } else {
      toast(newToast.message || newToast.title, { ...toastConfig, icon: 'ℹ️' });
    }
  },

  removeToast: (id) => toast.dismiss(id),

  // ── Loading States ───────────────────────────────────────────────────────
  isAnalyzing: false,
  isRewriting: false,
  setAnalyzing: (value) => set({ isAnalyzing: value }),
  setRewriting: (value) => set({ isRewriting: value }),
}));
