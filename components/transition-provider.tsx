'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { LoadingScreen } from './loading-screen';

const TransitionContext = createContext({
  setIsLoading: (loading: boolean) => {},
});

export const useTransition = () => useContext(TransitionContext);

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Optional: Show on route change
  useEffect(() => {
    // If you want to show it on every route change, uncomment below
    // setIsLoading(true);
    // const timer = setTimeout(() => setIsLoading(false), 800);
    // return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return (
    <TransitionContext.Provider value={{ setIsLoading }}>
      <LoadingScreen isLoading={isLoading} />
      {children}
    </TransitionContext.Provider>
  );
}
