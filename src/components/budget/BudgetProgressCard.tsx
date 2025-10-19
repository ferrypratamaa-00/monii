"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { EditBudgetDialog } from "./EditBudgetDialog";

interface Budget {
  id: number;
  categoryId: number;
  categoryName: string;
  period: "MONTHLY" | "YEARLY";
  limitAmount: number;
  currentSpending: number;
  createdAt: Date;
}

interface BudgetProgressCardProps {
  budget: Budget;
  showAlert?: boolean;
}

export function BudgetProgressCard({
  budget,
  showAlert = false,
}: BudgetProgressCardProps) {
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: async (budgetId: number) => {
      const response = await fetch(`/api/budgets/${budgetId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete budget");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["budget-stats"] });
    },
  });

  const handleDelete = async () => {
    if (
      confirm(
        `Are you sure you want to delete the budget for ${budget.categoryName}?`,
      )
    ) {
      setIsDeleting(true);
      try {
        await deleteMutation.mutateAsync(budget.id);
      } catch (error) {
        console.error("Failed to delete budget:", error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const spendingPercentage =
    budget.limitAmount > 0
      ? (budget.currentSpending / budget.limitAmount) * 100
      : 0;

  const remainingAmount = budget.limitAmount - budget.currentSpending;
  const isOverBudget = budget.currentSpending > budget.limitAmount;
  const isNearLimit = spendingPercentage >= 80 && spendingPercentage < 100;

  // Determine status and colors
  let statusColor = "bg-green-500";
  let statusText = "On Track";
  let statusVariant: "default" | "secondary" | "destructive" = "default";

  if (isOverBudget) {
    statusColor = "bg-red-500";
    statusText = "Over Budget";
    statusVariant = "destructive";
  } else if (isNearLimit) {
    statusColor = "bg-yellow-500";
    statusText = "Near Limit";
    statusVariant = "secondary";
  }

  return (
    <Card
      className={cn(
        "relative",
        showAlert && isOverBudget && "border-red-200 bg-red-50/50",
      )}
    >
      {showAlert && isOverBudget && (
        <div className="absolute -top-2 -right-2">
          <AlertTriangle className="h-6 w-6 text-red-500" />
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            {budget.categoryName}
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <EditBudgetDialog
                budget={budget}
                trigger={
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Budget
                  </DropdownMenuItem>
                }
              />
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? "Deleting..." : "Delete Budget"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={statusVariant} className="text-xs">
            {statusText}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {budget.period === "MONTHLY" ? "Monthly" : "Yearly"}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Spent</span>
            <span className={cn("font-medium", isOverBudget && "text-red-600")}>
              Rp {budget.currentSpending.toLocaleString("id-ID")}
            </span>
          </div>

          <Progress value={Math.min(spendingPercentage, 100)} className="h-3" />

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Limit: Rp {budget.limitAmount.toLocaleString("id-ID")}
            </span>
            <span
              className={cn(
                "font-medium",
                remainingAmount < 0 && "text-red-600",
              )}
            >
              {remainingAmount >= 0 ? "Remaining" : "Over"}: Rp{" "}
              {Math.abs(remainingAmount).toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        {/* Percentage and Status */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="text-sm">
            <span className="font-medium">
              {spendingPercentage.toFixed(1)}%
            </span>
            <span className="text-muted-foreground"> of budget used</span>
          </div>

          {isOverBudget && (
            <div className="flex items-center gap-1 text-red-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Over Budget!</span>
            </div>
          )}

          {isNearLimit && !isOverBudget && (
            <div className="flex items-center gap-1 text-yellow-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Near Limit</span>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t text-sm">
          <div>
            <div className="text-muted-foreground">Avg. Daily</div>
            <div className="font-medium">
              Rp {(budget.currentSpending / 30).toLocaleString("id-ID")}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Days Left</div>
            <div className="font-medium">
              {Math.max(
                0,
                Math.ceil(remainingAmount / (budget.currentSpending / 30)),
              ) || "∞"}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
