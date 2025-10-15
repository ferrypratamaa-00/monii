import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { generateBudgetCSV, generateTransactionCSV } from "@/services/export";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "transactions" or "budgets"
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let csvContent: string;
    let filename: string;

    if (type === "transactions") {
      csvContent = await generateTransactionCSV(
        parseInt(session.user.id, 10),
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined,
      );
      filename = `transactions_${new Date().toISOString().split("T")[0]}.csv`;
    } else if (type === "budgets") {
      csvContent = await generateBudgetCSV(parseInt(session.user.id, 10));
      filename = `budgets_${new Date().toISOString().split("T")[0]}.csv`;
    } else {
      return NextResponse.json(
        { error: "Invalid type parameter" },
        { status: 400 },
      );
    }

    const response = new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });

    return response;
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
