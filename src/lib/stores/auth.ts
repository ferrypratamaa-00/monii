"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  lastTokenRefresh: number | null;
  setUser: (user: User | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setLoading: (loading: boolean) => void;
  updateTokenRefresh: () => void;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
}

const TOKEN_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
const TOKEN_EXPIRY_BUFFER = 10 * 60 * 1000; // 10 minutes buffer before expiry

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      lastTokenRefresh: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      setAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),

      setLoading: (loading) => set({ isLoading: loading }),

      updateTokenRefresh: () => set({ lastTokenRefresh: Date.now() }),

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          lastTokenRefresh: null,
        });
        // Clear server-side session
        fetch("/api/auth/logout", { method: "POST" }).catch(console.error);
      },

      refreshToken: async () => {
        try {
          // Instead of refreshing token, check if current session is still valid
          const response = await fetch("/api/auth/me", {
            credentials: "include",
          });

          if (response.ok) {
            const data = await response.json();
            set({
              user: data.user,
              isAuthenticated: true,
              lastTokenRefresh: Date.now(),
            });
            return true;
          } else {
            // Session invalid, logout
            get().logout();
            return false;
          }
        } catch (error) {
          console.error("Session check failed:", error);
          get().logout();
          return false;
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        lastTokenRefresh: state.lastTokenRefresh,
      }),
    },
  ),
);

// Periodic token refresh
let refreshInterval: NodeJS.Timeout | null = null;

export const startTokenRefresh = () => {
  if (refreshInterval) return;

  refreshInterval = setInterval(async () => {
    const state = useAuthStore.getState();
    if (!state.isAuthenticated) return;

    const now = Date.now();
    const timeSinceLastRefresh = state.lastTokenRefresh
      ? now - state.lastTokenRefresh
      : Infinity;

    // Refresh if it's been more than the interval or if close to expiry
    if (timeSinceLastRefresh >= TOKEN_REFRESH_INTERVAL) {
      console.log("Refreshing auth token...");
      await state.refreshToken();
    }
  }, TOKEN_REFRESH_INTERVAL);
};

export const stopTokenRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
};

// Initialize auth state on app start
export const initializeAuth = async () => {
  const state = useAuthStore.getState();
  state.setLoading(true);

  try {
    // Check current auth status
    const response = await fetch("/api/auth/me", {
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      state.setUser(data.user);
      state.updateTokenRefresh();
      startTokenRefresh();
    } else {
      state.setUser(null);
      stopTokenRefresh();
    }
  } catch (error) {
    console.error("Auth initialization failed:", error);
    state.setUser(null);
    stopTokenRefresh();
  } finally {
    state.setLoading(false);
  }
};