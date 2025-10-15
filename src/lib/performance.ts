import type { NextWebVitalsMetric } from "next/app";

export function reportWebVitals(metric: NextWebVitalsMetric) {
  // Send to analytics service (Vercel, Google Analytics, etc.)
  // For now, log to console - replace with actual analytics in production
  console.log("Web Vitals:", {
    name: metric.name,
    value: metric.value,
    id: metric.id,
    label: metric.label,
  });

  // Example: Send to Vercel Analytics if configured
  // if (typeof window !== 'undefined' && window.va) {
  //   window.va('event', {
  //     name: `web-vitals:${metric.name}`,
  //     value: metric.value,
  //   });
  // }
}
