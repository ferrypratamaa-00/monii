import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { getTotalBalance } from "@/services/dashboard";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = parseInt(session.user.id, 10);
  const balance = await getTotalBalance(userId);

  return NextResponse.json({ balance });
}