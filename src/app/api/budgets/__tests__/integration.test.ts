import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";
import { DELETE, GET as getBudget, PUT } from "@/app/api/budgets/[id]/route";
import { POST as resetBudgets } from "@/app/api/budgets/reset-monthly/route";
import { GET, POST } from "@/app/api/budgets/route";
import { GET as getStats } from "@/app/api/budgets/stats/route";

// Mock the auth service
vi.mock("@/lib/auth-server", () => ({
  auth: vi.fn(),
}));

// Mock the budget service
vi.mock("@/services/budget", () => ({
  createBudget: vi.fn(),
  getBudgets: vi.fn(),
  updateBudget: vi.fn(),
  deleteBudget: vi.fn(),
  resetMonthlyBudgets: vi.fn(),
}));

// Mock NextResponse
vi.mock("next/server", () => ({
  NextResponse: {
    json: vi.fn(),
  },
}));

describe("Budget API Integration Tests", () => {
  describe("GET /api/budgets", () => {
    it("should return budgets for authenticated user", async () => {
      const { auth } = await import("@/lib/auth-server");
      const { getBudgets } = await import("@/services/budget");
      const { NextResponse } = await import("next/server");

      (auth as any).mockResolvedValue({
        user: { id: "1" },
      });

      const mockBudgets = [
        {
          id: 1,
          categoryId: 1,
          period: "MONTHLY",
          limitAmount: "100000",
          currentSpending: "50000",
          category: { name: "Food" },
        },
      ];

      (getBudgets as any).mockResolvedValue(mockBudgets);
      (NextResponse.json as any).mockReturnValue({
        status: 200,
        data: mockBudgets,
      });

      const response = await GET();

      expect(auth).toHaveBeenCalled();
      expect(getBudgets).toHaveBeenCalledWith(1);
      expect(NextResponse.json).toHaveBeenCalledWith(mockBudgets);
    });

    it("should return 401 for unauthenticated user", async () => {
      const { auth } = await import("@/lib/auth-server");
      const { NextResponse } = await import("next/server");

      (auth as any).mockResolvedValue(null);
      (NextResponse.json as any).mockReturnValue({
        status: 401,
        error: "Unauthorized",
      });

      const response = await GET();

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: "Unauthorized" },
        { status: 401 },
      );
    });
  });

  describe("POST /api/budgets", () => {
    it("should create budget successfully", async () => {
      const { auth } = await import("@/lib/auth-server");
      const { createBudget } = await import("@/services/budget");
      const { NextResponse } = await import("next/server");

      (auth as any).mockResolvedValue({
        user: { id: "1" },
      });

      const mockBudget = {
        id: 1,
        categoryId: 1,
        period: "MONTHLY",
        limitAmount: "100000",
      };

      (createBudget as any).mockResolvedValue(mockBudget);
      (NextResponse.json as any).mockReturnValue({
        status: 201,
        data: mockBudget,
      });

      const request = new NextRequest("http://localhost:3000/api/budgets", {
        method: "POST",
        body: JSON.stringify({
          categoryId: 1,
          period: "MONTHLY",
          limitAmount: 100000,
        }),
      });

      const response = await POST(request);

      expect(createBudget).toHaveBeenCalledWith(1, {
        categoryId: 1,
        period: "MONTHLY",
        limitAmount: 100000,
      });
      expect(NextResponse.json).toHaveBeenCalledWith(mockBudget, {
        status: 201,
      });
    });

    it("should handle validation errors", async () => {
      const { auth } = await import("@/lib/auth-server");
      const { NextResponse } = await import("next/server");

      (auth as any).mockResolvedValue({
        user: { id: "1" },
      });

      (NextResponse.json as any).mockReturnValue({
        status: 400,
        error: "Validation error",
      });

      const request = new NextRequest("http://localhost:3000/api/budgets", {
        method: "POST",
        body: JSON.stringify({
          // Invalid data - missing required fields
          categoryId: "invalid",
        }),
      });

      const response = await POST(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: expect.any(String) },
        { status: 400 },
      );
    });
  });

  describe("GET /api/budgets/[id]", () => {
    it("should return budget by id", async () => {
      const { auth } = await import("@/lib/auth-server");
      const { getBudgets } = await import("@/services/budget");
      const { NextResponse } = await import("next/server");

      (auth as any).mockResolvedValue({
        user: { id: "1" },
      });

      const mockBudget = {
        id: 1,
        categoryId: 1,
        period: "MONTHLY",
        limitAmount: "100000",
        currentSpending: "50000",
        category: { name: "Food" },
      };

      (getBudgets as any).mockResolvedValue([mockBudget]);
      (NextResponse.json as any).mockReturnValue({
        status: 200,
        data: mockBudget,
      });

      const response = await getBudget(
        new NextRequest("http://localhost:3000/api/budgets/1"),
        { params: Promise.resolve({ id: "1" }) },
      );

      expect(getBudgets).toHaveBeenCalledWith(1);
      expect(NextResponse.json).toHaveBeenCalledWith(mockBudget);
    });

    it("should return 404 for non-existent budget", async () => {
      const { auth } = await import("@/lib/auth-server");
      const { getBudgets } = await import("@/services/budget");
      const { NextResponse } = await import("next/server");

      (auth as any).mockResolvedValue({
        user: { id: "1" },
      });

      (getBudgets as any).mockResolvedValue([]);
      (NextResponse.json as any).mockReturnValue({
        status: 404,
        error: "Budget not found",
      });

      const response = await getBudget(
        new NextRequest("http://localhost:3000/api/budgets/999"),
        { params: Promise.resolve({ id: "999" }) },
      );

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: "Budget not found" },
        { status: 404 },
      );
    });
  });

  describe("PUT /api/budgets/[id]", () => {
    it("should update budget successfully", async () => {
      const { auth } = await import("@/lib/auth-server");
      const { updateBudget } = await import("@/services/budget");
      const { NextResponse } = await import("next/server");

      (auth as any).mockResolvedValue({
        user: { id: "1" },
      });

      const mockBudget = {
        id: 1,
        categoryId: 1,
        period: "MONTHLY",
        limitAmount: "150000",
      };

      (updateBudget as any).mockResolvedValue(mockBudget);
      (NextResponse.json as any).mockReturnValue({
        status: 200,
        data: mockBudget,
      });

      const request = new NextRequest("http://localhost:3000/api/budgets/1", {
        method: "PUT",
        body: JSON.stringify({
          limitAmount: 150000,
        }),
      });

      const response = await PUT(request, {
        params: Promise.resolve({ id: "1" }),
      });

      expect(updateBudget).toHaveBeenCalledWith(1, 1, {
        limitAmount: 150000,
      });
      expect(NextResponse.json).toHaveBeenCalledWith(mockBudget);
    });
  });

  describe("DELETE /api/budgets/[id]", () => {
    it("should delete budget successfully", async () => {
      const { auth } = await import("@/lib/auth-server");
      const { deleteBudget } = await import("@/services/budget");
      const { NextResponse } = await import("next/server");

      (auth as any).mockResolvedValue({
        user: { id: "1" },
      });

      (deleteBudget as any).mockResolvedValue(undefined);
      (NextResponse.json as any).mockReturnValue({
        status: 200,
        message: "Budget deleted successfully",
      });

      const request = new NextRequest("http://localhost:3000/api/budgets/1", {
        method: "DELETE",
      });

      const response = await DELETE(request, {
        params: Promise.resolve({ id: "1" }),
      });

      expect(deleteBudget).toHaveBeenCalledWith(1, 1);
      expect(NextResponse.json).toHaveBeenCalledWith({
        message: "Budget deleted successfully",
      });
    });
  });

  describe("POST /api/budgets/reset-monthly", () => {
    it("should reset monthly budgets", async () => {
      const { auth } = await import("@/lib/auth-server");
      const { resetMonthlyBudgets } = await import("@/services/budget");
      const { NextResponse } = await import("next/server");

      (auth as any).mockResolvedValue({
        user: { id: "1" },
      });

      (resetMonthlyBudgets as any).mockResolvedValue(undefined);
      (NextResponse.json as any).mockReturnValue({
        status: 200,
        message: "Monthly budgets reset successfully",
      });

      const request = new NextRequest(
        "http://localhost:3000/api/budgets/reset-monthly",
        {
          method: "POST",
        },
      );

      const response = await resetBudgets(request);

      expect(resetMonthlyBudgets).toHaveBeenCalledWith(1);
      expect(NextResponse.json).toHaveBeenCalledWith({
        message: "Monthly budgets reset successfully",
      });
    });
  });

  describe("GET /api/budgets/stats", () => {
    it("should return budget statistics", async () => {
      const { auth } = await import("@/lib/auth-server");
      const { getBudgets } = await import("@/services/budget");
      const { NextResponse } = await import("next/server");

      (auth as any).mockResolvedValue({
        user: { id: "1" },
      });

      const mockBudgets = [
        {
          id: 1,
          limitAmount: "100000",
          currentSpending: "50000",
        },
        {
          id: 2,
          limitAmount: "200000",
          currentSpending: "250000",
        },
      ];

      (getBudgets as any).mockResolvedValue(mockBudgets);
      (NextResponse.json as any).mockReturnValue({
        status: 200,
        data: {
          totalBudgets: 2,
          activeBudgets: 2,
          overBudget: 1,
          totalLimit: 300000,
          totalSpent: 300000,
        },
      });

      const response = await getStats();

      expect(getBudgets).toHaveBeenCalledWith(1);
      expect(NextResponse.json).toHaveBeenCalledWith({
        totalBudgets: 2,
        activeBudgets: 2,
        overBudget: 1,
        totalLimit: 300000,
        totalSpent: 300000,
      });
    });
  });
});
