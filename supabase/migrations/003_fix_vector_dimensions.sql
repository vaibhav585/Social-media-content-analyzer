-- =================================================================================
-- FIX DIMENSIONS FOR GEMINI EMBEDDING 001
-- Your specific API key requires models that output 3072 dimensions instead of 768.
-- Run this in the Supabase SQL Editor to update the table and search function.
-- =================================================================================

-- 1. Alter the existing table to accept 3072 dimensions
ALTER TABLE public.persona_embeddings 
  ALTER COLUMN embedding TYPE vector(3072);

-- 2. Drop the old function
DROP FUNCTION IF EXISTS match_persona_embeddings;

-- 3. Create the updated function that accepts 3072 dimensions
CREATE OR REPLACE FUNCTION match_persona_embeddings(
    query_embedding vector(3072),
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
