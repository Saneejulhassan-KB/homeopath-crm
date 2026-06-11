export const APP_NAME = "HomeoPath CRM";
export const APP_TAGLINE = "Holistic Clinic Management";

export const ROUTES = {
  DASHBOARD: "/",
  PATIENTS: "/patients",
  APPOINTMENTS: "/appointments",

  AI_ASSISTANT: "/ai-assistant",
  BILLING: "/billing",

  SETTINGS: "/settings",
  STAFF: "/staff",
  REGISTER: "/register",
  PRO: "/pro",
  PRO_VOICE: "/pro/voice-recorder",
  PRO_REMEDY_FINDER: "/pro/remedy-finder",
  PRO_TEMPLATES: "/pro/case-templates",
  PRO_TIMELINE: "/pro/patient-timeline",
  PRO_COMPARISON: "/pro/remedy-comparison",
  PRO_REPOSITORY: "/pro/case-repository",
  PRO_MATERIA_MEDICA: "/pro/materia-medica",
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
  "nurse",
  "billing",
] as const;

export const NAV_ITEMS = [
  {
    path: ROUTES.DASHBOARD,
    label: "Dashboard",
    icon: "LayoutDashboard",
    roles: [
      "main-admin",
      "doctor",
      "receptionist",
      "pharmacist",
      "nurse",
      "billing",
    ] as const,
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
    roles: ["main-admin", "doctor", "receptionist", "nurse"] as const,
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
    roles: ["main-admin", "billing"] as const,
  },
  {
    path: ROUTES.SETTINGS,
    label: "Settings",
    icon: "Settings",
    roles: [
      "main-admin",
      "doctor",
      "receptionist",
      "pharmacist",
      "nurse",
      "billing",
    ] as const,
  },
  {
    path: ROUTES.STAFF,
    label: "Staff",
    icon: "UserCog",
    roles: ["main-admin"] as const,
  },
  {
    path: ROUTES.PRO,
    label: "Pro Features",
    icon: "Crown",
    roles: ["main-admin", "doctor"] as const,
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
