import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { markNotificationAsRead } from "@/services/notification";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id, 10);
    const { notificationId } = await request.json();

    if (!notificationId || typeof notificationId !== "number") {
      return NextResponse.json(
        { error: "Invalid notification ID" },
        { status: 400 },
      );
    }

    await markNotificationAsRead(notificationId, userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mark notification as read error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
