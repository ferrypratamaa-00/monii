"use client";

import { Languages } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "./LanguageProvider";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const toggleLanguage = (lang: "id" | "en") => {
    setLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-card hover:bg-muted transition-colors flex items-center gap-1"
        aria-label="Change language"
      >
        <Languages className="w-5 h-5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground uppercase">
          {language}
        </span>
      </button>

      {isOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            onKeyDown={(e) => e.key === "Escape" && setIsOpen(false)}
            aria-label="Close language menu"
          />
          <div className="absolute right-0 mt-2 w-32 bg-card rounded-lg shadow-lg border border-border z-50 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleLanguage("id")}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors ${
                language === "id"
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-foreground"
              }`}
            >
              🇮🇩 Indonesia
            </button>
            <button
              type="button"
              onClick={() => toggleLanguage("en")}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors ${
                language === "en"
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-foreground"
              }`}
            >
              🇬🇧 English
            </button>
          </div>
        </>
      )}
    </div>
  );
}
