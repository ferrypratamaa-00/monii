/** biome-ignore-all lint/a11y/useSemanticElements: <> */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: <> */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <> */
/** biome-ignore-all lint/a11y/useAriaPropsSupportedByRole: <> */
/** biome-ignore-all lint/a11y/noNoninteractiveTabindex: <> */
"use client";

import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Transaction {
  id: number;
  type: "INCOME" | "EXPENSE";
  amount: string;
  description: string;
  date: Date;
  account: { name: string };
  category?: { name: string };
}

interface SwipeableTransactionItemProps {
  transaction: Transaction;
  onDelete: (id: number) => void;
}

export default function SwipeableTransactionItem({
  transaction,
  onDelete,
}: SwipeableTransactionItemProps) {
  const [isSwiped, setIsSwiped] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const itemRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!startX) return;

    const currentX = e.touches[0].clientX;
    const diff = startX - currentX;

    // Only allow swipe from right to left (negative diff)
    if (diff > 0) {
      setCurrentX(Math.min(diff, 80)); // Max swipe distance
      setIsSwiped(diff > 50); // Threshold for showing delete button
    }
  };

  const handleTouchEnd = () => {
    if (currentX > 50) {
      setCurrentX(80); // Keep delete button visible
      setIsSwiped(true);
    } else {
      setCurrentX(0);
      setIsSwiped(false);
    }
    setStartX(0);
  };

  const handleDelete = () => {
    onDelete(transaction.id);
    setCurrentX(0);
    setIsSwiped(false);
  };

  const handleCancel = () => {
    setCurrentX(0);
    setIsSwiped(false);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Delete Button (behind) */}
      <div
        className={cn(
          "absolute right-0 top-0 h-full bg-red-500 flex items-center justify-center transition-all duration-200",
          isSwiped ? "w-20" : "w-0",
        )}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          className="text-white hover:bg-red-600 h-full w-full rounded-none"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Transaction Item */}
      <div
        ref={itemRef}
        className={cn(
          "flex items-center justify-between p-4 border rounded-lg bg-background transition-transform duration-200",
          isSwiped ? "bg-red-50 border-red-200" : "hover:bg-primary/5",
        )}
        style={{
          transform: `translateX(-${currentX}px)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="listitem"
        tabIndex={0}
        aria-label={`Transaction: ${transaction.description}, ${
          transaction.type === "INCOME" ? "Income" : "Expense"
        } of ${parseFloat(transaction.amount).toLocaleString("id-ID")} rupiah`}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-1 text-xs rounded ${
                transaction.type === "INCOME"
                  ? "bg-income/20 text-income"
                  : "bg-expense/20 text-expense"
              }`}
              aria-label={`Transaction type: ${
                transaction.type === "INCOME" ? "Income" : "Expense"
              }`}
            >
              {transaction.type}
            </span>
            <span className="font-medium">{transaction.description}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {transaction.account.name}
            {transaction.category && ` • ${transaction.category.name}`}
            {" • "}
            {format(new Date(transaction.date), "MMM dd, yyyy")}
          </div>
        </div>
        <div
          className={`font-semibold ${
            transaction.type === "INCOME" ? "text-income" : "text-expense"
          }`}
          aria-label={`Amount: ${
            transaction.type === "INCOME" ? "plus" : "minus"
          } ${parseFloat(transaction.amount).toLocaleString("id-ID")} rupiah`}
        >
          {transaction.type === "INCOME" ? "+" : "-"}Rp{" "}
          {parseFloat(transaction.amount).toLocaleString("id-ID")}
        </div>
      </div>

      {/* Cancel overlay when swiped */}
      {isSwiped && (
        <div
          className="fixed inset-0 z-10 md:hidden"
          onClick={handleCancel}
          onTouchStart={handleCancel}
        />
      )}
    </div>
  );
}
