"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useLanguage } from "@/components/LanguageProvider";

interface PieChartProps {
  data: { name: string; value: number }[];
}

export default function ExpensePieChart({ data }: PieChartProps) {
  const { t } = useLanguage();

  // Use CSS custom properties for chart colors
  const getChartColor = (index: number) => {
    // Get the computed style to access CSS custom properties
    const root =
      typeof window !== "undefined"
        ? getComputedStyle(document.documentElement)
        : null;
    const colors = [
      root?.getPropertyValue("--chart-1") || "#d4a5c4",
      root?.getPropertyValue("--chart-2") || "#b88ba8",
      root?.getPropertyValue("--chart-3") || "#e8c5d8",
      root?.getPropertyValue("--chart-4") || "#d8b5c8",
      root?.getPropertyValue("--chart-5") || "#c8a8b8",
    ];
    return colors[index % colors.length];
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) =>
            `${name} ${((percent as number) * 100).toFixed(0)}%`
          }
          outerRadius={80}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${entry.name}`} fill={getChartColor(index)} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [
            `Rp ${value.toLocaleString("id-ID")}`,
            t("charts.amount"),
          ]}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
