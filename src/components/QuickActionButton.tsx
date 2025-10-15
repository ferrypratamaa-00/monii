"use client";

import { Plus, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "./LanguageProvider";

export default function QuickActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setIsOpen(false)}
          aria-label="Close quick actions"
        />
      )}

      {/* Quick Action Menu */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 md:hidden">
          <div className="bg-card rounded-2xl shadow-2xl border border-border p-2 space-y-2 min-w-[180px]">
            <Link
              href="/transactions?type=expense"
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <span className="text-xl">📤</span>
              </div>
              <span className="text-sm font-medium text-foreground">
                {t("dashboard.expense")}
              </span>
            </Link>

            <Link
              href="/transactions?type=income"
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <span className="text-xl">📥</span>
              </div>
              <span className="text-sm font-medium text-foreground">
                {t("dashboard.income")}
              </span>
            </Link>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-6 w-14 h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg flex items-center justify-center z-50 md:hidden transition-all"
        aria-label="Quick add transaction"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
      </button>
    </>
  );
}
