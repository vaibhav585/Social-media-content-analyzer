// =============================================================================
// Gemini Provider
// Interacts with Google Gemini API using structured JSON output mode.
// Primary: gemini-2.0-flash -> Fallback: gemini-3.6-flash
// =============================================================================

import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../config/env';
import { buildAnalysisSystemPrompt, buildAnalysisUserPrompt } from '../../prompts/analysisPrompt';
import { getRewritePrompt } from '../../prompts/rewritePrompt';
import { getBenchmarkPrompt } from '../../prompts/benchmarkPrompt';
import type { AnalysisResult, Platform } from '../../types';

export class GeminiProvider {
  private client: GoogleGenerativeAI;

  constructor() {
    this.client = new GoogleGenerativeAI(env.geminiApiKey);
  }

  /**
   * Runs content analysis via Gemini with internal model cascade (2.0 Flash -> 1.5 Flash).
   */
  public async analyzeContent(
    text: string,
    platform: Platform
  ): Promise<{ data: AnalysisResult; modelUsed: string }> {
    const systemInstruction = buildAnalysisSystemPrompt();
    const prompt = buildAnalysisUserPrompt(text, platform);

    // Primary: gemini-3.6-flash
    try {
      const model = this.client.getGenerativeModel({
        model: 'gemini-3.6-flash',
        systemInstruction,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const response = await model.generateContent(prompt);
      const rawText = response.response.text();
      const parsed = this.parseJson<AnalysisResult>(rawText);
      return { data: parsed, modelUsed: 'gemini-3.6-flash' };
    } catch (primaryError: any) {
      console.warn(
        `[GeminiProvider] Primary model gemini-3.6-flash failed: ${primaryError?.message}. Cascading...`
      );

      // Fallback: gemini-3.6-flash
      const fallbackModel = this.client.getGenerativeModel({
        model: 'gemini-3.6-flash',
        systemInstruction,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const response = await fallbackModel.generateContent(prompt);
      const rawText = response.response.text();
      const parsed = this.parseJson<AnalysisResult>(rawText);
      return { data: parsed, modelUsed: 'gemini-3.6-flash' };
    }
  }

  private parseJson<T>(raw: string): T {
    let clean = raw.trim();
    if (clean.startsWith('```json')) {
      clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (clean.startsWith('```')) {
      clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    return JSON.parse(clean);
  }

  public async rewriteContent(
    text: string,
    platform: Platform,
    goal: string,
    toneExamples?: string[]
  ): Promise<{ data: any; modelUsed: string }> {
    const prompt = getRewritePrompt(text, platform, goal, toneExamples);

    try {
      const model = this.client.getGenerativeModel({
        model: 'gemini-3.6-flash',
        generationConfig: { responseMimeType: 'application/json', temperature: 0.7 },
      });
      const response = await model.generateContent(prompt);
      return { data: this.parseJson(response.response.text()), modelUsed: 'gemini-3.6-flash' };
    } catch (error: any) {
      console.warn(`[GeminiProvider] Primary model failed for rewrite, cascading...`, error);
      const fallbackModel = this.client.getGenerativeModel({
        model: 'gemini-3.6-flash',
        generationConfig: { responseMimeType: 'application/json', temperature: 0.7 },
      });
      const response = await fallbackModel.generateContent(prompt);
      return { data: this.parseJson(response.response.text()), modelUsed: 'gemini-3.6-flash' };
    }
  }

  public async benchmarkContent(
    userText: string,
    competitorText: string,
    platform: Platform
  ): Promise<{ data: any; modelUsed: string }> {
    const prompt = getBenchmarkPrompt(userText, competitorText, platform);

    try {
      const model = this.client.getGenerativeModel({
        model: 'gemini-3.6-flash',
        generationConfig: { responseMimeType: 'application/json', temperature: 0.3 },
      });
      const response = await model.generateContent(prompt);
      return { data: this.parseJson(response.response.text()), modelUsed: 'gemini-3.6-flash' };
    } catch (error: any) {
      console.warn(`[GeminiProvider] Primary model failed for benchmark, cascading...`, error);
      const fallbackModel = this.client.getGenerativeModel({
        model: 'gemini-3.6-flash',
        generationConfig: { responseMimeType: 'application/json', temperature: 0.3 },
      });
      const response = await fallbackModel.generateContent(prompt);
      return { data: this.parseJson(response.response.text()), modelUsed: 'gemini-3.6-flash' };
    }
  }
}
