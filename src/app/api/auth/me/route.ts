import { NextResponse } from "next/server";
import { getCurrentUser } from "@/app/actions/auth";

export async function GET() {
  const userId = await getCurrentUser();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ userId });
}
