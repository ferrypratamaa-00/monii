import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { getMonthlySummary } from "@/services/dashboard";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = parseInt(session.user.id, 10);
  const summary = await getMonthlySummary(userId);

  return NextResponse.json(summary);
}