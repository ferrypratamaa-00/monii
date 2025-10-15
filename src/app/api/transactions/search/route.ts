import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { getFilteredTransactions } from "@/services/transaction";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = parseInt(session.user.id, 10);
  const filters = await request.json();

  const transactions = await getFilteredTransactions(userId, filters);

  return NextResponse.json(transactions);
}