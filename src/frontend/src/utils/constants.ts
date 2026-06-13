export const APP_NAME = "HomeoPath CRM";
export const APP_TAGLINE = "Holistic Clinic Management";

export const ROUTES = {
  DASHBOARD: "/",
  PATIENTS: "/patients",
  APPOINTMENTS: "/appointments",
  PHARMACY: "/pharmacy",

  AI_ASSISTANT: "/ai-assistant",
  BILLING: "/billing",

  SETTINGS: "/settings",
  USER_MANAGEMENT: "/user-management",
  REGISTER: "/register",
} as const;

export const LANGUAGES = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
] as const;

export const ROLES = [
  "main-admin",
  "doctor",
  "receptionist",
  "pharmacist",
] as const;

export const NAV_ITEMS = [
  {
    path: ROUTES.DASHBOARD,
    label: "Dashboard",
    icon: "LayoutDashboard",
    roles: ["main-admin", "doctor", "receptionist", "pharmacist"] as const,
  },
  {
    path: ROUTES.PATIENTS,
    label: "Patients",
    icon: "Users",
    roles: ["main-admin", "doctor", "receptionist"] as const,
  },
  {
    path: ROUTES.APPOINTMENTS,
    label: "Appointments",
    icon: "Calendar",
    roles: ["main-admin", "doctor", "receptionist"] as const,
  },
  {
    path: ROUTES.PHARMACY,
    label: "Pharmacy",
    icon: "FlaskConical",
    roles: ["main-admin", "receptionist", "pharmacist"] as const,
  },
  {
    path: ROUTES.AI_ASSISTANT,
    label: "AI Assistant",
    icon: "Brain",
    roles: ["main-admin", "doctor"] as const,
  },
  {
    path: ROUTES.BILLING,
    label: "Billing",
    icon: "CreditCard",
    roles: ["main-admin"] as const,
  },
  {
    path: ROUTES.SETTINGS,
    label: "Settings",
    icon: "Settings",
    roles: ["main-admin", "doctor", "receptionist", "pharmacist"] as const,
  },
  {
    path: ROUTES.USER_MANAGEMENT,
    label: "User Management",
    icon: "UserCog",
    roles: ["main-admin"] as const,
  },
] as const;

export const STATUS_COLORS = {
  confirmed: "bg-primary/20 text-primary border-primary/30",
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  completed: "bg-muted text-muted-foreground border-muted-foreground/30",
  cancelled: "bg-destructive/20 text-destructive border-destructive/30",
  paid: "bg-green-500/20 text-green-400 border-green-500/30",
  overdue: "bg-destructive/20 text-destructive border-destructive/30",
  active: "bg-primary/20 text-primary border-primary/30",
  inactive: "bg-muted text-muted-foreground border-muted-foreground/30",
  stopped: "bg-destructive/20 text-destructive border-destructive/30",
} as const;
