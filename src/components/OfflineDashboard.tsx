"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  CachedAccountsData,
  CachedCategoriesData,
  CachedDashboardData,
  CachedUserData,
} from "@/services/indexedDB";
import { indexedDBService } from "@/services/indexedDB";

interface OfflineDashboardProps {
  userName?: string | null;
}

export default function OfflineDashboard({ userName }: OfflineDashboardProps) {
  const { t } = useLanguage();
  const [cachedData, setCachedData] = useState<{
    userData: CachedUserData | null;
    dashboardData: CachedDashboardData | null;
    categoriesData: CachedCategoriesData | null;
    accountsData: CachedAccountsData | null;
  }>({
    userData: null,
    dashboardData: null,
    categoriesData: null,
    accountsData: null,
  });

  useEffect(() => {
    // Load cached data on component mount
    const loadCachedData = async () => {
      try {
        const [userData, dashboardData, categoriesData, accountsData] =
          await Promise.all([
            indexedDBService.getUserData(),
            indexedDBService.getDashboardData(),
            indexedDBService.getCategoriesData(),
            indexedDBService.getAccountsData(),
          ]);

        setCachedData({
          userData,
          dashboardData,
          categoriesData,
          accountsData,
        });
      } catch (error) {
        console.warn("Failed to load cached data:", error);
      }
    };

    loadCachedData();
  }, []);

  const { dashboardData, categoriesData, accountsData } = cachedData;

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-6">
      <div className="container mx-auto px-4 md:px-6 py-4 md:py-6 space-y-4 md:space-y-6">
        {/* Offline Header */}
        <div className="text-center py-8">
          <div className="mb-4">
            <Badge variant="secondary" className="mb-2">
              🔌 {t("offline.mode")}
            </Badge>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground mb-1">
            {userName ? `Hai ${userName}` : t("dashboard.greeting")} 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("offline.showingCachedData")}
          </p>
        </div>

        {/* Cached Balance Card */}
        {dashboardData && (
          <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-card/80">
            <CardContent className="pt-6 pb-6">
              <p className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Rp{dashboardData.totalBalance?.toLocaleString("id-ID") || "0"}
              </p>
              <div className="text-center text-sm text-muted-foreground">
                {t("offline.lastBalance")} (
                {new Date(dashboardData.lastSync).toLocaleDateString("id-ID")})
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cached Income/Expense Summary */}
        {dashboardData && (
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
                      +Rp
                      {dashboardData.monthlySummary?.income?.toLocaleString(
                        "id-ID",
                      ) || "0"}
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
                      -Rp
                      {dashboardData.monthlySummary?.expense?.toLocaleString(
                        "id-ID",
                      ) || "0"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Cached Accounts */}
        {accountsData && accountsData.accounts?.length > 0 && (
          <Card className="shadow-md border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg font-semibold text-foreground">
                {t("offline.cachedAccounts")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {accountsData.accounts.map(
                  (account: { id: number; name: string; balance: number }) => (
                    <div
                      key={account.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-sm text-foreground">
                          {account.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t("offline.lastUpdate")}{" "}
                          {new Date(accountsData.lastSync).toLocaleDateString(
                            "id-ID",
                          )}
                        </p>
                      </div>
                      <p className="font-bold text-sm">
                        Rp{account.balance?.toLocaleString("id-ID") || "0"}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cached Categories */}
        {categoriesData && categoriesData.categories?.length > 0 && (
          <Card className="shadow-md border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg font-semibold text-foreground">
                {t("offline.cachedCategories")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {categoriesData.categories.map(
                  (category: { id: number; name: string; type: string }) => (
                    <div
                      key={category.id}
                      className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
                    >
                      <span className="text-lg">
                        {category.type === "INCOME" ? "💰" : "🛒"}
                      </span>
                      <span className="text-sm font-medium">
                        {category.name}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Offline Message */}
        <Card className="shadow-md border-0 bg-muted/50">
          <CardContent className="pt-6 pb-6 text-center">
            <div className="mb-4">
              <span className="text-2xl">📱</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">{t("offline.offlineMode")}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t("offline.offlineDescription")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("offline.autoUpdate")}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
