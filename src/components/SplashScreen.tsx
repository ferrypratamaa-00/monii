"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate progress bar
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    // Show splash for 2.5 seconds, then fade out
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Wait for fade animation to complete before calling onComplete
      setTimeout(onComplete, 400);
    }, 2500);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-99 flex items-center justify-center bg-background transition-all duration-400 ${!isVisible ? "opacity-0" : "opacity-100"}`}
    >
      <div className="text-center">
        {/* App Logo/Icon */}
        <div className="mb-4">
          <Image
            src="/icons/icon-192.png"
            alt="Monii Logo"
            width={120}
            height={120}
            className="mx-auto rounded-2xl"
            priority
          />
        </div>

        {/* App Name */}
        <h1 className="text-3xl font-bold text-foreground mb-3">Monii</h1>

        {/* Tagline */}
        <p className="text-muted-foreground text-base mb-8">
          Personal Finance Manager
        </p>

        {/* Progress bar */}
        <div className="w-48 mx-auto mb-4">
          <div className="w-full bg-muted rounded-full h-1 overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Loading text */}
        <p className="text-xs text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
