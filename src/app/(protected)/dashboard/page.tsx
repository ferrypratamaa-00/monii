import { desc, eq } from "drizzle-orm";
import { getCurrentUser } from "@/app/actions/auth";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import {
  getMonthlyExpenseByCategory,
  getMonthlySummary,
  getMonthlyTrendData,
  getTotalBalance,
} from "@/services/dashboard";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const userId = await getCurrentUser();
  if (!userId) {
    return <div>Not authenticated</div>;
  }

  const [
    totalBalance,
    monthlySummary,
    expenseByCategory,
    trendData,
    recentTransactions,
  ] = await Promise.all([
    getTotalBalance(userId),
    getMonthlySummary(userId),
    getMonthlyExpenseByCategory(userId),
    getMonthlyTrendData(userId),
    db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.date))
      .limit(5),
  ]);

  return (
    <DashboardClient
      totalBalance={totalBalance}
      monthlySummary={monthlySummary}
      expenseByCategory={expenseByCategory}
      trendData={trendData}
      recentTransactions={recentTransactions}
      userId={userId}
    />
  );
}
