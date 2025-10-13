import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { budgets } from "@/db/schema";

export type BudgetInput = {
  categoryId: number;
  period: "MONTHLY" | "YEARLY";
  limitAmount: number;
};

export async function createBudget(userId: number, input: BudgetInput) {
  const [budget] = await db
    .insert(budgets)
    .values({
      userId,
      categoryId: input.categoryId,
      period: input.period,
      limitAmount: input.limitAmount.toString(),
    })
    .returning();
  return budget;
}

export async function getBudgets(userId: number) {
  return db.query.budgets.findMany({
    where: eq(budgets.userId, userId),
    with: {
      category: true,
    },
  });
}

export async function updateBudget(
  userId: number,
  budgetId: number,
  input: Partial<BudgetInput>,
) {
  const updateData: Partial<typeof budgets.$inferInsert> = {};
  if (input.categoryId) updateData.categoryId = input.categoryId;
  if (input.period) updateData.period = input.period;
  if (input.limitAmount !== undefined)
    updateData.limitAmount = input.limitAmount.toString();

  const [budget] = await db
    .update(budgets)
    .set(updateData)
    .where(eq(budgets.id, budgetId) && eq(budgets.userId, userId))
    .returning();
  return budget;
}

export async function deleteBudget(userId: number, budgetId: number) {
  await db
    .delete(budgets)
    .where(eq(budgets.id, budgetId) && eq(budgets.userId, userId));
}

export async function updateBudgetSpending(
  userId: number,
  categoryId: number,
  amount: number,
) {
  // Update currentSpending untuk budget monthly yang aktif
  await db
    .update(budgets)
    .set({
      currentSpending: sql`${budgets.currentSpending} + ${amount}`,
    })
    .where(
      eq(budgets.userId, userId) &&
        eq(budgets.categoryId, categoryId) &&
        eq(budgets.period, "MONTHLY"),
    );
}

export async function resetMonthlyBudgets(userId: number) {
  // Reset currentSpending ke 0 untuk semua budget monthly pada awal bulan
  await db
    .update(budgets)
    .set({ currentSpending: "0" })
    .where(eq(budgets.userId, userId) && eq(budgets.period, "MONTHLY"));
}
