import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { getUserBadges } from "@/services/goal";

export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const badges = await getUserBadges(parseInt(session.user.id, 10));
    return NextResponse.json(badges);
  } catch (error) {
    console.error("Error fetching badges:", error);
    return NextResponse.json(
      { error: "Failed to fetch badges" },
      { status: 500 },
    );
  }
}
