import { requireAdmin } from '@/lib/admin-auth';
import { getAllUsersWithTier } from '@/app/actions/admin';
import { UsersCmsClient } from '@/components/admin/users-cms-client';

export default async function AdminUsersPage() {
  await requireAdmin();
  const users = await getAllUsersWithTier();

  return (
    <div className="p-8 flex-1">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-lora text-3xl font-bold text-white">Manajemen Pengguna</h1>
          <p className="text-sm text-[#666] mt-1">
            Kelola akses tier pengguna — Free atau Premium.
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-full bg-[#0a0a0a] border border-[#161616] text-[10px] font-mono text-[#555]">
          {users.length} pengguna terdaftar
        </div>
      </div>

      <UsersCmsClient users={users} />
    </div>
  );
}
