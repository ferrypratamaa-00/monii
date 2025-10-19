"use client";

import {
  BarChart3,
  CreditCard,
  DollarSign,
  Home,
  LogOut,
  Menu,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { logoutAction } from "@/app/actions/auth";
import { InstallPrompt } from "@/components/InstallPrompt";
import { useAuthStore } from "@/lib/stores/auth";
import { cn } from "@/lib/utils";
import { useLanguage } from "../LanguageProvider";
import LanguageSwitcher from "../LanguageSwitcher";
import NotificationBell from "../NotificationBell";
import ThemeSelector from "../ThemeSelector";
import ThemeSwitcher from "../ThemeSwitcher";

const navigation = [
  { name: "nav.dashboard", href: "/dashboard", icon: Home },
  { name: "nav.transactions", href: "/transactions", icon: CreditCard },
  { name: "nav.accounts", href: "/accounts", icon: Wallet },
  { name: "nav.categories", href: "/categories", icon: BarChart3 },
  { name: "nav.reports", href: "/reports", icon: TrendingUp },
  { name: "nav.debts", href: "/debts", icon: DollarSign },
  { name: "nav.goals", href: "/goals", icon: Target },
];

const mobileNavigation = [
  { name: "nav.dashboard", href: "/dashboard", icon: Home },
  { name: "nav.transactions", href: "/transactions", icon: CreditCard },
  { name: "nav.accounts", href: "/accounts", icon: Wallet },
  { name: "nav.more", href: "/more", icon: Menu },
];

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { logout } = useAuthStore();

  let t: (key: string) => string;
  try {
    // biome-ignore lint/correctness/useHookAtTopLevel: <>
    const languageContext = useLanguage();
    t = languageContext.t;
  } catch {
    // Fallback if context is not available
    t = (key: string) => key;
  }

  const handleLogout = async () => {
    const result = await logoutAction();
    if (result.success) {
      // Clear service worker cache to prevent stale data
      if ("serviceWorker" in navigator && "caches" in window) {
        try {
          const cacheNames = await caches.keys();
          await Promise.all(
            cacheNames.map((cacheName) => caches.delete(cacheName)),
          );
          console.log("Cache cleared after logout");
        } catch (error) {
          console.error("Failed to clear cache:", error);
        }
      }

      // Clear client-side auth state
      logout();

      router.push("/login");
    } else {
      console.error("Logout failed:", result.error);
    }
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav
        className="border-b border-border hidden md:block sticky top-0 z-50 backdrop-blur-sm bg-card/95"
        aria-label="Main navigation"
        data-onboarding="navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-foreground">Monii 👛</h1>
              </div>
              <div
                className="hidden sm:ml-6 sm:flex sm:space-x-8"
                role="menubar"
              >
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary",
                        isActive
                          ? "border-primary text-foreground"
                          : "border-transparent text-muted-foreground hover:border-primary/50 hover:text-foreground",
                      )}
                      role="menuitem"
                      aria-current={isActive ? "page" : undefined}
                    >
                      <item.icon className="w-4 h-4 mr-2" aria-hidden="true" />
                      {t(item.name)}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div
              className="flex items-center space-x-2"
              role="toolbar"
              aria-label="User actions"
            >
              <InstallPrompt />
              <ThemeSelector />
              <LanguageSwitcher />
              <ThemeSwitcher />
              <NotificationBell />
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-foreground bg-muted hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                aria-label={t("nav.logout")}
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Header */}
      <div className="md:hidden bg-background px-6 py-4 flex justify-between items-center">
        <h1 className="text-lg font-bold text-foreground">Monii 👛</h1>
        <div className="flex items-center space-x-2">
          <InstallPrompt />
          <ThemeSelector />
          <LanguageSwitcher />
          <ThemeSwitcher />
          <NotificationBell />
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm shadow-lg z-50">
        <div className="flex justify-around items-center h-16 px-2">
          {mobileNavigation.map((item) => {
            const isActive =
              item.name === "nav.more"
                ? navigation.slice(3).some((nav) => nav.href === pathname)
                : pathname === item.href;
            if (item.name === "nav.more") {
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className={cn(
                    "flex flex-col items-center justify-center flex-1 py-2 px-1 text-xs font-medium transition-colors rounded-lg mx-1",
                    isActive
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-primary hover:bg-primary/5",
                  )}
                >
                  <item.icon
                    className={cn("w-5 h-5 mb-1", isActive && "text-primary")}
                  />
                  {t(item.name)}
                </button>
              );
            }
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 py-2 px-1 text-xs font-medium transition-colors rounded-lg mx-1",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5",
                )}
              >
                <item.icon
                  className={cn("w-5 h-5 mb-1", isActive && "text-primary")}
                />
                {t(item.name)}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <button
          type="button"
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileMenuOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setMobileMenuOpen(false)}
          aria-label="Close menu"
        >
          <div className="absolute bottom-16 left-0 right-0 bg-card rounded-t-3xl mx-4 p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                {t("nav.more")}
              </h3>
              <InstallPrompt />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {navigation.slice(3).map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex flex-col items-center p-4 rounded-xl transition-colors border",
                      isActive
                        ? "bg-primary/10 text-primary border-primary/20"
                        : "text-muted-foreground hover:bg-primary/5 border-border",
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="w-6 h-6 mb-2" />
                    <span className="text-sm font-medium">{t(item.name)}</span>
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex flex-col items-center p-4 rounded-xl transition-colors border text-muted-foreground hover:bg-primary/5 border-border"
              >
                <LogOut className="w-6 h-6 mb-2" />
                <span className="text-sm font-medium">{t("nav.logout")}</span>
              </button>
            </div>
          </div>
        </button>
      )}
    </>
  );
}
