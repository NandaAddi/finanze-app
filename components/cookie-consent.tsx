'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Cookie } from 'lucide-react';

export function CookieConsent() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if the user has already set their cookie preference
    const consent = localStorage.getItem('finanze_cookie_consent');
    if (!consent) {
      // Soft entrance delay for a premium user experience
      const timer = setTimeout(() => setIsOpen(true), 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('finanze_cookie_consent', 'accepted_all');
    setIsOpen(false);
  };

  const handleDeclineTracking = () => {
    localStorage.setItem('finanze_cookie_consent', 'essential_only');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-md z-[100] animate-fade-in-up">
      <div className="glass-strong p-6 rounded-2xl border border-border/80 shadow-2xl space-y-4">
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
            <Cookie className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground">Persetujuan Cookies 🍪</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Kami menggunakan cookie esensial demi keamanan login, serta cookie analitik opsional untuk memahami performa aplikasi kami agar Finanze terus menyajikan pengalaman terbaik.
            </p>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button 
            variant="ghost" 
            className="text-xs h-9 rounded-xl hover:bg-muted/50" 
            onClick={handleDeclineTracking}
          >
            Hanya Esensial
          </Button>
          <Button 
            className="text-xs h-9 rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={handleAcceptAll}
          >
            Setujui Semua
          </Button>
        </div>
      </div>
    </div>
  );
}
