-- =============================================================================
-- Social Media Content Analyzer — Initial Database Schema
-- Run this in Supabase SQL Editor to set up all tables, RLS, and indexes.
-- =============================================================================

-- ── Profiles (mirrors auth.users) ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Analyses ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

    -- Input
    original_text TEXT NOT NULL,
    file_name TEXT,
    file_type VARCHAR(20),
    file_url TEXT,
    platform VARCHAR(20),

    -- AI Analysis Results
    engagement_score INTEGER CHECK (engagement_score BETWEEN 0 AND 100),
    breakdown JSONB NOT NULL DEFAULT '{}',
    sentiment VARCHAR(20),
    suggestions JSONB DEFAULT '[]',
    platform_tips JSONB DEFAULT '{}',
    visual_analysis JSONB DEFAULT '{}',

    -- Metadata
    ai_provider VARCHAR(30),
    processing_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Rewrites ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.rewrites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID REFERENCES public.analyses(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

    goal VARCHAR(50) NOT NULL,
    rewritten_text TEXT NOT NULL,
    improvement_notes TEXT,

    ai_provider VARCHAR(30),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Benchmarks ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.benchmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    user_analysis_id UUID REFERENCES public.analyses(id) ON DELETE CASCADE,

    competitor_text TEXT NOT NULL,
    competitor_score INTEGER,
    comparison JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Row-Level Security ───────────────────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewrites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benchmarks ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Analyses
CREATE POLICY "Users can view own analyses"
    ON public.analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analyses"
    ON public.analyses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own analyses"
    ON public.analyses FOR DELETE USING (auth.uid() = user_id);

-- Rewrites
CREATE POLICY "Users can view own rewrites"
    ON public.rewrites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own rewrites"
    ON public.rewrites FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Benchmarks
CREATE POLICY "Users can view own benchmarks"
    ON public.benchmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own benchmarks"
    ON public.benchmarks FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ── Indexes ──────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON public.analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON public.analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_platform ON public.analyses(platform);
CREATE INDEX IF NOT EXISTS idx_rewrites_analysis_id ON public.rewrites(analysis_id);
CREATE INDEX IF NOT EXISTS idx_benchmarks_user_id ON public.benchmarks(user_id);
