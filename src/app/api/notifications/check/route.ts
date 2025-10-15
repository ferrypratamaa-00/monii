import { type NextRequest, NextResponse } from "next/server";
import { checkGoalDeadlines, checkCompletedGoals } from "@/services/goal";

export async function GET(_request: NextRequest) {
  try {
    // This endpoint should be called by a cron job or scheduled task
    // For security, you might want to add authentication or IP whitelisting

    // Check for goal deadlines and completed goals
    await checkGoalDeadlines();
    await checkCompletedGoals();

    return NextResponse.json({
      success: true,
      message: "Notification checks completed"
    });
  } catch (error) {
    console.error("Notification check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}