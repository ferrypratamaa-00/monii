"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LineChart } from "@/components/ui/charts/LineChart";
import { Skeleton } from "@/components/ui/skeleton";
import { getMonthlyTrendData } from "@/services/dashboard";

export function TrendChart() {
  const {
    data: trendData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["monthly-trend"],
    queryFn: () => getMonthlyTrendData(1), // TODO: Get from auth context
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Income vs Expense Trend</CardTitle>
          <CardDescription>Last 12 months</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Income vs Expense Trend</CardTitle>
          <CardDescription>Last 12 months</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Failed to load trend data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Income vs Expense Trend</CardTitle>
        <CardDescription>Last 12 months</CardDescription>
      </CardHeader>
      <CardContent>
        <LineChart data={trendData || []} />
      </CardContent>
    </Card>
  );
}
