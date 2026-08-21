// =============================================================================
// AI Orchestrator (Core Multi-Layer Resilience Pipeline)
// Coordinates: RateLimitTracker -> CircuitBreakers -> RetryWithBackoff -> Cross-Provider Failover -> Local Degradation
// Pipeline: Gemini (2.0 Flash -> 1.5 Flash) -> Groq (Llama 70B -> Llama 8B) -> Local Heuristics
// =============================================================================

import { env } from '../../config/env';
import { GeminiProvider } from './geminiProvider';
import { GroqProvider } from './groqProvider';
import { LocalHeuristicsEngine } from './localHeuristics';
import { CircuitBreaker } from './circuitBreaker';
import { RateLimitTracker } from './rateLimitTracker';
import { retryWithBackoff } from './retryWithBackoff';
import type { AIProvider, AIProviderResult, AnalysisResult, Platform, ProviderHealth } from '../../types';

export class AIOrchestrator {
  private geminiProvider: GeminiProvider;
  private groqProvider: GroqProvider;
  private localEngine: LocalHeuristicsEngine;

  private geminiBreaker: CircuitBreaker;
  private groqBreaker: CircuitBreaker;
  private rateLimiter: RateLimitTracker;

  constructor() {
    this.geminiProvider = new GeminiProvider();
    this.groqProvider = new GroqProvider();
    this.localEngine = new LocalHeuristicsEngine();

    this.geminiBreaker = new CircuitBreaker('gemini', { failureThreshold: 3, resetTimeoutMs: 60000 });
    this.groqBreaker = new CircuitBreaker('groq', { failureThreshold: 3, resetTimeoutMs: 60000 });

    this.rateLimiter = new RateLimitTracker();
    this.rateLimiter.registerProvider('gemini', { rpm: env.geminiRpmLimit, rpd: env.geminiRpdLimit });
    this.rateLimiter.registerProvider('groq', { rpm: env.groqRpmLimit, rpd: env.groqRpdLimit });
  }

  /**
   * Main analysis execution with full multi-layer fallback resilience.
   */
  public async analyzeContent(
    text: string,
    platform: Platform
  ): Promise<AIProviderResult<AnalysisResult>> {
    const startTime = Date.now();

    // ── Tier 1: Gemini Provider (Flash 2.0 -> Flash 1.5) ──────────────────────
    if (this.canUseGemini()) {
      try {
        console.log('[AI Orchestrator] Dispatching analysis to Tier 1: Gemini Provider...');
        this.rateLimiter.recordRequest('gemini');

        const result = await retryWithBackoff(
          () => this.geminiProvider.analyzeContent(text, platform),
          { maxAttempts: 2, initialDelayMs: 1000 }
        );

        this.geminiBreaker.recordSuccess();
        const latencyMs = Date.now() - startTime;
        console.log(`[AI Orchestrator] Gemini analysis succeeded in ${latencyMs}ms using ${result.modelUsed} ✅`);

        return {
          data: result.data,
          provider: result.modelUsed as AIProvider,
          latencyMs,
        };
      } catch (geminiError: any) {
        console.warn(`[AI Orchestrator] Gemini tier failed: ${geminiError?.message}. Tripping breaker & failing over to Groq...`);
        this.geminiBreaker.recordFailure(geminiError);
      }
    } else {
      console.log('[AI Orchestrator] Gemini skipped due to circuit breaker or rate limits. Routing directly to Groq...');
    }

    // ── Tier 2: Groq Provider (Llama 3.3 70B -> Llama 3.1 8B) ──────────────────
    if (this.canUseGroq()) {
      try {
        console.log('[AI Orchestrator] Dispatching analysis to Tier 2: Groq Provider...');
        this.rateLimiter.recordRequest('groq');

        const result = await retryWithBackoff(
          () => this.groqProvider.analyzeContent(text, platform),
          { maxAttempts: 2, initialDelayMs: 800 }
        );

        this.groqBreaker.recordSuccess();
        const latencyMs = Date.now() - startTime;
        console.log(`[AI Orchestrator] Groq analysis succeeded in ${latencyMs}ms using ${result.modelUsed} ✅`);

        return {
          data: result.data,
          provider: result.modelUsed as AIProvider,
          latencyMs,
        };
      } catch (groqError: any) {
        console.warn(`[AI Orchestrator] Groq tier failed: ${groqError?.message}. Tripping breaker & degrading to Local Heuristics...`);
        this.groqBreaker.recordFailure(groqError);
      }
    } else {
      console.log('[AI Orchestrator] Groq skipped due to circuit breaker or rate limits.');
    }

    // ── Tier 3: Local Heuristics Fallback (Zero AI — Last Resort) ──────────────
    console.warn('[AI Orchestrator] 🛡️ All cloud AI providers exhausted. Running Local Heuristic Engine...');
    const localData = this.localEngine.analyze(text, platform);
    const latencyMs = Date.now() - startTime;

    return {
      data: localData,
      provider: 'local-heuristic',
      latencyMs,
    };
  }

