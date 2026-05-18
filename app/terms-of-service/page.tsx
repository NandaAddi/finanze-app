import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Scale, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Syarat & Ketentuan — Finanze',
  description: 'Syarat dan Ketentuan Layanan Finanze SaaS. Penafian Nasihat Keuangan OJK, ketentuan pembayaran, dan aturan akun.',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Premium Header */}
      <header className="h-16 border-b border-border/10 sticky top-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-between px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
              <Scale className="w-5 h-5" />
            </div>
            <span className="font-serif-display font-semibold text-lg tracking-tight group-hover:opacity-80 transition-opacity">Finanze</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="rounded-xl text-xs" asChild>
            <Link href="/dashboard" className="flex items-center gap-2">
              Ke Dasbor <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-6 py-12 lg:py-20 space-y-12 animate-fade-in">
        {/* Title Block */}
        <div className="space-y-4 border-b border-border/50 pb-8">
          <h1 className="text-3xl md:text-5xl font-serif-display font-medium tracking-tight leading-tight">
            Syarat & Ketentuan Layanan
          </h1>
          <p className="text-sm text-muted-foreground">
            Terakhir Diperbarui: 18 Mei 2026 • Versi 1.0 (Disclaimer OJK & SaaS Billing Enforced)
          </p>
        </div>

        {/* CRITICAL DISCLAIMER WARNING CALLOUT */}
        <div className="glass p-6 rounded-2xl border border-rose-500/30 bg-rose-500/5 text-sm leading-relaxed space-y-3">
          <div className="flex items-center gap-2 text-rose-500 font-bold">
            <ShieldAlert className="w-5 h-5" />
            <span>⚠️ PENAFIAN HUKUM PENTING: BUKAN NASIHAT KEUANGAN</span>
          </div>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Finanze adalah platform aplikasi SaaS pencatatan keuangan pribadi mandiri. <strong>Finanze tidak beroperasi sebagai penasihat keuangan, agen investasi, penasihat perpajakan, atau konsultan hukum berlisensi di bawah Otoritas Jasa Keuangan (OJK)</strong> atau badan hukum keuangan lainnya.
          </p>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Seluruh analisis, tips menabung, ringkasan saldo, infografis, atau respons dari fitur <strong>AI Advisor</strong> adalah murni bersifat informatif dan edukatif. Kami tidak menjamin keuntungan atau menjamin kebalnya sistem dari risiko inflasi. Pengguna bertanggung jawab penuh atas segala tindakan, keputusan investasi, atau risiko keuangan yang diambil berdasarkan informasi di dalam platform.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8 text-sm md:text-base leading-relaxed text-muted-foreground">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl md:text-2xl font-serif-display font-medium text-foreground">
              Pasal 1: Ketentuan Pembuatan & Keamanan Akun
            </h2>
            <p>
              Dengan mendaftar dan menggunakan platform Finanze, Anda menyatakan dan menjamin bahwa:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Anda berusia minimal 18 tahun atau telah dianggap dewasa menurut hukum negara Anda.</li>
              <li>Seluruh data otentikasi pendaftaran yang diproses via Clerk adalah benar, akurat, dan milik Anda pribadi secara sah.</li>
              <li>Anda bertanggung jawab menjaga kerahasiaan kredensial akun login Anda dari penyalahgunaan pihak lain.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl md:text-2xl font-serif-display font-medium text-foreground">
              Pasal 2: Batasan Tanggung Jawab Keamanan & Performa
            </h2>
            <p>
              Finanze disediakan dengan basis "sebagaimana adanya" (*as is*) dan "sebagaimana tersedia" (*as available*). Dalam batasan hukum tertinggi yang berlaku, Kami tidak bertanggung jawab atas:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Segala bentuk kerugian finansial, kegagalan bisnis, kebangkrutan pribadi, atau kerugian material lainnya dari keputusan finansial yang Anda buat.</li>
              <li>Gangguan sistem, delay server, kegagalan integrasi API (seperti Clerk, Supabase, Vercel, Alibaba DashScope), atau downtime tidak terduga di luar kendali teknis developer.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl md:text-2xl font-serif-display font-medium text-foreground">
              Pasal 3: Larangan Penggunaan & Integritas Platform
            </h2>
            <p>
              Anda berkomitmen penuh dan tunduk hukum untuk tidak melakukan hal-hal berikut selama menggunakan platform:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Menggunakan Finanze untuk memfasilitasi tindak pidana pencucian uang (*money laundering*), penggelapan dana, atau penipuan finansial.</li>
              <li>Melakukan serangan penolakan layanan (DDoS), eksploitasi celah keamanan database, brute-forcing API, atau penetrasi server ilegal.</li>
              <li>Menyimpan konten ilegal, gambar bermuatan pornografi/kekerasan di bagian avatar profil atau bukti struk transaksi.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl md:text-2xl font-serif-display font-medium text-foreground">
              Pasal 4: Ketentuan Berlangganan & Pembatalan (SaaS Billing)
            </h2>
            <p>
              1.  <strong className="text-foreground">SaaS Tier Premium:</strong> Beberapa fitur pencatatan tingkat lanjut dan AI Advisor premium memerlukan keanggotaan berbayar.
            </p>
            <p>
              2.  <strong className="text-foreground">Kebijakan Pengembalian (Refund):</strong> Seluruh pembayaran langganan bulanan maupun tahunan yang telah berhasil ditarik oleh platform adalah **bersifat final dan tidak dapat dikembalikan (non-refundable)**.
            </p>
            <p>
              3.  <strong className="text-foreground">Penangguhan Akun:</strong> Kami berhak menangguhkan (suspend) atau menghapus akun yang terbukti melanggar Syarat & Ketentuan Layanan ini secara sepihak tanpa ganti rugi apa pun.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl md:text-2xl font-serif-display font-medium text-foreground">
              Pasal 5: Perubahan Ketentuan Layanan
            </h2>
            <p>
              Kami berhak memodifikasi, memperbarui, atau merombak Syarat & Ketentuan ini kapan saja. Setiap perubahan akan Kami publikasikan langsung di halaman ini dengan memperbarui tanggal "Terakhir Diperbarui" di atas. Penggunaan platform secara terus-menerus setelah pembaruan dinyatakan sebagai persetujuan eksplisit Anda atas perubahan tersebut.
            </p>
          </section>

        </div>

        {/* Footer Area */}
        <footer className="border-t border-border/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} Finanze. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/privacy-policy" className="hover:underline">Kebijakan Privasi</Link>
            <Link href="/dashboard" className="hover:underline">Kembali ke Dasbor</Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
