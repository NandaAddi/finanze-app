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
import { useUser } from '@/components/user-provider';
import { toast } from 'sonner';
import { getCategories, createTransaction, getFinancialOverview, seedDefaultCategories } from '@/app/actions/finance';
import { Loader2, Plus, Receipt, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export function AddTransactionForm() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [wallets, setWallets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [walletId, setWalletId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const isFetchingRef = useRef(false);

  useEffect(() => {
    if (user?.id && !isFetchingRef.current) {
      isFetchingRef.current = true;
      fetchOptions().finally(() => { isFetchingRef.current = false; });
    }
  }, [user?.id]);

  const fetchOptions = async () => {
    if (!user?.id) return;
    try {
      const [{ wallets: walletData }, categoryData] = await Promise.all([
        getFinancialOverview(),
        getCategories()
      ]);
      
      setWallets(walletData as any || []);
      if (walletData && walletData.length > 0) setWalletId(walletData[0].id);

      // If no categories, seed them
      if ((!categoryData || categoryData.length === 0) && walletData && walletData.length > 0) {
        const seeded = await seedDefaultCategories(walletData[0].id);
        setCategories(seeded || []);
        if (seeded && seeded.length > 0) setCategoryId(seeded[0].id);
      } else {
        setCategories(categoryData || []);
        if (categoryData && categoryData.length > 0) setCategoryId(categoryData[0].id);
      }
    } catch (error) {
      console.error('Error fetching options:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Masukkan nominal yang valid dan lebih dari 0');
      return;
    }
    if (!walletId || !categoryId || !user?.id) {
      toast.error('Lengkapi semua kolom yang diperlukan');
      return;
    }

    setLoading(true);
    try {
      const result = await createTransaction({
        amount: parsedAmount,
        type,
        description,
        wallet_id: walletId,
        category_id: categoryId,
      });

      if (!result.success) throw new Error(result.error);

      toast.success('Transaksi berhasil ditambahkan');
      router.push('/dashboard/transactions');
    } catch (error: any) {
      toast.error(error.message || 'Gagal menambahkan transaksi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-card/60 backdrop-blur-xl border border-border/50 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
      {/* Subtle glow ambient background rings */}
      <div className="absolute w-[200px] h-[200px] rounded-full bg-emerald-500/[0.01] blur-3xl -z-10 pointer-events-none -top-10 -left-10" />
      <div className="absolute w-[180px] h-[180px] rounded-full bg-rose-500/[0.01] blur-3xl -z-10 pointer-events-none -bottom-10 -right-10" />

      {/* Header */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border/50">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.push('/dashboard')}
          className="rounded-full hover:bg-muted/50 border border-border/10 text-muted-foreground hover:text-foreground shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <Receipt className="w-4.5 h-4.5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground leading-normal">
              Tambah Transaksi
            </h1>
            <p className="text-[11px] text-muted-foreground/60">
              Catat pengeluaran atau pemasukan baru secara manual.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-5">
          {/* Type Selector (Expense vs Income) */}
          <div className="flex bg-muted/50 p-1.5 rounded-xl border border-border/50 gap-1.5">
            <button
              type="button"
              onClick={() => setType('EXPENSE')}
              className={cn(
                "flex-1 py-2.5 text-xs font-bold rounded-lg transition-all duration-300",
                type === 'EXPENSE' 
                  ? "bg-rose-500 text-white shadow-lg shadow-rose-900/20" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => setType('INCOME')}
              className={cn(
                "flex-1 py-2.5 text-xs font-bold rounded-lg transition-all duration-300",
                type === 'INCOME' 
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-900/20" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Pemasukan
            </button>
          </div>

          {/* Amount Field */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-xs text-muted-foreground/75 font-semibold ml-1">Nominal Transaksi (Rp)</Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className={cn(
                  "bg-muted/30 border-border/50 text-xl font-bold font-mono h-12 rounded-xl focus-visible:ring-2",
                  type === 'EXPENSE' ? "focus-visible:ring-rose-500/40 text-rose-400" : "focus-visible:ring-emerald-500/40 text-emerald-400"
                )}
                required
              />
            </div>
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-xs text-muted-foreground/75 font-semibold ml-1">Deskripsi / Keterangan</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Untuk keperluan apa?"
              className="bg-muted/30 border-border/50 h-11 rounded-xl text-sm focus-visible:ring-emerald-500/40"
            />
          </div>

          {/* Wallet and Category Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground/75 font-semibold ml-1">Dompet Penyimpan</Label>
              <Select value={walletId} onValueChange={setWalletId}>
                <SelectTrigger className="bg-muted/30 border-border/50 h-11 rounded-xl text-xs focus:ring-emerald-500/40">
                  <SelectValue placeholder="Pilih dompet..." />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border/50">
                  {wallets.map(w => (
                    <SelectItem key={w.id} value={w.id} className="text-xs">{w.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground/75 font-semibold ml-1">Kategori Transaksi</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="bg-muted/30 border-border/50 h-11 rounded-xl text-xs focus:ring-emerald-500/40">
                  <SelectValue placeholder="Pilih kategori..." />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border/50">
                  {categories.map(c => (
                    <SelectItem key={c.id} value={c.id} className="text-xs">{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Submit Action Button */}
        <Button 
          type="submit" 
          disabled={loading}
          className={cn(
            "w-full h-12 rounded-2xl font-bold transition-all duration-300 gap-2 shadow-lg",
            type === 'EXPENSE' 
              ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-900/10' 
              : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-900/10'
          )}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4.5 h-4.5" />}
          {transactionToEdit ? 'Perbarui Transaksi' : 'Simpan Transaksi'}
        </Button>
      </form>
    </div>
  );
}
