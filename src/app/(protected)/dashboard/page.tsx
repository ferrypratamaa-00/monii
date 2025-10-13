"use client";

import { useQuery } from "@tanstack/react-query";
import { ExpensePieChart } from "@/components/app/dashboard/ExpensePieChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getMonthlyExpenseByCategory,
  getMonthlySummary,
  getTotalBalance,
} from "@/services/dashboard";

export default function DashboardPage() {
  const { data: totalBalance } = useQuery({
    queryKey: ["totalBalance"],
    queryFn: () => getTotalBalance(1), // TODO: get userId
  });

  const { data: monthlySummary } = useQuery({
    queryKey: ["monthlySummary"],
    queryFn: () => getMonthlySummary(1), // TODO: get userId
  });

  const { data: expenseByCategory } = useQuery({
    queryKey: ["expenseByCategory"],
    queryFn: () => getMonthlyExpenseByCategory(1), // TODO: get userId
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
    </div>
  );
}
