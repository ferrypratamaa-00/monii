"use client";

import { useQuery } from "@tanstack/react-query";
import { Target, Trophy, User, Users } from "lucide-react";
import { useState } from "react";
import { BadgeDisplay, type GoalBadge } from "@/components/goals/BadgeDisplay";
import { CreateGoalDialog } from "@/components/goals/CreateGoalDialog";
import { GoalProgressCard } from "@/components/goals/GoalProgressCard";
import { GoalsGuide } from "@/components/goals/GoalsGuide";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Goal {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  type: "personal" | "joint";
  deadline?: Date;
  createdAt: Date;
  members?: Array<{
    userId: number;
    user: { name: string };
    contribution: number;
  }>;
  badges?: Array<{
    id: number;
    name: string;
    description: string;
    icon: string;
  }>;
}

interface Account {
  id: number;
  name: string;
  balance: number;
}

interface GoalUser {
  id: number;
  name: string;
  email: string;
}

export default function GoalsPage() {
  const [activeTab, setActiveTab] = useState("goals");

  // Fetch goals
  const { data: goals, isLoading: goalsLoading } = useQuery({
    queryKey: ["goals"],
    queryFn: async () => {
      const response = await fetch("/api/goals");
      if (!response.ok) throw new Error("Failed to fetch goals");
      return response.json() as Promise<Goal[]>;
    },
  });

  // Fetch accounts for contributions
  const { data: accounts } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const response = await fetch("/api/accounts");
      if (!response.ok) throw new Error("Failed to fetch accounts");
      return response.json() as Promise<Account[]>;
    },
  });

  // Fetch users for joint goals
  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await fetch("/api/users");
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json() as Promise<GoalUser[]>;
    },
  });

  // Fetch user badges
  const { data: userBadges } = useQuery({
    queryKey: ["user-badges"],
    queryFn: async () => {
      const response = await fetch("/api/badges");
      if (!response.ok) throw new Error("Failed to fetch badges");
      return response.json() as Promise<GoalBadge[]>;
    },
  });

  const personalGoals = goals?.filter((goal) => goal.type === "personal") || [];
  const jointGoals = goals?.filter((goal) => goal.type === "joint") || [];

  const totalGoals = goals?.length || 0;
  const completedGoals =
    goals?.filter((goal) => goal.currentAmount >= goal.targetAmount).length ||
    0;
  const totalSaved =
    goals?.reduce((sum, goal) => sum + goal.currentAmount, 0) || 0;
  const totalTarget =
    goals?.reduce((sum, goal) => sum + goal.targetAmount, 0) || 0;

  if (goalsLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0, 1, 2].map((index) => (
            <Skeleton key={`loading-skeleton-${index}`} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Goals & Achievements</h1>
          <p className="text-muted-foreground">
            Lacak progress tabungan kamu dan dapatkan achievement badges
          </p>
        </div>
        <div className="flex items-center gap-2">
          {users && <GoalsGuide onCreateGoal={() => setActiveTab("goals")} />}
          {users && <CreateGoalDialog users={users} />}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGoals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedGoals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Saved</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalSaved.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Target Amount</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalTarget.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="achievements">Pencapaian</TabsTrigger>
        </TabsList>

        <TabsContent value="goals" className="space-y-6">
          {/* Personal Goals */}
          {personalGoals.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                Goal Pribadi
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {personalGoals.map((goal) => (
                  <GoalProgressCard
                    key={goal.id}
                    goal={goal}
                    accounts={accounts || []}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Joint Goals */}
          {jointGoals.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Goal Bersama
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {jointGoals.map((goal) => (
                  <GoalProgressCard
                    key={goal.id}
                    goal={goal}
                    accounts={accounts || []}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {totalGoals === 0 && (
            <Card className="p-8 text-center">
              <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Belum ada goals</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Goals adalah cara terbaik untuk mencapai target finansial kamu.
                Mulai dengan membuat goal pertama dan kontribusi secara rutin.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {users && (
                  <GoalsGuide onCreateGoal={() => setActiveTab("goals")} />
                )}
                {users && <CreateGoalDialog users={users} />}
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="achievements">
          {userBadges ? (
            <BadgeDisplay badges={userBadges} />
          ) : (
            <Card className="p-8 text-center">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No achievements yet
              </h3>
              <p className="text-muted-foreground">
                Complete goals and reach milestones to earn achievement badges.
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
