'use client';

/**
 * GlobalDialogProvider — Single source of truth for the three heavy shared dialogs.
 * Previously these were mounted twice (global-ui.tsx + dashboard-client.tsx),
 * doubling memory usage. Now they live here once, and any component can trigger
 * them via the `useGlobalDialog()` hook.
 */
import { createContext, useContext, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AddTransactionDialog } from '@/components/add-transaction-dialog';
import { AIChatDialog } from '@/components/ai-chat-dialog';
import { ReceiptScannerDialog } from '@/components/receipt-scanner-dialog';

interface GlobalDialogContextType {
  openAddDialog: () => void;
  openChatDialog: () => void;
  openScanDialog: () => void;
}

const GlobalDialogContext = createContext<GlobalDialogContextType>({
  openAddDialog: () => {},
  openChatDialog: () => {},
  openScanDialog: () => {},
});

export const useGlobalDialog = () => useContext(GlobalDialogContext);

export function GlobalDialogProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isScanOpen, setIsScanOpen] = useState(false);

  const openAddDialog  = useCallback(() => setIsAddOpen(true), []);
  const openChatDialog = useCallback(() => setIsChatOpen(true), []);
  const openScanDialog = useCallback(() => setIsScanOpen(true), []);

  const onSuccess = useCallback(() => router.refresh(), [router]);

  return (
    <GlobalDialogContext.Provider value={{ openAddDialog, openChatDialog, openScanDialog }}>
      {children}

      {/* These three dialogs are mounted ONCE for the entire dashboard */}
      <AddTransactionDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onSuccess={onSuccess}
      />
      <AIChatDialog
        open={isChatOpen}
        onOpenChange={setIsChatOpen}
        onSuccess={onSuccess}
      />
      <ReceiptScannerDialog
        open={isScanOpen}
        onOpenChange={setIsScanOpen}
        onSuccess={onSuccess}
      />
    </GlobalDialogContext.Provider>
  );
}
