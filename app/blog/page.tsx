import { Metadata } from 'next';
import Link from 'next/link';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { BlogPost } from '@/lib/types/admin';
import { ChevronLeft, Calendar, Clock, BookOpen, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Blog Finanze — Edukasi & Tips Mengatur Keuangan Pribadi',
  description: 'Temukan artikel menarik seputar cara menabung, mengelola gaji bulanan, investasi, dan wawasan finansial pribadi dari tim perencana keuangan Finanze.',
  keywords: ['tips keuangan', 'cara menabung', 'mengatur gaji bulanan', 'perencanaan keuangan', 'finanze blog'],
};

async function getPublishedPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  if (error) return [];
  return data ?? [];
}

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <div className="min-h-screen bg-[#040404] text-[#f5f5f5] selection:bg-emerald-500/30 selection:text-emerald-300 relative overflow-hidden flex flex-col justify-between font-sans">
      
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-950/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-950/5 blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111111_1px,transparent_1px),linear-gradient(to_bottom,#111111_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      {/* Header */}
      <header className="border-b border-[#1a1a1a]/30 bg-[#040404]/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-1 text-xs text-[#888] hover:text-white transition-colors">
              <ChevronLeft className="w-3.5 h-3.5" /> Kembali
            </Link>
            <span className="text-[#333]">|</span>
            <Link href="/" className="font-lora text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-emerald-200 bg-clip-text text-transparent">
              Finanze Blog
            </Link>
          </div>
          <Link href="/sign-in" className="px-4 py-1.5 text-xs font-medium text-[#040404] bg-[#f5f5f5] hover:bg-[#e0e0e0] rounded-full transition-all duration-200">
            Buka Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-4xl mx-auto px-6 py-16 w-full relative z-10">
        <div className="text-center mb-16 max-w-2xl mx-auto animate-fade-in">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0a0a0a] border border-[#161616] text-xs text-emerald-400 mb-6 font-mono">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Edu-Finansial Hub</span>
          </div>
          <h1 className="font-lora text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Edukasi & Wawasan Finansial
          </h1>
          <p className="text-xs sm:text-sm text-[#888] leading-relaxed">
            Kumpulan tips praktis untuk merapikan anggaran bulanan, menghemat dana, dan mempercepat kebebasan finansial Anda.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20 text-[#555]">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-sm">Belum ada artikel yang diterbitkan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in-up stagger-1">
            {posts.map((post) => (
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
                    <span className="text-[10px] text-[#555] flex items-center gap-1">
                      <Clock className="w-3 h-3" />{post.read_time}
                    </span>
                  </div>
                  <Link href={`/blog/${post.slug}`}>
                    <h2 className="font-lora text-lg sm:text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors leading-snug">
                      {post.title}
                    </h2>
                  </Link>
                  <p className="text-xs text-[#777] leading-relaxed mb-6">{post.excerpt}</p>
                </div>
                <div className="flex items-center justify-between border-t border-[#161616] pt-4 mt-2">
                  <div className="flex items-center gap-2 text-[10px] text-[#555]">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(post.published_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    <span>&bull;</span>
                    <span>Oleh {post.author}</span>
                  </div>
                  <Link href={`/blog/${post.slug}`} className="text-xs text-emerald-400 group-hover:text-emerald-300 font-medium flex items-center gap-1">
                    Baca Selengkapnya <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-[#1a1a1a]/40 bg-[#040404]/40 py-8 relative z-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#666]">&copy; {new Date().getFullYear()} Finanze. All rights reserved.</p>
          <div className="flex items-center gap-6 text-xs text-[#888]">
            <Link href="/privacy-policy" className="hover:text-[#f5f5f5] transition-colors">Kebijakan Privasi</Link>
            <Link href="/terms-of-service" className="hover:text-[#f5f5f5] transition-colors">Syarat & Ketentuan</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
