import { and, eq, gte, lt, sql } from "drizzle-orm";
import { db } from "@/db";
import { budgets, categories, transactions } from "@/db/schema";

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

  if (!currentBudget) {
    console.log(
      `No budget found for user ${userId}, category ${categoryId}, period MONTHLY`,
    );
    return null;
  }

  const category = currentBudget.category;

  const currentSpending = parseFloat(currentBudget.currentSpending || "0");
  const limitAmount = parseFloat(currentBudget.limitAmount);
  const newSpending = currentSpending + amount;

  console.log(
    `Updating budget spending: user ${userId}, category ${categoryId}, current ${currentSpending}, adding ${amount}, new ${newSpending}`,
  );

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

export async function recalculateBudgetSpending(userId: number) {
  // Get current month date range
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );

  // Get all monthly budgets for user
  const userBudgets = await db.query.budgets.findMany({
    where: and(eq(budgets.userId, userId), eq(budgets.period, "MONTHLY")),
    with: {
      category: true,
    },
  });

  console.log(`Recalculating spending for ${userBudgets.length} budgets`);

  // Recalculate spending for each budget
  for (const budget of userBudgets) {
    const [{ total }] = await db
      .select({
        total: sql<number>`COALESCE(SUM(ABS(CAST(${transactions.amount} AS DECIMAL))), 0)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.categoryId, budget.categoryId),
          eq(transactions.type, "EXPENSE"),
          gte(transactions.date, startOfMonth),
          lt(transactions.date, endOfMonth),
        ),
      );

    console.log(
      `Budget ${budget.id} (${budget.category?.name}): calculated total ${total}`,
    );

    // Update budget with recalculated spending
    await db
      .update(budgets)
      .set({
        currentSpending: total.toString(),
      })
      .where(eq(budgets.id, budget.id));
  }
}
