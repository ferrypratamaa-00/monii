"use client";

import { useEffect } from "react";

export function PWAProvider() {
  useEffect(() => {
    // Only register service worker in production and if supported
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log(
            "PWA: Service worker registered successfully",
            registration,
          );
        })
        .catch((error) => {
          console.error("PWA: Service worker registration failed", error);
        });
    }
  }, []);

  return null;
}
