// =============================================================================
// Client TypeScript Types
// Frontend-specific types extending shared types.
// =============================================================================

// Re-export all shared types
export type {
  Platform,
  FileType,
  ScoreDetail,
  AnalysisBreakdown,
  Sentiment,
  PlatformSpecific,
  AnalysisResult,
  Analysis,
  RewriteGoal,
  RewriteVariant,
  Rewrite,
  BenchmarkComparison,
  Benchmark,
  AnalyzeRequest,
  AnalyzeResponse,
  RewriteRequest,
  RewriteResponse,
  BenchmarkRequest,
  BenchmarkResponse,
  AnalysisHistoryResponse,
  TrendDataPoint,
  TrendsResponse,
  CircuitState,
  ProviderHealth,
  HealthResponse,
  UserProfile,
  ApiError,
} from '../../../shared/types';

// ── Upload State ─────────────────────────────────────────────────────────────

export interface UploadedFile {
  file: File;
  preview: string;
  extractedText: string | null;
  extractionProgress: number;
  extractionStatus: 'idle' | 'extracting' | 'done' | 'error';
  extractionError: string | null;
}

// ── UI State ─────────────────────────────────────────────────────────────────

export type Theme = 'light' | 'dark';

export type SidebarView = 'analyze' | 'history' | 'settings';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

// ── Auth State ───────────────────────────────────────────────────────────────

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: {
    id: string;
    email: string;
    fullName: string | null;
    avatarUrl: string | null;
  } | null;
}
