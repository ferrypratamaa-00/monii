"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function ThemeSwitcher() {
  const { colorMode, toggleColorMode } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleColorMode}
      className="p-2 rounded-lg bg-card hover:bg-muted transition-colors"
      aria-label="Toggle dark mode"
    >
      {colorMode === "light" ? (
        <Moon className="w-5 h-5 text-muted-foreground" />
      ) : (
        <Sun className="w-5 h-5 text-muted-foreground" />
      )}
    </button>
  );
}
