import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { budgets, categories } from "@/db/schema";
import { auth } from "@/lib/auth-server";
import { recalculateBudgetSpending } from "@/services/budget";

const CreateBudgetSchema = z.object({
  categoryId: z.number().int().positive(),
  period: z.enum(["MONTHLY", "YEARLY"]),
  limitAmount: z.number().positive(),
});

// GET /api/budgets - Get all budgets for current user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id, 10);

    // Recalculate budget spending to ensure data is up to date
    await recalculateBudgetSpending(userId);

    const userBudgets = await db
      .select({
        id: budgets.id,
        categoryId: budgets.categoryId,
        categoryName: categories.name,
        period: budgets.period,
        limitAmount: budgets.limitAmount,
        currentSpending: budgets.currentSpending,
        createdAt: budgets.createdAt,
      })
      .from(budgets)
      .innerJoin(categories, eq(budgets.categoryId, categories.id))
      .where(eq(budgets.userId, userId))
      .orderBy(budgets.createdAt);

    // Parse amounts as numbers for proper formatting
    const formattedBudgets = userBudgets.map((budget) => ({
      ...budget,
      limitAmount: parseFloat(budget.limitAmount),
      currentSpending: parseFloat(budget.currentSpending || "0"),
    }));

    return NextResponse.json(formattedBudgets);
  } catch (error) {
    console.error("GET /api/budgets error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/budgets - Create new budget
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id, 10);
    const body = await request.json();

    const validatedData = CreateBudgetSchema.parse(body);

    // Check if budget already exists for this category
    const existingBudget = await db
      .select()
      .from(budgets)
      .where(
        and(
          eq(budgets.userId, userId),
          eq(budgets.categoryId, validatedData.categoryId),
        ),
      )
      .limit(1);

    if (existingBudget.length > 0) {
      return NextResponse.json(
        { error: "Budget already exists for this category" },
        { status: 400 },
      );
    }

    // Create new budget
    const [newBudget] = await db
      .insert(budgets)
      .values({
        userId,
        categoryId: validatedData.categoryId,
        period: validatedData.period,
        limitAmount: validatedData.limitAmount.toString(),
        currentSpending: "0",
      })
      .returning();

    // Immediately calculate current spending for the new budget
    await recalculateBudgetSpending(userId);

    return NextResponse.json(newBudget, { status: 201 });
  } catch (error) {
    console.error("POST /api/budgets error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
