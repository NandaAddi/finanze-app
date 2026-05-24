'use server';

import { supabaseAdmin } from '@/utils/supabase/admin';
import { requireAdmin } from '@/lib/admin-auth';
import { BlogPostInsert, BlogPostUpdate } from '@/lib/types/admin';
import { revalidatePath } from 'next/cache';
import { clerkClient } from '@clerk/nextjs/server';

// ==============================================================
// ADMIN ANALYTICS ACTIONS
// ==============================================================

export async function getAdminStats() {
  await requireAdmin();

  const [
    { count: totalUsers },
    { count: totalTransactions },
    { count: totalAiQueries },
    { count: activeUsers7d },
  ] = await Promise.all([
    supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('transactions').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('ai_query_logs').select('*', { count: 'exact', head: true }),
    supabaseAdmin
      .from('transactions')
      .select('created_by', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
  ]);

  return {
    totalUsers: totalUsers ?? 0,
    activeUsers7d: activeUsers7d ?? 0,
    totalTransactions: totalTransactions ?? 0,
    totalAiQueries: totalAiQueries ?? 0,
  };
}

export async function getRecentUsers(limit = 10) {
  await requireAdmin();

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, email, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getUserGrowth() {
  await requireAdmin();

  // Get last 30 days user registrations grouped by day
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('created_at')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);

  // Group by date
  const grouped: Record<string, number> = {};
  (data ?? []).forEach(({ created_at }) => {
    const date = new Date(created_at).toISOString().split('T')[0];
    grouped[date] = (grouped[date] ?? 0) + 1;
  });

  // Fill all days in the range
  const result = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const date = d.toISOString().split('T')[0];
    result.push({ date, count: grouped[date] ?? 0 });
  }

  return result;
}

// ==============================================================
// BLOG CRUD ACTIONS
// ==============================================================

export async function getAllBlogPosts() {
  await requireAdmin();

  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getBlogPostById(id: string) {
  await requireAdmin();

  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function createBlogPost(payload: BlogPostInsert) {
  await requireAdmin();

  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .insert(payload)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/admin/blog');
  revalidatePath('/blog');
  revalidatePath('/sitemap.xml');

  return data;
}

export async function updateBlogPost(id: string, payload: BlogPostUpdate) {
  await requireAdmin();

  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/admin/blog');
  revalidatePath('/blog');
  revalidatePath(`/blog/${data.slug}`);
  revalidatePath('/sitemap.xml');

  return data;
}

export async function deleteBlogPost(id: string) {
  await requireAdmin();

  const { error } = await supabaseAdmin
    .from('blog_posts')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);

  revalidatePath('/admin/blog');
  revalidatePath('/blog');
}

export async function toggleBlogPublish(id: string, currentStatus: boolean) {
  return updateBlogPost(id, { is_published: !currentStatus });
}

// ==============================================================
// USER MANAGEMENT ACTIONS
// ==============================================================

export async function getAllUsersWithTier() {
  await requireAdmin();

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, email, tier, premium_until, created_at')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function toggleUserTier(
  targetUserId: string,
  targetTier: 'free' | 'premium'
) {
  await requireAdmin();

  const premiumUntil =
    targetTier === 'premium'
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // +30 hari
      : null;

  // 1. Update Supabase
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ tier: targetTier, premium_until: premiumUntil })
    .eq('id', targetUserId);

  if (error) throw new Error(error.message);

  // 2. Sync ke Clerk publicMetadata agar client tahu segera
  try {
    const client = await clerkClient();
    await client.users.updateUserMetadata(targetUserId, {
      publicMetadata: { tier: targetTier },
    });
  } catch (clerkError: any) {
    console.warn('[Admin] Failed to sync tier to Clerk metadata:', clerkError.message);
    // Non-fatal — Supabase is the source of truth, Clerk sync is best-effort
  }

  revalidatePath('/admin/users');
}
