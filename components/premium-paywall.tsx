'use client';

import { Crown, Lock, ArrowRight, Star } from 'lucide-react';
import Link from 'next/link';

interface PremiumPaywallProps {
  featureName: string;
  description?: string;
  isInline?: boolean;
}

export function PremiumPaywall({ featureName, description, isInline }: PremiumPaywallProps) {
  // Inline render mode for Dialogs and Drawers to prevent double card nesting and layout cutoff
  if (isInline) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center p-2 sm:p-4 space-y-5">
        {/* Subtle glow rings - Emerald and Cyan */}
        <div className="absolute w-[280px] h-[280px] rounded-full border border-emerald-500/5 bg-emerald-500/[0.01] blur-2xl -z-10 pointer-events-none" />
        
        {/* Icon */}
        <div className="relative animate-bounce shrink-0" style={{ animationDuration: '3s' }}>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 border border-emerald-500/20 flex items-center justify-center shadow-[0_8px_30px_rgba(16,185,129,0.15)]">
            <Crown className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center backdrop-blur-md">
            <Lock className="w-2.5 h-2.5 text-cyan-400" />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-2 shrink-0">
          <h2 className="font-lora text-lg sm:text-xl font-bold bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Fitur Ini Memerlukan Akses Premium
          </h2>
          <p className="text-[11px] sm:text-xs text-muted-foreground/80 leading-relaxed max-w-[290px] mx-auto">
            {description ?? `${featureName} hanya tersedia untuk pengguna Premium. Buka analisis keuangan cerdas tanpa batas, pemindai struk AI instan, dan asisten finansial 24/7.`}
          </p>
        </div>

        {/* Feature list */}
        <div className="w-full max-w-[290px] space-y-2 bg-emerald-500/[0.02] border border-emerald-500/5 rounded-2xl p-3.5 text-left shrink-0">
          {[
            'AI Advisor — Analisis Keuangan Otomatis',
            'Scan Struk AI — Ekstrak Transaksi Instan',
            'Chat AI — Asisten Finansial 24/7',
          ].map((item) => (
            <div key={item} className="flex items-center gap-2.5 text-[11px] text-muted-foreground">
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <Star className="w-1.5 h-1.5 text-emerald-400 fill-emerald-400" />
              </div>
              <span>{item}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="w-full max-w-[290px] space-y-2 shrink-0">
          {/* Primary CTA */}
          <a
            href={`https://wa.me/6281234567890?text=Halo+Admin+Finanze!+Saya+ingin+upgrade+ke+Premium+untuk+mengakses+fitur+${encodeURIComponent(featureName)}.`}
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-5 rounded-full font-bold text-xs transition-all duration-300 relative overflow-hidden group
              bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500
              text-white shadow-[0_4px_25px_rgba(16,185,129,0.3)] hover:shadow-[0_4px_35px_rgba(34,211,238,0.45)] hover:scale-[1.02] active:scale-[0.98]"
          >
            {/* shimmer sweep */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
            <Crown className="w-3.5 h-3.5 text-white" />
            Upgrade Premium — Rp29.000/bln
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </a>

          {/* Secondary */}
          <Link
            href="/dashboard"
            className="w-full flex items-center justify-center text-[10px] text-muted-foreground/60 hover:text-emerald-400 transition-colors py-1.5 font-medium"
          >
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Full page / standalone render mode
  return (
    <div className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
      {/* Blurred background mock */}
      <div className="absolute inset-0 bg-[#020604]/60 backdrop-blur-xl z-0" />

      {/* Subtle glow rings - Emerald and Cyan */}
      <div className="absolute w-[400px] h-[400px] rounded-full border border-emerald-500/5 bg-emerald-500/[0.02] blur-3xl z-0" />
      <div className="absolute w-[250px] h-[250px] rounded-full border border-cyan-500/5 bg-cyan-500/[0.02] blur-2xl z-0" />

      {/* Paywall Card */}
      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        <div className="p-8 rounded-3xl bg-[#030a06]/90 border border-emerald-500/20 shadow-[0_0_60px_rgba(16,185,129,0.08)] relative overflow-hidden backdrop-blur-md">
          
          {/* Shimmer top line - Emerald */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
          {/* Shimmer bottom glow - Cyan */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative animate-bounce" style={{ animationDuration: '3s' }}>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 border border-emerald-500/20 flex items-center justify-center shadow-[0_8px_30px_rgba(16,185,129,0.15)]">
                <Crown className="w-8 h-8 text-emerald-400" />
              </div>
              <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center backdrop-blur-md">
                <Lock className="w-3 h-3 text-cyan-400" />
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="text-center mb-8">
            <h2 className="font-lora text-xl font-bold bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent mb-3">
              Fitur Ini Memerlukan Akses Premium
            </h2>
            <p className="text-xs text-muted-foreground/80 leading-relaxed max-w-[320px] mx-auto">
              {description ?? `${featureName} hanya tersedia untuk pengguna Premium. Buka analisis keuangan cerdas tanpa batas, pemindai struk AI instan, dan asisten finansial 24/7.`}
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-3 mb-8 bg-emerald-500/[0.02] border border-emerald-500/5 rounded-2xl p-4">
            {[
              'AI Advisor — Analisis Keuangan Otomatis',
              'Scan Struk AI — Ekstrak Transaksi Instan',
              'Chat AI — Asisten Finansial 24/7',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <Star className="w-2 h-2 text-emerald-400 fill-emerald-400" />
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
              className="w-full flex items-center justify-center gap-2.5 py-3 px-6 rounded-full font-bold text-sm transition-all duration-300 relative overflow-hidden group
                bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500
                text-white shadow-[0_4px_25px_rgba(16,185,129,0.3)] hover:shadow-[0_4px_35px_rgba(34,211,238,0.45)] hover:scale-[1.02] active:scale-[0.98]"
            >
              {/* shimmer sweep */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
              <Crown className="w-4 h-4 text-white" />
              Upgrade ke Premium — Rp29.000/bln
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </a>

            {/* Secondary */}
            <Link
              href="/dashboard"
              className="w-full flex items-center justify-center text-xs text-muted-foreground/60 hover:text-emerald-400 transition-colors py-2 font-medium"
            >
              Kembali ke Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
