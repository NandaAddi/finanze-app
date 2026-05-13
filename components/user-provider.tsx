'use client';

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useUser as useClerkUser, useClerk } from '@clerk/nextjs';
import { syncUserWithDatabase } from '@/app/actions/finance';

// User context
interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  banner_url?: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isLoaded: clerkLoaded } = useClerkUser();
  const { signOut: clerkSignOut } = useClerk();
  
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const profile = await syncUserWithDatabase();
    if (profile) {
      setDbUser(profile as any);
    }
  }, []);

  useEffect(() => {
    async function initUser() {
      if (clerkLoaded && clerkUser) {
        // Sync via Server Action (Safe & Bypass RLS)
        const profile = await syncUserWithDatabase();
        
        if (profile) {
          setDbUser(profile as any);
        } else {
          // Fallback to clerk data if sync fails
          setDbUser({
            id: clerkUser.id,
            email: clerkUser.primaryEmailAddress?.emailAddress || '',
            full_name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
            avatar_url: clerkUser.imageUrl
          });
        }
        setLoading(false);
      } else if (clerkLoaded && !clerkUser) {
        setDbUser(null);
        setLoading(false);
      }
    }

    initUser();
  }, [clerkUser, clerkLoaded]);

  const signOut = useCallback(async () => {
    try {
      await clerkSignOut();
      setDbUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, [clerkSignOut]);

  const value = useMemo(() => ({
    user: dbUser,
    loading: !clerkLoaded || loading,
    signOut,
    refreshUser
  }), [dbUser, clerkLoaded, loading, signOut, refreshUser]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}