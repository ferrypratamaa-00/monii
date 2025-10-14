"use client";

import { useQuery } from "@tanstack/react-query";
import { ExpensePieChart } from "@/components/app/dashboard/ExpensePieChart";
import { ExportButtons } from "@/components/app/dashboard/ExportButtons";
import { TrendChart } from "@/components/app/dashboard/TrendChart";
import { AISuggestionsPanel } from "@/components/app/dashboard/AISuggestionsPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  getMonthlyExpenseByCategory,
  getMonthlySummary,
  getTotalBalance,
} from "@/services/dashboard";

export default function DashboardPage() {
  const { data: user } = useCurrentUser();

  const { data: totalBalance } = useQuery({
    queryKey: ["totalBalance", user?.userId],
    queryFn: () => getTotalBalance(user?.userId),
    enabled: !!user,
  });

  const { data: monthlySummary } = useQuery({
    queryKey: ["monthlySummary", user?.userId],
    queryFn: () => getMonthlySummary(user?.userId),
    enabled: !!user,
  });

  const { data: expenseByCategory } = useQuery({
    queryKey: ["expenseByCategory", user?.userId],
    queryFn: () => getMonthlyExpenseByCategory(user?.userId),
    enabled: !!user,
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Saldo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              Rp {totalBalance?.toLocaleString() || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pemasukan Bulan Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              Rp {monthlySummary?.income.toLocaleString() || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pengeluaran Bulan Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              Rp {monthlySummary?.expense.toLocaleString() || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pengeluaran per Kategori (Bulan Ini)</CardTitle>
        </CardHeader>
        <CardContent>
          <ExpensePieChart data={expenseByCategory || []} />
        </CardContent>
      </Card>

      <TrendChart />

      <AISuggestionsPanel userId={user?.userId} />

      <Card>
        <CardHeader>
          <CardTitle>Export Data</CardTitle>
        </CardHeader>
        <CardContent>
          <ExportButtons />
        </CardContent>
      </Card>
    </div>
  );
}
