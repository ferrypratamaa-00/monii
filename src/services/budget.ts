import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { budgets, categories } from "@/db/schema";

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
    .where(and(eq(budgets.id, budgetId), eq(budgets.userId, userId)))
    .returning();
  return budget;
}

export async function deleteBudget(userId: number, budgetId: number) {
  await db
    .delete(budgets)
    .where(and(eq(budgets.id, budgetId), eq(budgets.userId, userId)));
}

export async function updateBudgetSpending(
  userId: number,
  categoryId: number,
  amount: number,
) {
  // Get current budget before update
  const currentBudget = await db.query.budgets.findFirst({
    where: and(
      eq(budgets.userId, userId),
      eq(budgets.categoryId, categoryId),
      eq(budgets.period, "MONTHLY"),
    ),
    with: {
      category: true,
    },
  });

  if (!currentBudget) return null;

  const category = currentBudget.category;

  const currentSpending = parseFloat(currentBudget.currentSpending || "0");
  const limitAmount = parseFloat(currentBudget.limitAmount);
  const newSpending = currentSpending + amount;

  // Update currentSpending
  await db
    .update(budgets)
    .set({
      currentSpending: newSpending.toString(),
    })
    .where(
      and(
        eq(budgets.userId, userId),
        eq(budgets.categoryId, categoryId),
        eq(budgets.period, "MONTHLY"),
      ),
    );

  // Check if budget exceeded
  if (newSpending > limitAmount) {
    return {
      exceeded: true,
      categoryName: category?.name || "Unknown Category",
      currentSpending: newSpending,
      limitAmount,
      overAmount: newSpending - limitAmount,
    };
  }

  return null;
}

export async function resetMonthlyBudgets(userId: number) {
  // Reset currentSpending ke 0 untuk semua budget monthly pada awal bulan
  await db
    .update(budgets)
    .set({ currentSpending: "0" })
    .where(and(eq(budgets.userId, userId), eq(budgets.period, "MONTHLY")));
}
