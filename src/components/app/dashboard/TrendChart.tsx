"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LineChart } from "@/components/ui/charts/LineChart";
import { useLanguage } from "@/components/LanguageProvider";

interface TrendChartProps {
  data: {
    month: string;
    income: number;
    expense: number;
  }[];
}

export default function TrendChart({ data }: TrendChartProps) {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("charts.incomeVsExpense")}</CardTitle>
        <CardDescription>{t("charts.last12Months")}</CardDescription>
      </CardHeader>
      <CardContent>
        <LineChart data={data} />
      </CardContent>
    </Card>
  );
}
