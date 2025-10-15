"use client";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
  colorMode: "light" | "dark";
  toggleColorMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState("pink");
  const [colorMode, setColorMode] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Get saved theme or default to pink
    const savedTheme = localStorage.getItem("theme") || "pink";
    const savedMode =
      (localStorage.getItem("color-mode") as "light" | "dark") || "light";

    setThemeState(savedTheme);
    setColorMode(savedMode);
    document.documentElement.setAttribute("data-theme", savedTheme);
    document.documentElement.classList.toggle("dark", savedMode === "dark");
    setMounted(true);
  }, []);

  const setTheme = (newTheme: string) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const toggleColorMode = () => {
    const newMode = colorMode === "light" ? "dark" : "light";
    setColorMode(newMode);
    localStorage.setItem("color-mode", newMode);
    document.documentElement.classList.toggle("dark", newMode === "dark");
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, colorMode, toggleColorMode }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
