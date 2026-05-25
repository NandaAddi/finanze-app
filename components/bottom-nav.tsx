'use client';

import React, { useState } from 'react';
import { useMounted } from '@/hooks/use-mounted';
import { Home, Wallet, Plus, Receipt, MessageSquare, Camera, PenLine, BarChart3, ArrowRight, BrainCircuit, Zap } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const mounted = useMounted();

  const navItems = [
    { icon: Home, label: 'Beranda', href: '/dashboard' },
    { icon: Receipt, label: 'Riwayat', href: '/dashboard/transactions' },
    { icon: Plus, label: 'Tambah', isPlus: true },
    { icon: BarChart3, label: 'Analitik', href: '/dashboard/analytics' },
    { icon: Wallet, label: 'Dompet', href: '/dashboard/wallets' },
  ];

  const quickActions = [
    { 
      icon: MessageSquare, 
      label: 'Chat AI', 
      description: 'Asisten finansial cerdas Anda 24/7',
      onClick: () => router.push('/dashboard/chat'),
      iconColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      hoverGlow: 'hover:bg-emerald-500/[0.04] hover:border-emerald-500/20'
    },
    { 
      icon: Camera, 
      label: 'Scan Struk', 
      description: 'Ekstrak transaksi instan dari struk belanja',
      onClick: () => router.push('/dashboard/scan'),
      iconColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-400/20',
      hoverGlow: 'hover:bg-cyan-500/[0.04] hover:border-cyan-500/20'
    },
    { 
      icon: BrainCircuit, 
      label: 'AI Advisor', 
      description: 'Analisis & rekomendasi keuangan otomatis',
      onClick: () => router.push('/dashboard/ai-advisor'),
      iconColor: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
      hoverGlow: 'hover:bg-teal-500/[0.04] hover:border-teal-500/20'
    },
    { 
      icon: PenLine, 
      label: 'Tambah Manual', 
      description: 'Catat transaksi Anda secara cepat & mandiri',
      onClick: () => router.push('/dashboard/transactions/add'),
      iconColor: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      hoverGlow: 'hover:bg-emerald-500/[0.04] hover:border-emerald-500/20'
    },
  ];

  if (!mounted) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-[100] block md:hidden w-full">
        <div className="h-20 bg-background/80 backdrop-blur-xl border-t border-border/50" />
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] block md:hidden w-full">
      {/* Dialog Pop-up for Quick Actions */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[420px] w-[92%] sm:w-full rounded-[28px] bg-[#030705]/95 border border-emerald-500/15 p-6 backdrop-blur-xl shadow-[0_25px_60px_rgba(0,0,0,0.7),0_0_40px_rgba(16,185,129,0.05)] overflow-hidden">
          
          {/* Subtle glow ambient background rings */}
          <div className="absolute w-[200px] h-[200px] rounded-full bg-emerald-500/[0.02] blur-3xl -z-10 pointer-events-none -top-10 -left-10" />
          <div className="absolute w-[180px] h-[180px] rounded-full bg-cyan-500/[0.02] blur-2xl -z-10 pointer-events-none -bottom-10 -right-10" />

          <DialogHeader className="space-y-2 text-center pb-4 border-b border-emerald-500/5">
            <div className="flex justify-center mb-1">
              <div className="w-11 h-11 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-lg">
                <Zap className="w-5 h-5 text-emerald-400 animate-pulse" />
              </div>
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Aksi Cepat Finanze
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground/75 font-medium leading-relaxed max-w-[280px] sm:max-w-none mx-auto">
              Pilih metode pencatatan atau analisis keuangan cerdas dengan bantuan AI
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2 mt-4">
            {quickActions.map((action, i) => (
              <button
                key={i}
                onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-4 p-3.5 sm:p-4 rounded-2xl transition-all duration-200 text-left group active:scale-[0.98] border border-transparent",
                  action.hoverGlow
                )}
              >
                {/* Icon Container with subtle gradient border */}
                <div className={cn(
                  "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300 group-hover:scale-105",
                  action.iconColor
                )}>
                  <action.icon className="w-5.5 h-5.5" />
                </div>
                
                {/* Text metadata */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm sm:text-base font-bold text-foreground group-hover:text-emerald-400 transition-colors duration-200">
                    {action.label}
                  </h4>
                  <p className="text-xs text-muted-foreground/70 group-hover:text-muted-foreground/90 transition-colors duration-200 mt-1 truncate leading-relaxed">
                    {action.description}
                  </p>
                </div>

                {/* ArrowRight indicators for premium hover feedback */}
                <ArrowRight className="w-4 h-4 text-muted-foreground/30 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-emerald-400 transition-all duration-300 shrink-0" />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Main Bottom Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-background/80 backdrop-blur-xl border-t border-border/50 flex items-center justify-around px-2 pb-2 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        {navItems.map((item, i) => {
          if (item.isPlus) {
            return (
              <div key={i} className="relative -mt-10">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  aria-label={isOpen ? "Tutup menu aksi" : "Buka menu aksi cepat"}
                  className={cn(
                    "w-16 h-16 rounded-[22px] flex items-center justify-center text-white shadow-[0_15px_30px_rgba(16,185,129,0.25)] active:scale-95 transition-all duration-500 relative overflow-hidden group",
                    isOpen 
                      ? "bg-card border border-border/50 rotate-[135deg]" 
                      : "bg-emerald-500 rotate-0"
                  )}
                >
                  <Plus className={cn(
                    "w-8 h-8 transition-transform duration-500",
                    isOpen ? "text-rose-500" : "text-white"
                  )} />
                </button>
              </div>
            );
          }

          const isActive = pathname === item.href && !isOpen;
          return (
            <Link
              key={i}
              href={item.href ?? '/dashboard'}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 transition-all px-2 sm:px-4 py-3 rounded-2xl min-w-[60px] sm:min-w-[70px] active:bg-white/5",
                isActive ? "text-emerald-500" : "text-muted-foreground opacity-40"
              )}
            >
              <item.icon className={cn("w-5 h-5 transition-transform", isActive && "scale-110")} />
              <span className={cn("text-[9px] font-semibold tracking-tight transition-all", isActive ? "opacity-100" : "opacity-0")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
