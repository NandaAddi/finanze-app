import { redirect } from 'next/navigation';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getFinancialOverview } from '@/app/actions/finance';
import { getQuickInsight } from '@/app/actions/ai-advisor';
import { DashboardClient } from '@/components/dashboard-client';
import { supabaseAdmin } from '@/utils/supabase/admin';

export default async function DashboardPage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    return redirect('/sign-in');
  }

  // Fetch data on the server (Rule: server-side-performance)
  const [initialData, quickInsight] = await Promise.all([
    getFinancialOverview(),
    getQuickInsight()
  ]);

  // Get profile data from our DB using Supabase Admin
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('full_name')
    .eq('id', userId)
    .single();

  return (
    <DashboardClient 
      initialData={initialData as any} 
      quickInsight={quickInsight}
      user={{
        id: userId,
        full_name: profile?.full_name || user.firstName || 'User'
      }} 
    />
  );
}
