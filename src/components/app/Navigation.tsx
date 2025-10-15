"use client";

import {
  BarChart3,
  CreditCard,
  DollarSign,
  Home,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import NotificationBell from "../NotificationBell";
import ThemeToggle from "../ThemeToggle";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Transactions", href: "/transactions", icon: CreditCard },
  { name: "Accounts", href: "/accounts", icon: Wallet },
  { name: "Categories", href: "/categories", icon: BarChart3 },
  { name: "Reports", href: "/reports", icon: TrendingUp },
  { name: "Debts", href: "/debts", icon: DollarSign },
  { name: "Goals", href: "/goals", icon: Target },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav
      className="bg-white border-b border-gray-200"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Kantong</h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8" role="menubar">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500",
                      isActive
                        ? "border-indigo-500 text-gray-900"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
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
            <ThemeToggle />
            <NotificationBell />
          </div>
        </div>
      </div>
    </nav>
  );
}
