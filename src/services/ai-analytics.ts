import {
  type FinancialInsights,
  generateFinancialInsights,
  type SpendingTrend,
} from "./analytics";

export interface AIPrediction {
  category: string;
  predictedAmount: number;
  confidence: number;
  reasoning: string;
}

export interface AISuggestion {
  type: "WARNING" | "TIP" | "GOAL" | "INSIGHT";
  title: string;
  description: string;
  impact: "HIGH" | "MEDIUM" | "LOW";
  actionable: boolean;
  category?: string;
}

export interface AIAnalysis {
  spendingPredictions: AIPrediction[];
  personalizedSuggestions: AISuggestion[];
  riskAssessment: {
    level: "LOW" | "MEDIUM" | "HIGH";
    factors: string[];
    recommendations: string[];
  };
  financialHealth: {
    score: number; // 0-100
    grade: "A" | "B" | "C" | "D" | "F";
    strengths: string[];
    weaknesses: string[];
  };
}

/**
 * Simple AI-powered financial analysis service
 * Uses pattern recognition and statistical analysis
 */
export class AIAnalyticsService {
  /**
   * Analyze spending patterns and generate predictions
   */
  static async analyzeSpendingPatterns(userId: number): Promise<AIAnalysis> {
    const insights = await generateFinancialInsights(userId);

    // Generate spending predictions based on trends
    const spendingPredictions =
      AIAnalyticsService.generateSpendingPredictions(insights);

    // Generate personalized suggestions
    const personalizedSuggestions =
      AIAnalyticsService.generatePersonalizedSuggestions(insights);

    // Assess financial risk
    const riskAssessment = AIAnalyticsService.assessFinancialRisk(insights);

    // Calculate financial health score
    const financialHealth =
      AIAnalyticsService.calculateFinancialHealth(insights);

    return {
      spendingPredictions,
      personalizedSuggestions,
      riskAssessment,
      financialHealth,
    };
  }

  /**
   * Generate spending predictions for next month
   */
  private static generateSpendingPredictions(
    insights: FinancialInsights,
  ): AIPrediction[] {
    const predictions: AIPrediction[] = [];

    if (insights.monthlyTrends.length < 2) {
      return predictions; // Need at least 2 months of data
    }

    // Analyze each top spending category
    insights.topSpendingCategories.forEach((category) => {
      const categoryTrends = insights.monthlyTrends
        .map((trend) => {
          const catData = trend.categories.find(
            (c) => c.categoryId === category.categoryId,
          );
          return catData ? catData.amount : 0;
        })
        .filter((amount) => amount > 0);

      if (categoryTrends.length >= 2) {
        // Simple linear regression for prediction
        const prediction =
          AIAnalyticsService.predictNextMonthSpending(categoryTrends);
        const confidence = Math.min((categoryTrends.length / 6) * 100, 85); // Max 85% confidence

        predictions.push({
          category: category.categoryName,
          predictedAmount: prediction,
          confidence,
          reasoning: `Based on ${categoryTrends.length} months of spending data`,
        });
      }
    });

    return predictions.sort((a, b) => b.predictedAmount - a.predictedAmount);
  }

  /**
   * Simple linear regression prediction for next month
   */
  private static predictNextMonthSpending(historicalData: number[]): number {
    if (historicalData.length < 2) return historicalData[0] || 0;

    const _n = historicalData.length;
    const lastValue = historicalData[0];
    const previousValue = historicalData[1];

    // Simple trend calculation (weighted average of recent months)
    const weights = historicalData.map((_, index) => 0.9 ** index);
    const weightedSum = historicalData.reduce(
      (sum, value, index) => sum + value * weights[index],
      0,
    );
    const weightSum = weights.reduce((sum, weight) => sum + weight, 0);

    const trend = weightedSum / weightSum;

    // Predict next month with some momentum
    const momentum = (lastValue - previousValue) / previousValue;
    const prediction = trend * (1 + momentum * 0.3); // Dampen momentum

    return Math.max(0, prediction); // Ensure non-negative
  }

