import { requireAdmin } from '@/lib/admin-auth';
import { getAdminStats, getRecentUsers, getUserGrowth } from '@/app/actions/admin';
import { AdminDashboardClient } from '@/components/admin/admin-dashboard-client';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  await requireAdmin();

  const [stats, recentUsers, userGrowth] = await Promise.all([
    getAdminStats(),
    getRecentUsers(10),
    getUserGrowth(),
  ]);

  return (
    <AdminDashboardClient
      stats={stats}
      recentUsers={recentUsers}
      userGrowth={userGrowth}
    />
  );
}
