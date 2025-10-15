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

export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const goals = await getUserGoals(parseInt(session.user.id, 10));
    return NextResponse.json(goals);
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
