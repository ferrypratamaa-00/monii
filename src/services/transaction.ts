import { and, eq, gte, like, lte, sql } from "drizzle-orm";
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
  return db.transaction(async (tx) => {
    const [trx] = await tx
      .insert(transactions)
      .values({
        ...input,
        amount: input.amount.toString(),
      })
      .returning();

    // Update saldo atomic (balance = balance + amount)
    await tx
      .update(accounts)
      .set({ balance: sql`${accounts.balance} + ${input.amount}` })
      .where(eq(accounts.id, input.accountId));

    // Update budget spending jika expense dengan category
    if (input.type === "EXPENSE" && input.categoryId) {
      const budgetAlert = await updateBudgetSpending(
        input.userId,
        input.categoryId,
        Math.abs(input.amount),
      );

      // Create budget alert notification if limit exceeded
      if (budgetAlert?.exceeded) {
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

export async function getTransactions(userId: number) {
  return db.query.transactions.findMany({
    where: eq(transactions.userId, userId),
    with: {
      account: true,
      category: true,
    },
    orderBy: (transactions, { desc }) => [desc(transactions.date)],
  });
}

export async function getFilteredTransactions(
  userId: number,
  filters: z.infer<typeof SearchFiltersSchema>,
) {
  const whereConditions = [eq(transactions.userId, userId)];

  if (filters.query) {
    whereConditions.push(like(transactions.description, `%${filters.query}%`));
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
      gte(sql`ABS(${transactions.amount})`, filters.amountMin.toString()),
    );
  }

  if (filters.amountMax !== undefined) {
    whereConditions.push(
      lte(sql`ABS(${transactions.amount})`, filters.amountMax.toString()),
    );
  }

  if (filters.type) {
    whereConditions.push(eq(transactions.type, filters.type));
  }

  return db.query.transactions.findMany({
    where: and(...whereConditions),
    with: {
      account: true,
      category: true,
    },
    orderBy: (transactions, { desc }) => [desc(transactions.date)],
  });
}
