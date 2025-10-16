"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Brain,
  Lightbulb,
  Target,
  TrendingUp,
} from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { AIAnalysis, AISuggestion } from "@/services/ai-analytics";

interface AISuggestionsPanelProps {
  userId: number;
}

export function AISuggestionsPanel({ userId }: AISuggestionsPanelProps) {
  const { t } = useLanguage();
  const {
    data: aiAnalysis,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["ai-analysis", userId],
    queryFn: async (): Promise<AIAnalysis> => {
      const response = await fetch("/api/ai-analytics");
      if (!response.ok) {
        throw new Error("Failed to fetch AI analysis");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            {t("ai.title")}
          </CardTitle>
          <CardDescription>{t("ai.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !aiAnalysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            {t("ai.title")}
          </CardTitle>
          <CardDescription>{t("ai.error")}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Financial Health Score */}
      <FinancialHealthScore health={aiAnalysis.financialHealth} t={t} />

      {/* AI Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            {t("ai.recommendations")}
          </CardTitle>
          <CardDescription>{t("ai.recommendationsDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {aiAnalysis.personalizedSuggestions.map((suggestion, index) => (
              <AISuggestionCard
                key={`${suggestion.type}-${suggestion.title}-${index}`}
                suggestion={suggestion}
                t={t}
              />
            ))}
            {aiAnalysis.personalizedSuggestions.length === 0 && (
              <p className="text-muted-foreground text-center py-4">
                {t("ai.noRecommendations")}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Spending Predictions */}
      {aiAnalysis.spendingPredictions.length > 0 && (
        <SpendingPredictions
          predictions={aiAnalysis.spendingPredictions}
          t={t}
        />
      )}

      {/* Risk Assessment */}
      <RiskAssessment assessment={aiAnalysis.riskAssessment} t={t} />
    </div>
  );
}

interface AISuggestionCardProps {
  suggestion: AISuggestion;
  t: (key: string) => string;
}

function AISuggestionCard({ suggestion, t }: AISuggestionCardProps) {
  const getIcon = () => {
    switch (suggestion.type) {
      case "WARNING":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case "TIP":
        return <Lightbulb className="h-4 w-4 text-chart-1" />;
      case "GOAL":
        return <Target className="h-4 w-4 text-income" />;
      case "INSIGHT":
        return <TrendingUp className="h-4 w-4 text-chart-2" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getBadgeVariant = () => {
    switch (suggestion.impact) {
      case "HIGH":
        return "destructive";
      case "MEDIUM":
        return "default";
      case "LOW":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="flex items-start gap-3 p-4 border rounded-lg">
      {getIcon()}
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">{suggestion.title}</h4>
          <Badge variant={getBadgeVariant()}>
            {suggestion.impact} {t("ai.impact")}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {suggestion.description}
        </p>
        {suggestion.category && (
          <Badge variant="outline" className="text-xs">
            {suggestion.category}
          </Badge>
        )}
      </div>
    </div>
  );
}

interface FinancialHealthScoreProps {
  health: AIAnalysis["financialHealth"];
  t: (key: string) => string;
}

function FinancialHealthScore({ health, t }: FinancialHealthScoreProps) {
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A":
        return "text-income";
      case "B":
        return "text-chart-1";
      case "C":
        return "text-chart-2";
      case "D":
        return "text-expense";
      case "F":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          {t("ai.healthScore")}
        </CardTitle>
        <CardDescription>{t("ai.healthScoreDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{health.score}/100</span>
            <span
              className={`text-2xl font-bold ${getGradeColor(health.grade)}`}
            >
              {t("ai.grade")} {health.grade}
            </span>
          </div>
          <Progress value={health.score} className="h-3" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <h4 className="font-medium text-income mb-2">
                {t("ai.strengths")}
              </h4>
              <ul className="text-sm space-y-1">
                {health.strengths.map((strength, index) => {
                  let idx = index;
                  return (
                    <li
                      key={`strength-${strength}-${idx++}`}
                      className="flex items-center gap-2"
                    >
                      <div className="w-1.5 h-1.5 bg-income rounded-full"></div>
                      {strength}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-expense mb-2">
                {t("ai.improvements")}
              </h4>
              <ul className="text-sm space-y-1">
                {health.weaknesses.map((weakness, index) => {
                  let idx = index;
                  return (
                    <li
                      key={`weakness-${weakness}-${idx++}`}
                      className="flex items-center gap-2"
                    >
                      <div className="w-1.5 h-1.5 bg-expense rounded-full"></div>
                      {weakness}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface SpendingPredictionsProps {
  predictions: AIAnalysis["spendingPredictions"];
  t: (key: string) => string;
}

function SpendingPredictions({ predictions, t }: SpendingPredictionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {t("ai.spendingPredictions")}
        </CardTitle>
        <CardDescription>{t("ai.spendingPredictionsDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {predictions.map((prediction, index) => (
            <div
              key={`prediction-${prediction.category}-${index}`}
              className="flex items-center justify-between p-3 border rounded"
            >
              <div>
                <p className="font-medium">{prediction.category}</p>
                <p className="text-sm text-muted-foreground">
                  Rp {prediction.predictedAmount.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <Badge variant="outline">
                  {prediction.confidence.toFixed(0)}% {t("ai.confidence")}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  {prediction.reasoning}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface RiskAssessmentProps {
  assessment: AIAnalysis["riskAssessment"];
  t: (key: string) => string;
}

function RiskAssessment({ assessment, t }: RiskAssessmentProps) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case "HIGH":
        return "text-destructive bg-destructive/10 border-destructive/20";
      case "MEDIUM":
        return "text-expense bg-expense/10 border-expense/20";
      case "LOW":
        return "text-income bg-income/10 border-income/20";
      default:
        return "text-muted-foreground bg-muted/50 border-muted";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          {t("ai.riskAssessment")}
        </CardTitle>
        <CardDescription>{t("ai.riskAssessmentDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`p-4 border rounded-lg ${getRiskColor(assessment.level)}`}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">
              {t("ai.riskLevel")}: {assessment.level}
            </h3>
            <Badge
              variant={assessment.level === "HIGH" ? "destructive" : "default"}
            >
              {assessment.level}
            </Badge>
          </div>

          {assessment.factors.length > 0 && (
            <div className="mb-3">
              <h4 className="text-sm font-medium mb-2">
                {t("ai.riskFactors")}:
              </h4>
              <ul className="text-sm space-y-1">
                {assessment.factors.map((factor, index) => {
                  let idx = index;
                  return (
                    <li
                      key={`factor-${factor}-${idx++}`}
                      className="flex items-center gap-2"
                    >
                      <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
                      {factor}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {assessment.recommendations.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">
                {t("ai.recommendationsTitle")}:
              </h4>
              <ul className="text-sm space-y-1">
                {assessment.recommendations.map((rec, index) => {
                  let idx = index;
                  return (
                    <li
                      key={`recommendation-${rec}-${idx++}`}
                      className="flex items-center gap-2"
                    >
                      <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
                      {rec}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
