import { aiOrchestrator } from './ai/aiOrchestrator';
import { getSupabaseAdmin } from './supabaseService';
import type { BenchmarkRequest, BenchmarkResponse, Benchmark, BenchmarkComparison } from '../types';

export class BenchmarkService {
  public async benchmark(userId: string, req: BenchmarkRequest): Promise<BenchmarkResponse> {
    const { analysisId, competitorText, platform } = req;

    // Fetch original user analysis text from DB
    let userText = '';
    try {
      const supabase = getSupabaseAdmin();
      const { data } = await supabase.from('analyses').select('originalText').eq('id', analysisId).single();
      if (data) {
        userText = data.originalText;
      }
    } catch (dbError: any) {
      console.warn('[BenchmarkService] DB fetch failed (non-fatal):', dbError.message);
    }
    
    if (!userText) {
      userText = "The user's original text could not be loaded from the database.";
    }

    // Call orchestrator
    const result = await aiOrchestrator.benchmarkContent(userText, competitorText, platform);

    const comparison: BenchmarkComparison = {
      userScore: result.data.userScore,
      competitorScore: result.data.competitorScore,
      userBreakdown: result.data.userBreakdown,
      competitorBreakdown: result.data.competitorBreakdown,
      whatTheyDidBetter: result.data.whatTheyDidBetter,
      yourStrengths: result.data.yourStrengths,
    };

    const benchmarkData: Benchmark = {
      id: crypto.randomUUID(),
      userId,
      userAnalysisId: analysisId,
      competitorText,
      competitorScore: comparison.competitorScore,
      comparison,
      createdAt: new Date().toISOString(),
    };

    // Save to DB asynchronously if configured
    try {
      const supabase = getSupabaseAdmin();
      supabase.from('benchmarks').insert(benchmarkData).catch((err: any) => {
        console.error('[BenchmarkService] Failed to save benchmark to Supabase:', err.message);
      });
    } catch (e) {
      // DB not available, skip saving
    }

    return { benchmark: benchmarkData };
  }
}

export const benchmarkService = new BenchmarkService();
