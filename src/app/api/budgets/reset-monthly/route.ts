import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { resetMonthlyBudgets } from "@/services/budget";

// POST /api/budgets/reset-monthly - Reset monthly budgets (admin/internal use)
export async function POST(request: NextRequest) {
  try {
    // For security, this endpoint should only be called by authenticated admin users
    // or through a cron job with proper authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id, 10);

    // Reset monthly budgets for the current user
    await resetMonthlyBudgets(userId);

    return NextResponse.json({
      success: true,
      message: "Monthly budgets reset successfully",
    });
  } catch (error) {
    console.error("POST /api/budgets/reset-monthly error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// GET /api/budgets/reset-monthly - Check if reset is needed (for cron jobs)
export async function GET() {
  try {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // This endpoint can be used by external cron services
    // to check if monthly reset should be performed

    return NextResponse.json({
      shouldReset: true, // Always allow manual reset for now
      currentMonth,
      currentYear,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("GET /api/budgets/reset-monthly error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
