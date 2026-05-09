import { create } from "zustand";
import { notifications as initialNotifications } from "../data/notifications";
import type { Language, Notification, RoleId } from "../types";
import type { AuthUser } from "../utils/auth";
import { getCurrentUser, logoutUser } from "../utils/auth";

interface AppState {
  theme: "light" | "dark";
  accentColor: string;
  sidebarOpen: boolean;
  currentRole: RoleId | null;
  currentUser: AuthUser | null;
  isLoggedIn: boolean;
  language: Language;
  searchQuery: string;
  notifications: Notification[];

  toggleTheme: () => void;
  setAccentColor: (accent: string) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setRole: (roleId: RoleId | null) => void;
  setCurrentUser: (user: AuthUser | null) => void;
  logout: () => void;
  setLanguage: (lang: Language) => void;
  setSearchQuery: (query: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

const _storedUser = getCurrentUser();
const _storedRole = _storedUser
  ? _storedUser.role
  : (localStorage.getItem("hcrm_role") as RoleId | null);

const _storedAccent =
  typeof localStorage !== "undefined"
    ? (localStorage.getItem("accent-color") ?? "teal")
    : "teal";

export const useAppStore = create<AppState>((set) => ({
  theme: "light",
  accentColor: _storedAccent,
  sidebarOpen: true,
  currentRole: _storedRole,
  currentUser: _storedUser,
  isLoggedIn: !!_storedUser || !!_storedRole,
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

  setAccentColor: (accent) => {
    localStorage.setItem("accent-color", accent);
    set({ accentColor: accent });
  },

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  setRole: (roleId) => {
    if (roleId === null) {
      localStorage.removeItem("hcrm_role");
    } else {
      localStorage.setItem("hcrm_role", roleId);
    }
    set({ currentRole: roleId, isLoggedIn: roleId !== null });
  },

  setCurrentUser: (user) => {
    if (user) {
      localStorage.setItem("hcrm_role", user.role);
    }
    set({
      currentUser: user,
      currentRole: user?.role ?? null,
      isLoggedIn: !!user,
    });
  },

  logout: () => {
    logoutUser();
    set({ currentUser: null, currentRole: null, isLoggedIn: false });
  },

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
