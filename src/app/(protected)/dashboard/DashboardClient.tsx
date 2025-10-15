"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { AISuggestionsPanel } from "@/components/app/dashboard/AISuggestionsPanel";
import { ExpensePieChart } from "@/components/app/dashboard/ExpensePieChart";
import { ExportButtons } from "@/components/app/dashboard/ExportButtons";
import { TrendChart } from "@/components/app/dashboard/TrendChart";
import { useLanguage } from "@/components/LanguageProvider";
import QuickActionButton from "@/components/QuickActionButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
}

export default function DashboardClient({
  totalBalance,
  monthlySummary,
  expenseByCategory,
  trendData,
  recentTransactions,
  userId,
}: DashboardClientProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-6">
      <div className="container mx-auto px-4 md:px-6 py-4 md:py-6 space-y-4 md:space-y-6">
        {/* Greeting Header */}
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground mb-1">
            {t("dashboard.greeting")} Putri 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("dashboard.balanceLabel")}
          </p>
        </div>

        {/* Balance Card */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-card/80">
          <CardContent className="pt-6 pb-6">
            <p className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Rp{totalBalance.toLocaleString("id-ID")}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/transactions?action=add"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl transition-all shadow-md text-center text-sm"
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
                <div className="bg-green-100 dark:bg-green-900/30 w-10 h-10 rounded-full flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400 text-xl">
                    ↗
                  </span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {t("dashboard.income")}
                  </p>
                  <p className="text-lg md:text-xl font-bold text-green-600 dark:text-green-400">
                    +Rp{monthlySummary.income.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md border-0">
            <CardContent className="pt-4 pb-4">
              <div className="flex flex-col gap-2">
                <div className="bg-red-100 dark:bg-red-900/30 w-10 h-10 rounded-full flex items-center justify-center">
                  <span className="text-red-600 dark:text-red-400 text-xl">
                    ↙
                  </span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {t("dashboard.expense")}
                  </p>
                  <p className="text-lg md:text-xl font-bold text-red-600 dark:text-red-400">
                    -Rp{monthlySummary.expense.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="shadow-md border-0">
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
                          transaction.type === "income"
                            ? "bg-green-100 dark:bg-green-900/30"
                            : "bg-red-100 dark:bg-red-900/30"
                        }`}
                      >
                        <span className="text-lg">
                          {transaction.category === "Gaji"
                            ? "💰"
                            : transaction.category === "Makan"
                              ? "🍔"
                              : transaction.category === "Transport"
                                ? "🚗"
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
                        transaction.type === "income"
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}Rp
                      {transaction.amount.toLocaleString("id-ID")}
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
          <Card className="shadow-md border-0">
            <CardHeader>
              <CardTitle className="text-base md:text-lg font-semibold text-foreground">
                Pengeluaran per Kategori
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
    </div>
  );
}
