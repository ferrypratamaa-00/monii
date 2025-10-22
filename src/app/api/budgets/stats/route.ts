import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { budgets } from "@/db/schema";
import { auth } from "@/lib/auth-server";

// GET /api/budgets/stats - Get budget statistics
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id, 10);

    // Get budget statistics
    const stats = await db
      .select({
        totalBudgets: sql<number>`count(*)`,
        activeBudgets: sql<number>`count(case when ${budgets.limitAmount} > 0 then 1 end)`,
        overBudget: sql<number>`count(case when ${budgets.currentSpending} > ${budgets.limitAmount} then 1 end)`,
        totalLimit: sql<number>`sum(cast(${budgets.limitAmount} as decimal))`,
        totalSpent: sql<number>`sum(cast(${budgets.currentSpending} as decimal))`,
      })
      .from(budgets)
      .where(eq(budgets.userId, userId));

    const budgetStats = stats[0];

    return NextResponse.json({
      totalBudgets: Number(budgetStats.totalBudgets || 0),
      activeBudgets: Number(budgetStats.activeBudgets || 0),
      overBudget: Number(budgetStats.overBudget || 0),
      totalLimit: Number(budgetStats.totalLimit || 0),
      totalSpent: Number(budgetStats.totalSpent || 0),
    });
  } catch (error) {
    console.error("GET /api/budgets/stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
