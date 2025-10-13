import { eq, sql, sum } from "drizzle-orm";
import { db } from "@/db";
import { accounts, categories, transactions } from "@/db/schema";

export async function getTotalBalance(userId: number) {
  const result = await db
    .select({ total: sum(accounts.balance) })
    .from(accounts)
    .where(eq(accounts.userId, userId));

  return result[0]?.total ? parseFloat(result[0].total) : 0;
}

export async function getMonthlySummary(userId: number) {
  const currentMonth = sql`date_trunc('month', now())`;

  const incomeResult = await db
    .select({ total: sum(transactions.amount) })
    .from(transactions)
    .where(
      sql`${transactions.userId} = ${userId} AND ${transactions.type} = 'INCOME' AND date_trunc('month', ${transactions.date}) = ${currentMonth}`,
    );

  const expenseResult = await db
    .select({ total: sum(transactions.amount) })
    .from(transactions)
    .where(
      sql`${transactions.userId} = ${userId} AND ${transactions.type} = 'EXPENSE' AND date_trunc('month', ${transactions.date}) = ${currentMonth}`,
    );

  const income = incomeResult[0]?.total
    ? Math.abs(parseFloat(incomeResult[0].total))
    : 0;
  const expense = expenseResult[0]?.total
    ? Math.abs(parseFloat(expenseResult[0].total))
    : 0;

  return { income, expense };
}

export async function getMonthlyExpenseByCategory(userId: number) {
  const currentMonth = sql`date_trunc('month', now())`;

  const result = await db
    .select({
      categoryName: categories.name,
      total: sum(transactions.amount),
    })
    .from(transactions)
    .innerJoin(categories, eq(transactions.categoryId, categories.id))
    .where(
      sql`${transactions.userId} = ${userId} AND ${transactions.type} = 'EXPENSE' AND date_trunc('month', ${transactions.date}) = ${currentMonth}`,
    )
    .groupBy(categories.name);

  return result.map((row) => ({
    name: row.categoryName,
    value: Math.abs(parseFloat(row.total || "0")),
  }));
}
