import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export class PremiumRequiredError extends Error {
  constructor() {
    super('PREMIUM_REQUIRED');
    this.name = 'PremiumRequiredError';
  }
}

/**
 * Verifikasi bahwa user memiliki tier premium yang masih aktif.
 * Gunakan di awal setiap Server Action yang dilindungi fitur AI.
 * Throws PremiumRequiredError jika tidak premium.
 */
export async function requirePremium() {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('tier, premium_until')
    .eq('id', userId)
    .maybeSingle();

  if (!profile) throw new PremiumRequiredError();

  const isPremium = profile.tier === 'premium';
  const isExpired = profile.premium_until
    ? new Date(profile.premium_until) < new Date()
    : false;

  if (!isPremium || isExpired) throw new PremiumRequiredError();

  return { userId, tier: profile.tier as 'premium' };
}

/**
 * Kembalikan status tier user tanpa melempar error.
 * Berguna untuk kondisional rendering di server components.
 */
export async function getUserTier(): Promise<'free' | 'premium'> {
  const { userId } = await auth();
  if (!userId) return 'free';

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('tier, premium_until')
    .eq('id', userId)
    .maybeSingle();

  if (!profile || profile.tier !== 'premium') return 'free';

  // Check expiry
  if (profile.premium_until && new Date(profile.premium_until) < new Date()) {
    return 'free';
  }

  return 'premium';
}
