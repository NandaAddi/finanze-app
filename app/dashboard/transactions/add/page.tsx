import { AddTransactionForm } from '@/components/add-transaction-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Catat Transaksi Manual - Finanze',
  description: 'Catat pengeluaran dan pemasukan harian Anda secara cepat dan teratur.',
};

export default function AddTransactionPage() {
  return (
    <div className="py-6 px-4 md:px-6">
      <AddTransactionForm />
    </div>
  );
}
