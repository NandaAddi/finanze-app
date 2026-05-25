import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { unstable_cache } from 'next/cache';
import LandingClientWrapper from '@/components/landing-client-wrapper';

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

  // Fetch cached blog posts instantly on server side
  const latestPosts = await getCachedLatestPosts();

  return (
    <>
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

      {/* Render the Premium Animated UI on the client side */}
      <LandingClientWrapper latestPosts={latestPosts} />
    </>
  );
}
