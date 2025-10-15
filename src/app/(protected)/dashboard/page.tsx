import { getCurrentUser } from "@/app/actions/auth";
import { getMonthlyExpenseByCategory, getMonthlySummary, getMonthlyTrendData, getTotalBalance } from "@/services/dashboard";
import { AISuggestionsPanel } from "@/components/app/dashboard/AISuggestionsPanel";
import { ExpensePieChart } from "@/components/app/dashboard/ExpensePieChart";
import { ExportButtons } from "@/components/app/dashboard/ExportButtons";
import { TrendChart } from "@/components/app/dashboard/TrendChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const userId = await getCurrentUser();
  if (!userId) {
    return <div>Not authenticated</div>;
  }

  const [totalBalance, monthlySummary, expenseByCategory, trendData] = await Promise.all([
    getTotalBalance(userId),
    getMonthlySummary(userId),
    getMonthlyExpenseByCategory(userId),
    getMonthlyTrendData(userId),
  ]);

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
              Rp {totalBalance.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pemasukan Bulan Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              Rp {monthlySummary.income.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pengeluaran Bulan Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              Rp {monthlySummary.expense.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pengeluaran per Kategori (Bulan Ini)</CardTitle>
        </CardHeader>
        <CardContent>
          <ExpensePieChart data={expenseByCategory} />
        </CardContent>
      </Card>

      <TrendChart data={trendData} />

      <AISuggestionsPanel userId={userId} />

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
