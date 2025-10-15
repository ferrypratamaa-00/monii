"use client";

import {
  BarChart3,
  CreditCard,
  DollarSign,
  Home,
  Menu,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import LanguageSwitcher from "../LanguageSwitcher";
import NotificationBell from "../NotificationBell";
import ThemeSelector from "../ThemeSelector";
import ThemeSwitcher from "../ThemeSwitcher";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Transactions", href: "/transactions", icon: CreditCard },
  { name: "Accounts", href: "/accounts", icon: Wallet },
  { name: "Categories", href: "/categories", icon: BarChart3 },
  { name: "Reports", href: "/reports", icon: TrendingUp },
  { name: "Debts", href: "/debts", icon: DollarSign },
  { name: "Goals", href: "/goals", icon: Target },
];

const mobileNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Transactions", href: "/transactions", icon: CreditCard },
  { name: "Accounts", href: "/accounts", icon: Wallet },
  { name: "More", href: "/more", icon: Menu },
];

export default function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Navigation */}
      <nav
        className="bg-card border-b border-border hidden md:block sticky top-0 z-50 backdrop-blur-sm bg-card/95"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-foreground">
                  Kantong 👛
                </h1>
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
                      {item.name}
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
              <ThemeSelector />
              <LanguageSwitcher />
              <ThemeSwitcher />
              <NotificationBell />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Header */}
      <div className="md:hidden bg-background px-6 py-4 flex justify-between items-center">
        <h1 className="text-lg font-bold text-foreground">Kantong 👛</h1>
        <div className="flex items-center space-x-2">
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
              item.name === "More"
                ? navigation.slice(3).some((nav) => nav.href === pathname)
                : pathname === item.href;
            if (item.name === "More") {
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
                  {item.name}
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
                {item.name}
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
            <h3 className="text-lg font-semibold text-foreground mb-4">
              More Options
            </h3>
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
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </button>
      )}
    </>
  );
}
