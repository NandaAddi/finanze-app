import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { unstable_cache } from 'next/cache';
import {
  ArrowRight,
  Shield,
  Wallet,
  Sparkles,
  BarChart3,
  ChevronRight,
  CheckCircle2,
  TrendingUp,
  PiggyBank,
  Cpu,
  Layers,
  BookOpen,
  Clock,
  Calendar
} from 'lucide-react';

// Cache database query for 1 hour to optimize TTFB
const getCachedLatestPosts = unstable_cache(
  async () => {
    const { data } = await supabaseAdmin
      .from('blog_posts')
      .select('id, slug, title, excerpt, category, read_time, published_at, author')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(3);
    return data ?? [];
  },
  ['latest-blog-posts'],
  { revalidate: 3600, tags: ['blog'] }
);

export default async function Home() {
  const { userId } = await auth();

  // Redirect to dashboard if user is already signed in
  if (userId) {
    redirect('/dashboard');
  }

  // Fetch cached blog posts instantly
  const latestPosts = await getCachedLatestPosts();

  return (
    <div className="min-h-screen bg-[#040404] text-[#f5f5f5] selection:bg-emerald-500/30 selection:text-emerald-300 relative overflow-hidden flex flex-col justify-between font-sans">

      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "SoftwareApplication",
                "name": "Finanze",
                "operatingSystem": "All",
                "applicationCategory": "FinanceApplication",
                "description": "Minimalist Personal Finance Management for Individuals. Track your money effortlessly with AI-powered insights.",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "IDR"
                }
              },
              {
                "@type": "FAQPage",
                "mainEntity": [
                  {
                    "@type": "Question",
                    "name": "Apakah Finanze benar-benar gratis dan bebas iklan?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Ya, Finanze 100% gratis untuk seluruh fitur pencatatan dan pengelolaan keuangan utama Anda. Kami berkomitmen penuh untuk menjaga antarmuka yang bersih dan bebas iklan selamanya."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Bagaimana Finanze menjaga keamanan data keuangan saya?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Keamanan data Anda adalah prioritas utama kami. Finanze mengintegrasikan Clerk Authentication untuk melindungi akun Anda secara berlapis dan PostgreSQL Supabase untuk enkripsi data transaksi Anda secara aman."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Apa fungsi dari fitur AI Advisor di Finanze?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "AI Advisor bertindak sebagai perencana keuangan pribadi cerdas Anda yang menganalisis tren pemasukan dan pengeluaran untuk menyajikan tips penghematan taktis secara otomatis."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Apakah saya bisa melacak lebih dari satu jenis dompet?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Tentu saja! Fitur Multi-Wallet kami memungkinkan Anda memisahkan pencatatan saldo berdasarkan jenis dompet riil Anda (seperti Tunai, Bank BCA/Mandiri, E-Wallet, hingga Investasi)."
                    }
                  }
                ]
              }
            ]
          })
        }}
      />

      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-emerald-950/10 blur-[150px] pointer-events-none animate-pulse duration-10000 transform-gpu" />
      <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-rose-950/5 blur-[120px] pointer-events-none transform-gpu" />
      <div className="absolute bottom-[-10%] left-[10%] w-[40%] h-[40%] rounded-full bg-blue-950/5 blur-[130px] pointer-events-none animate-float transform-gpu" />

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111111_1px,transparent_1px),linear-gradient(to_bottom,#111111_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      {/* Header */}
      <header className="border-b border-[#1a1a1a]/30 bg-[#040404]/60 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-lora text-2xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 via-emerald-200 to-emerald-400 bg-clip-text text-transparent">
              Finanze
            </span>
          </div>

          <nav className="flex items-center gap-6">
            <Link
              href="/blog"
              className="text-xs sm:text-sm font-medium text-[#a0a0a0] hover:text-[#f5f5f5] transition-colors"
            >
              Blog
            </Link>
            <Link
              href="/sign-in"
              className="text-xs sm:text-sm font-medium text-[#a0a0a0] hover:text-[#f5f5f5] transition-colors"
            >
              Masuk
            </Link>
            <Link
              href="/sign-up"
              className="px-4 py-1.5 text-xs sm:text-sm font-medium text-[#040404] bg-[#f5f5f5] hover:bg-[#e0e0e0] rounded-full transition-all duration-200 shadow-sm"
            >
              Mulai Gratis
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center py-16 sm:py-24 relative z-10">
        <div className="max-w-6xl mx-auto px-6 text-center w-full">



          {/* Headline */}
          <h1 className="font-lora text-4xl sm:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1] max-w-4xl mx-auto">
            Kuasai Finansial Anda Tanpa <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-400 via-emerald-100 to-emerald-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              Distraksi & Iklan
            </span>
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-lg text-[#888888] max-w-2xl mx-auto mb-10 leading-relaxed font-sans">
            Finanze membantu Anda melacak pendapatan, pengeluaran, dan berbagai dompet finansial
            dalam satu tempat. Didukung oleh asisten AI pintar untuk panduan finansial personal.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link
              href="/sign-up"
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-[#040404] font-semibold rounded-full transition-all duration-200 shadow-[0_4px_25px_rgba(16,185,129,0.15)] flex items-center justify-center gap-2 group text-sm"
            >
              Mulai Secara Gratis
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/sign-in"
              className="w-full sm:w-auto px-8 py-3.5 bg-[#0a0a0a] border border-[#161616] hover:bg-[#111111] hover:border-[#222222] text-[#f5f5f5] font-medium rounded-full transition-all duration-200 flex items-center justify-center gap-2 text-sm"
            >
              Buka Dashboard
              <ChevronRight className="w-4 h-4 text-[#666]" />
            </Link>
          </div>

          {/* Interactive UI Mockup Dashboard */}
          <div className="w-full max-w-5xl mx-auto mb-24 rounded-2xl border border-[#1a1a1a] bg-[#080808]/90 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative group/mockup animate-fade-in-up">

            {/* Window bar */}
            <div className="h-10 border-b border-[#161616] bg-[#0a0a0a] px-4 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#ef4444]/20 group-hover/mockup:bg-[#ef4444] transition-colors" />
                <span className="w-3 h-3 rounded-full bg-[#eab308]/20 group-hover/mockup:bg-[#eab308] transition-colors" />
                <span className="w-3 h-3 rounded-full bg-[#22c55e]/20 group-hover/mockup:bg-[#22c55e] transition-colors" />
              </div>
              <div className="text-[10px] sm:text-xs text-[#555] font-mono">finanze.web.id/dashboard</div>
              <div className="w-14" />
            </div>

            {/* Simulated UI layout */}
            <div className="grid grid-cols-1 md:grid-cols-4 min-h-[400px] text-left">

              {/* Sidebar */}
              <div className="border-r border-[#161616] bg-[#060606] p-4 hidden md:flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="font-lora text-emerald-400 font-bold px-2 text-lg">Finanze</div>
                  <nav className="space-y-1">
                    <div className="px-3 py-2 rounded-lg bg-emerald-950/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                      <Layers className="w-4 h-4" /> Ikhtisar
                    </div>
                    <div className="px-3 py-2 rounded-lg text-[#666] text-xs font-medium flex items-center gap-2 hover:text-[#aaa] transition-colors">
                      <Wallet className="w-4 h-4" /> Dompet
                    </div>
                    <div className="px-3 py-2 rounded-lg text-[#666] text-xs font-medium flex items-center gap-2 hover:text-[#aaa] transition-colors">
                      <BarChart3 className="w-4 h-4" /> Analisis
                    </div>
                    <div className="px-3 py-2 rounded-lg text-[#666] text-xs font-medium flex items-center gap-2 hover:text-[#aaa] transition-colors">
                      <Sparkles className="w-4 h-4" /> AI Advisor
                    </div>
                  </nav>
                </div>
                <div className="p-2 border-t border-[#161616] flex items-center gap-2 text-xs text-[#444]">
                  <Shield className="w-3.5 h-3.5" /> Secure Session
                </div>
              </div>

              {/* Main content Area */}
              <div className="md:col-span-3 p-6 bg-[#080808] space-y-6 flex flex-col justify-between">

                {/* Upper stats row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                  {/* Balance Widget */}
                  <div className="p-4 rounded-xl border border-[#161616] bg-[#0a0a0a]">
                    <div className="text-[10px] text-[#666] font-medium mb-1">TOTAL KEKAYAAN</div>
                    <div className="font-lora text-lg font-bold text-white">Rp24.850.000</div>
                    <div className="text-[9px] text-emerald-400 flex items-center gap-1 mt-1 font-mono">
                      <TrendingUp className="w-3 h-3" /> +12.4% bln ini
                    </div>
                  </div>

                  {/* Income Widget */}
                  <div className="p-4 rounded-xl border border-[#161616] bg-[#0a0a0a]">
                    <div className="text-[10px] text-[#666] font-medium mb-1">TOTAL PEMASUKAN</div>
                    <div className="font-lora text-lg font-bold text-emerald-400">Rp15.200.000</div>
                    <div className="text-[9px] text-[#555] mt-1">Bulan Mei 2026</div>
                  </div>

                  {/* Expense Widget */}
                  <div className="p-4 rounded-xl border border-[#161616] bg-[#0a0a0a]">
                    <div className="text-[10px] text-[#666] font-medium mb-1">TOTAL PENGELUARAN</div>
                    <div className="font-lora text-lg font-bold text-rose-500">Rp4.350.000</div>
                    <div className="text-[9px] text-emerald-400 mt-1 font-mono">28.6% dari anggaran</div>
                  </div>

                </div>

                {/* Bottom detail row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                  {/* Transaction list preview */}
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-[#888] tracking-wider uppercase">Transaksi Terakhir</div>
                    <div className="space-y-2">
                      <div className="p-2.5 rounded-lg border border-[#161616] bg-[#0a0a0a] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <div className="text-[11px] font-semibold">Gaji Bulanan Utama</div>
                        </div>
                        <div className="text-[11px] font-mono text-emerald-400">+Rp15.000.000</div>
                      </div>
                      <div className="p-2.5 rounded-lg border border-[#161616] bg-[#0a0a0a] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                          <div className="text-[11px] font-semibold">Kopi Starbucks</div>
                        </div>
                        <div className="text-[11px] font-mono text-rose-500">-Rp55.000</div>
                      </div>
                      <div className="p-2.5 rounded-lg border border-[#161616] bg-[#0a0a0a] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                          <div className="text-[11px] font-semibold">Sewa Apartemen</div>
                        </div>
                        <div className="text-[11px] font-mono text-rose-500">-Rp3.500.000</div>
                      </div>
                    </div>
                  </div>

                  {/* AI Insight preview */}
                  <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-950/5 flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] text-purple-400 font-semibold mb-2">
                      <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                      <span>Rekomendasi Cerdas AI Advisor</span>
                    </div>
                    <p className="text-xs text-[#888] leading-relaxed mb-4">
                      "Pengeluaran gaya hidup Anda meningkat 12% minggu ini. Anda dapat menghemat sekitar **Rp150.000** jika membatasi pembelian kopi instan."
                    </p>
                    <div className="text-[10px] text-[#666] flex items-center justify-between border-t border-[#1a1a1a] pt-2.5">
                      <span>Akurasi Model AI: 98%</span>
                      <span className="text-purple-400 cursor-pointer hover:underline flex items-center">Pelajari Selengkapnya &rarr;</span>
                    </div>
                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* Deep Feature Grid */}
          <div className="my-24">
            <h2 className="font-lora text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
              Dirancang untuk Kecepatan & Kontrol Penuh
            </h2>
            <p className="text-[#666] max-w-2xl mx-auto mb-16 text-sm sm:text-base">
              Nikmati fitur-fitur premium yang mengutamakan privasi dan kegunaan maksimal untuk mengatur uang Anda.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">

              {/* Feature 1 */}
              <div className="p-8 rounded-2xl bg-[#080808] border border-[#161616] hover:border-[#22c55e]/20 transition-all duration-300 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6 group-hover:bg-emerald-500/20 transition-colors">
                  <Wallet className="w-6 h-6" />
                </div>
                <h3 className="font-lora text-xl font-bold text-white mb-3">Multi-Dompet Fleksibel</h3>
                <p className="text-sm text-[#777] leading-relaxed">
                  Kelola uang tunai, tabungan bank, dompet digital, kartu kredit, hingga investasi crypto dalam satu tempat terpusat.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-8 rounded-2xl bg-[#080808] border border-[#161616] hover:border-purple-500/20 transition-all duration-300 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-purple-500/5 blur-2xl pointer-events-none" />
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6 group-hover:bg-purple-500/20 transition-colors">
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="font-lora text-xl font-bold text-white mb-3">Kecerdasan Buatan (AI)</h3>
                <p className="text-sm text-[#777] leading-relaxed">
                  Terima analisis mendalam otomatis mengenai pengeluaran Anda. AI kami mendeteksi kebiasaan boros dan memberi saran realistis.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-8 rounded-2xl bg-[#080808] border border-[#161616] hover:border-blue-500/20 transition-all duration-300 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-blue-500/5 blur-2xl pointer-events-none" />
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6 group-hover:bg-blue-500/20 transition-colors">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="font-lora text-xl font-bold text-white mb-3">Analisis Grafik Elegan</h3>
                <p className="text-sm text-[#777] leading-relaxed">
                  Grafik interaktif yang memudahkan Anda memantau ke mana aliran kas Anda pergi tanpa perlu membaca ribuan baris excel.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-8 rounded-2xl bg-[#080808] border border-[#161616] hover:border-amber-500/20 transition-all duration-300 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-amber-500/5 blur-2xl pointer-events-none" />
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-6 group-hover:bg-amber-500/20 transition-colors">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="font-lora text-xl font-bold text-white mb-3">Keamanan Ekstra Aman</h3>
                <p className="text-sm text-[#777] leading-relaxed">
                  Kami mengintegrasikan Clerk Authentication dan enkripsi database PostgreSQL Supabase untuk memastikan privasi finansial Anda terlindungi.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="p-8 rounded-2xl bg-[#080808] border border-[#161616] hover:border-rose-500/20 transition-all duration-300 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-rose-500/5 blur-2xl pointer-events-none" />
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 mb-6 group-hover:bg-rose-500/20 transition-colors">
                  <PiggyBank className="w-6 h-6" />
                </div>
                <h3 className="font-lora text-xl font-bold text-white mb-3">Pencatat Keuangan Cepat</h3>
                <p className="text-sm text-[#777] leading-relaxed">
                  Hanya butuh 3 detik untuk mencatat pengeluaran Anda. Dirancang khusus agar pencatatan tidak terasa seperti pekerjaan rumah yang berat.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="p-8 rounded-2xl bg-[#080808] border border-[#161616] hover:border-[#bbb]/20 transition-all duration-300 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-neutral-500/5 blur-2xl pointer-events-none" />
                <div className="w-12 h-12 rounded-xl bg-neutral-500/10 flex items-center justify-center text-[#ddd] mb-6 group-hover:bg-neutral-500/20 transition-colors">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-lora text-xl font-bold text-white mb-3">Bebas Iklan Selamanya</h3>
                <p className="text-sm text-[#777] leading-relaxed">
                  Kami tidak menyajikan iklan yang mengganggu kenyamanan. Pengalaman mencatat yang 100% fokus pada kesehatan dompet Anda.
                </p>
              </div>

            </div>
          </div>

          {/* Latest Blog Posts Section */}
          {latestPosts && latestPosts.length > 0 && (
            <div className="my-24 w-full">
              <div className="text-center mb-16 max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0a0a0a] border border-[#161616] text-xs text-emerald-400 mb-6 font-mono">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Edu-Finansial Hub</span>
                </div>
                <h2 className="font-lora text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
                  Artikel & Tips Keuangan Terbaru
                </h2>
                <p className="text-xs sm:text-sm text-[#666] leading-relaxed">
                  Pelajari rahasia mengatur anggaran bulanan, berinvestasi dengan cerdas, dan mencapai kebebasan finansial dari tim perencana keuangan kami.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-5xl mx-auto">
                {latestPosts.map((post) => (
                  <article
                    key={post.id}
                    className="p-6 rounded-2xl bg-[#080808]/90 border border-[#161616] hover:border-emerald-500/20 transition-all duration-300 flex flex-col justify-between group cursor-pointer relative"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/30 border border-emerald-500/10 text-[10px] text-emerald-400 font-semibold font-mono">
                          {post.category}
                        </span>
                        <span className="text-[10px] text-[#555] flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" />{post.read_time}
                        </span>
                      </div>
                      <Link href={`/blog/${post.slug}`}>
                        <h3 className="font-lora text-lg font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors leading-snug">
                          {post.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-[#777] leading-relaxed mb-6 line-clamp-3">{post.excerpt}</p>
                    </div>
                    <div className="flex items-center justify-between border-t border-[#161616] pt-4 mt-2">
                      <span className="text-[10px] text-[#555] font-mono flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.published_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                      </span>
                      <Link href={`/blog/${post.slug}`} className="text-xs text-emerald-400 group-hover:text-emerald-300 font-medium flex items-center gap-1">
                        Baca <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>

              <div className="text-center mt-12">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full border border-[#161616] hover:border-emerald-500/20 text-xs text-[#888] hover:text-emerald-400 hover:bg-emerald-500/5 transition-all duration-200"
                >
                  Lihat Semua Artikel <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* FAQ Section */}
          <div className="my-24 max-w-3xl mx-auto text-left">
            <h2 className="font-lora text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4 text-center">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="text-[#666] text-center mb-12 text-sm sm:text-base">
              Menjawab rasa penasaran Anda seputar fitur, keamanan, dan fungsionalitas Finanze.
            </p>

            <div className="space-y-4">

              <details className="group border border-[#161616] bg-[#080808] rounded-xl p-6 [&_summary::-webkit-details-marker]:hidden transition-all duration-300 open:border-emerald-500/20">
                <summary className="flex items-center justify-between cursor-pointer focus:outline-none">
                  <h3 className="font-lora text-base sm:text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors">
                    Apakah Finanze benar-benar gratis dan bebas iklan?
                  </h3>
                  <span className="ml-1.5 flex-shrink-0 rounded-full bg-[#111] p-1.5 text-[#666] group-hover:text-white transition-colors group-open:rotate-90 duration-300">
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </summary>
                <p className="mt-4 text-sm text-[#888] leading-relaxed">
                  Ya, Finanze 100% gratis untuk seluruh fitur pencatatan dan pengelolaan keuangan utama Anda. Kami berkomitmen penuh untuk menjaga antarmuka yang bersih dan **bebas iklan selamanya**, sehingga Anda dapat fokus seutuhnya pada kesehatan finansial tanpa ada gangguan visual.
                </p>
              </details>

              <details className="group border border-[#161616] bg-[#080808] rounded-xl p-6 [&_summary::-webkit-details-marker]:hidden transition-all duration-300 open:border-emerald-500/20">
                <summary className="flex items-center justify-between cursor-pointer focus:outline-none">
                  <h3 className="font-lora text-base sm:text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors">
                    Bagaimana Finanze menjaga keamanan data keuangan saya?
                  </h3>
                  <span className="ml-1.5 flex-shrink-0 rounded-full bg-[#111] p-1.5 text-[#666] group-hover:text-white transition-colors group-open:rotate-90 duration-300">
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </summary>
                <p className="mt-4 text-sm text-[#888] leading-relaxed">
                  Keamanan data Anda adalah prioritas utama kami. Finanze mengintegrasikan **Clerk Authentication** untuk melindungi akun Anda secara berlapis. Semua data transaksi Anda disimpan dengan aman dan terenkripsi menggunakan **database PostgreSQL di platform Supabase**. Kami tidak memiliki akses langsung untuk mengintip rahasia tabungan Anda.
                </p>
              </details>

              <details className="group border border-[#161616] bg-[#080808] rounded-xl p-6 [&_summary::-webkit-details-marker]:hidden transition-all duration-300 open:border-emerald-500/20">
                <summary className="flex items-center justify-between cursor-pointer focus:outline-none">
                  <h3 className="font-lora text-base sm:text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors">
                    Apa fungsi dari fitur AI Advisor di Finanze?
                  </h3>
                  <span className="ml-1.5 flex-shrink-0 rounded-full bg-[#111] p-1.5 text-[#666] group-hover:text-white transition-colors group-open:rotate-90 duration-300">
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </summary>
                <p className="mt-4 text-sm text-[#888] leading-relaxed">
                  **AI Advisor** bertindak sebagai perencana keuangan pribadi cerdas Anda. Asisten AI ini akan menganalisis tren pemasukan dan pengeluaran dari dompet yang Anda catat, lalu menyajikan saran penghematan taktis secara otomatis (misalnya mendeteksi jika anggaran kopi bulanan Anda naik tidak wajar) tanpa membocorkan privasi Anda ke pihak luar.
                </p>
              </details>

              <details className="group border border-[#161616] bg-[#080808] rounded-xl p-6 [&_summary::-webkit-details-marker]:hidden transition-all duration-300 open:border-emerald-500/20">
                <summary className="flex items-center justify-between cursor-pointer focus:outline-none">
                  <h3 className="font-lora text-base sm:text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors">
                    Apakah saya bisa melacak lebih dari satu jenis dompet?
                  </h3>
                  <span className="ml-1.5 flex-shrink-0 rounded-full bg-[#111] p-1.5 text-[#666] group-hover:text-white transition-colors group-open:rotate-90 duration-300">
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </summary>
                <p className="mt-4 text-sm text-[#888] leading-relaxed">
                  Tentu saja! Fitur **Multi-Wallet** kami memungkinkan Anda memisahkan pencatatan saldo berdasarkan jenis penyimpanan riil Anda—misalnya membuat dompet Dompet Tunai (Cash), Dompet Bank BCA/Mandiri, E-Wallet (GoPay/OVO), hingga dompet investasi terpisah. Semua saldo terakumulasi rapi di dasbor utama.
                </p>
              </details>

            </div>
          </div>

          {/* ── Tim Pengembang ── */}
          <div className="my-24">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0a0a0a] border border-[#161616] text-xs text-[#888] mb-6 font-mono tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Tim Kami
              </div>
              <h2 className="font-lora text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
                Profil Pengembang
              </h2>
              <p className="text-xs sm:text-sm text-[#666] leading-relaxed">
                Finanze dirancang dan dikembangkan secara penuh oleh tim mahasiswa Indonesia yang bersemangat memajukan literasi keuangan digital.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">

              {/* Dev 1 */}
              <div className="group flex flex-col items-center gap-4 p-7 rounded-2xl bg-[#080808] border border-[#161616] hover:border-emerald-500/20 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-950/40 border border-emerald-500/20 flex items-center justify-center text-2xl font-bold text-emerald-400 font-lora shadow-lg shadow-emerald-950/40">
                    N
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <span className="text-[8px] text-emerald-400">✦</span>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="font-lora text-base font-bold text-white mb-1">M. Naufal Igall</h3>
                  <p className="text-[10px] font-mono text-emerald-400/70 tracking-widest uppercase mb-2">Lead Developer</p>
                  <p className="text-[11px] text-[#666] leading-relaxed">Full-stack & sistem autentikasi</p>
                </div>
              </div>

              {/* Dev 2 — Center + Featured */}
              <div className="group flex flex-col items-center gap-4 p-7 rounded-2xl bg-[#080808] border border-indigo-500/15 hover:border-indigo-500/30 transition-all duration-300 relative overflow-hidden shadow-[0_0_30px_rgba(99,102,241,0.05)]">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-indigo-500/5 blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-indigo-950/40 border border-indigo-500/20 flex items-center justify-center text-2xl font-bold text-indigo-400 font-lora shadow-lg shadow-indigo-950/40">
                    D
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                    <span className="text-[8px] text-indigo-400">✦</span>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="font-lora text-base font-bold text-white mb-1">Danish Mirza Y</h3>
                  <p className="text-[10px] font-mono text-indigo-400/70 tracking-widest uppercase mb-2">UI/UX & Frontend</p>
                  <p className="text-[11px] text-[#666] leading-relaxed">Desain antarmuka & pengalaman pengguna</p>
                </div>
              </div>

              {/* Dev 3 */}
              <div className="group flex flex-col items-center gap-4 p-7 rounded-2xl bg-[#080808] border border-[#161616] hover:border-amber-500/20 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-amber-500/5 blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-950/40 border border-amber-500/20 flex items-center justify-center text-2xl font-bold text-amber-400 font-lora shadow-lg shadow-amber-950/40">
                    F
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                    <span className="text-[8px] text-amber-400">✦</span>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="font-lora text-base font-bold text-white mb-1">M. Faiz Jatmiko</h3>
                  <p className="text-[10px] font-mono text-amber-400/70 tracking-widest uppercase mb-2">Backend & Database</p>
                  <p className="text-[11px] text-[#666] leading-relaxed">Arsitektur data & logika bisnis</p>
                </div>
              </div>

            </div>

            {/* Tagline bawah */}
            <p className="text-center text-[11px] text-[#444] font-mono mt-10 tracking-wider">
              🇮🇩 &nbsp; Dibuat dengan sepenuh hati di Indonesia
            </p>
          </div>

          {/* CTA Footer Block */}
          <div className="my-24 p-8 sm:p-12 rounded-3xl border border-[#1a1a1a] bg-gradient-to-br from-[#080808] via-[#050505] to-emerald-950/10 relative overflow-hidden max-w-4xl mx-auto text-center shadow-lg">

            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/5 blur-[80px] pointer-events-none" />
            <h2 className="font-lora text-2xl sm:text-4xl font-bold text-white mb-4">
              Siap Mengambil Kendali Atas Uang Anda?
            </h2>
            <p className="text-xs sm:text-sm text-[#888] max-w-lg mx-auto mb-8 leading-relaxed">
              Bergabunglah bersama ribuan pengguna lainnya yang menghemat jutaan rupiah setiap bulan menggunakan asisten pengatur keuangan Finanze.
            </p>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#f5f5f5] hover:bg-[#e0e0e0] text-[#040404] font-semibold rounded-full transition-all duration-200 text-sm shadow-sm"
            >
              Mulai Secara Gratis Sekarang
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1a1a1a]/40 bg-[#040404]/40 py-8 relative z-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#666]">
            &copy; {new Date().getFullYear()} Finanze. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-[#888]">
            <Link href="/privacy-policy" className="hover:text-[#f5f5f5] transition-colors">
              Kebijakan Privasi
            </Link>
            <Link href="/terms-of-service" className="hover:text-[#f5f5f5] transition-colors">
              Syarat & Ketentuan
            </Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
