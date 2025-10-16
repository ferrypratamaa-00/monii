"use client";

import {
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface TrendData {
  month: string;
  income: number;
  expense: number;
}

interface LineChartProps {
  data: TrendData[];
  height?: number;
}

export function LineChart({ data, height = 300 }: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => {
            const date = new Date(`${value}-01`);
            return date.toLocaleDateString("en-US", {
              month: "short",
              year: "2-digit",
            });
          }}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => `Rp ${value.toLocaleString()}`}
        />
        <Tooltip
          formatter={(value: number, name: string) => [
            `Rp ${value.toLocaleString()}`,
            name === "income" ? "Income" : "Expense",
          ]}
          labelFormatter={(label) => {
            const date = new Date(`${label}-01`);
            return date.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            });
          }}
        />
        <Line
          type="monotone"
          dataKey="income"
          stroke="#66c2a5"
          strokeWidth={2}
          dot={{ fill: "#66c2a5", strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="expense"
          stroke="#fc8d62"
          strokeWidth={2}
          dot={{ fill: "#fc8d62", strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6 }}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
