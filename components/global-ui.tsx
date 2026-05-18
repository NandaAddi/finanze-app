'use client';

import React from 'react';
import { BottomNav } from '@/components/bottom-nav';
import { TopNav } from '@/components/top-nav';
import { WelcomeModal } from '@/components/welcome-modal';
import { useGlobalDialog } from '@/components/global-dialog-provider';

export function GlobalUI() {
  const { openAddDialog, openChatDialog, openScanDialog } = useGlobalDialog();

  return (
    <>
      <TopNav />
      <BottomNav 
        onPlusClick={openAddDialog}
        onChatClick={openChatDialog}
        onScanClick={openScanDialog}
      />
      <WelcomeModal />
    </>
  );
}
