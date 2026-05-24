'use client';

import { Sparkles, Lock, ArrowRight, Star } from 'lucide-react';
import Link from 'next/link';

interface PremiumPaywallProps {
  featureName: string;
  description?: string;
}

export function PremiumPaywall({ featureName, description }: PremiumPaywallProps) {
  return (
    <div className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
      {/* Blurred background mock */}
      <div className="absolute inset-0 bg-[#040404] opacity-60 backdrop-blur-xl z-0" />

      {/* Subtle glow rings */}
      <div className="absolute w-[400px] h-[400px] rounded-full border border-indigo-500/10 bg-indigo-500/3 blur-3xl z-0" />
      <div className="absolute w-[250px] h-[250px] rounded-full border border-amber-500/10 bg-amber-500/3 blur-2xl z-0" />

      {/* Paywall Card */}
      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        <div className="p-8 rounded-3xl bg-[#080808]/95 border border-indigo-500/20 shadow-[0_0_60px_rgba(99,102,241,0.08)] relative overflow-hidden">
          
          {/* Shimmer top line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
          {/* Shimmer bottom glow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-amber-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400/20 border border-amber-400/30 flex items-center justify-center">
                <Lock className="w-2.5 h-2.5 text-amber-400" />
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="text-center mb-8">
            <h2 className="font-lora text-xl font-bold text-white mb-3">
              Fitur Ini Memerlukan Akses Premium
            </h2>
            <p className="text-xs text-[#888] leading-relaxed">
              {description ?? `${featureName} hanya tersedia untuk pengguna Premium. Buka analisis keuangan cerdas tanpa batas, pemindai struk AI instan, dan asisten finansial 24/7.`}
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-2.5 mb-8">
            {[
              'AI Advisor — Analisis Keuangan Otomatis',
              'Scan Struk AI — Ekstrak Transaksi Instan',
              'Chat AI — Asisten Finansial 24/7',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2.5 text-xs text-[#888]">
                <div className="w-4 h-4 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                  <Star className="w-2 h-2 text-indigo-400 fill-indigo-400" />
                </div>
                <span>{item}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="space-y-3">
            {/* Primary CTA */}
            <a
              href={`https://wa.me/6281234567890?text=Halo+Admin+Finanze!+Saya+ingin+upgrade+ke+Premium+untuk+mengakses+fitur+${encodeURIComponent(featureName)}.`}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-full font-semibold text-sm transition-all duration-200 relative overflow-hidden group
                bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400
                text-white shadow-[0_4px_20px_rgba(99,102,241,0.25)] hover:shadow-[0_4px_30px_rgba(99,102,241,0.4)]"
            >
              {/* shimmer sweep */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
              <Sparkles className="w-4 h-4" />
              Upgrade ke Premium — Rp29.000/bln
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </a>

            {/* Secondary */}
            <Link
              href="/dashboard"
              className="w-full flex items-center justify-center text-xs text-[#555] hover:text-[#888] transition-colors py-2"
            >
              Kembali ke Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
