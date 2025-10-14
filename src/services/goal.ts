import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  accounts,
  badges,
  goalMembers,
  goals,
  transactions,
} from "@/db/schema";

export interface CreateGoalData {
  userId: number;
  name: string;
  targetAmount: number;
  deadline?: Date;
  type: "PERSONAL" | "JOINT";
}

export interface CreateJointGoalData extends CreateGoalData {
  memberUserIds: number[];
}

export interface GoalWithMembers {
  id: number;
  userId: number;
  name: string;
  targetAmount: number;
  savedAmount: number;
  deadline: Date | null;
  type: "PERSONAL" | "JOINT";
  createdAt: Date;
  members?: Array<{
    userId: number;
    contributionAmount: number;
    joinedAt: Date;
  }>;
}

/**
 * Create a personal goal
 */
export async function createPersonalGoal(
  data: CreateGoalData,
): Promise<GoalWithMembers> {
  const [goal] = await db
    .insert(goals)
    .values({
      userId: data.userId,
      name: data.name,
      targetAmount: data.targetAmount.toString(),
      deadline: data.deadline,
      type: data.type,
    })
    .returning();

  return {
    ...goal,
    targetAmount: parseFloat(goal.targetAmount),
    savedAmount: parseFloat(goal.savedAmount),
  };
}

/**
 * Create a joint goal with multiple members
 */
export async function createJointGoal(
  data: CreateJointGoalData,
): Promise<GoalWithMembers> {
  return db.transaction(async (tx) => {
    // Create the goal
    const [goal] = await tx
      .insert(goals)
      .values({
        userId: data.userId,
        name: data.name,
        targetAmount: data.targetAmount.toString(),
        deadline: data.deadline,
        type: data.type,
      })
      .returning();

    // Add goal members including the creator
    const memberInserts = [data.userId, ...data.memberUserIds].map(
      (userId) => ({
        goalId: goal.id,
        userId,
      }),
    );

    await tx.insert(goalMembers).values(memberInserts);

    return {
      ...goal,
      targetAmount: parseFloat(goal.targetAmount),
      savedAmount: parseFloat(goal.savedAmount),
    };
  });
}

/**
 * Get all goals for a user (both personal and joint goals they're a member of)
 */
export async function getUserGoals(userId: number): Promise<GoalWithMembers[]> {
  // Get personal goals
  const personalGoals = await db.query.goals.findMany({
    where: eq(goals.userId, userId),
    with: {
      members: true,
    },
    orderBy: desc(goals.createdAt),
  });

  // Get joint goals where user is a member
  const memberGoals = await db
    .select({
      goal: goals,
    })
    .from(goalMembers)
    .innerJoin(goals, eq(goals.id, goalMembers.goalId))
    .where(and(eq(goalMembers.userId, userId), eq(goals.type, "JOINT")))
    .orderBy(desc(goals.createdAt));

  // Combine and deduplicate
  const allGoals = [...personalGoals];
  const personalGoalIds = new Set(personalGoals.map((g) => g.id));

  for (const { goal } of memberGoals) {
    if (!personalGoalIds.has(goal.id)) {
      // Fetch members for joint goals
      const members = await db.query.goalMembers.findMany({
        where: eq(goalMembers.goalId, goal.id),
      });
      allGoals.push({ ...goal, members });
    }
  }

  return allGoals.map((goal) => ({
    ...goal,
    targetAmount: parseFloat(goal.targetAmount),
    savedAmount: parseFloat(goal.savedAmount),
    members: goal.members?.map((member) => ({
      ...member,
      contributionAmount: parseFloat(member.contributionAmount),
    })),
  }));
}

/**
 * Contribute to a goal (atomic operation)
 */
