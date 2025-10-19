"use client";

import { Keyboard } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { APP_SHORTCUTS } from "@/hooks/useKeyboardShortcuts";

export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  const formatShortcut = (shortcut: {
    key: string;
    ctrlKey?: boolean;
    altKey?: boolean;
    shiftKey?: boolean;
    description: string;
  }) => {
    const parts = [];
    if (shortcut.ctrlKey) parts.push("Ctrl");
    if (shortcut.altKey) parts.push("Alt");
    if (shortcut.shiftKey) parts.push("Shift");
    parts.push(shortcut.key.toUpperCase());
    return parts.join(" + ");
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="text-muted-foreground hover:text-foreground"
      >
        <Keyboard className="h-4 w-4 mr-2" />
        Shortcuts
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
            <DialogDescription>
              Use these keyboard shortcuts to navigate faster
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {Object.entries(APP_SHORTCUTS).map(([key, shortcut]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {shortcut.description}
                </span>
                <kbd className="px-2 py-1 text-xs bg-muted rounded border font-mono">
                  {formatShortcut(shortcut)}
                </kbd>
              </div>
            ))}
          </div>

          <div className="text-xs text-muted-foreground mt-4">
            <p>💡 Tip: Shortcuts work when not typing in input fields</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
