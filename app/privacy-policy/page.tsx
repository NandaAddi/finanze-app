import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Kebijakan Privasi — Finanze',
  description: 'Kebijakan Privasi dan Pelindungan Data Pribadi Finanze SaaS sesuai dengan UU PDP Indonesia dan GDPR.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Premium Header */}
      <header className="h-16 border-b border-border/10 sticky top-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-between px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
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
            Kebijakan Privasi Finanze
          </h1>
          <p className="text-sm text-muted-foreground">
            Terakhir Diperbarui: 18 Mei 2026 • Versi 1.0 (UU PDP & GDPR Compliant)
          </p>
        </div>

        {/* Intro Alert */}
        <div className="glass p-6 rounded-2xl border border-primary/20 bg-primary/5 text-sm leading-relaxed space-y-2">
          <p className="font-bold text-foreground">💡 Pelindungan Data Pribadi Anda Adalah Prioritas Utama Kami</p>
          <p className="text-muted-foreground text-xs">
            Sesuai dengan <strong>Undang-Undang No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP)</strong> di Indonesia, Finanze berkomitmen penuh untuk menjaga keamanan, kerahasiaan, dan kedaulatan data finansial sensitif Anda secara mutlak.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8 text-sm md:text-base leading-relaxed text-muted-foreground">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl md:text-2xl font-serif-display font-medium text-foreground">
              Pasal 1: Data Pribadi yang Kami Kumpulkan
            </h2>
            <p>
              Untuk menyediakan layanan dasbor keuangan dan pencatatan yang responsif, Kami mengumpulkan data berikut:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>
                <strong className="text-foreground">Data Identitas & Otentikasi:</strong> Nama lengkap, alamat email, dan foto profil Anda yang diproses secara aman melalui sub-mitra otentikasi pihak ketiga Kami yaitu <strong className="text-foreground">Clerk</strong>.
              </li>
              <li>
                <strong className="text-foreground">Data Transaksi & Finansial:</strong> Catatan transaksi keuangan, nominal, kategori, nama akun dompet, dan log aktivitas yang Anda simpan ke dalam basis data Kami yaitu <strong className="text-foreground">Supabase</strong>.
              </li>
              <li>
                <strong className="text-foreground">Gambar Struk Belanja:</strong> Foto bukti bayar kuitansi yang Anda unggah secara sukarela untuk dipindai otomatis oleh AI.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl md:text-2xl font-serif-display font-medium text-foreground">
              Pasal 2: Tujuan & Dasar Hukum Pemrosesan Data
            </h2>
            <p>
              Pemrosesan Data Pribadi Anda hanya dilakukan berdasarkan persetujuan eksplisit Anda dan kebutuhan pemenuhan kontrak layanan, dengan tujuan:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Menyajikan dasbor visual analitik saldo, grafik pemasukan, dan grafik pengeluaran Anda.</li>
              <li>Memproses foto struk belanja menggunakan teknologi AI API (<strong className="text-foreground">Alibaba Cloud DashScope</strong>) guna mengekstrak rincian transaksi Anda secara instan.</li>
              <li>Mencegah penyalahgunaan sistem, penipuan, atau pelanggaran keamanan pada platform.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl md:text-2xl font-serif-display font-medium text-foreground">
              Pasal 3: Keterlibatan Sub-Pemroses Data Pihak Ketiga
            </h2>
            <p>
              Dalam menyajikan layanan, Kami bermitra dengan sub-pemroses data pihak ketiga berstandar industri tinggi yang diwajibkan menerapkan enkripsi penuh:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs">
              <div className="glass p-4 rounded-xl border border-border/80">
                <span className="font-bold text-foreground block mb-1">Clerk Inc. (Otentikasi)</span>
                Mengelola gerbang sesi login, metadata profil, dan otentikasi multi-faktor (MFA) secara aman.
              </div>
              <div className="glass p-4 rounded-xl border border-border/80">
                <span className="font-bold text-foreground block mb-1">Supabase Inc. (Database Cloud)</span>
                Menyimpan data dompet, kategori, dan riwayat transaksi keuangan Anda di server database Postgres terenkripsi.
              </div>
              <div className="glass p-4 rounded-xl border border-border/80">
                <span className="font-bold text-foreground block mb-1">Vercel Inc. (Hosting)</span>
                Penyedia infrastruktur serverless hosting serta pengumpulan analitik performa web.
              </div>
              <div className="glass p-4 rounded-xl border border-border/80">
                <span className="font-bold text-foreground block mb-1">Alibaba Cloud API DashScope (AI)</span>
                Memproses interpretasi teks AI Advisor dan ekstraksi struk belanja di tingkat server secara privat.
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl md:text-2xl font-serif-display font-medium text-foreground">
              Pasal 4: Hak-Hak Anda selaku Pemilik Data
            </h2>
            <p>
              Berdasarkan UU PDP Indonesia dan GDPR, Anda memiliki hak-hak mutlak berikut atas data pribadi Anda yang tersimpan di Finanze:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>
                <strong className="text-foreground">Hak Akses:</strong> Berhak mendapatkan salinan data transaksi Anda dari server database Kami kapan saja.
              </li>
              <li>
                <strong className="text-foreground">Hak Koreksi:</strong> Berhak mengubah catatan transaksi, kategori, atau saldo dompet Anda secara langsung tanpa persetujuan manual.
              </li>
              <li>
                <strong className="text-foreground">Hak Hapus Permanen (Right to be Forgotten):</strong> Anda berhak menghapus akun Anda di halaman Pengaturan. Setelah penghapusan diajukan, seluruh data finansial, data transaksi, dan profil Clerk Anda akan dihapus secara permanen dari server aktif Kami dalam jangka waktu **maksimal 14 hari kerja**.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl md:text-2xl font-serif-display font-medium text-foreground">
              Pasal 5: Hubungi Kami
            </h2>
            <p>
              Jika Anda memiliki pertanyaan mengenai pemrosesan data, keamanan data pribadi, atau ingin mengajukan hak penghapusan data secara tertulis, silakan hubungi Data Protection Officer (DPO) kami di:
            </p>
            <p className="text-primary font-serif-display text-sm mt-2">
              📧 support@finanze.com
            </p>
          </section>

        </div>

        {/* Footer Area */}
        <footer className="border-t border-border/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} Finanze. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/terms-of-service" className="hover:underline">Syarat & Ketentuan</Link>
            <Link href="/dashboard" className="hover:underline">Kembali ke Dasbor</Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
