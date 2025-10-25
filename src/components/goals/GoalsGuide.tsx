"use client";

import {
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Lightbulb,
  Plus,
  Target,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface GoalsGuideProps {
  onCreateGoal?: () => void;
}

export function GoalsGuide({ onCreateGoal }: GoalsGuideProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const steps = [
    {
      id: "set-target",
      icon: Target,
      title: t("goals.guide.step1.title"),
      description: t("goals.guide.step1.description"),
      details: t("goals.guide.step1.details"),
    },
    {
      id: "contribute",
      icon: DollarSign,
      title: t("goals.guide.step2.title"),
      description: t("goals.guide.step2.description"),
      details: t("goals.guide.step2.details"),
    },
    {
      id: "monitor",
      icon: TrendingUp,
      title: t("goals.guide.step3.title"),
      description: t("goals.guide.step3.description"),
      details: t("goals.guide.step3.details"),
    },
    {
      id: "achieve",
      icon: Trophy,
      title: t("goals.guide.step4.title"),
      description: t("goals.guide.step4.description"),
      details: t("goals.guide.step4.details"),
    },
  ];

  const tips = [
    {
      id: "realistic-deadline",
      icon: Calendar,
      title: t("goals.guide.tip1.title"),
      tip: t("goals.guide.tip1.description"),
    },
    {
      id: "regular-contribution",
      icon: TrendingUp,
      title: t("goals.guide.tip2.title"),
      tip: t("goals.guide.tip2.description"),
    },
    {
      id: "break-down",
      icon: Lightbulb,
      title: t("goals.guide.tip3.title"),
      tip: t("goals.guide.tip3.description"),
    },
    {
      id: "track-celebrate",
      icon: CheckCircle,
      title: t("goals.guide.tip4.title"),
      tip: t("goals.guide.tip4.description"),
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Lightbulb className="h-4 w-4 mr-2" />
          {t("goals.guide.title")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {t("goals.guide.subtitle")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Flow Steps */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {t("goals.guide.flowTitle")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {steps.map((step) => (
                <Card key={step.id} className="relative">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <step.icon className="h-5 w-5 text-primary" />
                      {step.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">
                      {step.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {step.details}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              {t("goals.guide.tipsTitle")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tips.map((tip) => (
                <Card key={tip.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <tip.icon className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-medium text-sm mb-1">
                          {tip.title}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {tip.tip}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Example */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t("goals.guide.exampleTitle")}</h3>
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{t("goal.title")}</Badge>
                    <span className="font-medium">{t("goals.guide.example.goal")}</span>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>• {t("goals.guide.example.target")}</p>
                    <p>• {t("goals.guide.example.deadline")}</p>
                    <p>• {t("goals.guide.example.contribution")}</p>
                    <p>
                      • {t("goals.guide.example.progress")}
                    </p>
                  </div>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm">
                      <strong>{t("goals.guide.flowTitle")}:</strong> {t("goals.guide.example.flow")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CTA */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={() => {
                setIsOpen(false);
                onCreateGoal?.();
              }}
              size="lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("goals.guide.startButton")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
