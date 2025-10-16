"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface OnboardingContextType {
  hasSeenOnboarding: boolean;
  setHasSeenOnboarding: (seen: boolean) => void;
  showSplash: boolean;
  setShowSplash: (show: boolean) => void;
  showWelcome: boolean;
  setShowWelcome: (show: boolean) => void;
  showGuide: boolean;
  setShowGuide: (show: boolean) => void;
  hasSeenGuide: boolean;
  setHasSeenGuide: (seen: boolean) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined,
);

const ONBOARDING_KEY = "monii_onboarding_seen";
const GUIDE_KEY = "monii_guide_seen";

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [hasSeenOnboarding, setHasSeenOnboardingState] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [hasSeenGuide, setHasSeenGuideState] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load onboarding state from localStorage on mount
  useEffect(() => {
    const seenOnboarding = localStorage.getItem(ONBOARDING_KEY) === "true";
    const seenGuide = localStorage.getItem(GUIDE_KEY) === "true";

    setHasSeenOnboardingState(seenOnboarding);
    setHasSeenGuideState(seenGuide);
    setIsLoaded(true);

    // If user hasn't seen onboarding, show welcome slides after splash
    if (!seenOnboarding) {
      setShowWelcome(true);
    }
  }, []);

  const setHasSeenOnboarding = (seen: boolean) => {
    setHasSeenOnboardingState(seen);
    localStorage.setItem(ONBOARDING_KEY, seen.toString());
  };

  const setHasSeenGuide = (seen: boolean) => {
    setHasSeenGuideState(seen);
    localStorage.setItem(GUIDE_KEY, seen.toString());
  };

  // Don't render children until we've loaded the onboarding state
  if (!isLoaded) {
    return null;
  }

  return (
    <OnboardingContext.Provider
      value={{
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
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}
