import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { getSummaryByDateRange } from "@/services/dashboard";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = parseInt(session.user.id, 10);
  const { searchParams } = new URL(request.url);

  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const start = startDate ? new Date(startDate) : undefined;
  const end = endDate ? new Date(endDate) : undefined;

  const summary = await getSummaryByDateRange(userId, start, end);

  return NextResponse.json(summary);
}