import { and, eq, gte, lt, sql, sum } from "drizzle-orm";
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

  const [incomeResult] = await db
    .select({ total: sum(transactions.amount) })
    .from(transactions)
    .where(
      sql`${transactions.userId} = ${userId} AND ${transactions.type} = 'INCOME' AND date_trunc('month', ${transactions.date}) = ${currentMonth}`,
    );

  const [expenseResult] = await db
    .select({ total: sum(transactions.amount) })
    .from(transactions)
    .where(
      sql`${transactions.userId} = ${userId} AND ${transactions.type} = 'EXPENSE' AND date_trunc('month', ${transactions.date}) = ${currentMonth}`,
    );

  const income = incomeResult?.total
    ? Math.abs(parseFloat(incomeResult.total))
    : 0;
  const expense = expenseResult?.total
    ? Math.abs(parseFloat(expenseResult.total))
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

export async function getMonthlyTrendData(
  userId: number,
  numMonths: number = 12,
) {
  const results = [];
  const now = new Date();

  for (let i = numMonths - 1; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

    const incomeResult = await db
      .select({
        income: sum(transactions.amount),
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, "INCOME"),
          gte(transactions.date, monthStart),
          lt(transactions.date, monthEnd),
        ),
      );

    const expenseResult = await db
      .select({
        expense: sum(transactions.amount),
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, "EXPENSE"),
          gte(transactions.date, monthStart),
          lt(transactions.date, monthEnd),
        ),
      );

    const monthStr = monthStart.toISOString().slice(0, 7); // YYYY-MM

    results.push({
      month: monthStr,
      income: Math.abs(parseFloat(incomeResult[0]?.income || "0")),
      expense: Math.abs(parseFloat(expenseResult[0]?.expense || "0")),
    });
  }

  return results;
}

export async function getSummaryByDateRange(
  userId: number,
  startDate?: Date,
  endDate?: Date,
) {
  const conditions = [eq(transactions.userId, userId)];

  if (startDate) {
    conditions.push(gte(transactions.date, startDate));
  }
  if (endDate) {
    conditions.push(lt(transactions.date, endDate));
  }

  const [incomeResult] = await db
    .select({ total: sum(transactions.amount) })
    .from(transactions)
    .where(
      and(
        ...conditions,
        eq(transactions.type, "INCOME"),
      ),
    );

  const [expenseResult] = await db
    .select({ total: sum(transactions.amount) })
    .from(transactions)
    .where(
      and(
        ...conditions,
        eq(transactions.type, "EXPENSE"),
      ),
    );

  const [transactionCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(transactions)
    .where(and(...conditions));

  const income = incomeResult?.total
    ? Math.abs(parseFloat(incomeResult.total))
    : 0;
  const expense = expenseResult?.total
    ? Math.abs(parseFloat(expenseResult.total))
    : 0;
  const totalTransactions = transactionCount?.count || 0;

  return { income, expense, totalTransactions };
}
