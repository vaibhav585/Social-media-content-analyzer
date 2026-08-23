// =============================================================================
// Groq Provider
// Ultra-fast LLM inference using Groq SDK.
// Layer 2 fallback when Gemini rate limits are reached or during peak traffic.
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
   * Extracts JSON from a response that may contain markdown code fences or plain text.
   */
  private extractJson<T>(raw: string): T {
    let clean = raw.trim();
    // Remove markdown code fences if present
    if (clean.startsWith('```json')) {
      clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (clean.startsWith('```')) {
      clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    return JSON.parse(clean);
  }

  /**
   * Runs content analysis via Groq with internal model cascade.
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
          { role: 'system', content: systemPrompt + '\n\nYou MUST respond with valid JSON only. No markdown, no explanation.' },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
      });

      const raw = response.choices[0]?.message?.content || '{}';
      const parsed = this.extractJson<AnalysisResult>(raw);
      return { data: parsed, modelUsed: 'groq-compound' };
    } catch (primaryError: any) {
      console.warn(
        `[GroqProvider] Primary groq/compound failed: ${primaryError?.message}. Cascading to compound-mini...`
      );

      // Fallback: groq/compound-mini
      const fallbackResponse = await this.client.chat.completions.create({
        model: 'groq/compound-mini',
        messages: [
          { role: 'system', content: systemPrompt + '\n\nYou MUST respond with valid JSON only. No markdown, no explanation.' },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
      });

      const raw = fallbackResponse.choices[0]?.message?.content || '{}';
      const parsed = this.extractJson<AnalysisResult>(raw);
      return { data: parsed, modelUsed: 'groq-compound-mini' };
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
        temperature: 0.7,
      });
      const raw = response.choices[0]?.message?.content || '{}';
      return { data: this.extractJson(raw), modelUsed: 'groq-compound' };
    } catch (error: any) {
      console.warn(`[GroqProvider] Primary rewrite failed, cascading...`, error?.message);
      const fallbackResponse = await this.client.chat.completions.create({
        model: 'groq/compound-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });
      const raw = fallbackResponse.choices[0]?.message?.content || '{}';
      return { data: this.extractJson(raw), modelUsed: 'groq-compound-mini' };
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
        temperature: 0.3,
      });
      const raw = response.choices[0]?.message?.content || '{}';
      return { data: this.extractJson(raw), modelUsed: 'groq-compound' };
    } catch (error: any) {
      console.warn(`[GroqProvider] Primary benchmark failed, cascading...`, error?.message);
      const fallbackResponse = await this.client.chat.completions.create({
        model: 'groq/compound-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      });
      const raw = fallbackResponse.choices[0]?.message?.content || '{}';
      return { data: this.extractJson(raw), modelUsed: 'groq-compound-mini' };
    }
  }
}
