import { desc, eq } from "drizzle-orm";
import { getCurrentUser } from "@/app/actions/auth";
import { db } from "@/db";
import { categories, transactions, users } from "@/db/schema";
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
    user,
  ] = await Promise.all([
    getTotalBalance(userId),
    getMonthlySummary(userId),
    getMonthlyExpenseByCategory(userId),
    getMonthlyTrendData(userId),
    db
      .select({
        id: transactions.id,
        type: transactions.type,
        amount: transactions.amount,
        description: transactions.description,
        date: transactions.date,
        categoryName: categories.name,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.date))
      .limit(5),
    db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { name: true },
    }),
  ]);

  const transformedExpenseByCategory = expenseByCategory.map((item) => ({
    category: item.name,
    total: item.value,
  }));

  const transformedRecentTransactions = recentTransactions.map(
    (transaction) => ({
      id: transaction.id,
      type: transaction.type,
      amount: parseFloat(transaction.amount),
      description: transaction.description,
      category: transaction.categoryName,
      date: transaction.date,
    }),
  );

  return (
    <DashboardClient
      totalBalance={totalBalance}
      monthlySummary={monthlySummary}
      expenseByCategory={transformedExpenseByCategory}
      trendData={trendData}
      recentTransactions={transformedRecentTransactions}
      userId={userId}
      userName={user?.name || null}
    />
  );
}
