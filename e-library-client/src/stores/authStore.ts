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
  setLoading: (loading: boolean) => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,
      isHydrated: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }),

      setAccessToken: (token) =>
        set({
          accessToken: token,
          isAuthenticated: !!token,
        }),

      setTokens: (accessToken, refreshToken) => {
        Cookies.set("refreshToken", refreshToken, {
          expires: 7,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        });
        set({
          accessToken,
          isAuthenticated: true,
        });
      },

      logout: () => {
        Cookies.remove("refreshToken");
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

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
          if (state.accessToken) {
            state.setLoading(false);
          } else {
            state.setLoading(false);
          }
        }
      },
    }
  )
);

export const getRefreshToken = (): string | undefined => {
  return Cookies.get("refreshToken");
};
