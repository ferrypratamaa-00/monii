import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { generateBackupJSON } from "@/services/backup";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id, 10);
    const backupData = await generateBackupJSON(userId);

    const response = new NextResponse(backupData, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="kantong-backup-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });

    return response;
  } catch (error) {
    console.error("Backup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
