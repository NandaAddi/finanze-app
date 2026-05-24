import { cache } from 'react';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

/**
 * Memoized authentication utility.
 * Avoids duplicate calls to auth() in Server Components and Layouts within a single request.
 */
export const getAuthCached = cache(async () => {
  const { userId } = await auth();
  return userId;
});

/**
 * Memoized Supabase User Profile fetch.
 * Safely caches the user's database profile for the duration of a single request lifecycle,
 * eliminating redundant queries across multiple Server Components/Layouts.
 */
export const getProfileCached = cache(async (userId: string) => {
  if (!userId) return null;
  
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, email, role, tier, premium_until')
    .eq('id', userId)
    .maybeSingle();
    
  if (error) {
    console.error('[Profile Cache] Failed to fetch cached profile:', error.message);
    return null;
  }
  
  return data;
});
