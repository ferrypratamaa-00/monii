import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { NotificationPreferencesService } from "@/services/notification-preferences";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const preferences = await NotificationPreferencesService.getUserPreferences(
      parseInt(session.user.id, 10),
    );

    return NextResponse.json(preferences);
  } catch (error) {
    console.error("Failed to get notification preferences:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { preferences } = body;

    if (!Array.isArray(preferences)) {
      return NextResponse.json(
        { error: "Invalid preferences format" },
        { status: 400 },
      );
    }

    // Validate preferences structure
    for (const pref of preferences) {
      if (
        !pref.notificationType ||
        typeof pref.emailEnabled !== "boolean" ||
        typeof pref.soundEnabled !== "boolean" ||
        typeof pref.pushEnabled !== "boolean"
      ) {
        return NextResponse.json(
          { error: "Invalid preference structure" },
          { status: 400 },
        );
      }
    }

    await NotificationPreferencesService.updateMultiplePreferences(
      parseInt(session.user.id, 10),
      preferences,
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update notification preferences:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
