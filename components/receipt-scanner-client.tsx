'use client';

import React, { useState, useRef, useEffect } from 'react';
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
import { Camera, Upload, Loader2, Receipt, Plus, Trash2, CheckCircle2, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import { analyzeReceipt } from '@/app/actions/receipt';
import { getFinancialOverview, createTransaction, getCategories } from '@/app/actions/finance';
import { useUser } from '@/components/user-provider';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export function ReceiptScannerClient() {
  const { user } = useUser();
  const router = useRouter();
  const [step, setStep] = useState<'upload' | 'analyzing' | 'review'>('upload');
  const [loading, setLoading] = useState(false);
  const [wallets, setWallets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState('');
  const [reviewTransactions, setReviewTransactions] = useState<any[]>([]);
  
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const fetchOptions = async () => {
    if (!user?.id) return;
    const [overview, categoryData] = await Promise.all([
      getFinancialOverview(),
      getCategories()
    ]);
    setWallets(overview.wallets as any[]);
    if (overview.wallets.length > 0) setSelectedWalletId((overview.wallets[0] as any).id);
    setCategories(categoryData || []);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error(`Ukuran gambar terlalu besar (Max 5MB)`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      processImage(base64String.split(',')[1]);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async (base64: string) => {
    setStep('analyzing');
    setLoading(true);
    try {
      await fetchOptions();
      const result = await analyzeReceipt(base64);
      if (result.success && result.data) {
        setReviewTransactions(result.data.transactions);
        setStep('review');
      } else {
        throw new Error(result.error || 'Gagal menganalisis struk');
      }
    } catch (error: any) {
      toast.error(error.message);
      setStep('upload');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    if (!user?.id || !selectedWalletId) return;
    setLoading(true);
    try {
      await Promise.all(
        reviewTransactions.map((t) => {
          const cat = categories.find((c) => c.name === t.categoryName) || categories[0];
          return createTransaction({
            amount: t.amount,
            type: t.type,
            description: t.description,
            wallet_id: selectedWalletId,
            category_id: cat?.id || categories[0]?.id,
          });
        })
      );
      toast.success('Transaksi berhasil disimpan!');
      router.push('/dashboard/transactions');
    } catch (error: any) {
      toast.error('Gagal menyimpan: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setStep('upload');
    setReviewTransactions([]);
  };

  return (
    <div className="max-w-3xl mx-auto bg-card/60 backdrop-blur-xl border border-border/50 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
      {/* Subtle glow ambient background rings */}
      <div className="absolute w-[300px] h-[300px] rounded-full bg-cyan-500/[0.02] blur-3xl -z-10 pointer-events-none -top-10 -left-10" />
      <div className="absolute w-[280px] h-[280px] rounded-full bg-emerald-500/[0.02] blur-3xl -z-10 pointer-events-none -bottom-10 -right-10" />

      {/* Header */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border/50">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.push('/dashboard')}
          className="rounded-full hover:bg-muted/50 border border-border/10 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-serif-display bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            Receipt Scanner AI
          </h1>
          <p className="text-xs text-muted-foreground leading-normal mt-0.5">
            Foto struk belanja Anda untuk diekstrak secara instan oleh AI pintar Finanze.
          </p>
        </div>
      </div>

      {step === 'upload' && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="md:col-span-3 space-y-4">
            {/* Opsi 1: Kamera */}
            <button 
              onClick={() => cameraInputRef.current?.click()}
              className="w-full flex items-center gap-6 p-6 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all text-left group active:scale-[0.98]"
            >
              <div className="w-14 h-14 rounded-2xl bg-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:rotate-6 transition-transform shrink-0">
                <Camera className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-cyan-400 text-sm sm:text-base">Ambil Foto Struk</h3>
                <p className="text-xs text-cyan-500/70 mt-1">Gunakan kamera untuk memotret secara langsung</p>
              </div>
              <input 
                type="file" ref={cameraInputRef} onChange={handleFileChange} 
                accept="image/*" capture="environment" className="hidden" 
              />
            </button>

            {/* Opsi 2: Galeri */}
            <button 
              onClick={() => galleryInputRef.current?.click()}
              className="w-full flex items-center gap-6 p-6 rounded-3xl bg-muted/50 border border-border/50 hover:bg-muted/80 transition-all text-left group active:scale-[0.98]"
            >
              <div className="w-14 h-14 rounded-2xl bg-card border border-border/50 flex items-center justify-center shadow-sm group-hover:-rotate-6 transition-transform shrink-0">
                <ImageIcon className="w-7 h-7 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base">Unggah Gambar</h3>
                <p className="text-xs text-muted-foreground mt-1">Pilih foto struk dari penyimpanan galeri HP</p>
              </div>
              <input 
                type="file" ref={galleryInputRef} onChange={handleFileChange} 
                accept="image/*" className="hidden" 
              />
            </button>
          </div>

          <div className="md:col-span-2 p-6 bg-muted/30 rounded-3xl border border-border/30 flex flex-col justify-center gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
              <span className="text-xs font-bold text-foreground">Pemrosesan Otomatis</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Teknologi AI Finanze secara cerdas menganalisis nama toko, tanggal, item pembelian, kategori pengeluaran, dan total nominal struk belanja dalam hitungan detik.
            </p>
          </div>
        </div>
      )}

      {step === 'analyzing' && (
        <div className="py-16 flex flex-col items-center justify-center text-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-cyan-500/20 border-t-cyan-500 animate-spin" />
            <Receipt className="w-10 h-10 text-cyan-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <div>
            <p className="font-bold text-lg">Menganalisis Struk dengan AI...</p>
            <p className="text-xs text-muted-foreground mt-2">Mohon tunggu sebentar, AI sedang membaca struk belanja Anda.</p>
          </div>
        </div>
      )}

      {step === 'review' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-60">Review Item Transaksi</Label>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setReviewTransactions([...reviewTransactions, { amount: 0, description: '', categoryName: 'Others', type: 'EXPENSE' }])} 
              className="h-8 text-xs gap-1 border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/5 hover:text-cyan-300 rounded-lg"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah Transaksi
            </Button>
          </div>

          <div className="space-y-4 max-h-[50vh] pr-1.5 overflow-y-auto custom-scrollbar">
            {reviewTransactions.map((t, i) => (
              <div key={i} className="p-5 rounded-2xl bg-muted/30 border border-border/50 space-y-4 relative group animate-in slide-in-from-bottom-2 duration-300">
                <button 
                  onClick={() => setReviewTransactions(reviewTransactions.filter((_, idx) => idx !== i))}
                  className="absolute top-3.5 right-3.5 text-muted-foreground hover:text-rose-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] text-muted-foreground font-bold uppercase ml-1">Deskripsi Item</Label>
                    <Input 
                      value={t.description} 
                      onChange={(e) => {
                        const updated = [...reviewTransactions];
                        updated[i].description = e.target.value;
                        setReviewTransactions(updated);
                      }} 
                      className="h-10 rounded-xl bg-card border-border/50 text-sm focus-visible:ring-cyan-500/40" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] text-muted-foreground font-bold uppercase ml-1">Nominal (Rp)</Label>
                      <Input 
                        type="number" 
                        value={t.amount} 
                        onChange={(e) => {
                          const updated = [...reviewTransactions];
                          updated[i].amount = parseFloat(e.target.value);
                          setReviewTransactions(updated);
                        }} 
                        className="h-10 rounded-xl bg-card border-border/50 text-sm font-bold focus-visible:ring-cyan-500/40 text-cyan-400" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] text-muted-foreground font-bold uppercase ml-1">Kategori</Label>
                      <Select 
                        value={t.categoryName} 
                        onValueChange={(val) => {
                          const updated = [...reviewTransactions];
                          updated[i].categoryName = val;
                          setReviewTransactions(updated);
                        }}
                      >
                        <SelectTrigger className="h-10 rounded-xl bg-card border-border/50 text-xs focus:ring-cyan-500/40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover rounded-xl border-border/50">
                          {categories.map(c => (
                            <SelectItem key={c.id} value={c.name} className="text-xs">{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-border/50 grid grid-cols-1 sm:grid-cols-5 gap-4 items-end">
            <div className="sm:col-span-3 space-y-2 text-left">
              <Label className="text-[10px] text-muted-foreground font-bold uppercase ml-1">Pilih Dompet Penyimpanan</Label>
              <Select value={selectedWalletId} onValueChange={setSelectedWalletId}>
                <SelectTrigger className="h-12 rounded-2xl bg-muted/50 border-border/50 text-sm focus:ring-cyan-500/40">
                  <SelectValue placeholder="Pilih dompet..." />
                </SelectTrigger>
                <SelectContent className="bg-popover rounded-xl border-border/50">
                  {wallets.map(w => (
                    <SelectItem key={w.id} value={w.id} className="text-xs">{w.name} (Rp {w.balance.toLocaleString('id-ID')})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-2 flex w-full gap-3 h-12">
              <Button variant="outline" onClick={resetScanner} className="flex-1 rounded-2xl h-full text-xs font-bold" disabled={loading}>Ulangi</Button>
              <Button onClick={handleSaveAll} className="flex-[2] bg-cyan-500 hover:bg-cyan-600 text-white rounded-2xl h-full font-bold gap-2 shadow-lg shadow-cyan-900/10" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Simpan Transaksi
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
