import { auth, currentUser } from '@clerk/nextjs/server';
import { AppSidebar } from './app-sidebar';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function AppSidebarServer() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    return null;
  }

  // Get profile from our DB using Supabase Admin
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('full_name, avatar_url, email')
    .eq('id', userId)
    .single();

  const userData = {
    name: profile?.full_name || user.firstName || user.emailAddresses[0].emailAddress || 'User',
    email: profile?.email || user.emailAddresses[0].emailAddress || '',
    avatar: profile?.avatar_url || user.imageUrl || '',
  };

  return <AppSidebar initialUser={userData} />;
}
