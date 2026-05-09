/**
 * Accent colour palette — each entry maps a human-readable ID to
 * its OKLCH light-mode and dark-mode values, plus a preview hex
 * for the colour-swatch buttons in Settings.
 *
 * The light/dark strings are written in OKLCH shorthand
 * (L C H) matching the format used throughout index.css.
 *
 * primary / primaryDark  → --primary, --ring, --sidebar-primary, --chart-1
 * primaryForeground      → --primary-foreground, --sidebar-primary-foreground
 */
export interface AccentPalette {
  /** --accent (light mode) */
  light: string;
  /** --accent-dark (dark mode) */
  dark: string;
  /** --primary in light mode */
  primary: string;
  /** --primary-foreground in light mode (white) */
  primaryForeground: string;
  /** --primary in dark mode */
  primaryDark: string;
  /** --primary-foreground in dark mode */
  primaryForegroundDark: string;
}

export const ACCENT_COLOR_MAP: Record<string, AccentPalette> = {
  teal: {
    light: "0.65 0.14 185",
    dark: "0.72 0.16 185",
    primary: "0.62 0.15 180",
    primaryForeground: "0.98 0 0",
    primaryDark: "0.65 0.18 180",
    primaryForegroundDark: "0.12 0 0",
  },
  skyblue: {
    light: "0.62 0.15 230",
    dark: "0.70 0.17 230",
    primary: "0.62 0.15 220",
    primaryForeground: "0.98 0 0",
    primaryDark: "0.65 0.18 220",
    primaryForegroundDark: "0.12 0 0",
  },
  violet: {
    light: "0.58 0.20 290",
    dark: "0.68 0.22 290",
    primary: "0.55 0.22 280",
    primaryForeground: "0.98 0 0",
    primaryDark: "0.58 0.24 280",
    primaryForegroundDark: "0.98 0 0",
  },
  emerald: {
    light: "0.60 0.16 155",
    dark: "0.68 0.18 155",
    primary: "0.62 0.15 145",
    primaryForeground: "0.98 0 0",
    primaryDark: "0.65 0.18 145",
    primaryForegroundDark: "0.12 0 0",
  },
  amber: {
    light: "0.72 0.16 75",
    dark: "0.78 0.18 75",
    primary: "0.72 0.18 85",
    primaryForeground: "0.10 0 0",
    primaryDark: "0.75 0.20 85",
    primaryForegroundDark: "0.10 0 0",
  },
  pink: {
    light: "0.60 0.20 340",
    dark: "0.68 0.22 340",
    primary: "0.62 0.20 350",
    primaryForeground: "0.98 0 0",
    primaryDark: "0.65 0.22 350",
    primaryForegroundDark: "0.98 0 0",
  },
  cyan: {
    light: "0.65 0.15 200",
    dark: "0.72 0.17 200",
    primary: "0.65 0.15 195",
    primaryForeground: "0.10 0 0",
    primaryDark: "0.68 0.18 195",
    primaryForegroundDark: "0.10 0 0",
  },
  indigo: {
    light: "0.55 0.22 265",
    dark: "0.65 0.24 265",
    primary: "0.50 0.22 260",
    primaryForeground: "0.98 0 0",
    primaryDark: "0.55 0.24 260",
    primaryForegroundDark: "0.98 0 0",
  },
  rose: {
    light: "0.62 0.22 10",
    dark: "0.70 0.24 10",
    primary: "0.62 0.20 10",
    primaryForeground: "0.98 0 0",
    primaryDark: "0.65 0.22 10",
    primaryForegroundDark: "0.98 0 0",
  },
  green: {
    light: "0.60 0.18 140",
    dark: "0.68 0.20 140",
    primary: "0.62 0.16 145",
    primaryForeground: "0.98 0 0",
    primaryDark: "0.65 0.18 145",
    primaryForegroundDark: "0.12 0 0",
  },
  orange: {
    light: "0.68 0.18 50",
    dark: "0.74 0.20 50",
    primary: "0.68 0.18 55",
    primaryForeground: "0.10 0 0",
    primaryDark: "0.70 0.20 55",
    primaryForegroundDark: "0.10 0 0",
  },
  purple: {
    light: "0.58 0.19 310",
    dark: "0.67 0.21 310",
    primary: "0.55 0.22 290",
    primaryForeground: "0.98 0 0",
    primaryDark: "0.58 0.24 290",
    primaryForegroundDark: "0.98 0 0",
  },
};

export interface AccentColor {
  id: string;
  label: string;
  /** CSS hex used only for the visual swatch — not applied to CSS vars */
  hex: string;
}

export const ACCENT_COLORS: AccentColor[] = [
  { id: "teal", label: "Teal", hex: "#14b8a6" },
  { id: "skyblue", label: "Sky Blue", hex: "#38bdf8" },
  { id: "violet", label: "Violet", hex: "#8b5cf6" },
  { id: "emerald", label: "Emerald", hex: "#10b981" },
  { id: "amber", label: "Amber", hex: "#f59e0b" },
  { id: "pink", label: "Pink", hex: "#ec4899" },
  { id: "cyan", label: "Cyan", hex: "#06b6d4" },
  { id: "indigo", label: "Indigo", hex: "#6366f1" },
  { id: "rose", label: "Rose", hex: "#f43f5e" },
  { id: "green", label: "Green", hex: "#22c55e" },
  { id: "orange", label: "Orange", hex: "#f97316" },
  { id: "purple", label: "Purple", hex: "#a855f7" },
];

/**
 * Read persisted accent from localStorage and apply it to the DOM.
 * Also updates --primary and all primary-derived CSS variables so the
 * selected colour propagates across the entire app.
 * Safe to call on first render (server guard included).
 */
export function applyPersistedAccent(): void {
  if (typeof window === "undefined") return;
  const saved = localStorage.getItem("accent-color") ?? "teal";
  const palette = ACCENT_COLOR_MAP[saved];
  if (!palette) return;

  const isDark = document.documentElement.classList.contains("dark");
  const primary = isDark ? palette.primaryDark : palette.primary;
  const primaryFg = isDark
    ? palette.primaryForegroundDark
    : palette.primaryForeground;

  const root = document.documentElement;
  root.style.setProperty("--accent", palette.light);
  root.style.setProperty("--accent-dark", palette.dark);
  root.style.setProperty("--primary", primary);
  root.style.setProperty("--primary-foreground", primaryFg);
  root.style.setProperty("--sidebar-primary", primary);
  root.style.setProperty("--sidebar-primary-foreground", primaryFg);
  root.style.setProperty("--ring", primary);
  root.style.setProperty("--chart-1", primary);
}