  public async rewriteContent(
    text: string,
    platform: Platform,
    goal: string,
    toneExamples?: string[]
  ): Promise<AIProviderResult<any>> {
    const startTime = Date.now();

    // Try Gemini
    if (this.canUseGemini()) {
      try {
        this.rateLimiter.recordRequest('gemini');
        const result = await retryWithBackoff(
          () => this.geminiProvider.rewriteContent(text, platform, goal, toneExamples),
          { maxAttempts: 2, initialDelayMs: 1000 }
        );
        this.geminiBreaker.recordSuccess();
        return { data: result.data, provider: result.modelUsed as AIProvider, latencyMs: Date.now() - startTime };
      } catch (e: any) {
        this.geminiBreaker.recordFailure(e);
      }
    }

    // Try Groq
    if (this.canUseGroq()) {
      try {
        this.rateLimiter.recordRequest('groq');
        const result = await retryWithBackoff(
          () => this.groqProvider.rewriteContent(text, platform, goal, toneExamples),
          { maxAttempts: 2, initialDelayMs: 800 }
        );
        this.groqBreaker.recordSuccess();
        return { data: result.data, provider: result.modelUsed as AIProvider, latencyMs: Date.now() - startTime };
      } catch (e: any) {
        this.groqBreaker.recordFailure(e);
      }
    }

    // Fallback Local Rewriter
    return {
      data: {
        goal,
        rewrittenText: `[Fallback Mode: AI keys not configured]\n\nHere is a structure you can follow to achieve your goal:\n\n1. Use a strong hook related to: ${text.substring(0, 30)}...\n2. Deliver value clearly in short paragraphs.\n3. End with a question to prompt discussion.`,
        improvementNotes: "Local fallback engaged. Add Gemini/Groq keys for actual AI rewrites."
      },
      provider: 'local-heuristic',
      latencyMs: Date.now() - startTime
    };
  }

  public async benchmarkContent(
    userText: string,
    competitorText: string,
    platform: Platform
  ): Promise<AIProviderResult<any>> {
    const startTime = Date.now();

    // Try Gemini
    if (this.canUseGemini()) {
      try {
        this.rateLimiter.recordRequest('gemini');
        const result = await retryWithBackoff(
          () => this.geminiProvider.benchmarkContent(userText, competitorText, platform),
          { maxAttempts: 2, initialDelayMs: 1000 }
        );
        this.geminiBreaker.recordSuccess();
        return { data: result.data, provider: result.modelUsed as AIProvider, latencyMs: Date.now() - startTime };
      } catch (e: any) {
        this.geminiBreaker.recordFailure(e);
      }
    }

    // Try Groq
    if (this.canUseGroq()) {
      try {
        this.rateLimiter.recordRequest('groq');
        const result = await retryWithBackoff(
          () => this.groqProvider.benchmarkContent(userText, competitorText, platform),
          { maxAttempts: 2, initialDelayMs: 800 }
        );
        this.groqBreaker.recordSuccess();
        return { data: result.data, provider: result.modelUsed as AIProvider, latencyMs: Date.now() - startTime };
      } catch (e: any) {
        this.groqBreaker.recordFailure(e);
      }
    }

    // Fallback Local Benchmark
    return {
      data: {
        userScore: 75,
        competitorScore: 80,
        userBreakdown: {
          hookStrength: { score: 70, reasoning: "User hook is decent." },
          emotionalResonance: { score: 70, reasoning: "User emotion is decent." },
          ctaClarity: { score: 70, reasoning: "User CTA is decent." },
          readability: { score: 70, reasoning: "User readability is decent." },
          hashtagEffectiveness: { score: 70, reasoning: "User hashtags are decent." }
        },
        competitorBreakdown: {
          hookStrength: { score: 80, reasoning: "Competitor hook is strong." },
          emotionalResonance: { score: 80, reasoning: "Competitor emotion is strong." },
          ctaClarity: { score: 80, reasoning: "Competitor CTA is strong." },
          readability: { score: 80, reasoning: "Competitor readability is strong." },
          hashtagEffectiveness: { score: 80, reasoning: "Competitor hashtags are strong." }
        },
        whatTheyDidBetter: ["Fallback mode: Could not fully analyze.", "Please add AI keys."],
        yourStrengths: ["Fallback mode: Baseline structure is okay."]
      },
      provider: 'local-heuristic',
      latencyMs: Date.now() - startTime
    };
  }

  /**
   * Returns provider health, circuit breaker statuses, and rate limit telemetry.
   */
  public getHealthTelemetry(): ProviderHealth[] {
    const geminiStats = this.rateLimiter.getStats('gemini');
    const groqStats = this.rateLimiter.getStats('groq');

    return [
      {
        name: 'Google Gemini',
        circuitState: this.geminiBreaker.getState(),
        requestsThisMinute: geminiStats.requestsThisMinute,
        requestsToday: geminiStats.requestsToday,
        isAvailable: this.geminiBreaker.isAvailable() && !geminiStats.isExhausted,
      },
      {
        name: 'Groq Cloud',
        circuitState: this.groqBreaker.getState(),
        requestsThisMinute: groqStats.requestsThisMinute,
        requestsToday: groqStats.requestsToday,
        isAvailable: this.groqBreaker.isAvailable() && !groqStats.isExhausted,
      },
      {
        name: 'Local Heuristics',
        circuitState: 'CLOSED',
        requestsThisMinute: 0,
        requestsToday: 0,
        isAvailable: true,
      },
    ];
  }

  private canUseGemini(): boolean {
    const hasKey = Boolean(env.geminiApiKey && env.geminiApiKey !== 'AIzaSy...' && !env.geminiApiKey.includes('placeholder'));
    return hasKey && this.geminiBreaker.isAvailable() && this.rateLimiter.canMakeRequest('gemini');
  }

  private canUseGroq(): boolean {
    const hasKey = Boolean(env.groqApiKey && env.groqApiKey !== 'gsk_...' && !env.groqApiKey.includes('placeholder'));
    return hasKey && this.groqBreaker.isAvailable() && this.rateLimiter.canMakeRequest('groq');
  }
}

// Singleton export
export const aiOrchestrator = new AIOrchestrator();
