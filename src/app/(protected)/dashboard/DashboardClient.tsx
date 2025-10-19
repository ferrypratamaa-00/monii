"use client";

import { ArrowRight } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import OfflineDashboard from "@/components/OfflineDashboard";
import { QuickActionButton } from "@/components/QuickActionButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useOnboardingGuide } from "@/hooks/useOnboardingGuide";
import { localStorageService } from "@/services/localStorage";
import { syncService } from "@/services/sync";

// Lazy load heavy chart components
const AISuggestionsPanel = dynamic(
  () =>
    import(
      "@/components/app/dashboard/AISuggestionsPanel"
    ) as unknown as Promise<{
      default: React.ComponentType<{ userId: number }>;
    }>,
  {
    loading: () => (
      <Card className="shadow-md border-0">
        <CardContent className="pt-6 pb-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    ),
  },
);

const ExpensePieChart = dynamic(
  () =>
    import("@/components/app/dashboard/ExpensePieChart") as unknown as Promise<{
      default: React.ComponentType<{
        data: Array<{ name: string; value: number }>;
      }>;
    }>,
  {
    loading: () => (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    ),
  },
);

const ExportButtons = dynamic(
  () =>
    import("@/components/app/dashboard/ExportButtons") as unknown as Promise<{
      default: React.ComponentType<Record<string, never>>;
    }>,
  {
    loading: () => (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    ),
  },
);

const TrendChart = dynamic(
  () =>
    import("@/components/app/dashboard/TrendChart") as unknown as Promise<{
      default: React.ComponentType<{
        data: Array<{ month: string; income: number; expense: number }>;
      }>;
    }>,
  {
    loading: () => (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    ),
  },
);

interface DashboardClientProps {
  totalBalance: number;
  monthlySummary: { income: number; expense: number };
  expenseByCategory: Array<{ category: string; total: number }>;
  trendData: Array<{ month: string; income: number; expense: number }>;
  recentTransactions: Array<{
    id: number;
    type: string;
    amount: number;
    description: string | null;
    category: string | null;
    date: Date;
  }>;
  userId: number;
  userName: string | null;
}

export default function DashboardClient({
  totalBalance,
  monthlySummary,
  expenseByCategory,
  trendData,
  recentTransactions,
  userId,
  userName,
}: DashboardClientProps) {
  const { t } = useLanguage();
  const [isOnline, setIsOnline] = useState(true);
  const [hasCachedData, setHasCachedData] = useState(false);
  const [syncStatus, setSyncStatus] = useState(syncService.getSyncStatus());
  const [showConflictDialog, setShowConflictDialog] = useState(false);

  // Initialize onboarding guide
  useOnboardingGuide();

  // biome-ignore lint/correctness/useExhaustiveDependencies: <>
  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine);

    // Check if we have cached data
    const cacheStatus = localStorageService.getCacheStatus();
    setHasCachedData(cacheStatus.dashboardData || cacheStatus.userData);

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus(syncService.getSyncStatus());
    };
    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus(syncService.getSyncStatus());
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Periodic sync status check
    const syncCheckInterval = setInterval(() => {
      const newStatus = syncService.getSyncStatus();
      setSyncStatus(newStatus);

      // Show conflict dialog if conflicts detected and not already showing
      if (newStatus.hasConflicts && !showConflictDialog) {
        setShowConflictDialog(true);
      }
    }, 5000); // Check every 5 seconds

    // Cache current data for offline use
    if (totalBalance !== undefined && monthlySummary) {
      localStorageService.saveDashboardData({
        totalBalance,
        monthlySummary,
      });
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(syncCheckInterval);
    };
  }, [totalBalance, monthlySummary]);

  // Show offline dashboard if offline and we have cached data
  if (!isOnline && hasCachedData) {
    return <OfflineDashboard userName={userName} />;
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-6">
      <div className="container mx-auto px-4 md:px-6 py-4 md:py-6 space-y-4 md:space-y-6">
        {/* Greeting Header */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl md:text-2xl font-bold text-foreground">
              {userName ? `Hai ${userName}` : t("dashboard.greeting")} 👋
            </h1>
            {/* Sync Status Indicator */}
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isOnline ? "bg-green-500" : "bg-orange-500"
                }`}
                title={isOnline ? "Online" : "Offline"}
              />
              {syncStatus.pendingCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  {syncStatus.pendingCount} pending
                </span>
              )}
              {syncStatus.hasConflicts && (
                <span className="text-xs text-orange-600 font-medium">
                  ⚠️ Sync conflict
                </span>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {t("dashboard.balanceLabel")}
          </p>
        </div>

        {/* Balance Card */}
        <Card
          className="shadow-lg border-0 bg-gradient-to-br from-card to-card/80"
          data-onboarding="dashboard-balance"
        >
          <CardContent className="pt-6 pb-6">
            <p className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Rp{totalBalance.toLocaleString("id-ID")}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/transactions?action=add"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl transition-all shadow-md text-center text-sm"
                data-onboarding="add-transaction"
              >
                {t("dashboard.addNote")}
              </Link>
              <Link
                href="/reports"
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold py-3 rounded-xl transition-all shadow-md text-center text-sm"
              >
                {t("dashboard.viewReport")}
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Income/Expense Summary */}
        <div className="grid gap-3 md:gap-4 grid-cols-2">
          <Card className="shadow-md border-0">
            <CardContent className="pt-4 pb-4">
              <div className="flex flex-col gap-2">
                <div className="bg-income/20 w-10 h-10 rounded-full flex items-center justify-center">
                  <span className="text-income text-xl">↗</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {t("dashboard.income")}
                  </p>
                  <p className="text-lg md:text-xl font-bold text-income">
                    +Rp{monthlySummary.income.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md border-0">
            <CardContent className="pt-4 pb-4">
              <div className="flex flex-col gap-2">
                <div className="bg-expense/20 w-10 h-10 rounded-full flex items-center justify-center">
                  <span className="text-expense text-xl">↙</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {t("dashboard.expense")}
                  </p>
                  <p className="text-lg md:text-xl font-bold text-expense">
                    -Rp{monthlySummary.expense.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card
          className="shadow-md border-0"
          data-onboarding="recent-transactions"
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base md:text-lg font-semibold text-foreground">
                {t("dashboard.financialRecords")}
              </CardTitle>
              <Link
                href="/transactions"
                className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
              >
                {t("dashboard.viewAll")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">{t("dashboard.noTransactions")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === "INCOME"
                            ? "bg-income/20"
                            : "bg-expense/20"
                        }`}
                      >
                        <span className="text-lg">
                          {transaction.type === "INCOME"
                            ? "💰"
                            : transaction.category === "Makan"
                              ? "🍔"
                              : transaction.category === "Transport"
                                ? "�"
                                : transaction.category === "Belanja"
                                  ? "🛒"
                                  : transaction.category === "Tagihan"
                                    ? "📄"
                                    : transaction.category === "Hiburan"
                                      ? "🎬"
                                      : transaction.category === "Kesehatan"
                                        ? "🏥"
                                        : transaction.category === "Pendidikan"
                                          ? "📚"
                                          : "💸"}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground">
                          {transaction.category || "Lainnya"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "short",
                            },
                          )}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`font-bold text-sm ${
                        transaction.type === "INCOME"
                          ? "text-income"
                          : "text-expense"
                      }`}
                    >
                      Rp{Math.abs(transaction.amount).toLocaleString("id-ID")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trend Chart */}
        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle className="text-base md:text-lg font-semibold text-foreground">
              {t("dashboard.expenseChart")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TrendChart data={trendData} />
          </CardContent>
        </Card>

        {/* Expense by Category - Only show if there's data */}
        {expenseByCategory.length > 0 && (
          <Card className="shadow-md border-0" data-onboarding="expense-chart">
            <CardHeader>
              <CardTitle className="text-base md:text-lg font-semibold text-foreground">
                {t("dashboard.expenseByCategory")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ExpensePieChart
                data={expenseByCategory.map((item) => ({
                  name: item.category,
                  value: item.total,
                }))}
              />
            </CardContent>
          </Card>
        )}

        {/* AI Suggestions - Optional */}
        <div className="hidden md:block">
          <AISuggestionsPanel userId={userId} />
        </div>

        {/* Export Data - Hide on mobile */}
        <div className="hidden md:block">
          <Card className="shadow-md border-0">
            <CardHeader>
              <CardTitle className="text-base md:text-lg font-semibold text-foreground">
                {t("dashboard.exportData")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ExportButtons />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Action Floating Button */}
      <QuickActionButton />

      {/* Conflict Resolution Dialog */}
      <Dialog open={showConflictDialog} onOpenChange={setShowConflictDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>⚠️ Sinkronisasi Konflik Terdeteksi</DialogTitle>
            <DialogDescription>
              Ada transaksi yang belum tersinkronisasi selama lebih dari 24 jam.
              Pastikan Anda online untuk menyelesaikan sinkronisasi.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowConflictDialog(false)}
              className="flex-1"
            >
              Abaikan
            </Button>
            <Button
              onClick={() => {
                setShowConflictDialog(false);
                // Force sync attempt
                syncService.syncPendingData();
              }}
              className="flex-1"
            >
              Coba Sinkronkan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
