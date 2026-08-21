import { aiOrchestrator } from './ai/aiOrchestrator';
import { embeddingService } from './ai/embeddingService';
import { supabaseAdmin } from './supabaseService';
import type { RewriteRequest, RewriteResponse, Rewrite, RewriteGoal } from '../types';

export class RewriteService {
  public async rewrite(userId: string, req: RewriteRequest): Promise<RewriteResponse> {
    const { analysisId, text, platform, goal, personaId } = req;

    // ── RAG Tone-Matching: Retrieve relevant examples if a persona is selected ──
    let toneExamples: string[] | undefined;

    if (personaId) {
      try {
        console.log(`[RewriteService] RAG: Retrieving tone examples for persona ${personaId}...`);
        const queryEmbedding = await embeddingService.embedText(text);

        if (supabaseAdmin) {
          const { data, error } = await supabaseAdmin.rpc('match_persona_embeddings', {
            query_embedding: JSON.stringify(queryEmbedding),
            match_persona_id: personaId,
            match_threshold: 0.3,
            match_count: 5,
          });

          if (!error && data && data.length > 0) {
            toneExamples = data.map((match: any) => match.content);
            console.log(`[RewriteService] RAG: Found ${toneExamples.length} tone examples (similarity > 0.3) ✅`);
          } else {
            console.log('[RewriteService] RAG: No matching examples found, proceeding without tone-matching.');
          }
        }
      } catch (ragError: any) {
        console.warn(`[RewriteService] RAG retrieval failed (non-fatal): ${ragError.message}`);
        // Non-fatal: proceed without tone examples
      }
    }

    // Call orchestrator with optional tone examples
    const result = await aiOrchestrator.rewriteContent(text, platform, goal, toneExamples);

    const rewriteData: Rewrite = {
      id: crypto.randomUUID(),
      userId,
      analysisId,
      goal,
      rewrittenText: result.data.rewrittenText,
      improvementNotes: result.data.improvementNotes,
      aiProvider: result.provider,
      createdAt: new Date().toISOString(),
    };

    // Save to DB asynchronously if configured
    if (supabaseAdmin) {
      supabaseAdmin.from('rewrites').insert(rewriteData).catch((err) => {
        console.error('[RewriteService] Failed to save rewrite to Supabase:', err.message);
      });
    }

    // Since RewriteResponse requires `variants` array (per types), wrap the result
    return {
      variants: [
        {
          goal,
          rewrittenText: result.data.rewrittenText,
          improvementNotes: result.data.improvementNotes,
        }
      ]
    };
  }
}

export const rewriteService = new RewriteService();
