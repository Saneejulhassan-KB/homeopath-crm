export const APP_NAME = "HomeoPath CRM";
export const APP_TAGLINE = "Holistic Clinic Management";

export const ROUTES = {
  DASHBOARD: "/",
  PATIENTS: "/patients",
  APPOINTMENTS: "/appointments",
  PRESCRIPTIONS: "/prescriptions",
  AI_ASSISTANT: "/ai-assistant",
  BILLING: "/billing",
  REPORTS: "/reports",
  SETTINGS: "/settings",
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

export const ROLES = ["Admin", "Doctor", "Receptionist"] as const;

export const NAV_ITEMS = [
  { path: ROUTES.DASHBOARD, label: "Dashboard", icon: "LayoutDashboard" },
  { path: ROUTES.PATIENTS, label: "Patients", icon: "Users" },
  { path: ROUTES.APPOINTMENTS, label: "Appointments", icon: "Calendar" },
  { path: ROUTES.PRESCRIPTIONS, label: "Prescriptions", icon: "Pill" },
  { path: ROUTES.AI_ASSISTANT, label: "AI Assistant", icon: "Brain" },
  { path: ROUTES.BILLING, label: "Billing", icon: "CreditCard" },
  { path: ROUTES.REPORTS, label: "Reports", icon: "BarChart3" },
  { path: ROUTES.SETTINGS, label: "Settings", icon: "Settings" },
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
