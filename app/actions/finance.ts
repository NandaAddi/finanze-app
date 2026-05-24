'use server';

import { supabaseAdmin } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';
import { auth, currentUser } from '@clerk/nextjs/server';

/**
 * Fast auth — only validates the Clerk JWT, zero DB round-trips.
 * Use this for READ operations.
 */
async function getAuth() {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  return userId;
}

/**
 * Auth + profile sync — ensures the profiles row exists before an INSERT.
 * Only needed for createTransaction and createWallet where the FK constraint
 * requires the profile to exist. Calling this on every action was the main
 * source of 200-500ms overhead per request.
 */
async function getAuthEnsureProfile() {
  const userId = await getAuth();
  await syncUserWithDatabase();
  return userId;
}

export async function syncUserWithDatabase() {
  try {
    const user = await currentUser();
    if (!user) throw new Error('No Clerk user found');
    
    const userId = user.id;
    const email = user.emailAddresses[0]?.emailAddress || '';
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
    const avatarUrl = user.imageUrl || '';
    
    const { data: profile, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
      
    if (fetchError) throw fetchError;
    
    if (!profile) {
      console.log(`[Sync] Creating profile for ${userId}...`);
      const { data: newProfile, error } = await supabaseAdmin
        .from('profiles')
        .insert({ id: userId, email, full_name: fullName, avatar_url: avatarUrl })
        .select()
        .single();
        
      if (error) {
        console.error('[Sync Error] Failed to insert profile:', error);
        throw error;
      }
      return newProfile;
    }
    return profile;
  } catch (error: any) { 
    console.error('[Sync Critical Error]:', error.message);
    throw error; 
  }
}

export async function getFinancialOverview() {
  try {
    const userId = await getAuth();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const [walletsRes, transRes, weeklyRes] = await Promise.all([
      supabaseAdmin.from('wallets').select('*').eq('user_id', userId).order('name', { ascending: true }),
      supabaseAdmin.from('transactions').select('*, category:categories(*), wallet:wallets(*)').eq('created_by', userId).order('created_at', { ascending: false }).limit(5),
      supabaseAdmin.from('transactions').select('amount, created_at').eq('created_by', userId).eq('type', 'EXPENSE').gte('created_at', sevenDaysAgo.toISOString())
    ]);
    const spendingMap = new Map<string, number>();
    weeklyRes.data?.forEach(t => {
      const dateKey = new Date(t.created_at).toDateString();
      spendingMap.set(dateKey, (spendingMap.get(dateKey) || 0) + t.amount);
    });
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklySpending = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const amount = spendingMap.get(date.toDateString()) || 0;
      return { day: days[date.getDay()], amount };
    });
    return { wallets: walletsRes.data || [], transactions: transRes.data || [], weeklySpending };
  } catch (error) { return { wallets: [], transactions: [], weeklySpending: [] }; }
}

export async function createTransaction(data: any) {
  try {
    // Ensure profile FK exists before inserting a transaction
    const userId = await getAuthEnsureProfile();
    const { error: insertError } = await supabaseAdmin.from('transactions').insert({
      id: `trans_${Math.random().toString(36).substring(2, 15)}`,
      amount: data.amount, type: data.type, description: data.description, wallet_id: data.wallet_id, category_id: data.category_id, created_by: userId
    });
    if (insertError) throw insertError;
    const adjustment = data.type === 'INCOME' ? data.amount : -data.amount;
    await supabaseAdmin.rpc('adjust_wallet_balance', { p_wallet_id: data.wallet_id, p_amount: adjustment });
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) { return { success: false, error: error.message }; }
}

