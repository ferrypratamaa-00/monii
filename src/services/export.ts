import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { budgets, categories, transactions } from "@/db/schema";

export async function generateTransactionCSV(
  userId: number,
  startDate?: Date,
  endDate?: Date,
) {
  let query = db
    .select({
      date: transactions.date,
      type: transactions.type,
      amount: transactions.amount,
      description: transactions.description,
      category: categories.name,
    })
    .from(transactions)
    .innerJoin(categories, eq(transactions.categoryId, categories.id))
    .where(eq(transactions.userId, userId));

  if (startDate) {
    query = query.where(sql`${transactions.date} >= ${startDate}`);
  }

  if (endDate) {
    query = query.where(sql`${transactions.date} <= ${endDate}`);
  }

  const result = await query.orderBy(transactions.date);

  // Convert to CSV format
  const headers = ["Date", "Type", "Amount", "Description", "Category"];
  const csvRows = result.map((row) => [
    row.date.toISOString().split("T")[0],
    row.type,
    row.amount.toString(),
    `"${row.description}"`,
    row.category,
  ]);

  const csvContent = [headers, ...csvRows]
    .map((row) => row.join(","))
    .join("\n");

  return csvContent;
}

export async function generateBudgetCSV(userId: number) {
  const result = await db
    .select({
      category: categories.name,
      period: budgets.period,
      limitAmount: budgets.limitAmount,
      currentSpending: budgets.currentSpending,
      remaining: sql<number>`${budgets.limitAmount} - ${budgets.currentSpending}`,
    })
    .from(budgets)
    .innerJoin(categories, eq(budgets.categoryId, categories.id))
    .where(eq(budgets.userId, userId));

  const headers = [
    "Category",
    "Period",
    "Limit Amount",
    "Current Spending",
    "Remaining",
  ];
  const csvRows = result.map((row) => [
    row.category,
    row.period,
    row.limitAmount.toString(),
    row.currentSpending.toString(),
    row.remaining.toString(),
  ]);

  const csvContent = [headers, ...csvRows]
    .map((row) => row.join(","))
    .join("\n");

  return csvContent;
}
