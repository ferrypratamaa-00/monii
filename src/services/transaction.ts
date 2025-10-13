import { eq, sql } from "drizzle-orm";
import type { z } from "zod";
import { db } from "@/db";
import { accounts, transactions } from "@/db/schema";
import type { TransactionSchema } from "@/lib/validations/transaction";

export async function createTransaction(
  input: z.infer<typeof TransactionSchema> & { userId: number },
) {
  return db.transaction(async (tx) => {
    const [trx] = await tx
      .insert(transactions)
      .values({
        userId: input.userId,
        accountId: input.accountId,
        categoryId: input.categoryId,
        type: input.type,
        amount: input.amount,
        description: input.description,
        date: input.date,
        isRecurring: input.isRecurring,
      })
      .returning();

    // Update saldo atomic (balance = balance + amount)
    await tx
      .update(accounts)
      .set({ balance: sql`${accounts.balance} + ${input.amount}` })
      .where(eq(accounts.id, input.accountId));

    return trx;
  });
}
