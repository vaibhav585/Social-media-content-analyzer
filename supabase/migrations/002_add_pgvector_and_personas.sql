-- =============================================================================
-- ContentPulse — Persona & Embeddings Schema (RAG Tone-Matching)
-- Enables pgvector and creates tables for storing user brand personas
-- and their associated vector embeddings for retrieval-augmented generation.
-- =============================================================================

-- Enable the vector extension (requires Supabase to have pgvector enabled)
CREATE EXTENSION IF NOT EXISTS vector;

-- ── User Personas ────────────────────────────────────────────────────────────
-- Each user can create multiple "brand voices" (e.g., "Sarcastic Twitter", "Professional LinkedIn")

CREATE TABLE IF NOT EXISTS public.personas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Persona Embeddings ───────────────────────────────────────────────────────
-- Stores chunked text from the user's past posts along with their vector embeddings.
-- We use 768 dimensions to match Google's text-embedding-004 output.

CREATE TABLE IF NOT EXISTS public.persona_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID REFERENCES public.personas(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    embedding vector(768),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Similarity Search Function ───────────────────────────────────────────────
-- Performs cosine similarity search to find the most relevant past posts
-- for a given query embedding vector.

CREATE OR REPLACE FUNCTION match_persona_embeddings(
    query_embedding vector(768),
    match_persona_id UUID,
    match_threshold FLOAT DEFAULT 0.5,
    match_count INT DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    persona_id UUID,
    content TEXT,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        pe.id,
        pe.persona_id,
        pe.content,
        1 - (pe.embedding <=> query_embedding) AS similarity
    FROM public.persona_embeddings pe
    WHERE pe.persona_id = match_persona_id
      AND 1 - (pe.embedding <=> query_embedding) > match_threshold
    ORDER BY pe.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- ── Row-Level Security ───────────────────────────────────────────────────────

ALTER TABLE public.personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.persona_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own personas"
    ON public.personas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own personas"
    ON public.personas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own personas"
    ON public.personas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own personas"
    ON public.personas FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own persona embeddings"
    ON public.persona_embeddings FOR SELECT
    USING (persona_id IN (SELECT id FROM public.personas WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert own persona embeddings"
    ON public.persona_embeddings FOR INSERT
    WITH CHECK (persona_id IN (SELECT id FROM public.personas WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete own persona embeddings"
    ON public.persona_embeddings FOR DELETE
    USING (persona_id IN (SELECT id FROM public.personas WHERE user_id = auth.uid()));

-- ── Indexes ──────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_personas_user_id ON public.personas(user_id);
CREATE INDEX IF NOT EXISTS idx_persona_embeddings_persona_id ON public.persona_embeddings(persona_id);

-- Use IVFFlat index for fast approximate nearest neighbor search on embeddings
-- (Only create after inserting some rows; Supabase handles this automatically)
-- CREATE INDEX IF NOT EXISTS idx_persona_embeddings_vector ON public.persona_embeddings
--     USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
