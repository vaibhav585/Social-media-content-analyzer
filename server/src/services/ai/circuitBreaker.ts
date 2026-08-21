// =============================================================================
// Circuit Breaker Pattern
// Prevents cascade failures by temporarily isolating failing AI providers.
// States: CLOSED (healthy) -> OPEN (broken) -> HALF-OPEN (testing recovery)
// =============================================================================

import type { CircuitBreakerState } from '../../types';

export interface CircuitBreakerConfig {
  failureThreshold: number;   // Number of consecutive failures to trip circuit
  resetTimeoutMs: number;     // Cooldown duration before attempting HALF-OPEN
  successThreshold: number;   // Consecutive successes in HALF-OPEN to CLOSE circuit
}

const defaultConfig: CircuitBreakerConfig = {
  failureThreshold: 3,
  resetTimeoutMs: 60000, // 60 seconds cooldown
  successThreshold: 1,
};

export class CircuitBreaker {
  public readonly name: string;
  private state: CircuitBreakerState = 'CLOSED';
  private consecutiveFailures = 0;
  private consecutiveSuccesses = 0;
  private nextAttemptTimestamp = 0;
  private readonly config: CircuitBreakerConfig;

  constructor(name: string, config?: Partial<CircuitBreakerConfig>) {
    this.name = name;
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Returns current circuit state, transitioning from OPEN to HALF_OPEN if cooldown expired.
   */
  public getState(): CircuitBreakerState {
    if (this.state === 'OPEN' && Date.now() >= this.nextAttemptTimestamp) {
      this.state = 'HALF_OPEN';
      this.consecutiveSuccesses = 0;
      console.log(`[CircuitBreaker:${this.name}] Cooldown expired. State -> HALF_OPEN (probing...)`);
    }
    return this.state;
  }

  /**
   * Checks if requests are allowed to proceed to this provider.
   */
  public isAvailable(): boolean {
    const currentState = this.getState();
    return currentState === 'CLOSED' || currentState === 'HALF_OPEN';
  }

  /**
   * Records a successful execution.
   */
  public recordSuccess(): void {
    if (this.state === 'HALF_OPEN') {
      this.consecutiveSuccesses++;
      if (this.consecutiveSuccesses >= this.config.successThreshold) {
        this.state = 'CLOSED';
        this.consecutiveFailures = 0;
        console.log(`[CircuitBreaker:${this.name}] Provider recovered. State -> CLOSED ✅`);
      }
    } else {
      this.consecutiveFailures = 0;
    }
  }

  /**
   * Records a failure execution.
   */
  public recordFailure(error?: any): void {
    this.consecutiveFailures++;
    console.warn(
      `[CircuitBreaker:${this.name}] Failure recorded (${this.consecutiveFailures}/${this.config.failureThreshold}). Error: ${error?.message || error}`
    );

    if (this.state === 'HALF_OPEN' || this.consecutiveFailures >= this.config.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttemptTimestamp = Date.now() + this.config.resetTimeoutMs;
      console.error(
        `[CircuitBreaker:${this.name}] ⚠️ Circuit TRIPPED -> OPEN. Provider isolated for ${this.config.resetTimeoutMs / 1000}s.`
      );
    }
  }

  /**
   * Manually resets the circuit breaker to CLOSED.
   */
  public reset(): void {
    this.state = 'CLOSED';
    this.consecutiveFailures = 0;
    this.consecutiveSuccesses = 0;
    this.nextAttemptTimestamp = 0;
  }
}
