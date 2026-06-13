import type { Role, RoleConfig, RoleId, RolePermissions } from "../types";

export const ROLE_CONFIGS: RoleConfig[] = [
  {
    id: "main-admin",
    displayName: "Main Admin",
    icon: "Shield",
    color: "violet",
    gradient: "from-violet-500/20 to-purple-600/10",
    description:
      "Full clinic oversight, staff management, analytics & settings",
  },
  {
    id: "doctor",
    displayName: "Doctor",
    icon: "Stethoscope",
    color: "sky",
    gradient: "from-sky-500/20 to-blue-600/10",
    description:
      "Consultations, prescriptions, patient case history & follow-ups",
  },
  {
    id: "receptionist",
    displayName: "Receptionist",
    icon: "CalendarCheck",
    color: "emerald",
    gradient: "from-emerald-500/20 to-green-600/10",
    description: "Appointment booking, patient registration & front-desk ops",
  },
  {
    id: "pharmacist",
    displayName: "Pharmacist",
    icon: "FlaskConical",
    color: "amber",
    gradient: "from-amber-500/20 to-orange-600/10",
    description:
      "Remedy dispensing, inventory management & prescription review",
  },
];

// Maps RoleId → display Role string used in the store
export const ROLE_DISPLAY_MAP: Record<RoleId, Role> = {
  "main-admin": "Main Admin",
  doctor: "Doctor",
  receptionist: "Receptionist",
  pharmacist: "Pharmacist",
};

// Tailwind class sets per color token
export const ROLE_COLOR_MAP: Record<
  string,
  { border: string; glow: string; text: string; bg: string; ring: string }
> = {
  violet: {
    border: "border-violet-400/60",
    glow: "shadow-violet-500/30",
    text: "text-violet-300",
    bg: "bg-violet-500/15",
    ring: "ring-violet-400/40",
  },
  sky: {
    border: "border-sky-400/60",
    glow: "shadow-sky-500/30",
    text: "text-sky-300",
    bg: "bg-sky-500/15",
    ring: "ring-sky-400/40",
  },
  emerald: {
    border: "border-emerald-400/60",
    glow: "shadow-emerald-500/30",
    text: "text-emerald-300",
    bg: "bg-emerald-500/15",
    ring: "ring-emerald-400/40",
  },
  amber: {
    border: "border-amber-400/60",
    glow: "shadow-amber-500/30",
    text: "text-amber-300",
    bg: "bg-amber-500/15",
    ring: "ring-amber-400/40",
  },
};

export const ROLE_PERMISSIONS: Record<RoleId, RolePermissions> = {
  "main-admin": {
    dashboard: "full",
    patients: "full",
    appointments: "full",
    billing: "view-only",
    settings: "full",
    "ai-assistant": "full",
  },
  doctor: {
    dashboard: "filtered",
    patients: "filtered",
    appointments: "filtered",
    billing: "none",
    settings: "view-only",
    "ai-assistant": "full",
  },
  receptionist: {
    dashboard: "filtered",
    patients: "filtered",
    appointments: "full",
    billing: "none",
    settings: "view-only",
    "ai-assistant": "none",
  },
  pharmacist: {
    dashboard: "filtered",
    patients: "none",
    appointments: "none",
    billing: "none",
    settings: "view-only",
    "ai-assistant": "none",
  },
};

export function hasModuleAccess(roleId: RoleId, module: string): boolean {
  return (ROLE_PERMISSIONS[roleId]?.[module] ?? "none") !== "none";
}

export function getRoleConfig(roleId: RoleId): RoleConfig | undefined {
  return ROLE_CONFIGS.find((r) => r.id === roleId);
}
