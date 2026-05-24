import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { redirect } from 'next/navigation';

/**
 * Verifikasi admin di sisi server (Server Components & Server Actions).
 * Menggunakan clerkClient langsung agar membaca publicMetadata terbaru
 * tanpa bergantung pada JWT cache.
 */
export async function requireAdmin() {
  const { userId } = await auth();

  if (!userId) {
    console.warn('[requireAdmin] Access denied: No userId found in Clerk session.');
    redirect('/sign-in');
  }

  console.log(`[requireAdmin] Checking admin privilege for userId: ${userId}`);

  // Bypas JWT caching dengan membaca role langsung dari database Supabase (Source of Truth)
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('[requireAdmin] Database error while checking admin privilege:', error.message);
    throw new Error(`Auth error: ${error.message}`);
  }

  console.log(`[requireAdmin] Retrieval result for ${userId}:`, profile);

  if (!profile || profile.role !== 'admin') {
    console.warn(`[requireAdmin] Access denied: User ${userId} is not an admin. Role in DB is: ${profile?.role || 'none'}`);
    redirect('/dashboard');
  }

  console.log(`[requireAdmin] Access granted: User ${userId} successfully validated as admin.`);
  return { userId: userId!, profile };
}

