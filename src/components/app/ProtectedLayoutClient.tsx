"use client";

import Navigation from "@/components/app/Navigation";
import OfflineIndicator from "@/components/OfflineIndicator";
import { ErrorBoundary } from "@/components/ui/error-boundary";

interface ProtectedLayoutClientProps {
  children: React.ReactNode;
}

export default function ProtectedLayoutClient({
  children,
}: ProtectedLayoutClientProps) {
  return (
    <ErrorBoundary>
      <Navigation />
      {children}
      <OfflineIndicator />
    </ErrorBoundary>
  );
}
