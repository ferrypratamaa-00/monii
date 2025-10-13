import { eq } from "drizzle-orm";
import { db } from "@/db";
import { debts } from "@/db/schema";

export type DebtInput = {
  type: "DEBT" | "RECEIVABLE";
  personName: string;
  amount: number;
  dueDate?: Date;
};

export async function createDebt(userId: number, input: DebtInput) {
  const [debt] = await db
    .insert(debts)
    .values({
      userId,
      type: input.type,
      personName: input.personName,
      amount: input.amount.toString(),
      dueDate: input.dueDate,
    })
    .returning();
  return debt;
}

export async function getDebts(userId: number) {
  return db.query.debts.findMany({
    where: eq(debts.userId, userId),
  });
}

export async function updateDebt(
  userId: number,
  debtId: number,
  input: Partial<DebtInput>,
) {
  const updateData: Partial<typeof debts.$inferInsert> = {};
  if (input.type) updateData.type = input.type;
  if (input.personName) updateData.personName = input.personName;
  if (input.amount !== undefined) updateData.amount = input.amount.toString();
  if (input.dueDate !== undefined) updateData.dueDate = input.dueDate;

  const [debt] = await db
    .update(debts)
    .set(updateData)
    .where(eq(debts.id, debtId) && eq(debts.userId, userId))
    .returning();
  return debt;
}

export async function deleteDebt(userId: number, debtId: number) {
  await db
    .delete(debts)
    .where(eq(debts.id, debtId) && eq(debts.userId, userId));
}

export async function markAsPaid(userId: number, debtId: number) {
  await db
    .update(debts)
    .set({ status: "PAID" })
    .where(eq(debts.id, debtId) && eq(debts.userId, userId));
}
