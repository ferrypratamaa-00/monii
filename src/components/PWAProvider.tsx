"use client";

import { useEffect } from "react";

const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB
const CACHE_CLEANUP_INTERVAL = 30 * 60 * 1000; // 30 minutes

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

    // Monitor cache size and cleanup periodically
    const monitorCacheSize = async () => {
      if (!("caches" in window)) return;

      try {
        const cacheNames = await caches.keys();
        let totalSize = 0;

        for (const cacheName of cacheNames) {
          const cache = await caches.open(cacheName);
          const keys = await cache.keys();

          for (const request of keys) {
            try {
              const response = await cache.match(request);
              if (response) {
                const blob = await response.blob();
                totalSize += blob.size;
              }
            } catch (error) {
              console.warn(`Failed to get size for ${request.url}:`, error);
            }
          }
        }

        console.log(`Cache size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

        // If cache exceeds limit, clear oldest caches
        if (totalSize > MAX_CACHE_SIZE) {
          console.log("Cache size exceeded limit, cleaning up...");

          // Sort caches by name (assuming newer caches have higher numbers)
          const sortedCaches = cacheNames.sort();

          // Keep only the most recent cache
          for (let i = 0; i < sortedCaches.length - 1; i++) {
            await caches.delete(sortedCaches[i]);
            console.log(`Deleted old cache: ${sortedCaches[i]}`);
          }
        }
      } catch (error) {
        console.error("Cache monitoring failed:", error);
      }
    };

    // Initial check
    monitorCacheSize();

    // Periodic monitoring
    const intervalId = setInterval(monitorCacheSize, CACHE_CLEANUP_INTERVAL);

    return () => clearInterval(intervalId);
  }, []);

  return null;
}
