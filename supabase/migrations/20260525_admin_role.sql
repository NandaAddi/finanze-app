-- ============================================================
-- FINANZE ADMIN ROLE MIGRATION
-- Run in Supabase SQL Editor
-- ============================================================

-- 1. Add role column to profiles table if it doesn't exist
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'member'
    CHECK (role IN ('member', 'admin'));

-- 2. Index for quick role lookups
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles (role);
