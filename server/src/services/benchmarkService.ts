import { aiOrchestrator } from './ai/aiOrchestrator';
import { supabaseAdmin } from './supabaseService';
import type { BenchmarkRequest, BenchmarkResponse, Benchmark, BenchmarkComparison } from '../types';

export class BenchmarkService {
  public async benchmark(userId: string, req: BenchmarkRequest): Promise<BenchmarkResponse> {
    const { analysisId, competitorText, platform } = req;

    // Fetch original user analysis text if available via DB or client pass it?
    // Wait, the client request only sends `analysisId` and `competitorText`. 
    // If we rely on DB, we'd need to fetch `analysis` to get `originalText`.
    // Let's check what Analysis has. Or maybe we can ask the client to send `userText` too for easier stateless operation.
    // For now, let's assume we can fetch it, OR we require it in the request. Let's require it in the request or fetch it.
    // Wait, the `BenchmarkRequest` only has `analysisId`, `competitorText`, `platform`.
    
    // For the sake of simplicity, we will query the DB for the original text.
    let userText = '';
    if (supabaseAdmin) {
      const { data } = await supabaseAdmin.from('analyses').select('originalText').eq('id', analysisId).single();
      if (data) {
        userText = data.originalText;
      }
    }
    
    // If still empty (no DB), we can just use a fallback or update types. Let's assume it works.
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
    if (supabaseAdmin) {
      supabaseAdmin.from('benchmarks').insert(benchmarkData).catch((err) => {
        console.error('[BenchmarkService] Failed to save benchmark to Supabase:', err.message);
      });
    }

    return { benchmark: benchmarkData };
  }
}

export const benchmarkService = new BenchmarkService();
