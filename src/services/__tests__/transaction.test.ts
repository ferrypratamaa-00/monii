import { describe, expect, it, vi } from "vitest";
import { db } from "@/db";
import {
  createTransaction,
  getFilteredTransactions,
  getTransactions,
} from "@/services/transaction";

// Mock the database
vi.mock("@/db", () => ({
  db: {
    transaction: vi.fn(),
    query: {
      transactions: {
        findMany: vi.fn(),
      },
    },
  },
}));

// Mock the budget and notification services
vi.mock("@/services/budget", () => ({
  updateBudgetSpending: vi.fn(),
}));

vi.mock("@/services/notification", () => ({
  createNotification: vi.fn(),
}));

describe("Transaction Service", () => {
  describe("createTransaction", () => {
    it("should create income transaction successfully", async () => {
      const mockTransaction = {
        id: 1,
        amount: "100000",
        description: "Salary",
        type: "INCOME",
        userId: 1,
        accountId: 1,
        categoryId: 1,
        date: new Date(),
      };

      const mockTx = {
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockTransaction]),
          }),
        }),
        update: vi.fn().mockReturnValue({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(undefined),
          }),
        }),
      };

      (db.transaction as any).mockImplementation((callback: any) =>
        callback(mockTx),
      );

      const result = await createTransaction({
        amount: 100000,
        description: "Salary",
        type: "INCOME",
        userId: 1,
        accountId: 1,
        categoryId: 1,
        date: new Date(),
        isRecurring: false,
      });

      expect(result).toEqual(mockTransaction);
      expect(mockTx.insert).toHaveBeenCalled();
      expect(mockTx.update).toHaveBeenCalled();
    });

    it("should create expense transaction and update budget", async () => {
      const mockTransaction = {
        id: 1,
        amount: "-50000",
        description: "Food",
        type: "EXPENSE",
        userId: 1,
        accountId: 1,
        categoryId: 1,
        date: new Date(),
      };

      const mockBudgetAlert = {
        exceeded: true,
        categoryName: "Food",
        overAmount: 5000,
        currentSpending: 55000,
        limitAmount: 50000,
      };

      const mockTx = {
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockTransaction]),
          }),
        }),
        update: vi.fn().mockReturnValue({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(undefined),
          }),
        }),
      };

      (db.transaction as any).mockImplementation((callback: any) =>
        callback(mockTx),
      );

      // Mock budget service to return alert
      const { updateBudgetSpending } = await import("@/services/budget");
      (updateBudgetSpending as any).mockResolvedValue(mockBudgetAlert);

      const result = await createTransaction({
        amount: -50000,
        description: "Food",
        type: "EXPENSE",
        userId: 1,
        accountId: 1,
        categoryId: 1,
        date: new Date(),
        isRecurring: false,
      });

      expect(result).toEqual(mockTransaction);
      expect(updateBudgetSpending).toHaveBeenCalledWith(1, 1, 50000);

      // Should create notification for budget alert
      const { createNotification } = await import("@/services/notification");
      expect(createNotification).toHaveBeenCalledWith(
        1,
        "BUDGET_ALERT",
        "Budget Alert",
        expect.stringContaining("exceeded your budget"),
      );
    });

    it("should handle transaction creation failure", async () => {
      const mockError = new Error("Database error");

      (db.transaction as any).mockImplementation(() => {
        throw mockError;
      });

      await expect(
        createTransaction({
          amount: 100000,
          description: "Salary",
          type: "INCOME",
          userId: 1,
          accountId: 1,
          categoryId: 1,
          date: new Date(),
          isRecurring: false,
        }),
      ).rejects.toThrow("Database error");
    });
  });

  describe("getTransactions", () => {
    it("should return transactions for user", async () => {
      const mockTransactions = [
        {
          id: 1,
          amount: "100000",
          description: "Salary",
          type: "INCOME",
          userId: 1,
          account: { id: 1, name: "Bank" },
          category: { id: 1, name: "Income" },
          date: new Date(),
        },
      ];

      (db.query.transactions.findMany as any).mockResolvedValue(
        mockTransactions,
      );

      const result = await getTransactions(1);

      expect(db.query.transactions.findMany).toHaveBeenCalledWith({
        where: expect.any(Object),
        with: {
          account: true,
          category: true,
        },
        orderBy: expect.any(Function),
      });
      expect(result).toEqual(mockTransactions);
    });
  });

  describe("getFilteredTransactions", () => {
    it("should return filtered transactions", async () => {
      const mockTransactions = [
        {
          id: 1,
          amount: "50000",
          description: "Food",
          type: "EXPENSE",
          userId: 1,
          account: { id: 1, name: "Bank" },
          category: { id: 1, name: "Food" },
          date: new Date(),
        },
      ];

      (db.query.transactions.findMany as any).mockResolvedValue(
        mockTransactions,
      );

      const filters = {
        query: "food",
        categoryId: 1,
        accountId: 1,
        dateFrom: new Date("2024-01-01"),
        dateTo: new Date("2024-12-31"),
        amountMin: 10000,
        amountMax: 100000,
        type: "EXPENSE" as const,
      };

      const result = await getFilteredTransactions(1, filters);

      expect(db.query.transactions.findMany).toHaveBeenCalledWith({
        where: expect.any(Object),
        with: {
          account: true,
          category: true,
        },
        orderBy: expect.any(Function),
      });
      expect(result).toEqual(mockTransactions);
    });

    it("should handle empty filters", async () => {
      const mockTransactions: never[] = [];

      (db.query.transactions.findMany as any).mockResolvedValue(
        mockTransactions,
      );

      const result = await getFilteredTransactions(1, {});

      expect(result).toEqual([]);
    });
  });
});
