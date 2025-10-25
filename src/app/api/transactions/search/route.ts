import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { getFilteredTransactions } from "@/services/transaction";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = parseInt(session.user.id, 10);
  const body = await request.json();
  const { page = 1, limit = 50, ...rawFilters } = body;

  // Parse dates from ISO strings back to Date objects
  const filters = {
    ...rawFilters,
    dateFrom: rawFilters.dateFrom ? new Date(rawFilters.dateFrom) : undefined,
    dateTo: rawFilters.dateTo ? new Date(rawFilters.dateTo) : undefined,
  };

  const result = await getFilteredTransactions(userId, filters, {
    page,
    limit,
  });

  return NextResponse.json(result);
}
