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
    redirect('/sign-in');
  }

  // Bypas JWT caching dengan membaca role langsung dari database Supabase (Source of Truth)
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard');
  }

  return { userId: userId!, profile };
}

