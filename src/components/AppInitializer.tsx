"use client";

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

  // Show splash screen first
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  // Show welcome slides if user hasn't seen onboarding
  if (showWelcome && !hasSeenOnboarding) {
    return (
      <WelcomeSlides
        onComplete={handleWelcomeComplete}
        onSkip={handleWelcomeSkip}
      />
    );
  }

  // Show main app
  return <>{children}</>;
}
