"use client";

import { useAuthStore } from "@/lib/stores/auth";

export function useAuth() {
  const { user, isAuthenticated, isLoading, logout, refreshToken } =
    useAuthStore();

  return {
    user,
    isAuthenticated,
    isLoading,
    logout,
    refreshToken,
  };
}
