import { eq, sql, and, gte, lte, desc } from "drizzle-orm";
import { db } from "@/db";
import { transactions, categories, budgets } from "@/db/schema";

export interface MonthlySpending {
  month: string;
  year: number;
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  categoryBreakdown: CategorySpending[];
}

export interface CategorySpending {
  categoryId: number;
  categoryName: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

export interface SpendingTrend {
  period: string;
  income: number;
  expenses: number;
  net: number;
  categories: CategorySpending[];
}

export interface BudgetAnalysis {
  categoryId: number;
  categoryName: string;
  budgeted: number;
  actual: number;
  remaining: number;
  percentageUsed: number;
  status: "UNDER_BUDGET" | "ON_TRACK" | "OVER_BUDGET";
}

export interface FinancialInsights {
  monthlyTrends: SpendingTrend[];
  topSpendingCategories: CategorySpending[];
  budgetPerformance: BudgetAnalysis[];
  averageMonthlySpending: number;
  spendingGrowthRate: number;
  recommendations: string[];
}

/**
 * Get monthly spending analysis for a user
 */
export async function getMonthlySpendingAnalysis(
  userId: number,
  months: number = 6,
): Promise<MonthlySpending[]> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const monthlyData = await db
    .select({
      month: sql<string>`TO_CHAR(${transactions.date}, 'YYYY-MM')`,
      year: sql<number>`EXTRACT(YEAR FROM ${transactions.date})`,
      type: transactions.type,
      amount: sql<number>`SUM(ABS(${transactions.amount}))`,
      categoryId: categories.id,
      categoryName: categories.name,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(
      and(
        eq(transactions.userId, userId),
        gte(transactions.date, startDate),
        lte(transactions.date, endDate),
      ),
    )
    .groupBy(
      sql`TO_CHAR(${transactions.date}, 'YYYY-MM')`,
      sql`EXTRACT(YEAR FROM ${transactions.date})`,
      transactions.type,
      categories.id,
      categories.name,
    )
    .orderBy(desc(sql`TO_CHAR(${transactions.date}, 'YYYY-MM')`));

  // Group by month and calculate totals
  const monthlyMap = new Map<string, MonthlySpending>();

  for (const row of monthlyData) {
    const key = row.month;
    if (!monthlyMap.has(key)) {
      monthlyMap.set(key, {
        month: row.month,
        year: row.year,
        totalIncome: 0,
        totalExpenses: 0,
        netIncome: 0,
        categoryBreakdown: [],
      });
    }

    const monthData = monthlyMap.get(key) ?? {
      month: key,
      year: parseInt(key.split("-")[0], 10),
      totalIncome: 0,
      totalExpenses: 0,
      netIncome: 0,
      categoryBreakdown: [],
    };

    if (row.type === "INCOME") {
      monthData.totalIncome += row.amount;
    } else {
      monthData.totalExpenses += row.amount;
    }

    // Add to category breakdown if category exists
    if (row.categoryId && row.categoryName) {
      const existingCategory = monthData.categoryBreakdown.find(
        (cat) => cat.categoryId === row.categoryId,
      );

      if (existingCategory) {
        existingCategory.amount += row.amount;
        existingCategory.transactionCount += 1;
      } else {
        monthData.categoryBreakdown.push({
          categoryId: row.categoryId,
          categoryName: row.categoryName,
          amount: row.amount,
          percentage: 0, // Will be calculated later
          transactionCount: 1,
        });
      }
    }
  }

  // Calculate percentages and net income
  const result = Array.from(monthlyMap.values()).map((month) => {
    month.netIncome = month.totalIncome - month.totalExpenses;

    // Calculate percentages for categories
    const totalExpenses = month.totalExpenses;
    month.categoryBreakdown.forEach((cat) => {
      cat.percentage =
        totalExpenses > 0 ? (cat.amount / totalExpenses) * 100 : 0;
    });

    return month;
  });

  return result.sort((a, b) => b.month.localeCompare(a.month));
}

/**
 * Get spending trends over time
 */
export async function getSpendingTrends(
  userId: number,
  months: number = 12,
): Promise<SpendingTrend[]> {
  const monthlyData = await getMonthlySpendingAnalysis(userId, months);

  return monthlyData.map((month) => ({
    period: month.month,
    income: month.totalIncome,
    expenses: month.totalExpenses,
    net: month.netIncome,
    categories: month.categoryBreakdown,
  }));
}

/**
 * Get budget vs actual spending analysis
 */
export async function getBudgetAnalysis(
  userId: number,
  month?: string, // Format: 'YYYY-MM'
): Promise<BudgetAnalysis[]> {
  const targetMonth = month || new Date().toISOString().slice(0, 7); // Current month
  const [year, monthNum] = targetMonth.split("-").map(Number);

  const startDate = new Date(year, monthNum - 1, 1);
  const endDate = new Date(year, monthNum, 0); // Last day of month

  // Get budgets for the user
  const userBudgets = await db.query.budgets.findMany({
    where: eq(budgets.userId, userId),
    with: {
      category: true,
    },
  });

  // Get actual spending by category for the month
  const actualSpending = await db
    .select({
      categoryId: transactions.categoryId,
      amount: sql<number>`SUM(ABS(${transactions.amount}))`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, "EXPENSE"),
        gte(transactions.date, startDate),
        lte(transactions.date, endDate),
      ),
    )
    .groupBy(transactions.categoryId);

  // Create budget analysis
  const analysis: BudgetAnalysis[] = userBudgets.map((budget) => {
    const actual =
      actualSpending.find(
        (spending) => spending.categoryId === budget.categoryId,
      )?.amount || 0;

    const budgeted = parseFloat(budget.limitAmount);
    const remaining = budgeted - actual;
    const percentageUsed = budgeted > 0 ? (actual / budgeted) * 100 : 0;

    let status: "UNDER_BUDGET" | "ON_TRACK" | "OVER_BUDGET";
    if (percentageUsed > 100) {
      status = "OVER_BUDGET";
    } else if (percentageUsed > 80) {
      status = "ON_TRACK";
    } else {
      status = "UNDER_BUDGET";
    }

    return {
      categoryId: budget.categoryId,
      categoryName: budget.category?.name || "Unknown Category",
      budgeted,
      actual,
      remaining,
      percentageUsed,
      status,
    };
  });

  return analysis.sort((a, b) => b.actual - a.actual);
}

/**
 * Generate AI-ready financial insights
 */
export async function generateFinancialInsights(
  userId: number,
): Promise<FinancialInsights> {
  const trends = await getSpendingTrends(userId, 6);
  const budgetAnalysis = await getBudgetAnalysis(userId);

  // Calculate average monthly spending
  const averageMonthlySpending =
    trends.length > 0
      ? trends.reduce((sum, trend) => sum + trend.expenses, 0) / trends.length
      : 0;

  // Calculate spending growth rate (last 3 months vs previous 3 months)
  let spendingGrowthRate = 0;
  if (trends.length >= 6) {
    const recent3Months =
      trends.slice(0, 3).reduce((sum, t) => sum + t.expenses, 0) / 3;
    const previous3Months =
      trends.slice(3, 6).reduce((sum, t) => sum + t.expenses, 0) / 3;
    spendingGrowthRate =
      previous3Months > 0
        ? ((recent3Months - previous3Months) / previous3Months) * 100
        : 0;
  }

  // Get top spending categories from most recent month
  const topSpendingCategories = trends[0]?.categories.slice(0, 5) || [];

  // Generate recommendations
  const recommendations: string[] = [];

  // Budget recommendations
  const overBudgetCategories = budgetAnalysis.filter(
    (b) => b.status === "OVER_BUDGET",
  );
  if (overBudgetCategories.length > 0) {
    recommendations.push(
      `You're over budget in ${overBudgetCategories.length} categories. Consider reducing spending in: ${overBudgetCategories.map((c) => c.categoryName).join(", ")}`,
    );
  }

  // Spending trend recommendations
  if (spendingGrowthRate > 20) {
    recommendations.push(
      `Your spending has increased by ${spendingGrowthRate.toFixed(1)}% recently. Consider reviewing your expenses.`,
    );
  } else if (spendingGrowthRate < -10) {
    recommendations.push(
      `Great job! Your spending has decreased by ${Math.abs(spendingGrowthRate).toFixed(1)}% recently.`,
    );
  }

  // Category recommendations
  if (topSpendingCategories.length > 0) {
    const topCategory = topSpendingCategories[0];
    if (topCategory.percentage > 50) {
      recommendations.push(
        `${topCategory.categoryName} accounts for ${topCategory.percentage.toFixed(1)}% of your expenses. Consider optimizing this category.`,
      );
    }
  }

  // Savings recommendations
  const avgIncome =
    trends.reduce((sum, t) => sum + t.income, 0) / trends.length;
  const avgExpenses =
    trends.reduce((sum, t) => sum + t.expenses, 0) / trends.length;
  const savingsRate =
    avgIncome > 0 ? ((avgIncome - avgExpenses) / avgIncome) * 100 : 0;

  if (savingsRate < 20) {
    recommendations.push(
      `Your savings rate is ${savingsRate.toFixed(1)}%. Consider aiming for at least 20% savings.`,
    );
  } else {
    recommendations.push(
      `Excellent! Your savings rate is ${savingsRate.toFixed(1)}%. Keep up the good work!`,
    );
  }

  return {
    monthlyTrends: trends,
    topSpendingCategories,
    budgetPerformance: budgetAnalysis,
    averageMonthlySpending,
    spendingGrowthRate,
    recommendations,
  };
}
