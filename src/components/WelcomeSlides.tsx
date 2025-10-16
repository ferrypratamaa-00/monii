"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/LanguageProvider";

interface WelcomeSlide {
  id: number;
  title: string;
  description: string;
  icon: string;
  iconBg: string;
}

interface WelcomeSlidesProps {
  onComplete: () => void;
  onSkip: () => void;
}

const slidesData = [
  {
    id: 1,
    titleKey: "onboarding.welcome",
    descriptionKey: "onboarding.welcomeDesc",
    icon: "💰",
    iconBg: "bg-gradient-to-br from-primary/20 to-accent/20"
  },
  {
    id: 2,
    titleKey: "onboarding.transactions",
    descriptionKey: "onboarding.transactionsDesc",
    icon: "📱",
    iconBg: "bg-gradient-to-br from-green-500/20 to-emerald-500/20"
  },
  {
    id: 3,
    titleKey: "onboarding.accounts",
    descriptionKey: "onboarding.accountsDesc",
    icon: "📊",
    iconBg: "bg-gradient-to-br from-purple-500/20 to-indigo-500/20"
  },
  {
    id: 4,
    titleKey: "onboarding.reports",
    descriptionKey: "onboarding.reportsDesc",
    icon: "📈",
    iconBg: "bg-gradient-to-br from-orange-500/20 to-red-500/20"
  },
  {
    id: 5,
    titleKey: "onboarding.offline",
    descriptionKey: "onboarding.offlineDesc",
    icon: "🔄",
    iconBg: "bg-gradient-to-br from-teal-500/20 to-cyan-500/20"
  }
];

export function WelcomeSlides({ onComplete, onSkip }: WelcomeSlidesProps) {
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: WelcomeSlide[] = slidesData.map(slide => ({
    ...slide,
    title: t(slide.titleKey),
    description: t(slide.descriptionKey)
  }));

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="fixed inset-0 z-40 bg-background flex flex-col">
      {/* Header with skip button */}
      <div className="flex justify-end p-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onSkip}
          className="text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors duration-200"
        >
          <X className="h-4 w-4 mr-2" />
          {t("onboarding.skip")}
        </Button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          {/* Slide icon */}
          <div className={`w-20 h-20 ${slides[currentSlide].iconBg} rounded-2xl flex items-center justify-center mx-auto mb-8 text-4xl transition-all duration-300 hover:scale-105`}>
            {slides[currentSlide].icon}
          </div>

          {/* Slide title */}
          <h2 className="text-2xl font-bold text-foreground mb-4 leading-tight">
            {slides[currentSlide].title}
          </h2>

          {/* Slide description */}
          <p className="text-muted-foreground text-base leading-relaxed">
            {slides[currentSlide].description}
          </p>
        </div>
      </div>

      {/* Navigation dots */}
      <div className="flex justify-center space-x-2 mb-8">
        {slides.map((_, index) => (
          <button
            type="button"
            key={index + 1}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 ${
              index === currentSlide
                ? 'w-6 h-2 bg-primary rounded-full'
                : 'w-2 h-2 bg-white border border-primary/50 rounded-full hover:bg-muted-foreground/50'
            }`}
          />
        ))}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between items-center px-6 pb-8">
        <Button
          variant="outline"
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="border-border hover:bg-muted/50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          {t("onboarding.back")}
        </Button>

        <Button
          onClick={nextSlide}
          className="bg-primary hover:bg-primary/90 text-primary-foreground transition-colors duration-200"
        >
          {currentSlide === slides.length - 1 ? t("onboarding.start") : t("onboarding.next")}
          {currentSlide < slides.length - 1 && <ChevronRight className="h-4 w-4 ml-2" />}
        </Button>
      </div>
    </div>
  );
}