export async function createWallet(data: any) {
  try {
    // Ensure profile FK exists before inserting a wallet
    const userId = await getAuthEnsureProfile();
    const id = `wallet_${Math.random().toString(36).substring(2, 15)}`;
    const { data: wallet, error } = await supabaseAdmin.from('wallets').insert({
      id, name: data.name, description: data.description, balance: data.balance, currency: data.currency, user_id: userId, slug: data.name.toLowerCase().replace(/ /g, '-') + '-' + id.split('_')[1]
    }).select().single();
    if (error) throw error;
    revalidatePath('/dashboard');
    return { success: true, data: wallet };
  } catch (error: any) { return { success: false, error: error.message }; }
}

export async function getWallets() {
  const userId = await getAuth();
  const { data } = await supabaseAdmin.from('wallets').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  return data || [];
}

export async function getNotifications() {
  const userId = await getAuth();
  const { data } = await supabaseAdmin.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20);
  return data || [];
}

export async function markNotifAsRead(id: string) {
  const userId = await getAuth();
  await supabaseAdmin.from('notifications').update({ is_read: true }).eq('id', id).eq('user_id', userId);
  revalidatePath('/dashboard');
  return { success: true };
}

export async function deleteNotif(id: string) {
  const userId = await getAuth();
  await supabaseAdmin.from('notifications').delete().eq('id', id).eq('user_id', userId);
  revalidatePath('/dashboard');
  return { success: true };
}

export async function getCategories() {
  const userId = await getAuth();
  const { data } = await supabaseAdmin.from('categories').select('*').or(`created_by.eq.${userId},created_by.is.null`).order('name', { ascending: true });
  return data || [];
}

export async function updateTransaction(data: any) {
  try {
    const userId = await getAuth();
    // 🛡️ SECURITY PATCH: Ensure old transaction exists and is owned by the logged-in user
    const { data: oldT } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('id', data.id)
      .eq('created_by', userId) // ← Ownership Validation
      .single();
      
    if (!oldT) throw new Error('Transaction not found or unauthorized access.');
    
    // 🛡️ SECURITY PATCH: Ensure target wallet belongs to the user
    const { data: targetWallet } = await supabaseAdmin
      .from('wallets')
      .select('id')
      .eq('id', data.wallet_id)
      .eq('user_id', userId)
      .maybeSingle();

    if (!targetWallet) throw new Error('Target wallet not found or unauthorized access.');

    const oldVal = oldT.type === 'INCOME' ? oldT.amount : -oldT.amount;
    const newVal = data.type === 'INCOME' ? data.amount : -data.amount;
    if (oldT.wallet_id !== data.wallet_id) {
      await supabaseAdmin.rpc('adjust_wallet_balance', { p_wallet_id: oldT.wallet_id, p_amount: -oldVal });
      await supabaseAdmin.rpc('adjust_wallet_balance', { p_wallet_id: data.wallet_id, p_amount: newVal });
    } else {
      await supabaseAdmin.rpc('adjust_wallet_balance', { p_wallet_id: data.wallet_id, p_amount: newVal - oldVal });
    }
    await supabaseAdmin.from('transactions').update({
      amount: data.amount, type: data.type, description: data.description, wallet_id: data.wallet_id, category_id: data.category_id, updated_at: new Date().toISOString()
    }).eq('id', data.id);
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) { return { success: false, error: error.message }; }
}

