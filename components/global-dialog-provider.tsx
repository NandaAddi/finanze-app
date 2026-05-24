'use client';

/**
 * GlobalDialogProvider — Single source of truth for the three heavy shared dialogs.
 * Previously these were mounted twice (global-ui.tsx + dashboard-client.tsx),
 * doubling memory usage. Now they live here once, and any component can trigger
 * them via the `useGlobalDialog()` hook.
 */
import { createContext, useContext, useState, useCallback, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';

// Lazy-loaded heavy components for code-splitting and faster initial bundle load
const AddTransactionDialog = lazy(() => 
  import('@/components/add-transaction-dialog').then(module => ({ default: module.AddTransactionDialog }))
);
const AIChatDialog = lazy(() => 
  import('@/components/ai-chat-dialog').then(module => ({ default: module.AIChatDialog }))
);
const ReceiptScannerDialog = lazy(() => 
  import('@/components/receipt-scanner-dialog').then(module => ({ default: module.ReceiptScannerDialog }))
);

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

      {/* These dialogs are dynamically loaded and mounted only when opened to keep initial JS tiny */}
      <Suspense fallback={null}>
        {isAddOpen && (
          <AddTransactionDialog
            open={isAddOpen}
            onOpenChange={setIsAddOpen}
            onSuccess={onSuccess}
          />
        )}
        {isChatOpen && (
          <AIChatDialog
            open={isChatOpen}
            onOpenChange={setIsChatOpen}
            onSuccess={onSuccess}
          />
        )}
        {isScanOpen && (
          <ReceiptScannerDialog
            open={isScanOpen}
            onOpenChange={setIsScanOpen}
            onSuccess={onSuccess}
          />
        )}
      </Suspense>
    </GlobalDialogContext.Provider>
  );
}
