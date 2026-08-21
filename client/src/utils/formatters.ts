// =============================================================================
// Formatters
// Utility functions for formatting dates, scores, text, and file sizes.
// =============================================================================

/**
 * Formats a date string into a human-readable format.
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

/**
 * Formats a date string into a relative time (e.g., "2 hours ago").
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
}

/**
 * Formats an engagement score with a + or - prefix.
 */
export function formatScoreChange(current: number, previous: number): string {
  const diff = current - previous;
  if (diff > 0) return `+${diff}`;
  return String(diff);
}

/**
 * Formats bytes into human-readable file size.
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

/**
 * Truncates text to a maximum length with ellipsis.
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Formats milliseconds into a human-readable duration.
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

/**
 * Capitalizes the first letter of a string.
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Formats the AI provider name for display.
 */
export function formatProviderName(provider: string): string {
  const names: Record<string, string> = {
    'gemini-2.0-flash': 'Gemini Flash',
    'gemini-1.5-flash': 'Gemini 1.5',
    'groq-llama-3.3-70b': 'Groq Llama 70B',
    'groq-llama-3.1-8b': 'Groq Llama 8B',
    'local-heuristic': 'Local Analysis',
  };
  return names[provider] || provider;
}
