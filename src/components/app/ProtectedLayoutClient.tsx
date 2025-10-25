"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Navigation from "@/components/app/Navigation";
import { KeyboardShortcutsHelp } from "@/components/KeyboardShortcutsHelp";
import OfflineIndicator from "@/components/OfflineIndicator";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import {
  APP_SHORTCUTS,
  useKeyboardShortcuts,
} from "@/hooks/useKeyboardShortcuts";

interface ProtectedLayoutClientProps {
  children: React.ReactNode;
}

export default function ProtectedLayoutClient({
  children,
}: ProtectedLayoutClientProps) {
  const router = useRouter();
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      ...APP_SHORTCUTS.NEW_TRANSACTION,
      action: () => {
        // Focus on add transaction button or open modal
        const addButton = document.querySelector(
          '[data-onboarding="add-transaction"]',
        ) as HTMLButtonElement;
        if (addButton) {
          addButton.click();
        }
      },
    },
    {
      ...APP_SHORTCUTS.SEARCH,
      action: () => {
        // Focus on search input
        const searchInput = document.querySelector(
          'input[placeholder*="Search"]',
        ) as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      },
    },
    {
      ...APP_SHORTCUTS.DASHBOARD,
      action: () => router.push("/"),
    },
    {
      ...APP_SHORTCUTS.TRANSACTIONS,
      action: () => router.push("/transactions"),
    },
    {
      ...APP_SHORTCUTS.REPORTS,
      action: () => router.push("/reports"),
    },
    {
      ...APP_SHORTCUTS.BUDGET,
      action: () => router.push("/budget"),
    },
    {
      ...APP_SHORTCUTS.HELP,
      action: () => setShowShortcuts(true),
    },
  ]);

  return (
    <ErrorBoundary>
      <Navigation />
      {children}
      <OfflineIndicator />

      {/* Keyboard shortcuts help */}
      {showShortcuts && <KeyboardShortcutsHelp />}
    </ErrorBoundary>
  );
}
