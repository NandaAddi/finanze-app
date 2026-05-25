import { getUserTier } from '@/lib/premium-gate';
import { PremiumPaywall } from '@/components/premium-paywall';
import { AIChatClient } from '@/components/ai-chat-client';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Chat Advisor - Finanze',
  description: 'Tanya asisten keuangan AI cerdas Anda 24/7 untuk mencatat transaksi secara instan.',
};

export default async function AIChatPage() {
  const tier = await getUserTier();

  if (tier !== 'premium') {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <PremiumPaywall featureName="Chat AI" />
      </div>
    );
  }

  return (
    <div className="-mt-14 md:mt-0 py-2 px-3 md:px-6">
      <AIChatClient />
    </div>
  );
}
