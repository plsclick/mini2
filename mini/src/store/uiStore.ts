import { create } from "zustand";
interface UIState {
  searchOpen: boolean;
  sidebarOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}
export const useUIStore = create<UIState>((set) => ({
  searchOpen: false,
  sidebarOpen: false,
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));
