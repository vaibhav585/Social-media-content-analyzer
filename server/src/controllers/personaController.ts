// =============================================================================
// Persona Controller
// Handles CRUD operations for user brand personas and training them
// with past post data via vector embeddings.
// =============================================================================

import { Response } from 'express';
import { embeddingService } from '../services/ai/embeddingService';
import { getSupabaseAdmin } from '../services/supabaseService';
import { env } from '../config/env';
import type { AuthenticatedRequest } from '../types';

// ============================================================================
// In-Memory Guest Storage (For Demo Mode / Interviewers)
// ============================================================================
interface GuestPersona {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  embeddingCount: number;
  embeddings: { content: string; vector: number[] }[];
}

const guestPersonas: GuestPersona[] = [];

/**
 * GET /api/personas
 * Fetch all personas belonging to the authenticated user.
 */
export async function listPersonas(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    
    // Check if Supabase is configured
    if (env.supabaseUrl.includes('placeholder')) {
      res.json({ success: true, personas: [] });
      return;
    }

    if (userId === 'guest_user') {
      const sanitized = guestPersonas.map(({ embeddings, ...p }) => p);
      res.json({ success: true, personas: sanitized });
      return;
    }

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('personas')
      .select('id, name, description, created_at, updated_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Get embedding counts for each persona
    const personasWithCounts = await Promise.all(
      (data || []).map(async (persona) => {
        const { count } = await supabase
          .from('persona_embeddings')
          .select('id', { count: 'exact', head: true })
          .eq('persona_id', persona.id);
        return { ...persona, embeddingCount: count || 0 };
      })
    );

    res.json({ success: true, personas: personasWithCounts });
  } catch (error: any) {
    console.error('[PersonaController] listPersonas error:', error.message);
    res.status(500).json({ success: false, error: { message: 'Failed to fetch personas.' } });
  }
}

/**
 * POST /api/personas
 * Create a new persona and optionally train it with initial text.
 * Body: { name: string, description?: string, trainingText?: string }
 */
export async function createPersona(req: AuthenticatedRequest, res: Response): Promise<void> {
  console.log('[PersonaController] createPersona hit. req.user:', req.user, 'req.body.name:', req.body.name);
  try {
    const userId = req.user!.id;
    const { name, description, trainingText } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      res.status(400).json({ success: false, error: { message: 'Persona name is required (min 2 characters).' } });
      return;
    }

    if (env.supabaseUrl.includes('placeholder')) {
      res.status(400).json({ success: false, error: { message: 'Database not configured. Cannot save personas.' } });
      return;
    }

    if (userId === 'guest_user') {
      const newPersona: GuestPersona = {
        id: `guest-persona-${Date.now()}`,
        name: name.trim(),
        description: description?.trim() || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        embeddingCount: 0,
        embeddings: [],
      };

      if (trainingText && trainingText.trim().length > 50) {
        const chunks = embeddingService.chunkText(trainingText);
        const vectors = await embeddingService.embedBatch(chunks);
        newPersona.embeddings = chunks.map((content, i) => ({ content, vector: vectors[i] }));
        newPersona.embeddingCount = chunks.length;
      }

      guestPersonas.push(newPersona);
      const { embeddings, ...sanitized } = newPersona;
      res.status(201).json({ success: true, persona: sanitized });
      return;
    }

    const supabase = getSupabaseAdmin();

    // 1. Create the persona record
    const { data: persona, error: insertError } = await supabase
      .from('personas')
      .insert({ user_id: userId, name: name.trim(), description: description?.trim() || null })
      .select()
      .single();

    if (insertError) throw insertError;

    let embeddingCount = 0;

    // 2. If training text is provided, chunk it and generate embeddings
    if (trainingText && trainingText.trim().length > 50) {
      const chunks = embeddingService.chunkText(trainingText);
      console.log(`[PersonaController] Training persona "${name}" with ${chunks.length} chunks...`);

      const embeddings = await embeddingService.embedBatch(chunks);

      // 3. Store each chunk + embedding in the database
      const rows = chunks.map((content, i) => ({
        persona_id: persona.id,
        content,
        embedding: JSON.stringify(embeddings[i]),
      }));

      const { error: embedError } = await supabase
        .from('persona_embeddings')
        .insert(rows);

      if (embedError) {
        console.error('[PersonaController] Failed to store embeddings:', embedError.message);
      } else {
        embeddingCount = chunks.length;
        console.log(`[PersonaController] Stored ${embeddingCount} embeddings for persona "${name}" ✅`);
      }
    }

    res.status(201).json({
      success: true,
      persona: { ...persona, embeddingCount },
    });
  } catch (error: any) {
    console.error('[PersonaController] createPersona error:', error.message);
    res.status(500).json({ success: false, error: { message: 'Failed to create persona.' } });
  }
}

