import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { NotificationPreferencesService } from "@/services/notification-preferences";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await NotificationPreferencesService.resetToDefaults(
      parseInt(session.user.id, 10),
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to reset notification preferences:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
