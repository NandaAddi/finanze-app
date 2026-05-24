import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';
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

  // Read publicMetadata directly — bypasses JWT token caching
  const client = await clerkClient();
  const user = await client.users.getUser(userId!);
  const role = user.publicMetadata?.role as string | undefined;

  if (role !== 'admin') {
    redirect('/dashboard');
  }

  return { userId: userId!, user };
}

