"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LineChart } from "@/components/ui/charts/LineChart";

interface TrendChartProps {
  data: {
    month: string;
    income: number;
    expense: number;
  }[];
}

export function TrendChart({ data }: TrendChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Income vs Expense Trend</CardTitle>
        <CardDescription>Last 12 months</CardDescription>
      </CardHeader>
      <CardContent>
        <LineChart data={data} />
      </CardContent>
    </Card>
  );
}
