import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { getDebts } from "@/services/debt";

export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const debts = await getDebts(parseInt(session.user.id, 10));

    return NextResponse.json(debts);
  } catch (error) {
    console.error("Error fetching debts:", error);
    return NextResponse.json(
      { error: "Failed to fetch debts" },
      { status: 500 },
    );
  }
}
