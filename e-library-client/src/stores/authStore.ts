import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/types/api";
import Cookies from "js-cookie";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  setHydrated: () => void;
}

const COOKIE_OPTS = {
  expires: 7,
  secure: process.env.NODE_ENV === "production",
  sameSite: (process.env.NODE_ENV === "production" ? "strict" : "lax") as "strict" | "lax",
  path: "/",
} as const;

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,
      isHydrated: false,

      setUser: (user) => {
        // Keep the role cookie in sync for middleware routing (avoids client-side flicker)
        if (user?.role) {
          Cookies.set("user_role", user.role, COOKIE_OPTS);
        } else {
          Cookies.remove("user_role", { path: "/" });
        }
        set({ user, isAuthenticated: !!user, isLoading: false });
      },

      setAccessToken: (token) =>
        set({ accessToken: token, isAuthenticated: !!token }),

      setTokens: (accessToken, refreshToken) => {
        Cookies.set("refreshToken", refreshToken, COOKIE_OPTS);
        set({ accessToken, isAuthenticated: true, isLoading: false });
      },

      logout: () => {
        Cookies.remove("refreshToken", { path: "/" });
        Cookies.remove("user_role", { path: "/" });
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("auth-storage");
        }
        set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
      },

      clearAuth: () =>
        set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false }),

      setLoading: (loading) => set({ isLoading: loading }),
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated();
          state.setLoading(false);
        }
      },
    }
  )
);

export const getRefreshToken = (): string | undefined =>
  Cookies.get("refreshToken");

export function useAuthHydration() {
  return useAuthStore((state) => state.isHydrated);
}