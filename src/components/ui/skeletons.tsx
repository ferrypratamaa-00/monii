"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} />;
}

// Transaction List Skeleton
export function TransactionListSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Search Form */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Transaction Items */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => {
          let index = i;
          return (
            <div
              key={index++}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-5 w-20" />
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <Skeleton className="h-4 w-32" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  );
}

// Dashboard Skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <div className="shadow-lg border-0 bg-gradient-to-br from-card to-card/80 rounded-lg p-6">
        <Skeleton className="h-12 w-48 mb-6" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>

      {/* Income/Expense Summary */}
      <div className="grid gap-4 grid-cols-2">
        <div className="shadow-md border-0 rounded-lg p-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div>
              <Skeleton className="h-4 w-16 mb-1" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        </div>
        <div className="shadow-md border-0 rounded-lg p-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div>
              <Skeleton className="h-4 w-16 mb-1" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="shadow-md border-0 rounded-lg p-4">
        <div className="flex items-center justify-between pb-3 mb-4 border-b">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => {
            let index = i;
            return (
              <div key={index++} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart */}
      <div className="shadow-md border-0 rounded-lg p-4">
        <Skeleton className="h-6 w-32 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

// Card Skeleton
export function CardSkeleton() {
  return (
    <div className="shadow-md border-0 rounded-lg p-6">
      <Skeleton className="h-6 w-32 mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => {
          let index = i;
          return (
            <div key={index++} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Table Skeleton
export function TableSkeleton({
  rows = 5,
  columns = 4,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="space-y-4">
      {/* Table Header */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: <>
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>

      {/* Table Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex++}
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex++} className="h-4 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}
