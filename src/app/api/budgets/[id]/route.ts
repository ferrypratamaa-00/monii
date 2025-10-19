import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { budgets } from "@/db/schema";
import { auth } from "@/lib/auth-server";

const UpdateBudgetSchema = z.object({
  limitAmount: z.number().positive().optional(),
  period: z.enum(["MONTHLY", "YEARLY"]).optional(),
});

// GET /api/budgets/[id] - Get specific budget
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id, 10);
    const { id } = await params;
    const budgetId = parseInt(id, 10);

    if (Number.isNaN(budgetId)) {
      return NextResponse.json({ error: "Invalid budget ID" }, { status: 400 });
    }

    const budget = await db
      .select()
      .from(budgets)
      .where(and(eq(budgets.id, budgetId), eq(budgets.userId, userId)))
      .limit(1);

    if (budget.length === 0) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }

    return NextResponse.json(budget[0]);
  } catch (error) {
    console.error("GET /api/budgets/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT /api/budgets/[id] - Update budget
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id, 10);
    const { id } = await params;
    const budgetId = parseInt(id, 10);

    if (Number.isNaN(budgetId)) {
      return NextResponse.json({ error: "Invalid budget ID" }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = UpdateBudgetSchema.parse(body);

    // Check if budget exists and belongs to user
    const existingBudget = await db
      .select()
      .from(budgets)
      .where(and(eq(budgets.id, budgetId), eq(budgets.userId, userId)))
      .limit(1);

    if (existingBudget.length === 0) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }

    // Update budget
    const updateData: Partial<typeof budgets.$inferInsert> = {};
    if (validatedData.limitAmount !== undefined) {
      updateData.limitAmount = validatedData.limitAmount.toString();
    }
    if (validatedData.period !== undefined) {
      updateData.period = validatedData.period;
    }

    const [updatedBudget] = await db
      .update(budgets)
      .set(updateData)
      .where(and(eq(budgets.id, budgetId), eq(budgets.userId, userId)))
      .returning();

    return NextResponse.json(updatedBudget);
  } catch (error) {
    console.error("PUT /api/budgets/[id] error:", error);

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

// DELETE /api/budgets/[id] - Delete budget
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id, 10);
    const { id } = await params;
    const budgetId = parseInt(id, 10);

    if (Number.isNaN(budgetId)) {
      return NextResponse.json({ error: "Invalid budget ID" }, { status: 400 });
    }

    // Check if budget exists and belongs to user
    const existingBudget = await db
      .select()
      .from(budgets)
      .where(and(eq(budgets.id, budgetId), eq(budgets.userId, userId)))
      .limit(1);

    if (existingBudget.length === 0) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }

    // Delete budget
    await db
      .delete(budgets)
      .where(and(eq(budgets.id, budgetId), eq(budgets.userId, userId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/budgets/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
