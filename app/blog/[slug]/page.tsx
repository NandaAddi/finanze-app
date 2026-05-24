import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { BlogPost } from '@/lib/types/admin';
import { ChevronLeft, Calendar, Clock, BookOpen, Share2, ArrowRight } from 'lucide-react';
import { cache } from 'react';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

// React cache memoizes database results per-request lifecycle to prevent duplicate database queries
const getPostBySlug = cache(async (slug: string): Promise<BlogPost | null> => {
  const { data } = await supabaseAdmin
    .from('blog_posts')
    .select('id, slug, title, content, excerpt, meta_description, category, read_time, published_at, author, updated_at')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();
  return data ?? null;
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: 'Artikel Tidak Ditemukan — Finanze' };

  const url = `https://finanze.web.id/blog/${post.slug}`;

  return {
    title: `${post.title} — Blog Finanze`,
    description: post.meta_description,
    keywords: [post.category.toLowerCase(), 'pengatur keuangan', 'tips menabung', 'finanze blog'],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: post.title,
      description: post.meta_description,
      url,
      type: 'article',
      publishedTime: post.published_at,
      modifiedTime: post.updated_at || post.published_at,
      authors: [post.author],
      images: [
        {
          url: 'https://finanze.web.id/og-image.png',
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.meta_description,
      images: ['https://finanze.web.id/og-image.png'],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  return (
    <div className="min-h-screen bg-[#040404] text-[#f5f5f5] selection:bg-emerald-500/30 selection:text-emerald-300 relative overflow-hidden flex flex-col justify-between font-sans">

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": post.title,
            "description": post.meta_description,
            "datePublished": post.published_at,
            "dateModified": post.updated_at || post.published_at,
            "author": { "@type": "Person", "name": post.author },
            "publisher": {
              "@type": "Organization",
              "name": "Finanze",
              "logo": { "@type": "ImageObject", "url": "https://finanze.web.id/apple-icon.png" }
            },
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `https://finanze.web.id/blog/${post.slug}`
            }
          })
        }}
      />

      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-950/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-950/5 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-[#1a1a1a]/30 bg-[#040404]/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/blog" className="flex items-center gap-1 text-xs text-[#888] hover:text-white transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" /> Kembali ke Blog
          </Link>
          <Link href="/sign-in" className="px-4 py-1.5 text-xs font-medium text-[#040404] bg-[#f5f5f5] hover:bg-[#e0e0e0] rounded-full transition-all duration-200">
            Coba Aplikasi
          </Link>
        </div>
      </header>

      <main className="flex-grow max-w-3xl mx-auto px-6 py-16 w-full relative z-10">

        {/* Article Meta */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/30 border border-emerald-500/10 text-[10px] text-emerald-400 font-semibold font-mono">
              {post.category}
            </span>
            <span className="text-[10px] text-[#555] flex items-center gap-1 font-mono">
              <Clock className="w-3 h-3" />{post.read_time}
            </span>
          </div>

          <h1 className="font-lora text-3xl sm:text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center justify-between border-y border-[#161616] py-3.5 text-xs text-[#666] font-mono">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>Diterbitkan: {new Date(post.published_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
              <span>&bull;</span>
              <span>Oleh: {post.author}</span>
            </div>
            <div className="flex items-center gap-1 hover:text-white cursor-pointer transition-colors">
              <Share2 className="w-3.5 h-3.5" /><span>Bagikan</span>
            </div>
          </div>
        </div>

        {/* Article Content Body */}
        <article className="mb-16 animate-fade-in-up stagger-1 space-y-0">
          {post.content.split('\n\n').map((paragraph, index) => {
            const trimmed = paragraph.trim();
            if (!trimmed) return null;

            if (trimmed.startsWith('### ')) {
              return (
                <h3 key={index} className="font-lora text-xl font-bold text-white mt-8 mb-4">
                  {trimmed.replace('### ', '')}
                </h3>
              );
            }
            if (trimmed.startsWith('## ')) {
              return (
                <h2 key={index} className="font-lora text-2xl font-bold text-white mt-10 mb-4 border-b border-[#161616] pb-2">
                  {trimmed.replace('## ', '')}
                </h2>
              );
            }
            if (trimmed.startsWith('* ')) {
              return (
                <ul key={index} className="list-disc pl-5 space-y-2 my-4 text-sm text-[#888] leading-relaxed">
                  {trimmed.split('\n').filter(l => l.startsWith('* ')).map((bullet, bIdx) => (
                    <li key={bIdx} dangerouslySetInnerHTML={{
                      __html: bullet.replace('* ', '').replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                    }} />
                  ))}
                </ul>
              );
            }

            return (
              <p
                key={index}
                className="text-sm sm:text-base text-[#888] leading-relaxed mb-6 font-sans"
                dangerouslySetInnerHTML={{
                  __html: trimmed.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                }}
              />
            );
          })}
        </article>

        {/* CTA */}
        <div className="p-8 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-[#080808] to-emerald-950/5 relative overflow-hidden text-center shadow-md animate-fade-in-up stagger-2">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/20 border border-emerald-500/10 text-[10px] text-emerald-400 mb-4 font-mono">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Mulai Atur Uang Anda Sekarang</span>
          </div>
          <h3 className="font-lora text-lg sm:text-xl font-bold text-white mb-2">
            Ingin Mempraktikkan Tips di Atas?
          </h3>
          <p className="text-xs text-[#666] max-w-md mx-auto mb-6 leading-relaxed">
            Daftarkan diri Anda di Finanze secara gratis dan nikmati pencatatan keuangan minimalis instan bebas iklan!
          </p>
          <Link href="/sign-up" className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-[#f5f5f5] hover:bg-[#e0e0e0] text-[#040404] font-semibold rounded-full transition-all duration-200 text-xs">
            Coba Finanze Gratis <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>

      <footer className="border-t border-[#1a1a1a]/40 bg-[#040404]/40 py-8 relative z-10">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
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
