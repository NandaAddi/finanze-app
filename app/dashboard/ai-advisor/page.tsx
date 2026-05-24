import { getUserTier } from '@/lib/premium-gate';
import { PremiumPaywall } from '@/components/premium-paywall';
import { AIAdvisorClient } from '@/components/ai-advisor-client';

export default async function AIAdvisorPage() {
  const tier = await getUserTier();

  if (tier !== 'premium') {
    return <PremiumPaywall featureName="AI Advisor" />;
  }

  return <AIAdvisorClient />;
}
