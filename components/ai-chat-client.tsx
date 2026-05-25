'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { MessageSquare, Send, Loader2, Bot, Lock, ArrowRight, ArrowLeft, Wallet } from 'lucide-react';
import { parseAndCreateTransactions } from '@/app/actions/ai-chat';
import { getWallets } from '@/app/actions/finance';
import { useUser } from '@/components/user-provider';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export function AIChatClient() {
  const { user } = useUser();
  const router = useRouter();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [wallets, setWallets] = useState<any[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState('');
  const [history, setHistory] = useState<{role: 'user' | 'ai', content: string, data?: any}[]>([]);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.id) {
      (async () => {
        try {
          const data = await getWallets();
          setWallets(data);
          if (data.length > 0 && !selectedWalletId) setSelectedWalletId(data[0].id);
        } catch (err) {
          console.error('Failed to fetch wallets:', err);
        }
      })();
    }
  }, [user?.id, selectedWalletId]);

  // Scroll to bottom of the chat container ONLY
  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: history.length <= 1 ? 'auto' : 'smooth'
      });
    }
  }, [history, loading]);

  const handleSend = async () => {
    if (!input.trim() || !user?.id || !selectedWalletId) return;

    const userMsg = input;
    setInput('');
    setHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const result = await parseAndCreateTransactions(userMsg, selectedWalletId);
      
      if (result.success) {
        setHistory(prev => [...prev, { 
          role: 'ai', 
          content: `Berhasil mencatat ${result.count} transaksi keuangan Anda secara otomatis ke sistem!`,
          data: result.data
        }]);
        toast.success(`Berhasil menambahkan ${result.count} transaksi`);
      } else if (result.error === 'PREMIUM_REQUIRED') {
        setHistory(prev => [...prev, { 
          role: 'ai', 
          content: '🔒 PREMIUM_REQUIRED'
        }]);
      } else {
        throw new Error(result.error || 'Gagal memproses permintaan');
      }
    } catch (error: any) {
      setHistory(prev => [...prev, { role: 'ai', content: `Maaf, asisten gagal memproses teks tersebut: ${error.message}` }]);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getFormattedTime = () => {
    return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-full max-w-4xl mx-auto h-[calc(100dvh-17rem)] md:h-[calc(100dvh-11rem)] flex flex-col bg-[#0b0f0c] border border-emerald-950 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative gpu">
      {/* 🟢 WHATSAPP-STYLE solid HEADER */}
      <div className="px-4 py-3 border-b border-emerald-950 flex items-center justify-between bg-[#121c15] shrink-0 z-10">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.push('/dashboard')}
            className="rounded-full hover:bg-emerald-950 border border-emerald-950 text-emerald-400 hover:text-emerald-300 h-9 w-9"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          
          {/* AI Avatar with Glowing Online Status indicator */}
          <div className="flex items-center gap-2.5">
            <div className="relative h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center border border-emerald-400/20 shadow-md">
              <Bot className="w-5.5 h-5.5 text-white" />
              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-[#121c15] shadow-sm animate-ping" style={{ animationDuration: '2s' }} />
              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-[#121c15] shadow-sm" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-emerald-100 font-sans tracking-wide flex items-center gap-1.5">
                Finanze AI Advisor
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase animate-pulse">
                Online
              </span>
            </div>
          </div>
        </div>
        
        {/* Sleek Minimal Wallet Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          {wallets.length > 0 ? (
            <Select value={selectedWalletId} onValueChange={setSelectedWalletId}>
              <SelectTrigger className="h-8 bg-[#18221c] border-emerald-950 text-xs w-[110px] sm:w-[130px] rounded-full hover:border-emerald-800 transition-colors shadow-inner text-emerald-300">
                <SelectValue placeholder="Pilih dompet..." />
              </SelectTrigger>
              <SelectContent className="bg-[#0b0f0c] border-emerald-950 text-emerald-200">
                {wallets.map(w => (
                  <SelectItem key={w.id} value={w.id} className="text-xs hover:bg-emerald-950 focus:bg-emerald-950">{w.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="h-8 w-[110px] sm:w-[130px] bg-emerald-950/40 border border-emerald-950 rounded-full animate-pulse" />
          )}
        </div>
      </div>

      {/* 💬 WHATSAPP-STYLE CHAT BG & MESSAGES CONTAINER */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 py-5 space-y-4 custom-scrollbar bg-[#080d0a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0b1610]/40 via-transparent to-transparent"
      >
        {history.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-80 my-auto py-12">
            <div className="w-14 h-14 rounded-full bg-emerald-950/50 flex items-center justify-center border border-emerald-900/30">
              <MessageSquare className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-bold text-emerald-400">Mulai Chat Finanze AI</p>
              <p className="text-xs text-muted-foreground/80 max-w-[280px] mx-auto leading-relaxed">
                Tulis transaksi belanja Anda secara alami seperti mengobrol biasa:<br />
                <span className="inline-block mt-2 px-2.5 py-1 bg-emerald-950/60 border border-emerald-900/20 rounded-lg text-emerald-400 font-mono text-[11px]">
                  "beli pertamax motor 50rb"
                </span>
                <br />
                <span className="inline-block mt-1 px-2.5 py-1 bg-cyan-950/60 border border-cyan-900/20 rounded-lg text-cyan-400 font-mono text-[11px]">
                  "komisi proyek web 2.5jt"
                </span>
              </p>
            </div>
          </div>
        )}

        {history.map((msg, i) => (
          <div key={i} className={cn(
            "flex flex-col max-w-[85%] space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-300",
            msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
          )}>
            {msg.content === '🔒 PREMIUM_REQUIRED' ? (
              <div className="px-4.5 py-4 rounded-2xl bg-[#121c15] border border-emerald-900/30 rounded-tl-none max-w-[280px] shadow-lg">
                <div className="flex items-center gap-2 mb-1.5">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-400">Premium Required</span>
                </div>
                <p className="text-xs text-muted-foreground/80 leading-relaxed mb-3.5">AI Advisor hanya tersedia untuk pengguna Premium Finanze.</p>
                <a
                  href="https://wa.me/6281234567890?text=Halo+Admin!+Saya+ingin+upgrade+ke+Premium+Finanze+untuk+mengakses+AI+Chat"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-transform active:scale-[0.98]"
                >
                  Daftar Premium <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            ) : (
              <div className={cn(
                "px-4 py-2.5 rounded-2xl text-[14px] sm:text-[15px] leading-relaxed shadow-sm relative",
                msg.role === 'user' 
                  ? "bg-[#113824] text-emerald-50 rounded-tr-none border border-emerald-800/10" 
                  : "bg-[#18221c] text-emerald-100 rounded-tl-none border border-emerald-950/20"
              )}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <div className="flex items-center justify-end gap-1 mt-1 text-[9px] select-none text-muted-foreground/60">
                  <span>{getFormattedTime()}</span>
                  {msg.role === 'user' && (
                    <span className="text-emerald-400 font-bold">✓✓</span>
                  )}
                </div>
              </div>
            )}
            
            {msg.data && (
              <div className="w-full space-y-2 mt-1.5">
                {msg.data.map((item: any, idx: number) => (
                  <div key={idx} className="bg-[#0f1b14] border border-emerald-900/20 rounded-xl p-3 flex items-center justify-between text-xs animate-in zoom-in-95 shadow-inner">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-emerald-400">{item.description}</span>
                      <span className="text-[9px] text-muted-foreground font-mono">{item.categoryName} • {item.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}</span>
                    </div>
                    <span className={cn(
                      "font-bold font-mono text-xs sm:text-sm",
                      item.type === 'INCOME' ? "text-cyan-400" : "text-emerald-400"
                    )}>
                      {item.type === 'INCOME' ? '+' : '-'} Rp {item.amount.toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {loading && (
          <div className="flex items-center gap-2.5 mr-auto bg-[#18221c] border border-emerald-950/20 px-4 py-2.5 rounded-2xl rounded-tl-none animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            <span className="text-xs text-muted-foreground">Sedang mengetik...</span>
          </div>
        )}
      </div>

      {/* 🚀 WHATSAPP PILL INPUT & FLOATING SEND BUTTON */}
      <div className="p-3 sm:p-4 bg-[#121c15] border-t border-emerald-950 shrink-0">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex items-center gap-2 max-w-2xl mx-auto"
        >
          <div className="flex-1 relative">
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ketik pesan..."
              className="w-full h-11 pl-5 pr-5 bg-[#18221c] border border-emerald-950 rounded-full focus-visible:ring-emerald-500/20 text-sm sm:text-base text-emerald-100 placeholder:text-muted-foreground/30 shadow-inner"
              disabled={loading}
            />
          </div>
          <Button 
            type="submit"
            size="icon"
            disabled={loading || !input.trim()}
            className="h-11 w-11 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-md active:scale-95 shrink-0 transition-transform"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4.5 h-4.5 ml-0.5" />}
          </Button>
        </form>
      </div>
    </div>
  );
}
