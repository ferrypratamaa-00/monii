import { eq, sql } from "drizzle-orm";
import type { z } from "zod";
import { db } from "@/db";
import { accounts, transactions } from "@/db/schema";
import type { TransactionSchema } from "@/lib/validations/transaction";
import { updateBudgetSpending } from "./budget";

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
      await updateBudgetSpending(
        input.userId,
        input.categoryId,
        Math.abs(input.amount),
      );
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
