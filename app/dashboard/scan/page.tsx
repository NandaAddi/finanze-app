import { getUserTier } from '@/lib/premium-gate';
import { PremiumPaywall } from '@/components/premium-paywall';
import { ReceiptScannerClient } from '@/components/receipt-scanner-client';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Receipt Scanner OCR - Finanze',
  description: 'Scan struk belanja Anda untuk mencatat pengeluaran otomatis dengan AI cerdas.',
};

export default async function ReceiptScannerPage() {
  const tier = await getUserTier();

  if (tier !== 'premium') {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <PremiumPaywall featureName="Scan Struk" />
      </div>
    );
  }

  return (
    <div className="py-4 sm:py-6 px-4 md:px-6">
      <ReceiptScannerClient />
    </div>
  );
}
