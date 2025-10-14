"use client";

import { useQuery } from "@tanstack/react-query";
import { Brain, TrendingUp, AlertTriangle, Target, Lightbulb } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AIAnalysis, AISuggestion } from "@/services/ai-analytics";

interface AISuggestionsPanelProps {
  userId: number;
}

export function AISuggestionsPanel({ userId }: AISuggestionsPanelProps) {
  const { data: aiAnalysis, isLoading, error } = useQuery({
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
            AI Financial Insights
          </CardTitle>
          <CardDescription>
            Analyzing your financial patterns...
          </CardDescription>
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
            AI Financial Insights
          </CardTitle>
          <CardDescription>
            Unable to load AI insights at this time.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Financial Health Score */}
      <FinancialHealthScore health={aiAnalysis.financialHealth} />

      {/* AI Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            AI Recommendations
          </CardTitle>
          <CardDescription>
            Personalized insights to improve your financial health
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {aiAnalysis.personalizedSuggestions.map((suggestion, index) => (
              <AISuggestionCard key={index} suggestion={suggestion} />
            ))}
            {aiAnalysis.personalizedSuggestions.length === 0 && (
              <p className="text-muted-foreground text-center py-4">
                No specific recommendations at this time. Keep up the good work!
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Spending Predictions */}
      {aiAnalysis.spendingPredictions.length > 0 && (
        <SpendingPredictions predictions={aiAnalysis.spendingPredictions} />
      )}

      {/* Risk Assessment */}
      <RiskAssessment assessment={aiAnalysis.riskAssessment} />
    </div>
  );
}

interface AISuggestionCardProps {
  suggestion: AISuggestion;
}

function AISuggestionCard({ suggestion }: AISuggestionCardProps) {
  const getIcon = () => {
    switch (suggestion.type) {
      case 'WARNING':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'TIP':
        return <Lightbulb className="h-4 w-4 text-blue-500" />;
      case 'GOAL':
        return <Target className="h-4 w-4 text-green-500" />;
      case 'INSIGHT':
        return <TrendingUp className="h-4 w-4 text-purple-500" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getBadgeVariant = () => {
    switch (suggestion.impact) {
      case 'HIGH':
        return 'destructive';
      case 'MEDIUM':
        return 'default';
      case 'LOW':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="flex items-start gap-3 p-4 border rounded-lg">
      {getIcon()}
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">{suggestion.title}</h4>
          <Badge variant={getBadgeVariant()}>
            {suggestion.impact} Impact
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{suggestion.description}</p>
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
  health: AIAnalysis['financialHealth'];
}

function FinancialHealthScore({ health }: FinancialHealthScoreProps) {
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'text-green-600';
      case 'B':
        return 'text-blue-600';
      case 'C':
        return 'text-yellow-600';
      case 'D':
        return 'text-orange-600';
      case 'F':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Financial Health Score
        </CardTitle>
        <CardDescription>
          Your overall financial wellness based on spending patterns and habits
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{health.score}/100</span>
            <span className={`text-2xl font-bold ${getGradeColor(health.grade)}`}>
              Grade {health.grade}
            </span>
          </div>
          <Progress value={health.score} className="h-3" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <h4 className="font-medium text-green-700 mb-2">Strengths</h4>
              <ul className="text-sm space-y-1">
                {health.strengths.map((strength, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-orange-700 mb-2">Areas for Improvement</h4>
              <ul className="text-sm space-y-1">
                {health.weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                    {weakness}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface SpendingPredictionsProps {
  predictions: AIAnalysis['spendingPredictions'];
}

function SpendingPredictions({ predictions }: SpendingPredictionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Spending Predictions
        </CardTitle>
        <CardDescription>
          AI-powered predictions for next month's spending by category
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {predictions.map((prediction, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded">
              <div>
                <p className="font-medium">{prediction.category}</p>
                <p className="text-sm text-muted-foreground">
                  Rp {prediction.predictedAmount.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <Badge variant="outline">
                  {prediction.confidence.toFixed(0)}% confidence
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
  assessment: AIAnalysis['riskAssessment'];
}

function RiskAssessment({ assessment }: RiskAssessmentProps) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'HIGH':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'LOW':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Risk Assessment
        </CardTitle>
        <CardDescription>
          Current financial risk level and mitigation strategies
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className={`p-4 border rounded-lg ${getRiskColor(assessment.level)}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Risk Level: {assessment.level}</h3>
            <Badge variant={assessment.level === 'HIGH' ? 'destructive' : 'default'}>
              {assessment.level}
            </Badge>
          </div>

          {assessment.factors.length > 0 && (
            <div className="mb-3">
              <h4 className="text-sm font-medium mb-2">Risk Factors:</h4>
              <ul className="text-sm space-y-1">
                {assessment.factors.map((factor, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
                    {factor}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {assessment.recommendations.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Recommendations:</h4>
              <ul className="text-sm space-y-1">
                {assessment.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}