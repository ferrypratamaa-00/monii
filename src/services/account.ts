import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { accounts } from "@/db/schema";

export type AccountInput = {
  name: string;
  initialBalance: number;
};

export async function createAccount(userId: number, input: AccountInput) {
  const [account] = await db
    .insert(accounts)
    .values({
      userId,
      name: input.name,
      initialBalance: input.initialBalance.toString(),
      balance: input.initialBalance.toString(),
    })
    .returning();
  return account;
}

export async function getAccounts(userId: number) {
  return db.query.accounts.findMany({
    where: eq(accounts.userId, userId),
  });
}

export async function updateAccount(
  userId: number,
  accountId: number,
  input: Partial<AccountInput>,
) {
  const updateData: Partial<typeof accounts.$inferInsert> = {};
  if (input.name) updateData.name = input.name;
  if (input.initialBalance !== undefined)
    updateData.initialBalance = input.initialBalance.toString();

  const [account] = await db
    .update(accounts)
    .set(updateData)
    .where(and(eq(accounts.id, accountId), eq(accounts.userId, userId)))
    .returning();
  return account;
}

export async function deleteAccount(userId: number, accountId: number) {
  await db
    .delete(accounts)
    .where(and(eq(accounts.id, accountId), eq(accounts.userId, userId)));
}
