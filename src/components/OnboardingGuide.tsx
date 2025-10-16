"use client";

import { useEffect, useState } from "react";
import Joyride, { type CallBackProps, EVENTS, STATUS } from "react-joyride";
import { useLanguage } from "@/components/LanguageProvider";
import { useTheme } from "@/components/ThemeProvider";

interface OnboardingGuideProps {
  run: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export function OnboardingGuide({
  run,
  onComplete,
  onSkip,
}: OnboardingGuideProps) {
  const { t } = useLanguage();
  const { theme, colorMode } = useTheme();
  const [steps, setSteps] = useState<any[]>([]);
  const [styles, setStyles] = useState<any>({});

  useEffect(() => {
    // Define onboarding steps for essential features
    const onboardingSteps = [
      {
        target: '[data-onboarding="dashboard-balance"]',
        content: (
          <div className="text-center">
            <h3 className="font-semibold text-lg mb-2 text-foreground">
              {t("onboarding.guide.balance")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("onboarding.guide.balanceDesc")}
            </p>
          </div>
        ),
        placement: "bottom" as const,
        disableBeacon: true,
      },
      {
        target: '[data-onboarding="add-transaction"]',
        content: (
          <div className="text-center">
            <h3 className="font-semibold text-lg mb-2 text-foreground">
              {t("onboarding.guide.addTransaction")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("onboarding.guide.addTransactionDesc")}
            </p>
          </div>
        ),
        placement: "top" as const,
      },
      {
        target: '[data-onboarding="recent-transactions"]',
        content: (
          <div className="text-center">
            <h3 className="font-semibold text-lg mb-2 text-foreground">
              {t("onboarding.guide.recentTransactions")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("onboarding.guide.recentTransactionsDesc")}
            </p>
          </div>
        ),
        placement: "top" as const,
      },
      {
        target: '[data-onboarding="expense-chart"]',
        content: (
          <div className="text-center">
            <h3 className="font-semibold text-lg mb-2 text-foreground">
              {t("onboarding.guide.expenseChart")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("onboarding.guide.expenseChartDesc")}
            </p>
          </div>
        ),
        placement: "left" as const,
      },
      {
        target: '[data-onboarding="navigation"]',
        content: (
          <div className="text-center">
            <h3 className="font-semibold text-lg mb-2 text-foreground">
              {t("onboarding.guide.navigation")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("onboarding.guide.navigationDesc")}
            </p>
          </div>
        ),
        placement: "top" as const,
      },
    ];

    setSteps(onboardingSteps);
  }, [t]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <>
  useEffect(() => {
    // Update styles based on current theme
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);

    const primaryColor = computedStyle.getPropertyValue("--primary").trim();
    const foregroundColor = computedStyle
      .getPropertyValue("--foreground")
      .trim();
    const cardBg = computedStyle.getPropertyValue("--card").trim();
    const primaryFg = computedStyle
      .getPropertyValue("--primary-foreground")
      .trim();
    const mutedFg = computedStyle.getPropertyValue("--muted-foreground").trim();

    const customStyles = {
      options: {
        primaryColor: primaryColor || "#d4a5c4",
        textColor: foregroundColor || "#4a4a4a",
        backgroundColor: cardBg || "#ffffff",
        overlayColor: "rgba(0, 0, 0, 0.5)",
        spotlightShadow: "0 0 15px rgba(0, 0, 0, 0.5)",
        beaconSize: 36,
        zIndex: 100,
      },
      tooltip: {
        borderRadius: 8,
        fontSize: 14,
      },
      tooltipContainer: {
        textAlign: "center" as const,
      },
      buttonNext: {
        backgroundColor: primaryColor || "#d4a5c4",
        fontSize: 14,
        borderRadius: 6,
        padding: "8px 16px",
        color: primaryFg || "#ffffff",
        border: "none",
        cursor: "pointer",
      },
      buttonBack: {
        color: mutedFg || "#9b9b9b",
        marginRight: 10,
        fontSize: 14,
        backgroundColor: "transparent",
        border: "none",
        cursor: "pointer",
      },
      buttonSkip: {
        color: mutedFg || "#9b9b9b",
        fontSize: 14,
        backgroundColor: "transparent",
        border: "none",
        cursor: "pointer",
      },
      buttonClose: {
        height: 14,
        width: 14,
        right: 15,
        top: 15,
      },
    };

    setStyles(customStyles);
  }, [theme, colorMode]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      onComplete();
    }

    if (type === EVENTS.STEP_BEFORE && data.index === 0) {
      // Scroll to top when starting
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous={true}
      showProgress={true}
      showSkipButton={true}
      callback={handleJoyrideCallback}
      styles={styles}
      locale={{
        back: t("onboarding.back"),
        close: t("onboarding.close"),
        last: t("onboarding.finish"),
        next: t("onboarding.next"),
        open: t("onboarding.open"),
        skip: t("onboarding.skip"),
      }}
      disableOverlayClose={true}
      disableCloseOnEsc={true}
      spotlightClicks={false}
      hideCloseButton={false}
    />
  );
}
