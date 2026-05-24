'use client';

import React, { useState, createContext, useContext } from 'react';
import { LoadingScreen } from './loading-screen';

const TransitionContext = createContext({
  setIsLoading: (loading: boolean) => {},
});

export const useTransition = () => useContext(TransitionContext);

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <TransitionContext.Provider value={{ setIsLoading }}>
      <LoadingScreen isLoading={isLoading} />
      {children}
    </TransitionContext.Provider>
  );
}