  /**
   * Generate personalized financial suggestions
   */
  private static generatePersonalizedSuggestions(
    insights: FinancialInsights,
  ): AISuggestion[] {
    const suggestions: AISuggestion[] = [];

    // Budget-related suggestions
    const overBudget = insights.budgetPerformance.filter(
      (b) => b.status === "OVER_BUDGET",
    );
    if (overBudget.length > 0) {
      suggestions.push({
        type: "WARNING",
        title: "Budget Alert",
        description: `You're over budget in ${overBudget.length} categories. Consider reviewing your spending in ${overBudget
          .map((b) => b.categoryName)
          .slice(0, 2)
          .join(" and ")}.`,
        impact: "HIGH",
        actionable: true,
      });
    }

    // Spending growth suggestions
    if (insights.spendingGrowthRate > 15) {
      suggestions.push({
        type: "WARNING",
        title: "Spending Increase Detected",
        description: `Your expenses have increased by ${insights.spendingGrowthRate.toFixed(1)}% recently. Review your recent transactions to identify areas for optimization.`,
        impact: "HIGH",
        actionable: true,
      });
    }

    // Savings suggestions
    const avgIncome =
      insights.monthlyTrends.reduce((sum, t) => sum + t.income, 0) /
      insights.monthlyTrends.length;
    const avgExpenses =
      insights.monthlyTrends.reduce((sum, t) => sum + t.expenses, 0) /
      insights.monthlyTrends.length;
    const savingsRate =
      avgIncome > 0 ? ((avgIncome - avgExpenses) / avgIncome) * 100 : 0;

    if (savingsRate < 20) {
      suggestions.push({
        type: "TIP",
        title: "Boost Your Savings",
        description: `Your current savings rate is ${savingsRate.toFixed(1)}%. Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings.`,
        impact: "MEDIUM",
        actionable: true,
      });
    }

    // Category optimization suggestions
    if (insights.topSpendingCategories.length > 0) {
      const topCategory = insights.topSpendingCategories[0];
      if (topCategory.percentage > 40) {
        suggestions.push({
          type: "TIP",
          title: "Category Optimization",
          description: `${topCategory.categoryName} represents ${topCategory.percentage.toFixed(1)}% of your spending. Look for ways to reduce costs in this area.`,
          impact: "MEDIUM",
          actionable: true,
          category: topCategory.categoryName,
        });
      }
    }

    // Goal suggestions
    if (savingsRate >= 20) {
      suggestions.push({
        type: "GOAL",
        title: "Emergency Fund Goal",
        description:
          "Great savings rate! Consider building an emergency fund covering 3-6 months of expenses.",
        impact: "MEDIUM",
        actionable: true,
      });
    }

    // Seasonal insights
    const currentMonth = new Date().getMonth();
    if (currentMonth === 11) {
      // December
      suggestions.push({
        type: "INSIGHT",
        title: "Year-End Planning",
        description:
          "December is here! Review your annual spending and plan for tax optimization strategies.",
        impact: "LOW",
        actionable: false,
      });
    }

    return suggestions;
  }

  /**
   * Assess financial risk level
   */
  private static assessFinancialRisk(insights: FinancialInsights) {
    let riskScore = 0;
    const factors: string[] = [];
    const recommendations: string[] = [];

    // Budget overruns
    const overBudgetCount = insights.budgetPerformance.filter(
      (b) => b.status === "OVER_BUDGET",
    ).length;
    if (overBudgetCount > 0) {
      riskScore += overBudgetCount * 20;
      factors.push(`${overBudgetCount} categories over budget`);
      recommendations.push(
        "Review and adjust budget limits for over-budget categories",
      );
    }

    // High spending growth
    if (insights.spendingGrowthRate > 25) {
      riskScore += 30;
      factors.push(
        `Spending increased by ${insights.spendingGrowthRate.toFixed(1)}%`,
      );
      recommendations.push(
        "Monitor spending trends and identify unusual expenses",
      );
    }

    // Low savings rate
    const avgIncome =
      insights.monthlyTrends.reduce((sum, t) => sum + t.income, 0) /
      insights.monthlyTrends.length;
    const avgExpenses =
      insights.monthlyTrends.reduce((sum, t) => sum + t.expenses, 0) /
      insights.monthlyTrends.length;
    const savingsRate =
      avgIncome > 0 ? ((avgIncome - avgExpenses) / avgIncome) * 100 : 0;

    if (savingsRate < 10) {
      riskScore += 40;
      factors.push(`Very low savings rate (${savingsRate.toFixed(1)}%)`);
      recommendations.push("Increase savings rate to at least 20% of income");
    } else if (savingsRate < 20) {
      riskScore += 20;
      factors.push(`Low savings rate (${savingsRate.toFixed(1)}%)`);
      recommendations.push(
        "Consider increasing savings to build financial security",
      );
    }

    // Determine risk level
    let level: "LOW" | "MEDIUM" | "HIGH";
    if (riskScore >= 60) {
      level = "HIGH";
    } else if (riskScore >= 30) {
      level = "MEDIUM";
    } else {
      level = "LOW";
    }

    return { level, factors, recommendations };
  }

