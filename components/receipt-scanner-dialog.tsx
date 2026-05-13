'use client';

import React, { useState, useRef } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { Camera, Upload, Loader2, Receipt, Plus, Trash2, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { analyzeReceipt } from '@/app/actions/receipt';
import { getFinancialOverview, createTransaction, getCategories } from '@/app/actions/finance';
import { useUser } from '@/components/user-provider';
import { toast } from 'sonner';

export function ReceiptScannerDialog({ open, onOpenChange, onSuccess }: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const { user } = useUser();
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
      const results = await Promise.allSettled(
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
      onSuccess();
      onOpenChange(false);
      resetScanner();
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
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if(!o) resetScanner(); }}>
      <DialogContent className="sm:max-w-[450px] w-full h-[100dvh] sm:h-auto max-w-none sm:rounded-3xl rounded-none bg-card p-0 overflow-hidden flex flex-col border-none shadow-2xl">
        <DialogHeader className="p-8 pb-4">
          <DialogTitle className="text-2xl font-bold font-serif-display text-center">Receipt Scanner</DialogTitle>
          <p className="text-center text-xs text-muted-foreground">Pilih cara untuk memasukkan struk belanja Anda</p>
        </DialogHeader>

        <div className="flex-1 p-8 overflow-y-auto">
          {step === 'upload' && (
            <div className="grid grid-cols-1 gap-4">
              {/* Opsi 1: Kamera */}
              <button 
                onClick={() => cameraInputRef.current?.click()}
                className="flex items-center gap-6 p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all text-left group active:scale-95"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:rotate-6 transition-transform">
                  <Camera className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-emerald-500">Ambil Foto</h3>
                  <p className="text-[11px] text-emerald-500/70 mt-1">Gunakan kamera untuk scan struk</p>
                </div>
                <input 
                  type="file" ref={cameraInputRef} onChange={handleFileChange} 
                  accept="image/*" capture="environment" className="hidden" 
                />
              </button>

              {/* Opsi 2: Galeri */}
              <button 
                onClick={() => galleryInputRef.current?.click()}
                className="flex items-center gap-6 p-6 rounded-3xl bg-muted/50 border border-border/50 hover:bg-muted/80 transition-all text-left group active:scale-95"
              >
                <div className="w-14 h-14 rounded-2xl bg-card border border-border/50 flex items-center justify-center shadow-sm group-hover:-rotate-6 transition-transform">
                  <ImageIcon className="w-7 h-7 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-bold">Pilih Galeri</h3>
                  <p className="text-[11px] text-muted-foreground mt-1">Upload foto dari penyimpanan HP</p>
                </div>
                <input 
                  type="file" ref={galleryInputRef} onChange={handleFileChange} 
                  accept="image/*" className="hidden" 
                />
              </button>

              <div className="mt-8 p-4 bg-muted/30 rounded-2xl border border-border/30 flex gap-4">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  AI kami akan secara otomatis mendeteksi nominal, kategori, dan rincian belanja dari foto yang Anda berikan.
                </p>
              </div>
            </div>
          )}

          {step === 'analyzing' && (
            <div className="py-20 flex flex-col items-center justify-center text-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                <Receipt className="w-10 h-10 text-emerald-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <div>
                <p className="font-bold text-lg">Menganalisis Struk...</p>
                <p className="text-xs text-muted-foreground mt-2">Mohon tunggu sebentar, AI sedang bekerja.</p>
              </div>
            </div>
          )}

          {step === 'review' && (
            <div className="space-y-6 max-h-[60vh] pr-2 custom-scrollbar overflow-y-auto">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Review Transaksi</Label>
                <Button variant="ghost" size="sm" onClick={() => setReviewTransactions([...reviewTransactions, { amount: 0, description: '', categoryName: 'Others', type: 'EXPENSE' }])} className="h-8 text-[10px] gap-1 text-emerald-500">
                  <Plus className="w-3 h-3" /> Tambah
                </Button>
              </div>

              {reviewTransactions.map((t, i) => (
                <div key={i} className="p-5 rounded-2xl bg-muted/50 border border-border/50 space-y-4 relative group">
                  <button 
                    onClick={() => setReviewTransactions(reviewTransactions.filter((_, idx) => idx !== i))}
                    className="absolute top-3 right-3 text-muted-foreground hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] text-muted-foreground font-bold uppercase ml-1">Deskripsi</Label>
                      <Input value={t.description} onChange={(e) => {
                        const updated = [...reviewTransactions];
                        updated[i].description = e.target.value;
                        setReviewTransactions(updated);
                      }} className="h-10 rounded-xl bg-card border-border/50 text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] text-muted-foreground font-bold uppercase ml-1">Nominal (Rp)</Label>
                        <Input type="number" value={t.amount} onChange={(e) => {
                          const updated = [...reviewTransactions];
                          updated[i].amount = parseFloat(e.target.value);
                          setReviewTransactions(updated);
                        }} className="h-10 rounded-xl bg-card border-border/50 text-sm font-bold" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] text-muted-foreground font-bold uppercase ml-1">Kategori</Label>
                        <Select value={t.categoryName} onValueChange={(val) => {
                          const updated = [...reviewTransactions];
                          updated[i].categoryName = val;
                          setReviewTransactions(updated);
                        }}>
                          <SelectTrigger className="h-10 rounded-xl bg-card border-border/50 text-xs">
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

              <div className="pt-4 border-t border-border/10 space-y-3">
                <Label className="text-[10px] text-muted-foreground font-bold uppercase ml-1">Pilih Dompet</Label>
                <Select value={selectedWalletId} onValueChange={setSelectedWalletId}>
                  <SelectTrigger className="h-12 rounded-2xl bg-muted border-border/50">
                    <SelectValue placeholder="Pilih dompet..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover rounded-xl border-border/50">
                    {wallets.map(w => (
                      <SelectItem key={w.id} value={w.id}>{w.name} (Rp {w.balance.toLocaleString('id-ID')})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-8 pt-4 bg-muted/10 border-t border-border/30">
          {step === 'review' ? (
            <div className="flex w-full gap-3">
              <Button variant="outline" onClick={resetScanner} className="flex-1 rounded-2xl h-12 text-xs font-bold" disabled={loading}>Ulangi</Button>
              <Button onClick={handleSaveAll} className="flex-[2] bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl h-12 font-bold gap-2" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Simpan Transaksi
              </Button>
            </div>
          ) : (
             <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full text-muted-foreground text-xs h-10 hover:bg-transparent">Batalkan</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
