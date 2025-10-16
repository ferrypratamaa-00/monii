"use client";

import { OnboardingGuide } from "@/components/OnboardingGuide";
import { useOnboarding } from "@/components/OnboardingProvider";
import { SplashScreen } from "@/components/SplashScreen";
import { WelcomeSlides } from "@/components/WelcomeSlides";

interface AppInitializerProps {
  children: React.ReactNode;
}

export function AppInitializer({ children }: AppInitializerProps) {
  const {
    hasSeenOnboarding,
    setHasSeenOnboarding,
    showSplash,
    setShowSplash,
    showWelcome,
    setShowWelcome,
    showGuide,
    setShowGuide,
    hasSeenGuide,
    setHasSeenGuide,
  } = useOnboarding();

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const handleWelcomeComplete = () => {
    setHasSeenOnboarding(true);
    setShowWelcome(false);
  };

  const handleWelcomeSkip = () => {
    setHasSeenOnboarding(true);
    setShowWelcome(false);
  };

  const handleGuideComplete = () => {
    setHasSeenGuide(true);
    setShowGuide(false);
  };

  const handleGuideSkip = () => {
    setHasSeenGuide(true);
    setShowGuide(false);
  };

  return (
    <>
      {/* Show splash screen first */}
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

      {/* Show welcome slides if user hasn't seen onboarding */}
      {showWelcome && !hasSeenOnboarding && (
        <WelcomeSlides
          onComplete={handleWelcomeComplete}
          onSkip={handleWelcomeSkip}
        />
      )}

      {/* Show onboarding guide if user has seen welcome but not guide */}
      {showGuide && hasSeenOnboarding && !hasSeenGuide && (
        <OnboardingGuide
          run={showGuide}
          onComplete={handleGuideComplete}
          onSkip={handleGuideSkip}
        />
      )}

      {/* Show main app */}
      {children}
    </>
  );
}
