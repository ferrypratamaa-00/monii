/** biome-ignore-all lint/a11y/useSemanticElements: <> */
"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useState } from "react";

import TransactionModal from "./TransactionModal";
import AdvancedSearchForm from "@/components/AdvancedSearchForm";
import { getFilteredTransactions } from "@/services/transaction";
import type { SearchFiltersSchema } from "@/lib/validations/search";
import { z } from "zod";

type SearchFilters = z.infer<typeof SearchFiltersSchema>;

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
  const [filters, setFilters] = useState<SearchFilters | null>(null);

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactions", filters],
    queryFn: async () => {
      if (filters && Object.keys(filters).length > 0) {
        // Use filtered transactions service
        return getFilteredTransactions(1, filters); // TODO: Get userId from auth
      } else {
        // Use regular API for all transactions
        const response = await fetch("/api/transactions");
        if (!response.ok) throw new Error("Failed to fetch transactions");
        return response.json();
      }
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json();
    },
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const response = await fetch("/api/accounts");
      if (!response.ok) throw new Error("Failed to fetch accounts");
      return response.json();
    },
  });

  const handleSearch = async (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

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
        <h2 className="text-2xl font-bold" id="transactions-heading">Transactions</h2>
        <TransactionModal />
      </div>

      <AdvancedSearchForm
        onFiltersChange={setFilters}
        categories={categories}
        accounts={accounts}
      />

      <div className="space-y-2" role="list" aria-labelledby="transactions-heading">
        {transactions.map((transaction: Transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-inset"
            role="listitem"
            // biome-ignore lint/a11y/noNoninteractiveTabindex: <>
            tabIndex={0}
            aria-label={`Transaction: ${transaction.description}, ${transaction.type === "INCOME" ? "Income" : "Expense"} of ${parseFloat(transaction.amount).toLocaleString("id-ID")} rupiah`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {/** biome-ignore lint/a11y/useAriaPropsSupportedByRole: <> */}
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    transaction.type === "INCOME"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                  aria-label={`Transaction type: ${transaction.type === "INCOME" ? "Income" : "Expense"}`}
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
            {/** biome-ignore lint/a11y/useAriaPropsSupportedByRole: <> */}
            <div
              className={`font-semibold ${
                transaction.type === "INCOME"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
              aria-label={`Amount: ${transaction.type === "INCOME" ? "plus" : "minus"} ${parseFloat(transaction.amount).toLocaleString("id-ID")} rupiah`}
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
