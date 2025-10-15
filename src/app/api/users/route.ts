import { ne, sql } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { auth } from "@/lib/auth-server";

export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all users except the current user for joint goals
    const allUsers = await db
      .select({
        id: users.id,
        name: sql<string>`split_part(${users.email}, '@', 1)`,
        email: users.email,
      })
      .from(users)
      .where(ne(users.id, parseInt(session.user.id, 10)));

    return NextResponse.json(allUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}
