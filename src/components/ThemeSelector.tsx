"use client";

import { Palette } from "lucide-react";
import { useState } from "react";
import { useTheme } from "./ThemeProvider";

const themes = [
  {
    id: "pink",
    name: "Pink Pastel",
    colors: ["#F5E6E8", "#D4A5C4", "#F8B4D9"],
    emoji: "🌸",
  },
  {
    id: "blue",
    name: "Blue Ocean",
    colors: ["#E8F4F8", "#5DADE2", "#3498DB"],
    emoji: "🌊",
  },
  {
    id: "purple",
    name: "Purple Dream",
    colors: ["#F4ECF7", "#9B59B6", "#8E44AD"],
    emoji: "💜",
  },
  {
    id: "professional",
    name: "Professional",
    colors: ["#FAFAFA", "#2D3748", "#4A5568"],
    emoji: "💼",
  },
  {
    id: "vibrant",
    name: "Vibrant Modern",
    colors: ["#FEFEFE", "#1DA1F2", "#FF6B35"],
    emoji: "✨",
  },
  {
    id: "warm",
    name: "Warm Elegant",
    colors: ["#FDF8F4", "#D2691E", "#CD853F"],
    emoji: "🌅",
  },
  {
    id: "tech",
    name: "Cool Tech",
    colors: ["#0A0A0A", "#00FF88", "#FF0080"],
    emoji: "🚀",
  },
];

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-card hover:bg-muted transition-colors flex items-center gap-1"
        aria-label="Change theme"
      >
        <Palette className="w-5 h-5 text-muted-foreground" />
      </button>

      {isOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            onKeyDown={(e) => e.key === "Escape" && setIsOpen(false)}
            aria-label="Close theme menu"
          />
          <div className="absolute right-0 mt-2 w-56 bg-card rounded-xl shadow-xl border border-border z-50 overflow-hidden p-3">
            <h3 className="text-sm font-semibold text-foreground mb-3 px-2">
              Pilih Tema
            </h3>
            <div className="space-y-2">
              {themes.map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-3 rounded-lg text-left transition-all border-2 ${
                    theme === t.id
                      ? "bg-primary/10 border-primary shadow-sm"
                      : "border-transparent hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{t.emoji}</span>
                    <div className="flex-1">
                      <div
                        className={`font-medium text-sm ${
                          theme === t.id ? "text-primary" : "text-foreground"
                        }`}
                      >
                        {t.name}
                      </div>
                      <div className="flex gap-1 mt-1">
                        {t.colors.map((color) => (
                          <div
                            key={color}
                            className="w-4 h-4 rounded-full border border-border/50"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                    {theme === t.id && (
                      <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
