-- ============================================================
-- FINANZE PREMIUM TIER MIGRATION
-- Run in Supabase SQL Editor
-- ============================================================

-- 1. Add tier columns to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS tier TEXT NOT NULL DEFAULT 'free'
    CHECK (tier IN ('free', 'premium')),
  ADD COLUMN IF NOT EXISTS premium_until TIMESTAMPTZ;

-- 2. Index for quick tier lookups
CREATE INDEX IF NOT EXISTS profiles_tier_idx ON public.profiles (tier);

-- 3. RLS policy: users can read only their own tier status
-- (admin client bypasses RLS via service key)
DROP POLICY IF EXISTS "Users read own tier" ON public.profiles;
CREATE POLICY "Users read own tier"
  ON public.profiles FOR SELECT
  USING (id = current_setting('request.jwt.claims', true)::jsonb->>'sub');
