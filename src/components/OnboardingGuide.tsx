"use client";

import { useEffect, useState } from "react";
import Joyride, { CallBackProps, STATUS, EVENTS } from "react-joyride";
import { useLanguage } from "@/components/LanguageProvider";

interface OnboardingGuideProps {
  run: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export function OnboardingGuide({ run, onComplete, onSkip }: OnboardingGuideProps) {
  const { t } = useLanguage();
  const [steps, setSteps] = useState<any[]>([]);

  useEffect(() => {
    // Define onboarding steps for essential features
    const onboardingSteps = [
      {
        target: '[data-onboarding="dashboard-balance"]',
        content: (
          <div className="text-center">
            <h3 className="font-semibold text-lg mb-2">{t("onboarding.guide.balance")}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
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
            <h3 className="font-semibold text-lg mb-2">{t("onboarding.guide.addTransaction")}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
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
            <h3 className="font-semibold text-lg mb-2">{t("onboarding.guide.recentTransactions")}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
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
            <h3 className="font-semibold text-lg mb-2">{t("onboarding.guide.expenseChart")}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
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
            <h3 className="font-semibold text-lg mb-2">{t("onboarding.guide.navigation")}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {t("onboarding.guide.navigationDesc")}
            </p>
          </div>
        ),
        placement: "top" as const,
      },
    ];

    setSteps(onboardingSteps);
  }, [t]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      onComplete();
    }

    if (type === EVENTS.STEP_BEFORE && data.index === 0) {
      // Scroll to top when starting
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const customStyles = {
    options: {
      primaryColor: '#3b82f6',
      textColor: '#374151',
      backgroundColor: '#ffffff',
      overlayColor: 'rgba(0, 0, 0, 0.5)',
      spotlightShadow: '0 0 15px rgba(0, 0, 0, 0.5)',
      beaconSize: 36,
      zIndex: 100,
    },
    tooltip: {
      borderRadius: 8,
      fontSize: 14,
    },
    tooltipContainer: {
      textAlign: 'center' as const,
    },
    buttonNext: {
      backgroundColor: '#3b82f6',
      fontSize: 14,
      borderRadius: 6,
      padding: '8px 16px',
    },
    buttonBack: {
      color: '#6b7280',
      marginRight: 10,
      fontSize: 14,
    },
    buttonSkip: {
      color: '#6b7280',
      fontSize: 14,
    },
    buttonClose: {
      height: 14,
      width: 14,
      right: 15,
      top: 15,
    },
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous={true}
      showProgress={true}
      showSkipButton={true}
      callback={handleJoyrideCallback}
      styles={customStyles}
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