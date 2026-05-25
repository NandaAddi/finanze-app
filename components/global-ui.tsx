'use client';

import React from 'react';
import { BottomNav } from '@/components/bottom-nav';
import { TopNav } from '@/components/top-nav';
import { WelcomeModal } from '@/components/welcome-modal';

export function GlobalUI() {
  return (
    <>
      <TopNav />
      <BottomNav />
      <WelcomeModal />
    </>
  );
}
