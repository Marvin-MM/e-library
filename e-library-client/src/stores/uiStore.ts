import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  sidebarOpen: boolean;
  reducedMotion: boolean;
  theme: "light" | "dark";
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setReducedMotion: (reduced: boolean) => void;
  setTheme: (theme: "light" | "dark") => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      reducedMotion: false,
      theme: "light",

      setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setReducedMotion: (reduced: boolean) => set({ reducedMotion: reduced }),
      setTheme: (theme: "light" | "dark") => set({ theme }),
    }),
    {
      name: "ui-storage",
    }
  )
);
