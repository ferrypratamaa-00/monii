import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { AIAnalyticsService } from "@/services/ai-analytics";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id, 10);

    // Generate AI analysis
    const aiAnalysis = await AIAnalyticsService.analyzeSpendingPatterns(userId);

    return NextResponse.json(aiAnalysis);
  } catch (error) {
    console.error("AI Analytics error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
