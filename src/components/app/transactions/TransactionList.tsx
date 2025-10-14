"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import TransactionModal from "./TransactionModal";

interface Transaction {
  id: number;
  type: "INCOME" | "EXPENSE";
  amount: string;
  description: string;
  date: Date;
  account: { name: string };
  category?: { name: string };
}

export default function TransactionList() {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const response = await fetch("/api/transactions");
      if (!response.ok) throw new Error("Failed to fetch transactions");
      return response.json();
    },
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading transactions...</div>;
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">No transactions yet</p>
        <TransactionModal />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Transactions</h2>
        <TransactionModal />
      </div>

      <div className="space-y-2">
        {transactions.map((transaction: Transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    transaction.type === "INCOME"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
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
                transaction.type === "INCOME"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {transaction.type === "INCOME" ? "+" : "-"}Rp{" "}
              {parseFloat(transaction.amount).toLocaleString("id-ID")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
