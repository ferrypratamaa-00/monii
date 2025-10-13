import { eq, sql, sum } from "drizzle-orm";
import { db } from "@/db";
import { transactions } from "@/db/schema";

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

export async function getMonthlyTrendData(
  userId: number,
  numMonths: number = 12,
) {
  const results = [];

  for (let i = numMonths - 1; i >= 0; i--) {
    const monthStart = sql`date_trunc('month', now() - interval '${i} months')`;
    const monthEnd = sql`date_trunc('month', now() - interval '${i - 1} months')`;

    const [incomeResult] = await db
      .select({
        month: sql<string>`to_char(${monthStart}, 'YYYY-MM')`,
        income: sum(transactions.amount),
      })
      .from(transactions)
      .where(
        sql`${transactions.userId} = ${userId} AND ${transactions.type} = 'INCOME' AND ${transactions.date} >= ${monthStart} AND ${transactions.date} < ${monthEnd}`,
      );

    const [expenseResult] = await db
      .select({
        month: sql<string>`to_char(${monthStart}, 'YYYY-MM')`,
        expense: sum(transactions.amount),
      })
      .from(transactions)
      .where(
        sql`${transactions.userId} = ${userId} AND ${transactions.type} = 'EXPENSE' AND ${transactions.date} >= ${monthStart} AND ${transactions.date} < ${monthEnd}`,
      );

    results.push({
      month:
        incomeResult?.month ||
        expenseResult?.month ||
        `2024-${String(i + 1).padStart(2, "0")}`,
      income: Math.abs(parseFloat(incomeResult?.income || "0")),
      expense: Math.abs(parseFloat(expenseResult?.expense || "0")),
    });
  }

  return results;
}