export async function deleteTransactionAction(id: string) {
  try {
    const userId = await getAuth();
    // 🛡️ SECURITY PATCH: Ensure transaction is owned by the logged-in user before delete
    const { data: t } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('id', id)
      .eq('created_by', userId) // ← Ownership Validation
      .single();

    if (t) {
      const adj = t.type === 'INCOME' ? -t.amount : t.amount;
      await supabaseAdmin.rpc('adjust_wallet_balance', { p_wallet_id: t.wallet_id, p_amount: adj });
      await supabaseAdmin.from('transactions').delete().eq('id', id).eq('created_by', userId);
    }
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateWallet(data: any) {
  const userId = await getAuth();
  const { data: wallet } = await supabaseAdmin.from('wallets').update({
    name: data.name, description: data.description, currency: data.currency, updated_at: new Date().toISOString()
  }).eq('id', data.id).eq('user_id', userId).select().single();
  revalidatePath('/dashboard');
  return { success: true, data: wallet };
}

export async function deleteWallet(id: string) {
  const userId = await getAuth();
  await supabaseAdmin.from('wallets').delete().eq('id', id).eq('user_id', userId);
  revalidatePath('/dashboard');
  return { success: true };
}

export async function getWalletDetails(id: string) {
  const userId = await getAuth();
  const [w, t] = await Promise.all([
    supabaseAdmin.from('wallets').select('*').eq('id', id).eq('user_id', userId).single(),
    supabaseAdmin.from('transactions').select('*, category:categories(*)').eq('wallet_id', id).eq('created_by', userId).order('created_at', { ascending: false })
  ]);
  return { wallet: w.data, transactions: t.data || [] };
}

export async function searchFinancials(q: string) {
  const userId = await getAuth();
  const [w, t] = await Promise.all([
    supabaseAdmin.from('wallets').select('*').eq('user_id', userId).ilike('name', `%${q}%`).limit(5),
    supabaseAdmin.from('transactions').select('*').eq('created_by', userId).ilike('description', `%${q}%`).limit(5)
  ]);
  return { wallets: w.data || [], transactions: t.data || [] };
}

export async function seedDefaultCategories(walletId: string) {
  const userId = await getAuth();
  const defaults = [{ name: 'Food', icon: 'utensils', color: '#10b981' }, { name: 'Transport', icon: 'car', color: '#3b82f6' }, { name: 'Others', icon: 'grid', color: '#6b7280' }];
  const { data, error } = await supabaseAdmin.from('categories').insert(defaults.map((c, i) => ({ id: `cat_${Math.random().toString(36).substring(2, 11)}`, ...c, wallet_id: walletId, created_by: userId, position: i }))).select();
  if (error) throw error;
  return data;
}

export async function transferFunds(data: any) {
  try {
    const userId = await getAuth();
    
    // 🛡️ SECURITY PATCH: Cross-validate ownership of BOTH source and destination wallets
    const [fromWallet, toWallet] = await Promise.all([
      supabaseAdmin.from('wallets').select('id').eq('id', data.fromWalletId).eq('user_id', userId).maybeSingle(),
      supabaseAdmin.from('wallets').select('id').eq('id', data.toWalletId).eq('user_id', userId).maybeSingle()
    ]);

    if (!fromWallet.data || !toWallet.data) {
      throw new Error('Akses transfer ditolak. Salah satu dompet tidak valid atau bukan milik Anda.');
    }

    await supabaseAdmin.rpc('adjust_wallet_balance', { p_wallet_id: data.fromWalletId, p_amount: -data.amount });
    await supabaseAdmin.rpc('adjust_wallet_balance', { p_wallet_id: data.toWalletId, p_amount: data.amount });
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateProfile(data: any) {
  const userId = await getAuth();
  await supabaseAdmin.from('profiles').update({ ...data, updated_at: new Date().toISOString() }).eq('id', userId);
  return { success: true };
}

export async function getTransactions(type: string) {
  const userId = await getAuth();
  let q = supabaseAdmin.from('transactions').select('*, category:categories(*), wallet:wallets(*)').eq('created_by', userId);
  if (type !== 'ALL') q = q.eq('type', type);
  const { data } = await q.order('created_at', { ascending: false });
  return data || [];
}

export async function getAnalyticsData(startDate: Date) {
  const userId = await getAuth();
  const [walletsRes, transRes] = await Promise.all([
    supabaseAdmin.from('wallets').select('*').eq('user_id', userId),
    supabaseAdmin.from('transactions').select('*, category:categories(*), wallet:wallets(*)').eq('created_by', userId).gte('created_at', startDate.toISOString()).order('created_at', { ascending: true })
  ]);
  return { wallets: walletsRes.data || [], transactions: transRes.data || [] };
}
