"use client";

import { BarChart3, FileText, Plus, Target } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import TransactionModal from "./app/transactions/TransactionModal";

export function QuickActionButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const quickActions = [
    {
      icon: Plus,
      label: "Add Transaction",
      href: null,
      onClick: () => setIsModalOpen(true),
      color: "bg-primary hover:bg-primary/90",
    },
    {
      icon: BarChart3,
      label: "View Reports",
      href: "/reports",
      onClick: null,
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      icon: Target,
      label: "Manage Budgets",
      href: "/budget",
      onClick: null,
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      icon: FileText,
      label: "View Transactions",
      href: "/transactions",
      onClick: null,
      color: "bg-purple-500 hover:bg-purple-600",
    },
  ];

  return (
    <>
      {/* Expanded Action Buttons */}
      {isExpanded && (
        <div className="fixed right-7.5 bottom-38 flex flex-col gap-3 z-50">
          {quickActions.slice(1).map((action) => {
            const Icon = action.icon;
            return action.href ? (
              <Link key={action.label} href={action.href}>
                <Button
                  size="lg"
                  className={`h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 ${action.color} text-white`}
                  title={action.label}
                >
                  <Icon className="h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <Button
                key={action.label}
                size="lg"
                className={`h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 ${action.color} text-white`}
                onClick={action.onClick || undefined}
                title={action.label}
              >
                <Icon className="h-5 w-5" />
              </Button>
            );
          })}
        </div>
      )}

      {/* Main FAB */}
      <Button
        size="lg"
        className={`fixed right-6 bottom-20 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 ${
          isExpanded ? "rotate-45" : ""
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Plus className="h-6 w-6" />
        <span className="sr-only">
          {isExpanded ? "Close quick actions" : "Open quick actions"}
        </span>
      </Button>

      {/* Backdrop for mobile */}
      {isExpanded && (
        // biome-ignore lint/a11y/noStaticElementInteractions: <>
        // biome-ignore lint/a11y/useKeyWithClickEvents: <>
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
