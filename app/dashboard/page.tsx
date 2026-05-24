import { redirect } from 'next/navigation';
import { getAuthCached, getProfileCached } from '@/lib/cached-queries';
import { getFinancialOverview } from '@/app/actions/finance';
import { getQuickInsight } from '@/app/actions/ai-advisor';
import { DashboardClient } from '@/components/dashboard-client';

export default async function DashboardPage() {
  const userId = await getAuthCached();

  if (!userId) {
    return redirect('/sign-in');
  }

  // Fetch data in parallel on the server (Rule: server-side-performance)
  const [initialData, quickInsight, profile] = await Promise.all([
    getFinancialOverview(),
    getQuickInsight(),
    getProfileCached(userId)
  ]);

  return (
    <DashboardClient 
      initialData={initialData as any} 
      quickInsight={quickInsight}
      user={{
        id: userId,
        full_name: profile?.full_name || 'Pengguna Finanze'
      }} 
    />
  );
}
