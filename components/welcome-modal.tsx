'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function WelcomeModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('finanze_welcome_seen');
    if (!hasSeenWelcome) {
      const timer = setTimeout(() => setOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('finanze_welcome_seen', 'true');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[360px] p-8 border-none bg-card rounded-[2rem] shadow-2xl">
        <div className="flex flex-col items-center text-center space-y-6">
           <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-emerald-500/10 shadow-lg">
              <Image 
                src="/profil%20pengembang/profile-pengembang.webp" 
                alt="Muhammad Naufal Igall" 
                fill
                className="object-cover"
              />
           </div>
           
           <div className="space-y-2">
             <h2 className="text-2xl font-bold tracking-tight">Selamat Datang</h2>
             <p className="text-xs text-muted-foreground font-medium">dari Muhammad Naufal Igall</p>
           </div>

           <p className="text-sm text-muted-foreground leading-relaxed">
             "Terima kasih telah menggunakan <span className="text-foreground font-bold">Finanze</span>. Semoga aplikasi ini membantu Anda mengelola keuangan dengan lebih baik."
           </p>
           
           <Button 
             onClick={handleDismiss}
             className="w-full bg-foreground text-background hover:opacity-90 rounded-2xl h-12 font-bold transition-all active:scale-95"
           >
              Mulai Sekarang
           </Button>

           <p className="text-[10px] text-muted-foreground opacity-50">
             Versi 1.0 • Track Money Effortlessly
           </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