/**
 * DELETE /api/personas/:id
 * Delete a persona and all its associated embeddings (cascade).
 */
export async function deletePersona(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const personaId = req.params.id;

    if (env.supabaseUrl.includes('placeholder')) {
      res.status(400).json({ success: false, error: { message: 'Database not configured.' } });
      return;
    }

    if (userId === 'guest_user') {
      const index = guestPersonas.findIndex(p => p.id === personaId);
      if (index > -1) {
        guestPersonas.splice(index, 1);
        res.json({ success: true, message: 'Persona deleted.' });
      } else {
        res.status(404).json({ success: false, error: { message: 'Persona not found.' } });
      }
      return;
    }

    const supabase = getSupabaseAdmin();

    // Verify ownership
    const { data: persona } = await supabase
      .from('personas')
      .select('id')
      .eq('id', personaId)
      .eq('user_id', userId)
      .single();

    if (!persona) {
      res.status(404).json({ success: false, error: { message: 'Persona not found.' } });
      return;
    }

    const { error } = await supabase.from('personas').delete().eq('id', personaId);
    if (error) throw error;

    res.json({ success: true, message: 'Persona deleted.' });
  } catch (error: any) {
    console.error('[PersonaController] deletePersona error:', error.message);
    res.status(500).json({ success: false, error: { message: 'Failed to delete persona.' } });
  }
}

/**
 * POST /api/personas/:id/query
 * Retrieve the most relevant past posts from a persona for a given query text.
 * This is the core RAG retrieval endpoint.
 * Body: { queryText: string, matchCount?: number }
 */
export async function queryPersona(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const personaId = req.params.id;
    const { queryText, matchCount = 5 } = req.body;

    if (!queryText || queryText.trim().length < 10) {
      res.status(400).json({ success: false, error: { message: 'queryText must be at least 10 characters.' } });
      return;
    }

    // Generate embedding for the query
    const queryEmbedding = await embeddingService.embedText(queryText);

    if (userId === 'guest_user' || env.supabaseUrl.includes('placeholder')) {
      // Mock cosine similarity search for guest mode
      const persona = guestPersonas.find(p => p.id === personaId);
      if (!persona) {
        res.json({ success: true, matches: [] });
        return;
      }
      
      // Calculate cosine similarity manually
      const matches = persona.embeddings.map(e => {
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < e.vector.length; i++) {
          dotProduct += e.vector[i] * queryEmbedding[i];
          normA += e.vector[i] * e.vector[i];
          normB += queryEmbedding[i] * queryEmbedding[i];
        }
        const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
        return {
          id: `match-${Date.now()}-${Math.random()}`,
          persona_id: persona.id,
          content: e.content,
          similarity
        };
      });
      
      // Sort and limit
      matches.sort((a, b) => b.similarity - a.similarity);
      res.json({ success: true, matches: matches.slice(0, matchCount) });
      return;
    }

    const supabase = getSupabaseAdmin();

    // Call the cosine similarity search function
    const { data, error } = await supabase.rpc('match_persona_embeddings', {
      query_embedding: JSON.stringify(queryEmbedding),
      match_persona_id: personaId,
      match_threshold: 0.3,
      match_count: matchCount,
    });

    if (error) throw error;

    res.json({ success: true, matches: data || [] });
  } catch (error: any) {
    console.error('[PersonaController] queryPersona error:', error.message);
    res.status(500).json({ success: false, error: { message: 'Failed to query persona.' } });
  }
}
