"use client";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface BudgetProgressBarProps {
  currentSpending: number;
  limitAmount: number;
  categoryName: string;
}

export function BudgetProgressBar({
  currentSpending,
  limitAmount,
  categoryName,
}: BudgetProgressBarProps) {
  const percentage = (currentSpending / limitAmount) * 100;
  const remaining = limitAmount - currentSpending;

  // Warna dinamis berdasarkan persentase
  const getProgressColor = () => {
    if (percentage < 60) return "bg-green-500";
    if (percentage < 80) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getStatusText = () => {
    if (percentage < 60) return "Aman";
    if (percentage < 80) return "Waspada";
    return "Melebihi Batas";
  };

  const getStatusVariant = () => {
    if (percentage < 60) return "default";
    if (percentage < 80) return "secondary";
    return "destructive";
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="font-medium">{categoryName}</span>
        <Badge variant={getStatusVariant()}>{getStatusText()}</Badge>
      </div>

      <Progress
        value={Math.min(percentage, 100)}
        className="h-3"
        // Custom styling untuk warna dinamis
        style={
          {
            "--progress-background": getProgressColor(),
          } as React.CSSProperties
        }
      />

      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Rp {currentSpending.toLocaleString()}</span>
        <span>Rp {limitAmount.toLocaleString()}</span>
      </div>

      <div className="text-xs text-muted-foreground">
        {remaining > 0 ? (
          <span>Sisa anggaran: Rp {remaining.toLocaleString()}</span>
        ) : (
          <span className="text-red-500">
            Melebihi: Rp {Math.abs(remaining).toLocaleString()}
          </span>
        )}
      </div>
    </div>
  );
}
