"use client";

import { useEffect } from "react";
import { useOnboarding } from "@/components/OnboardingProvider";

export function useOnboardingGuide() {
  const { hasSeenOnboarding, hasSeenGuide, setShowGuide } = useOnboarding();

  useEffect(() => {
    // Start onboarding guide if user has seen welcome slides but not the guide
    if (hasSeenOnboarding && !hasSeenGuide) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        setShowGuide(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [hasSeenOnboarding, hasSeenGuide, setShowGuide]);

  return {
    shouldShowGuide: hasSeenOnboarding && !hasSeenGuide,
  };
}