export async function contributeToGoal(
  goalId: number,
  userId: number,
  amount: number,
  accountId: number,
): Promise<{ success: boolean; message: string }> {
  return db.transaction(async (tx) => {
    // Check if user is a member of the goal
    const membership = await tx.query.goalMembers.findFirst({
      where: and(
        eq(goalMembers.goalId, goalId),
        eq(goalMembers.userId, userId),
      ),
    });

    if (!membership) {
      return { success: false, message: "User is not a member of this goal" };
    }

    // Check account balance
    const account = await tx.query.accounts.findFirst({
      where: and(eq(accounts.id, accountId), eq(accounts.userId, userId)),
    });

    if (!account || parseFloat(account.balance) < amount) {
      return { success: false, message: "Insufficient account balance" };
    }

    // Update account balance
    await tx
      .update(accounts)
      .set({
        balance: sql`${accounts.balance} - ${amount}`,
      })
      .where(eq(accounts.id, accountId));

    // Update goal saved amount
    await tx
      .update(goals)
      .set({
        savedAmount: sql`${goals.savedAmount} + ${amount}`,
      })
      .where(eq(goals.id, goalId));

    // Update member contribution
    await tx
      .update(goalMembers)
      .set({
        contributionAmount: sql`${goalMembers.contributionAmount} + ${amount}`,
      })
      .where(
        and(eq(goalMembers.goalId, goalId), eq(goalMembers.userId, userId)),
      );

    // Create transaction record
    await tx.insert(transactions).values({
      userId,
      accountId,
      type: "EXPENSE",
      amount: amount.toString(),
      description: `Contribution to goal: ${await tx.query.goals
        .findFirst({
          where: eq(goals.id, goalId),
          columns: { name: true },
        })
        .then((g) => g?.name || "Unknown Goal")}`,
      date: new Date(),
    });

    return { success: true, message: "Contribution successful" };
  });
}

/**
 * Delete a goal (only creator can delete)
 */
export async function deleteGoal(
  goalId: number,
  userId: number,
): Promise<boolean> {
  const result = await db
    .delete(goals)
    .where(and(eq(goals.id, goalId), eq(goals.userId, userId)));

  return (result.rowCount || 0) > 0;
}

/**
 * Check and award badges based on user achievements
 */
export async function checkAndAwardBadges(userId: number): Promise<string[]> {
  const awardedBadges: string[] = [];

  // Check for budget master badge (3 months under budget consecutively)
  const budgetMasterCheck = await checkBudgetMasterBadge(userId);
  if (budgetMasterCheck && !(await hasBadge(userId, "BUDGET_MASTER"))) {
    await awardBadge(userId, "BUDGET_MASTER");
    awardedBadges.push("BUDGET_MASTER");
  }

  // Check for goal achiever badge (completed 3 goals)
  const goalAchieverCheck = await checkGoalAchieverBadge(userId);
  if (goalAchieverCheck && !(await hasBadge(userId, "GOAL_ACHIEVER"))) {
    await awardBadge(userId, "GOAL_ACHIEVER");
    awardedBadges.push("GOAL_ACHIEVER");
  }

  // Check for saving streak badge (consistent monthly savings for 6 months)
  const savingStreakCheck = await checkSavingStreakBadge(userId);
  if (savingStreakCheck && !(await hasBadge(userId, "SAVING_STREAK"))) {
    await awardBadge(userId, "SAVING_STREAK");
    awardedBadges.push("SAVING_STREAK");
  }

  return awardedBadges;
}

/**
 * Helper function to check if user already has a badge
 */
async function hasBadge(userId: number, badgeCode: string): Promise<boolean> {
  const badge = await db.query.badges.findFirst({
    where: and(eq(badges.userId, userId), eq(badges.code, badgeCode)),
  });
  return !!badge;
}

/**
 * Helper function to award a badge
 */
async function awardBadge(userId: number, badgeCode: string): Promise<void> {
  await db.insert(badges).values({
    userId,
    code: badgeCode,
  });
}

/**
 * Check for budget master badge (3 consecutive months under budget)
 */
async function checkBudgetMasterBadge(_userId: number): Promise<boolean> {
  // This would require analyzing budget performance over time
  // For now, return false (would need more complex logic)
  return false;
}

/**
 * Check for goal achiever badge (completed 3 goals)
 */
async function checkGoalAchieverBadge(userId: number): Promise<boolean> {
  const completedGoals = await db.query.goals.findMany({
    where: and(
      eq(goals.userId, userId),
      sql`${goals.savedAmount} >= ${goals.targetAmount}`,
    ),
  });
  return completedGoals.length >= 3;
}

/**
 * Check for saving streak badge (6 months of consistent savings)
 */
async function checkSavingStreakBadge(_userId: number): Promise<boolean> {
  // This would require analyzing monthly savings trends
  // For now, return false (would need more complex logic)
  return false;
}

/**
 * Get user's badges
 */
export async function getUserBadges(userId: number): Promise<
  Array<{
    id: number;
    code: string;
    earnedAt: Date;
  }>
> {
  return db.query.badges.findMany({
    where: eq(badges.userId, userId),
    orderBy: desc(badges.earnedAt),
  });
}

//# sourceMappingURL=goalService.js.map
