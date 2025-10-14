import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateTransactionPDF } from "@/services/export";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const pdfBlob = await generateTransactionPDF(
      parseInt(session.user.id, 10),
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );

    const filename = `transactions_${new Date().toISOString().split("T")[0]}.pdf`;

    const response = new NextResponse(pdfBlob, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });

    return response;
  } catch (error) {
    console.error("PDF Export error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}