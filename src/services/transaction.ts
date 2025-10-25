import { and, eq, gte, lte, sql } from "drizzle-orm";
import type { z } from "zod";
import { db } from "@/db";
import { accounts, transactions } from "@/db/schema";
import type { SearchFiltersSchema } from "@/lib/validations/search";
import type { TransactionSchema } from "@/lib/validations/transaction";
import { updateBudgetSpending } from "./budget";
import { createNotification } from "./notification";

export async function createTransaction(
  input: z.infer<typeof TransactionSchema> & { userId: number },
) {
  console.log("createTransaction called with input:", input);
  return db.transaction(async (tx) => {
    console.log("Starting database transaction");
    const [trx] = await tx
      .insert(transactions)
      .values({
        ...input,
        amount: input.amount.toString(),
      })
      .returning();
    console.log("Transaction inserted:", trx);

    // Update saldo atomic (balance = balance + amount)
    console.log(
      "Updating account balance for accountId:",
      input.accountId,
      "with amount:",
      input.amount,
    );
    await tx
      .update(accounts)
      .set({ balance: sql`${accounts.balance} + ${input.amount}` })
      .where(eq(accounts.id, input.accountId));
    console.log("Account balance updated");

    // Update budget spending jika expense dengan category
    if (input.type === "EXPENSE" && input.categoryId) {
      console.log("Updating budget spending for categoryId:", input.categoryId);
      const budgetAlert = await updateBudgetSpending(
        input.userId,
        input.categoryId,
        Math.abs(input.amount),
      );

      // Create budget alert notification if limit exceeded
      if (budgetAlert?.exceeded) {
        console.log("Creating budget alert notification");
        await createNotification(
          input.userId,
          "BUDGET_ALERT",
          "Budget Alert",
          `You've exceeded your budget for ${budgetAlert.categoryName} by Rp ${budgetAlert.overAmount.toLocaleString("id-ID")}. Current spending: Rp ${budgetAlert.currentSpending.toLocaleString("id-ID")} of Rp ${budgetAlert.limitAmount.toLocaleString("id-ID")}.`,
        );
      }
    }

    return trx;
  });
}

export async function getTransactions(
  userId: number,
  options: { page?: number; limit?: number } = {},
) {
  const { page = 1, limit = 50 } = options;
  const offset = (page - 1) * limit;

  const transactionList = await db.query.transactions.findMany({
    where: eq(transactions.userId, userId),
    with: {
      account: true,
      category: true,
    },
    orderBy: (transactions, { desc }) => [desc(transactions.date)],
    limit,
    offset,
  });

  // Get total count for pagination
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(transactions)
    .where(eq(transactions.userId, userId));

  return {
    transactions: transactionList,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
}

export async function getFilteredTransactions(
  userId: number,
  filters: z.infer<typeof SearchFiltersSchema>,
  options: { page?: number; limit?: number } = {},
) {
  const { page = 1, limit = 50 } = options;
  const offset = (page - 1) * limit;

  const whereConditions = [eq(transactions.userId, userId)];

  if (filters.query) {
    whereConditions.push(
      sql`LOWER(${transactions.description}) LIKE LOWER(${`%${filters.query}%`})`,
    );
  }

  if (filters.categoryId) {
    whereConditions.push(eq(transactions.categoryId, filters.categoryId));
  }

  if (filters.accountId) {
    whereConditions.push(eq(transactions.accountId, filters.accountId));
  }

  if (filters.dateFrom) {
    whereConditions.push(gte(transactions.date, filters.dateFrom));
  }

  if (filters.dateTo) {
    whereConditions.push(lte(transactions.date, filters.dateTo));
  }

  if (filters.amountMin !== undefined) {
    whereConditions.push(
      gte(
        sql`ABS(CAST(${transactions.amount} AS DECIMAL))`,
        sql`${filters.amountMin}`,
      ),
    );
  }

  if (filters.amountMax !== undefined) {
    whereConditions.push(
      lte(
        sql`ABS(CAST(${transactions.amount} AS DECIMAL))`,
        sql`${filters.amountMax}`,
      ),
    );
  }

  if (filters.type) {
    whereConditions.push(eq(transactions.type, filters.type));
  }

  const transactionList = await db.query.transactions.findMany({
    where: and(...whereConditions),
    with: {
      account: true,
      category: true,
    },
    orderBy: (transactions, { desc }) => [desc(transactions.date)],
    limit,
    offset,
  });

  // Get total count for pagination
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(transactions)
    .where(and(...whereConditions));

  return {
    transactions: transactionList,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
}
