// =============================================================================
// Rate Limit Tracker (In-Memory Intelligence)
// Proactively tracks RPM & RPD usage per AI provider to prevent 429 exhaustion.
// =============================================================================

export interface ProviderLimits {
  rpm: number;
  rpd: number;
}

export interface ProviderUsageStats {
  requestsThisMinute: number;
  requestsToday: number;
  rpmLimit: number;
  rpdLimit: number;
  rpmPercentage: number;
  rpdPercentage: number;
  isApproachingLimit: boolean; // >80% RPM
  isExhausted: boolean;
}

export class RateLimitTracker {
  private minuteWindows: Map<string, { count: number; windowStart: number }> = new Map();
  private dayWindows: Map<string, { count: number; windowStart: number }> = new Map();
  private limits: Map<string, ProviderLimits> = new Map();

  /**
   * Registers rate limits for a specific AI provider.
   */
  public registerProvider(providerName: string, limits: ProviderLimits): void {
    this.limits.set(providerName, limits);
  }

  /**
   * Checks if a provider has capacity before dispatching a request.
   */
  public canMakeRequest(providerName: string): boolean {
    this.cleanupWindows(providerName);
    const stats = this.getStats(providerName);
    return !stats.isExhausted;
  }

  /**
   * Checks if provider is near capacity (>80%) to proactively prefer fallbacks.
   */
  public isApproachingLimit(providerName: string): boolean {
    this.cleanupWindows(providerName);
    const stats = this.getStats(providerName);
    return stats.isApproachingLimit;
  }

  /**
   * Increments the request counter for the provider upon making an API call.
   */
  public recordRequest(providerName: string): void {
    this.cleanupWindows(providerName);

    const now = Date.now();
    const minWin = this.minuteWindows.get(providerName) || { count: 0, windowStart: now };
    const dayWin = this.dayWindows.get(providerName) || { count: 0, windowStart: now };

    minWin.count++;
    dayWin.count++;

    this.minuteWindows.set(providerName, minWin);
    this.dayWindows.set(providerName, dayWin);
  }

  /**
   * Returns full usage telemetry for a given provider.
   */
  public getStats(providerName: string): ProviderUsageStats {
    this.cleanupWindows(providerName);

    const limits = this.limits.get(providerName) || { rpm: 15, rpd: 1500 };
    const minWin = this.minuteWindows.get(providerName) || { count: 0, windowStart: Date.now() };
    const dayWin = this.dayWindows.get(providerName) || { count: 0, windowStart: Date.now() };

    const rpmPercentage = Math.round((minWin.count / limits.rpm) * 100);
    const rpdPercentage = Math.round((dayWin.count / limits.rpd) * 100);

    const isExhausted = minWin.count >= limits.rpm || dayWin.count >= limits.rpd;
    const isApproachingLimit = rpmPercentage >= 80 || rpdPercentage >= 80;

    return {
      requestsThisMinute: minWin.count,
      requestsToday: dayWin.count,
      rpmLimit: limits.rpm,
      rpdLimit: limits.rpd,
      rpmPercentage,
      rpdPercentage,
      isApproachingLimit,
      isExhausted,
    };
  }

  /**
   * Resets expired 60-second and 24-hour windows.
   */
  private cleanupWindows(providerName: string): void {
    const now = Date.now();

    // Minute window cleanup (60,000ms)
    const minWin = this.minuteWindows.get(providerName);
    if (minWin && now - minWin.windowStart >= 60000) {
      this.minuteWindows.set(providerName, { count: 0, windowStart: now });
    }

    // Day window cleanup (86,400,000ms)
    const dayWin = this.dayWindows.get(providerName);
    if (dayWin && now - dayWin.windowStart >= 86400000) {
      this.dayWindows.set(providerName, { count: 0, windowStart: now });
    }
  }
}
