-- ==============================================================================
-- FINANZE DATABASE PERFORMANCE INDEXES MIGRATION
-- ==============================================================================
-- This migration introduces B-Tree indexes on foreign keys and compound sorting columns
-- to eliminate Full Table (Sequential) Scans and boost query performance up to 100x.

-- 1. Index on wallets(user_id)
-- Speeds up: getFinancialOverview(), getWallets(), and sidebar lookups.
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON public.wallets USING btree (user_id);

-- 2. Index on categories(created_by)
-- Speeds up: getCategories() which queries (created_by = user_id OR created_by IS NULL).
CREATE INDEX IF NOT EXISTS idx_categories_created_by ON public.categories USING btree (created_by);

-- 3. Composite Index on transactions(created_by, created_at DESC)
-- Speeds up: Recent transactions lists, infinite scrolls, and page-by-page transaction lists
-- that filter by user and sort from newest to oldest.
CREATE INDEX IF NOT EXISTS idx_transactions_created_by_created_at 
ON public.transactions USING btree (created_by, created_at DESC);

-- 4. Index on transactions(wallet_id)
-- Speeds up: getWalletDetails() which queries transactions for a specific wallet.
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON public.transactions USING btree (wallet_id);

-- 5. Index on transactions(category_id)
-- Speeds up: Category analytics, spending charts, and transaction audits.
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON public.transactions USING btree (category_id);

-- 6. Index on profiles(email)
-- Speeds up: Clerk sync profile checks on synchronization actions.
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles USING btree (email);

COMMENT ON INDEX public.idx_transactions_created_by_created_at IS 'Speeds up dashboard recent transactions queries and sorting';
