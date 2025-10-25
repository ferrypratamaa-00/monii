import { desc, eq } from "drizzle-orm";
import { getCurrentUser } from "@/app/actions/auth";
import { db } from "@/db";
import { accounts, categories, transactions, users } from "@/db/schema";
import {
  getMonthlyExpenseByCategory,
  getMonthlySummary,
  getMonthlyTrendData,
  getTotalBalance,
} from "@/services/dashboard";
import { indexedDBService } from "@/services/indexedDB";
import { localStorageService } from "@/services/localStorage";
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
    allCategories,
    allAccounts,
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
        categoryIcon: categories.iconName,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.date))
      .limit(5),
    db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { name: true, email: true },
    }),
    db.query.categories.findMany({
      where: eq(categories.userId, userId),
      columns: { id: true, name: true, type: true, iconName: true },
    }),
    db.query.accounts.findMany({
      where: eq(accounts.userId, userId),
      columns: { id: true, name: true, balance: true },
    }),
  ]);

  // Cache data for offline use
  if (user) {
    localStorageService.saveUserData({
      id: userId,
      name: user.name ?? undefined,
      email: user.email || "",
    });
    await indexedDBService.saveUserData({
      id: userId,
      name: user.name ?? undefined,
      email: user.email || "",
    });
  }

  if (allCategories.length > 0) {
    const transformedCategories = allCategories.map((cat) => ({
      ...cat,
      iconName: cat.iconName || undefined,
    }));
    localStorageService.saveCategoriesData({
      categories: transformedCategories,
    });
    await indexedDBService.saveCategoriesData({
      categories: transformedCategories,
    });
  }

  if (allAccounts.length > 0) {
    localStorageService.saveAccountsData({
      accounts: allAccounts.map((account) => ({
        ...account,
        balance: parseFloat(account.balance),
      })),
    });
    await indexedDBService.saveAccountsData({
      accounts: allAccounts.map((account) => ({
        ...account,
        balance: parseFloat(account.balance),
      })),
    });
  }

  if (totalBalance !== undefined && monthlySummary) {
    await indexedDBService.saveDashboardData({
      totalBalance,
      monthlySummary,
    });
  }

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
      categoryIcon: transaction.categoryIcon,
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
