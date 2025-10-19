"use client";

import { useEffect } from "react";

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when user is typing in input fields
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        (event.target as HTMLElement)?.contentEditable === "true"
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const keyMatches =
          event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = !!shortcut.ctrlKey === event.ctrlKey;
        const altMatches = !!shortcut.altKey === event.altKey;
        const shiftMatches = !!shortcut.shiftKey === event.shiftKey;

        if (keyMatches && ctrlMatches && altMatches && shiftMatches) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
}

// Predefined shortcuts for the app
export const APP_SHORTCUTS = {
  NEW_TRANSACTION: {
    key: "n",
    ctrlKey: true,
    description: "Add new transaction",
  },
  SEARCH: { key: "f", ctrlKey: true, description: "Focus search" },
  DASHBOARD: { key: "d", ctrlKey: true, description: "Go to dashboard" },
  TRANSACTIONS: { key: "t", ctrlKey: true, description: "Go to transactions" },
  REPORTS: { key: "r", ctrlKey: true, description: "Go to reports" },
  BUDGET: { key: "b", ctrlKey: true, description: "Go to budget" },
  HELP: { key: "?", ctrlKey: true, description: "Show keyboard shortcuts" },
} as const;
