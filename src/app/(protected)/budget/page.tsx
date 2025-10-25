"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, RotateCcw, Target, TrendingUp } from "lucide-react";
import { useState } from "react";
import { BudgetProgressCard } from "@/components/app/budgets/BudgetProgressCard";
import { CreateBudgetDialog } from "@/components/app/budgets/CreateBudgetDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Budget {
  id: number;
  categoryId: number;
  categoryName: string;
  period: "MONTHLY" | "YEARLY";
  limitAmount: number;
  currentSpending: number;
  createdAt: Date;
}

interface BudgetStats {
  totalBudgets: number;
  activeBudgets: number;
  overBudget: number;
  totalLimit: number;
  totalSpent: number;
}

export default function BudgetPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const queryClient = useQueryClient();

  // Fetch budgets
  const { data: budgets, isLoading: budgetsLoading } = useQuery({
    queryKey: ["budgets"],
    queryFn: async () => {
      const response = await fetch("/api/budgets");
      if (!response.ok) throw new Error("Failed to fetch budgets");
      return response.json() as Promise<Budget[]>;
    },
  });

  // Fetch budget statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["budget-stats"],
    queryFn: async () => {
      const response = await fetch("/api/budgets/stats");
      if (!response.ok) throw new Error("Failed to fetch budget stats");
      return response.json() as Promise<BudgetStats>;
    },
  });

  // Fetch categories for budget creation
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json();
    },
  });

  // Reset monthly budgets mutation
  const resetMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/budgets/reset-monthly", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to reset budgets");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["budget-stats"] });
      console.log("Monthly budgets reset successfully");
    },
    onError: (error) => {
      console.error("Failed to reset budgets:", error);
    },
  });

  // Recalculate spending mutation
  const recalculateMutation = useMutation({
    mutationFn: async () => {
      // Trigger recalculation by refetching budgets
      const response = await fetch("/api/budgets");
      if (!response.ok) throw new Error("Failed to recalculate budgets");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["budget-stats"] });
      console.log("Budget spending recalculated successfully");
    },
    onError: (error) => {
      console.error("Failed to recalculate budgets:", error);
    },
  });

  const activeBudgets = budgets?.filter((b) => b.limitAmount > 0) || [];
  const overBudgetBudgets =
    budgets?.filter((b) => b.currentSpending > b.limitAmount) || [];

  if (budgetsLoading || statsLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={`loading-skeleton-${index}`} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 mb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Budget Management</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Kelola anggaran bulanan dan pantau pengeluaran Anda
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Button
            variant="outline"
            onClick={() => recalculateMutation.mutate()}
            disabled={recalculateMutation.isPending}
            className="w-full sm:w-auto"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            {recalculateMutation.isPending ? "Recalculating..." : "Recalculate"}
          </Button>
          <Button
            variant="outline"
            onClick={() => resetMutation.mutate()}
            disabled={resetMutation.isPending}
            className="w-full sm:w-auto"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            {resetMutation.isPending ? "Resetting..." : "Reset Monthly"}
          </Button>
          {categories && (
            <CreateBudgetDialog
              categories={categories}
              onSuccess={() => {
                // Optional: could add additional logic here if needed
              }}
            />
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budgets</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalBudgets || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Budgets
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.activeBudgets || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Over Budget</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {stats?.overBudget || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Limit</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rp {(stats?.totalLimit || 0).toLocaleString("id-ID")}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="active">Active Budgets</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Budget Overview */}
          {activeBudgets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeBudgets.map((budget) => (
                <BudgetProgressCard key={budget.id} budget={budget} />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Belum ada budget</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Budget membantu Anda mengontrol pengeluaran. Mulai dengan
                membuat budget untuk kategori pengeluaran utama.
              </p>
              <div className="flex justify-center">
                {categories && (
                  <CreateBudgetDialog
                    categories={categories}
                    onSuccess={() => {
                      // Optional: could add additional logic here if needed
                    }}
                  />
                )}
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-6">
          {/* Active Budgets */}
          {activeBudgets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeBudgets.map((budget) => (
                <BudgetProgressCard key={budget.id} budget={budget} />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Active Budgets</h3>
              <p className="text-muted-foreground">
                Create budgets to start tracking your spending limits.
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          {/* Budget Alerts */}
          {overBudgetBudgets.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <h3 className="text-lg font-semibold">Over Budget Alerts</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {overBudgetBudgets.map((budget) => (
                  <BudgetProgressCard
                    key={budget.id}
                    budget={budget}
                    showAlert={true}
                  />
                ))}
              </div>
            </div>
          ) : (
            <Card className="p-8 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">
                All Budgets On Track
              </h3>
              <p className="text-muted-foreground">
                Great job! All your budgets are within limits. Keep up the good
                work!
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
