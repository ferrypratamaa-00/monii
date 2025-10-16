import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import {
  ContributeToGoalSchema,
  CreateJointGoalSchema,
  CreatePersonalGoalSchema,
  DeleteGoalSchema,
} from "@/lib/validations/goal";
import {
  contributeToGoal,
  createJointGoal,
  createPersonalGoal,
  deleteGoal,
  getUserGoals,
} from "@/services/goal";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const goals = await getUserGoals(parseInt(session.user.id, 10));

    // Get all unique user IDs from goal members
    const userIds = new Set<number>();
    goals.forEach((goal) => {
      goal.members?.forEach((member) => userIds.add(member.userId));
    });

    // Fetch user names (name field may not exist yet, so use email as fallback)
    let userMap = new Map<number, string>();
    try {
      const userRecords = await db
        .select({ id: users.id, name: users.name, email: users.email })
        .from(users)
        .where(inArray(users.id, Array.from(userIds)));

      userMap = new Map(userRecords.map((user) => [user.id, user.name || user.email]));
    } catch (error) {
      // If name column doesn't exist yet, just use "User" as placeholder
      userIds.forEach(id => userMap.set(id, "User"));
    }    // Transform the data to match frontend expectations
    const transformedGoals = goals.map((goal) => ({
      id: goal.id,
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.savedAmount, // Map savedAmount to currentAmount
      type: goal.type.toLowerCase() as "personal" | "joint", // Convert to lowercase
      deadline: goal.deadline,
      createdAt: goal.createdAt,
      members: goal.members?.map((member) => ({
        userId: member.userId,
        user: { name: userMap.get(member.userId) || "Unknown User" },
        contribution: member.contributionAmount, // Map contributionAmount to contribution
      })),
    }));

    return NextResponse.json(transformedGoals);
  } catch (error) {
    console.error("Error fetching goals:", error);
    return NextResponse.json(
      { error: "Failed to fetch goals" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, ...data } = body;

    if (type === "personal") {
      const validatedData = CreatePersonalGoalSchema.parse(data);
      const goal = await createPersonalGoal({
        userId: parseInt(session.user.id, 10),
        name: validatedData.name,
        targetAmount: validatedData.targetAmount,
        deadline: validatedData.deadline,
        type: "PERSONAL",
      });
      return NextResponse.json(goal);
    } else if (type === "joint") {
      const validatedData = CreateJointGoalSchema.parse(data);
      const goal = await createJointGoal({
        userId: parseInt(session.user.id, 10),
        name: validatedData.name,
        targetAmount: validatedData.targetAmount,
        deadline: validatedData.deadline,
        type: "JOINT",
        memberUserIds: validatedData.memberUserIds,
      });
      return NextResponse.json(goal);
    } else {
      return NextResponse.json({ error: "Invalid goal type" }, { status: 400 });
    }
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Error creating goal:", error);
    return NextResponse.json(
      { error: "Failed to create goal" },
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
    const validatedData = ContributeToGoalSchema.parse(body);

    const result = await contributeToGoal(
      validatedData.goalId,
      parseInt(session.user.id, 10),
      validatedData.amount,
      validatedData.accountId,
    );

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Error contributing to goal:", error);
    return NextResponse.json(
      { error: "Failed to contribute to goal" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const goalId = searchParams.get("goalId");

    if (!goalId) {
      return NextResponse.json({ error: "Goal ID required" }, { status: 400 });
    }

    const validatedData = DeleteGoalSchema.parse({
      goalId: parseInt(goalId, 10),
    });

    await deleteGoal(validatedData.goalId, parseInt(session.user.id, 10));
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Error deleting goal:", error);
    return NextResponse.json(
      { error: "Failed to delete goal" },
      { status: 500 },
    );
  }
}
