// =============================================================================
// Groq Provider
// Ultra-fast LLM inference using Groq SDK (Llama 3.3 70B & 3.1 8B).
// Layer 3 fallback when Gemini rate limits are reached or during peak traffic.
// =============================================================================

import Groq from 'groq-sdk';
import { env } from '../../config/env';
import { buildAnalysisSystemPrompt, buildAnalysisUserPrompt } from '../../prompts/analysisPrompt';
import { getRewritePrompt } from '../../prompts/rewritePrompt';
import { getBenchmarkPrompt } from '../../prompts/benchmarkPrompt';
import type { AnalysisResult, Platform } from '../../types';

export class GroqProvider {
  private client: Groq;

  constructor() {
    this.client = new Groq({ apiKey: env.groqApiKey });
  }

  /**
   * Runs content analysis via Groq with internal model cascade (Llama 3.3 70B -> Llama 3.1 8B).
   */
  public async analyzeContent(
    text: string,
    platform: Platform
  ): Promise<{ data: AnalysisResult; modelUsed: string }> {
    const systemPrompt = buildAnalysisSystemPrompt();
    const userPrompt = buildAnalysisUserPrompt(text, platform);

    // Primary: groq/compound
    try {
      const response = await this.client.chat.completions.create({
        model: 'groq/compound',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });

      const raw = response.choices[0]?.message?.content || '{}';
      const parsed = JSON.parse(raw);
      return { data: parsed as AnalysisResult, modelUsed: 'groq-llama3-70b' };
    } catch (primaryError: any) {
      console.warn(
        `[GroqProvider] Primary llama3-70b failed: ${primaryError?.message}. Cascading to llama3-8b...`
      );

      // Fallback: groq/compound-mini
      const fallbackResponse = await this.client.chat.completions.create({
        model: 'groq/compound-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });

      const raw = fallbackResponse.choices[0]?.message?.content || '{}';
      const parsed = JSON.parse(raw);
      return { data: parsed as AnalysisResult, modelUsed: 'groq-llama3-8b' };
    }
  }

  public async rewriteContent(
    text: string,
    platform: Platform,
    goal: string,
    toneExamples?: string[]
  ): Promise<{ data: any; modelUsed: string }> {
    const prompt = getRewritePrompt(text, platform, goal, toneExamples);

    try {
      const response = await this.client.chat.completions.create({
        model: 'groq/compound',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });
      const raw = response.choices[0]?.message?.content || '{}';
      return { data: JSON.parse(raw), modelUsed: 'groq-llama3-70b' };
    } catch (error) {
      console.warn(`[GroqProvider] Primary rewrite failed, cascading to 8b...`, error);
      const fallbackResponse = await this.client.chat.completions.create({
        model: 'groq/compound-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });
      const raw = fallbackResponse.choices[0]?.message?.content || '{}';
      return { data: JSON.parse(raw), modelUsed: 'groq-llama3-8b' };
    }
  }

  public async benchmarkContent(
    userText: string,
    competitorText: string,
    platform: Platform
  ): Promise<{ data: any; modelUsed: string }> {
    const prompt = getBenchmarkPrompt(userText, competitorText, platform);

    try {
      const response = await this.client.chat.completions.create({
        model: 'groq/compound',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });
      const raw = response.choices[0]?.message?.content || '{}';
      return { data: JSON.parse(raw), modelUsed: 'groq-llama3-70b' };
    } catch (error) {
      console.warn(`[GroqProvider] Primary benchmark failed, cascading to 8b...`, error);
      const fallbackResponse = await this.client.chat.completions.create({
        model: 'groq/compound-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });
      const raw = fallbackResponse.choices[0]?.message?.content || '{}';
      return { data: JSON.parse(raw), modelUsed: 'groq-llama3-8b' };
    }
  }
}
