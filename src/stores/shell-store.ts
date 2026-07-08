import { create } from "zustand";

type ShellState = {
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  searchOpen: boolean;
  toggleSidebar: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
};

export const useShellStore = create<ShellState>((set) => ({
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  searchOpen: false,
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
  setSearchOpen: (open) => set({ searchOpen: open }),
}));
