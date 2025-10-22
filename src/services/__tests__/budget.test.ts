import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the database before importing anything else
vi.mock("@/db", () => ({
  db: {
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(),
      })),
    })),
    query: {
      budgets: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
    },
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(),
        })),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(),
    })),
  },
}));

import { db } from "@/db";
import {
  createBudget,
  deleteBudget,
  getBudgets,
  resetMonthlyBudgets,
  updateBudget,
  updateBudgetSpending,
} from "@/services/budget";

describe("Budget Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  describe("createBudget", () => {
    it("should create a new budget", async () => {
      const mockBudget = {
        id: 1,
        userId: 1,
        categoryId: 1,
        period: "MONTHLY",
        limitAmount: "100000",
        currentSpending: "0",
      };

      // Mock the insert chain
      const mockReturning = vi.fn().mockResolvedValue([mockBudget]);
      const mockValues = vi.fn().mockReturnValue({
        returning: mockReturning,
      });
      const mockInsert = vi.fn().mockReturnValue({
        values: mockValues,
      });

      (db.insert as any).mockImplementation(mockInsert);

      const result = await createBudget(1, {
        categoryId: 1,
        period: "MONTHLY",
        limitAmount: 100000,
      });

      expect(result).toEqual(mockBudget);
    });
  });

  describe("getBudgets", () => {
    it("should return budgets for user", async () => {
      const mockBudgets = [
        {
          id: 1,
          userId: 1,
          categoryId: 1,
          period: "MONTHLY",
          limitAmount: "100000",
          currentSpending: "50000",
          category: { id: 1, name: "Food" },
        },
      ];

      (db.query.budgets.findMany as any).mockResolvedValue(mockBudgets);

      const result = await getBudgets(1);

      expect(result).toEqual(mockBudgets);
    });
  });

  describe("updateBudget", () => {
    it("should update budget successfully", async () => {
      const mockBudget = {
        id: 1,
        userId: 1,
        categoryId: 1,
        period: "MONTHLY",
        limitAmount: "150000",
        currentSpending: "50000",
      };

      // Mock the update chain
      const mockReturning = vi.fn().mockResolvedValue([mockBudget]);
      const mockWhere = vi.fn().mockReturnValue({
        returning: mockReturning,
      });
      const mockSet = vi.fn().mockReturnValue({
        where: mockWhere,
      });
      const mockUpdate = vi.fn().mockReturnValue({
        set: mockSet,
      });

      (db.update as any).mockImplementation(mockUpdate);

      const result = await updateBudget(1, 1, {
        limitAmount: 150000,
      });

      expect(result).toEqual(mockBudget);
    });
  });

  describe("deleteBudget", () => {
    it("should delete budget successfully", async () => {
      // Mock the delete chain
      const mockWhere = vi.fn().mockResolvedValue(undefined);
      const mockDelete = vi.fn().mockReturnValue({
        where: mockWhere,
      });

      (db.delete as any).mockImplementation(mockDelete);

      await expect(deleteBudget(1, 1)).resolves.toBeUndefined();
    });
  });

  describe("updateBudgetSpending", () => {
    it("should update spending and return null when under limit", async () => {
      const mockBudget = {
        id: 1,
        currentSpending: "30000",
        limitAmount: "50000",
        category: {
          name: "Food",
        },
      };

      (db.query.budgets.findFirst as any).mockResolvedValue(mockBudget);

      // Mock the update chain
      const mockWhere = vi.fn().mockResolvedValue(undefined);
      const mockSet = vi.fn().mockReturnValue({
        where: mockWhere,
      });
      const mockUpdate = vi.fn().mockReturnValue({
        set: mockSet,
      });

      (db.update as any).mockImplementation(mockUpdate);

      const result = await updateBudgetSpending(1, 1, 20000);

      expect(result).toBeNull();
    });

    it("should return budget alert when limit exceeded", async () => {
      const mockBudget = {
        id: 1,
        currentSpending: "80000",
        limitAmount: "100000",
        category: { name: "Food" },
      };

      (db.query.budgets.findFirst as any).mockResolvedValue(mockBudget);

      // Mock the update chain
      const mockWhere = vi.fn().mockResolvedValue(undefined);
      const mockSet = vi.fn().mockReturnValue({
        where: mockWhere,
      });
      const mockUpdate = vi.fn().mockReturnValue({
        set: mockSet,
      });

      (db.update as any).mockImplementation(mockUpdate);

      const result = await updateBudgetSpending(1, 1, 25000);

      expect(result).toEqual({
        exceeded: true,
        categoryName: "Food",
        currentSpending: 105000,
        limitAmount: 100000,
        overAmount: 5000,
      });
    });

    it("should return null when no budget exists", async () => {
      (db.query.budgets.findFirst as any).mockResolvedValue(null);

      const result = await updateBudgetSpending(1, 1, 50000);

      expect(result).toBeNull();
    });
  });

  describe("resetMonthlyBudgets", () => {
    it("should reset monthly budgets spending to zero", async () => {
      // Mock the update chain
      const mockWhere = vi.fn().mockResolvedValue(undefined);
      const mockSet = vi.fn().mockReturnValue({
        where: mockWhere,
      });
      const mockUpdate = vi.fn().mockReturnValue({
        set: mockSet,
      });

      (db.update as any).mockImplementation(mockUpdate);

      await expect(resetMonthlyBudgets(1)).resolves.toBeUndefined();
    });
  });
});
