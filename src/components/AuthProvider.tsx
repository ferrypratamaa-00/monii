"use client";

import { useEffect } from "react";
import { initializeAuth } from "@/lib/stores/auth";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  useEffect(() => {
    // Initialize auth state on app start
    initializeAuth();
  }, []);

  return <>{children}</>;
}
