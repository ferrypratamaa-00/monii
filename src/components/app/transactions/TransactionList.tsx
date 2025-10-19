/** biome-ignore-all lint/a11y/useSemanticElements: <> */
/** biome-ignore-all lint/a11y/noNoninteractiveTabindex: <> */
/** biome-ignore-all lint/a11y/useAriaPropsSupportedByRole: <> */
"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import dynamic from "next/dynamic";
import { useState } from "react";
import { toast } from "sonner";
import type { z } from "zod";
import type { SearchFiltersSchema } from "@/lib/validations/search";

// Lazy load heavy components
const AdvancedSearchForm = dynamic(
  () => import("@/components/AdvancedSearchForm"),
  {
    loading: () => (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    ),
  },
);
const TransactionModal = dynamic(() => import("./TransactionModal"), {
  loading: () => (
    <button
      type="button"
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      disabled
    >
      Loading...
    </button>
  ),
});
const SwipeableTransactionItem = dynamic(
  () => import("./SwipeableTransactionItem"),
  {
    loading: () => (
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-24"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </div>
    ),
  },
);

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
  const [page, setPage] = useState(1);
  const limit = 50;

  const { data: result, isLoading } = useQuery({
    queryKey: ["transactions", filters, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (filters && Object.keys(filters).length > 0) {
        // Use filtered transactions API
        const response = await fetch("/api/transactions/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...filters, page, limit }),
        });
        if (!response.ok)
          throw new Error("Failed to fetch filtered transactions");
        return response.json();
      } else {
        // Use regular API for all transactions
        const response = await fetch(`/api/transactions?${params}`);
        if (!response.ok) throw new Error("Failed to fetch transactions");
        return response.json();
      }
    },
  });

  const transactions = result?.transactions || [];
  const pagination = result?.pagination;

  const handleDeleteTransaction = async (transactionId: number) => {
    if (!confirm("Are you sure you want to delete this transaction?")) {
      return;
    }

    try {
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete transaction");
      }

      toast.success("Transaction deleted successfully");
      // Refetch transactions
      window.location.reload();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error("Failed to delete transaction");
    }
  };

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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => {
            let idx = i;
            return (
              <div
                key={idx++}
                className="h-16 bg-gray-200 rounded animate-pulse"
              ></div>
            );
          })}
        </div>
      </div>
    );
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
        <h2 className="text-2xl font-bold" id="transactions-heading">
          Transactions
        </h2>
        <TransactionModal />
      </div>

      <AdvancedSearchForm
        onFiltersChange={(newFilters) => {
          setFilters(newFilters);
          setPage(1); // Reset to first page when filters change
        }}
        categories={categories}
        accounts={accounts}
      />

      <div
        className="space-y-2"
        role="list"
        aria-labelledby="transactions-heading"
      >
        {transactions.map((transaction: Transaction) => (
          <div key={transaction.id}>
            {/* Mobile: Swipeable Item */}
            <div className="md:hidden">
              <SwipeableTransactionItem
                transaction={transaction}
                onDelete={handleDeleteTransaction}
              />
            </div>

            {/* Desktop: Regular Item */}
            <div className="hidden md:block">
              <div
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-primary/5 focus-within:ring-2 focus-within:ring-primary focus-within:ring-inset"
                role="listitem"
                tabIndex={0}
                aria-label={`Transaction: ${transaction.description}, ${transaction.type === "INCOME" ? "Income" : "Expense"} of ${parseFloat(transaction.amount).toLocaleString("id-ID")} rupiah`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        transaction.type === "INCOME"
                          ? "bg-income/20 text-income"
                          : "bg-expense/20 text-expense"
                      }`}
                      aria-label={`Transaction type: ${transaction.type === "INCOME" ? "Income" : "Expense"}`}
                    >
                      {transaction.type}
                    </span>
                    <span className="font-medium">
                      {transaction.description}
                    </span>
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
                      ? "text-income"
                      : "text-expense"
                  }`}
                  aria-label={`Amount: ${transaction.type === "INCOME" ? "plus" : "minus"} ${parseFloat(transaction.amount).toLocaleString("id-ID")} rupiah`}
                >
                  {transaction.type === "INCOME" ? "+" : "-"}Rp{" "}
                  {parseFloat(transaction.amount).toLocaleString("id-ID")}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} transactions
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/10"
            >
              Previous
            </button>
            <span className="text-sm">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
              disabled={page === pagination.totalPages}
              className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/10"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
