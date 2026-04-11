import { create } from "zustand";
import { notifications as initialNotifications } from "../data/notifications";
import type { Language, Notification, Role } from "../types";

interface AppState {
  theme: "light" | "dark";
  sidebarOpen: boolean;
  currentRole: Role;
  language: Language;
  searchQuery: string;
  notifications: Notification[];

  toggleTheme: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setRole: (role: Role) => void;
  setLanguage: (lang: Language) => void;
  setSearchQuery: (query: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  theme: "dark",
  sidebarOpen: true,
  currentRole: "Admin",
  language: "en",
  searchQuery: "",
  notifications: initialNotifications,

  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === "dark" ? "light" : "dark";
      if (newTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return { theme: newTheme };
    }),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  setRole: (role) => set({ currentRole: role }),

  setLanguage: (lang) => set({ language: lang }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      ),
    })),

  markAllNotificationsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),
}));