  /**
   * Calculate financial health score
   */
  private static calculateFinancialHealth(insights: FinancialInsights) {
    let score = 50; // Base score
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    // Savings rate (0-30 points)
    const avgIncome =
      insights.monthlyTrends.reduce((sum, t) => sum + t.income, 0) /
      insights.monthlyTrends.length;
    const avgExpenses =
      insights.monthlyTrends.reduce((sum, t) => sum + t.expenses, 0) /
      insights.monthlyTrends.length;
    const savingsRate =
      avgIncome > 0 ? ((avgIncome - avgExpenses) / avgIncome) * 100 : 0;

    if (savingsRate >= 30) {
      score += 30;
      strengths.push("Excellent savings rate");
    } else if (savingsRate >= 20) {
      score += 25;
      strengths.push("Good savings rate");
    } else if (savingsRate >= 10) {
      score += 15;
      strengths.push("Moderate savings rate");
    } else {
      score += 5;
      weaknesses.push("Low savings rate");
    }

    // Budget performance (0-25 points)
    const onTrackBudgets = insights.budgetPerformance.filter(
      (b) => b.status === "ON_TRACK",
    ).length;
    const underBudgets = insights.budgetPerformance.filter(
      (b) => b.status === "UNDER_BUDGET",
    ).length;
    const overBudgets = insights.budgetPerformance.filter(
      (b) => b.status === "OVER_BUDGET",
    ).length;
    const totalBudgets = insights.budgetPerformance.length;

    if (totalBudgets > 0) {
      const budgetScore = ((onTrackBudgets + underBudgets) / totalBudgets) * 25;
      score += budgetScore;

      if (overBudgets === 0) {
        strengths.push("All budgets on track");
      } else if (overBudgets < totalBudgets * 0.3) {
        strengths.push("Most budgets on track");
      } else {
        weaknesses.push("Multiple budgets exceeded");
      }
    }

    // Spending stability (0-20 points)
    const spendingVariation = AIAnalyticsService.calculateSpendingVariation(
      insights.monthlyTrends,
    );
    if (spendingVariation < 0.2) {
      score += 20;
      strengths.push("Consistent spending patterns");
    } else if (spendingVariation < 0.4) {
      score += 15;
      strengths.push("Moderately stable spending");
    } else {
      score += 5;
      weaknesses.push("Variable spending patterns");
    }

    // Spending growth (0-15 points)
    if (insights.spendingGrowthRate <= 5) {
      score += 15;
      strengths.push("Controlled spending growth");
    } else if (insights.spendingGrowthRate <= 15) {
      score += 10;
      strengths.push("Moderate spending growth");
    } else {
      score += 0;
      weaknesses.push("High spending growth");
    }

    // Ensure score is within bounds
    score = Math.max(0, Math.min(100, score));

    // Determine grade
    let grade: "A" | "B" | "C" | "D" | "F";
    if (score >= 90) grade = "A";
    else if (score >= 80) grade = "B";
    else if (score >= 70) grade = "C";
    else if (score >= 60) grade = "D";
    else grade = "F";

    return { score, grade, strengths, weaknesses };
  }

  /**
   * Calculate coefficient of variation for spending stability
   */
  private static calculateSpendingVariation(trends: SpendingTrend[]): number {
    if (trends.length < 2) return 0;

    const expenses = trends.map((t) => t.expenses);
    const mean = expenses.reduce((sum, val) => sum + val, 0) / expenses.length;
    const variance =
      expenses.reduce((sum, val) => sum + (val - mean) ** 2, 0) /
      expenses.length;
    const stdDev = Math.sqrt(variance);

    return mean > 0 ? stdDev / mean : 0;
  }
}
