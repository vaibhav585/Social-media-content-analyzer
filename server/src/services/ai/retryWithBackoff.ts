// =============================================================================
// Retry With Exponential Backoff
// Layer 1 of AI Resilience Pipeline — handles transient glitches & rate limits
// =============================================================================

export interface RetryOptions {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  factor?: number;
  jitter?: boolean;
  shouldRetry?: (error: any) => boolean;
}

const defaultOptions: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  factor: 2.5,
  jitter: true,
  shouldRetry: (error: any) => {
    // Retry on 429 (Rate Limit), 500, 502, 503, 504, or network timeouts
    const status = error?.status || error?.statusCode || error?.response?.status;
    if (status === 429 || (status >= 500 && status <= 504)) {
      return true;
    }
    const message = error?.message?.toLowerCase() || '';
    if (
      message.includes('rate limit') ||
      message.includes('quota') ||
      message.includes('timeout') ||
      message.includes('econnreset') ||
      message.includes('overloaded') ||
      message.includes('resource_exhausted')
    ) {
      return true;
    }
    return false;
  },
};

/**
 * Wraps an async operation with exponential backoff and jitter.
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options?: RetryOptions,
  onRetry?: (attempt: number, delayMs: number, error: any) => void
): Promise<T> {
  const opts = { ...defaultOptions, ...options };
  let attempt = 0;

  while (attempt < opts.maxAttempts) {
    try {
      return await fn();
    } catch (error: any) {
      attempt++;

      if (attempt >= opts.maxAttempts || !opts.shouldRetry(error)) {
        throw error;
      }

      // Calculate backoff delay: initialDelay * factor^(attempt - 1)
      let delay = opts.initialDelayMs * Math.pow(opts.factor, attempt - 1);
      delay = Math.min(delay, opts.maxDelayMs);

      // Add jitter (+- 20%) to avoid synchronized stampede
      if (opts.jitter) {
        const jitterMultiplier = 0.8 + Math.random() * 0.4;
        delay = Math.round(delay * jitterMultiplier);
      }

      if (onRetry) {
        onRetry(attempt, delay, error);
      } else {
        console.warn(
          `[Retry] Attempt ${attempt}/${opts.maxAttempts} failed. Retrying in ${delay}ms... Reason: ${error?.message || 'Unknown error'}`
        );
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error('Retry loop exited unexpectedly');
}
