"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Target, Users, DollarSign } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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

interface GoalProgressCardProps {
  goal: Goal;
  accounts: Array<{ id: number; name: string; balance: number }>;
}

export function GoalProgressCard({ goal, accounts }: GoalProgressCardProps) {
  const [contributionAmount, setContributionAmount] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [isContributing, setIsContributing] = useState(false);
  const queryClient = useQueryClient();

  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  const remaining = goal.targetAmount - goal.currentAmount;

  const contributeMutation = useMutation({
    mutationFn: async (data: {
      goalId: number;
      amount: number;
      accountId: number;
    }) => {
      const response = await fetch("/api/goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to contribute");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Contribution added successfully!");
      setContributionAmount("");
      setSelectedAccountId("");
      setIsContributing(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleContribute = () => {
    const amount = parseFloat(contributionAmount);
    const accountId = parseInt(selectedAccountId, 10);

    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!accountId) {
      toast.error("Please select an account");
      return;
    }

    const account = accounts.find((a) => a.id === accountId);
    if (!account || account.balance < amount) {
      toast.error("Insufficient balance in selected account");
      return;
    }

    contributeMutation.mutate({
      goalId: goal.id,
      amount,
      accountId,
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {goal.name}
          </CardTitle>
          <div className="flex items-center gap-2">
            {goal.type === "joint" && <Users className="h-4 w-4" />}
            <Badge variant={goal.type === "personal" ? "secondary" : "default"}>
              {goal.type}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{progress.toFixed(1)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>${goal.currentAmount.toLocaleString()}</span>
            <span>${goal.targetAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Deadline */}
        {goal.deadline && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              Due{" "}
              {new Date(goal.deadline).toLocaleDateString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
              })}
            </span>
          </div>
        )}

        {/* Badges */}
        {goal.badges && goal.badges.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {goal.badges.map((badge) => (
              <Badge key={badge.id} variant="outline" className="text-xs">
                {badge.icon} {badge.name}
              </Badge>
            ))}
          </div>
        )}

        {/* Members (for joint goals) */}
        {goal.type === "joint" && goal.members && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Members</h4>
            <div className="space-y-1">
              {goal.members.map((member) => (
                <div
                  key={member.userId}
                  className="flex justify-between text-sm"
                >
                  <span>{member.user.name}</span>
                  <span>${member.contribution.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contribute Button */}
        <Dialog open={isContributing} onOpenChange={setIsContributing}>
          <DialogTrigger asChild>
            <Button className="w-full" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Contribute
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Contribute to {goal.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="account">From Account</Label>
                <Select
                  value={selectedAccountId}
                  onValueChange={setSelectedAccountId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem
                        key={account.id}
                        value={account.id.toString()}
                      >
                        {account.name} (${account.balance.toLocaleString()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-muted-foreground">
                Remaining to goal: ${remaining.toLocaleString()}
              </div>
              <Button
                onClick={handleContribute}
                disabled={contributeMutation.isPending}
                className="w-full"
              >
                {contributeMutation.isPending
                  ? "Contributing..."
                  : "Contribute"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
