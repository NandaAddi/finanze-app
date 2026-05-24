-- ============================================================
-- FINANZE ADMIN & CMS MIGRATION
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. BLOG POSTS TABLE
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug        TEXT UNIQUE NOT NULL,
    title       TEXT NOT NULL,
    excerpt     TEXT NOT NULL DEFAULT '',
    content     TEXT NOT NULL DEFAULT '',
    meta_description TEXT NOT NULL DEFAULT '',
    category    TEXT NOT NULL DEFAULT 'Tips Keuangan',
    read_time   TEXT NOT NULL DEFAULT '3 menit baca',
    author      TEXT NOT NULL DEFAULT 'Tim Finanze',
    is_published BOOLEAN NOT NULL DEFAULT false,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast slug lookup on public pages
CREATE INDEX IF NOT EXISTS blog_posts_slug_idx ON public.blog_posts (slug);
CREATE INDEX IF NOT EXISTS blog_posts_published_idx ON public.blog_posts (is_published, published_at DESC);

-- Auto-update updated_at trigger
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
    BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. AI QUERY LOGS TABLE (untuk tracking penggunaan AI Advisor)
CREATE TABLE IF NOT EXISTS public.ai_query_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    query_text  TEXT,
    model_used  TEXT DEFAULT 'gemini',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ai_query_logs_user_idx ON public.ai_query_logs (user_id);
CREATE INDEX IF NOT EXISTS ai_query_logs_created_idx ON public.ai_query_logs (created_at DESC);

-- 3. ROW LEVEL SECURITY
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_query_logs ENABLE ROW LEVEL SECURITY;

-- Public can read published posts only (no auth required)
DROP POLICY IF EXISTS "Public read published blog posts" ON public.blog_posts;
CREATE POLICY "Public read published blog posts"
    ON public.blog_posts FOR SELECT
    USING (is_published = true);

-- Service role (admin client) bypasses RLS automatically via service key
-- ai_query_logs: users can only see their own
DROP POLICY IF EXISTS "Users read own ai logs" ON public.ai_query_logs;
CREATE POLICY "Users read own ai logs"
    ON public.ai_query_logs FOR SELECT
    USING (user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub');

DROP POLICY IF EXISTS "Users insert own ai logs" ON public.ai_query_logs;
CREATE POLICY "Users insert own ai logs"
    ON public.ai_query_logs FOR INSERT
    WITH CHECK (user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub');

-- 4. SEED SAMPLE BLOG POSTS (migrated from static lib/blog-data.ts)
INSERT INTO public.blog_posts (slug, title, excerpt, meta_description, category, read_time, is_published, content, published_at)
VALUES
(
    'cara-mengatur-keuangan-gaji-umr',
    '5 Cara Mengatur Keuangan Pribadi dengan Gaji UMR agar Bisa Menabung',
    'Mengelola keuangan dengan gaji UMR sering dianggap sulit. Simak panduan praktis dan tips cerdas mengatur gaji bulanan agar tetap bisa menabung dan memiliki dana darurat.',
    'Temukan 5 cara praktis mengatur keuangan pribadi dengan gaji UMR di Indonesia. Tips jitu membagi gaji untuk kebutuhan harian, tabungan, dan dana darurat.',
    'Tips Keuangan',
    '4 menit baca',
    true,
    '### 1. Buat Evaluasi Anggaran di Hari Pertama Gajian
Langkah paling krusial adalah tidak menunda pencatatan anggaran. Begitu gaji masuk, segera pisahkan pengeluaran wajib terlebih dahulu.

### 2. Gunakan Metode Pembagian Gaji Sistem Amplop
Bagi sisa uang ke dalam beberapa "amplop" digital untuk mengontrol pengeluaran harian secara ketat.

### 3. Batasi Pengeluaran Gaya Hidup secara Tegas
Kebocoran halus dari gaya hidup seperti kopi susu harian bisa menumpuk menjadi ratusan ribu per bulan.

### 4. Mulai Bangun Dana Darurat (Walau Rp100.000 Sebulan)
Sisihkan di awal begitu gajian diterima. Konsistensi lebih penting dari nominalnya.

### 5. Manfaatkan Aplikasi Pencatat Keuangan Minimalis
Gunakan Finanze untuk mencatat pengeluaran dalam hitungan detik dan visualisasi grafik pengeluaran mingguan.',
    '2026-05-25'
),
(
    'panduan-membagi-gaji-metode-50-30-20',
    'Panduan Membagi Gaji Bulanan dengan Metode 50/30/20 untuk Pemula',
    'Bingung cara membagi gaji bulanan secara adil? Pelajari metode populer 50/30/20 untuk membagi pengeluaran kebutuhan, keinginan, dan tabungan.',
    'Pelajari cara mudah membagi gaji bulanan dengan rumus alokasi anggaran 50/30/20. Panduan praktis bagi pemula.',
    'Perencanaan Finansial',
    '3 menit baca',
    true,
    '### 1. 50% untuk Kebutuhan Pokok (Needs)
Setengah dari pendapatan untuk pengeluaran wajib: sewa/kos, listrik, air, bahan makanan, transportasi kerja.

### 2. 30% untuk Keinginan Pribadi (Wants)
Makan di restoran, nonton bioskop, belanja pakaian, langganan hiburan. Pos ini bersifat opsional.

### 3. 20% untuk Masa Depan & Tabungan (Savings)
Langsung diamankan untuk dana darurat, tabungan tujuan, dan investasi guna melawan inflasi.',
    '2026-05-24'
)
ON CONFLICT (slug) DO NOTHING;
