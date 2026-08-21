// =============================================================================
// Analysis Service
// Orchestrates content analysis through the resilience pipeline & persists to Supabase.
// =============================================================================

import { aiOrchestrator } from './ai/aiOrchestrator';
import { getSupabaseAdmin } from './supabaseService';
import { env } from '../config/env';
import type { AnalyzeRequest, Analysis, FileType, Platform } from '../types';

export class AnalysisService {
  /**
   * Runs the full analysis pipeline and stores result in database.
   */
  public async analyze(
    payload: {
      text: string;
      fileType: FileType;
      platform: Platform;
      fileUrl?: string;
      userId?: string;
    }
  ): Promise<Analysis> {
    const { text, fileType, platform, fileUrl, userId = 'anonymous-demo-user' } = payload;

    // 1. Run through AI Resilience Pipeline
    const aiResult = await aiOrchestrator.analyzeContent(text, platform);
    const { data: analysisData, provider, latencyMs } = aiResult;

    const analysisId = `analysis_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const createdAt = new Date().toISOString();

    const analysisRecord: Analysis = {
      id: analysisId,
      userId,
      originalText: text,
      fileName: null,
      fileType,
      fileUrl: fileUrl || null,
      platform,
      engagementScore: analysisData.engagementScore,
      breakdown: analysisData.breakdown,
      sentiment: analysisData.sentiment,
      suggestions: analysisData.suggestions,
      platformTips: analysisData.platformSpecific,
      visualAnalysis: {},
      aiProvider: provider,
      processingTimeMs: latencyMs,
      createdAt,
    };

    // 2. Persist to Supabase if credentials are valid and user is not demo
    if (this.isSupabaseAvailable() && userId !== 'anonymous-demo-user' && !userId.startsWith('demo-')) {
      try {
        const supabase = getSupabaseAdmin();
        const { data, error } = await supabase
          .from('analyses')
          .insert({
            user_id: userId,
            original_text: text,
            file_type: fileType,
            file_url: fileUrl || null,
            platform,
            engagement_score: analysisData.engagementScore,
            breakdown: analysisData.breakdown,
            sentiment: analysisData.sentiment,
            suggestions: analysisData.suggestions,
            platform_tips: analysisData.platformSpecific,
            ai_provider: provider,
            processing_time_ms: latencyMs,
          })
          .select()
          .single();

        if (error) {
          console.warn('[AnalysisService] Failed to persist analysis to Supabase:', error.message);
        } else if (data) {
          analysisRecord.id = data.id;
        }
      } catch (dbError: any) {
        console.warn('[AnalysisService] Supabase DB write error (falling back to memory):', dbError.message);
      }
    }

    return analysisRecord;
  }

  private isSupabaseAvailable(): boolean {
    return Boolean(
      env.supabaseUrl &&
      env.supabaseServiceRoleKey &&
      !env.supabaseUrl.includes('your-project') &&
      !env.supabaseServiceRoleKey.includes('eyJhbGciOi...')
    );
  }
}

export const analysisService = new AnalysisService();
