-- ==============================================================================
-- FINANZE SUPABASE SCHEMA SETUP SCRIPT (CLERK COMPATIBLE)
-- ==============================================================================

-- 1. Membersihkan Constraint Lama
ALTER TABLE IF EXISTS public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 2. Membuat Enum Types
DO $$ BEGIN
    CREATE TYPE "TransactionType" AS ENUM ('INCOME', 'EXPENSE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Membuat Tabel-Tabel
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    banner_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wallets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    slug TEXT UNIQUE NOT NULL,
    balance DOUBLE PRECISION NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'IDR',
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_by TEXT REFERENCES public.profiles(id),
    updated_by TEXT REFERENCES public.profiles(id),
    public_share_token TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT,
    color TEXT,
    wallet_id TEXT NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    created_by TEXT REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY,
    amount DOUBLE PRECISION NOT NULL,
    type "TransactionType" NOT NULL DEFAULT 'EXPENSE',
    description TEXT,
    category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    wallet_id TEXT NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
    created_by TEXT REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.activity_logs (
    id TEXT PRIMARY KEY,
    wallet_id TEXT NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_wallets_updated_at ON public.wallets;
CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON public.wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_transactions_updated_at ON public.transactions;
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Row Level Security (RLS) - Disable for SaaS logic
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.wallets DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.activity_logs DISABLE ROW LEVEL SECURITY;

-- 6. Database Functions (RPC) - ATOMIC UPDATES
CREATE OR REPLACE FUNCTION public.adjust_wallet_balance(
    p_wallet_id TEXT,
    p_amount DOUBLE PRECISION
)
RETURNS VOID AS $$
BEGIN
    UPDATE public.wallets
    SET balance = balance + p_amount
    WHERE id = p_wallet_id;
END;
$$ LANGUAGE plpgsql;

-- 7. Cleanup OLD triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
