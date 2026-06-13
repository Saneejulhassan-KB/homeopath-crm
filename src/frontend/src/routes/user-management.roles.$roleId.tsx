import { Button } from "@/components/ui/button";
import { ROLE_COLOR_MAP } from "@/utils/roleAccess";
import { createRoute, useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckSquare,
  LayoutDashboard,
  RotateCcw,
  Save,
  Shield,
  Square,
  Stethoscope,
  UserCog,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Route as userManagementRoute } from "./user-management";

export const Route = createRoute({
  getParentRoute: () => userManagementRoute,
  path: "roles/$roleId",
  component: RolePermissionsEditor,
});

// ─── Role metadata ────────────────────────────────────────────────────────────

const ROLE_META: Record<
  string,
  { name: string; color: string; description: string; isBuiltIn: boolean }
> = {
  "main-admin": {
    name: "Main Admin",
    color: "violet",
    description:
      "Full clinic oversight, staff management, analytics & settings",
    isBuiltIn: true,
  },
  admin: {
    name: "Admin",
    color: "sky",
    description: "Administrative tasks, reporting & staff coordination",
    isBuiltIn: true,
  },
  doctor: {
    name: "Doctor",
    color: "sky",
    description:
      "Consultations, prescriptions, patient case history & follow-ups",
    isBuiltIn: true,
  },
  receptionist: {
    name: "Receptionist",
    color: "emerald",
    description: "Appointment booking, patient registration & front-desk ops",
    isBuiltIn: true,
  },
  pharmacist: {
    name: "Pharmacist",
    color: "amber",
    description:
      "Remedy dispensing, inventory management & prescription review",
    isBuiltIn: true,
  },
};

// ─── Permissions definition ───────────────────────────────────────────────────

interface Permission {
  id: string;
  label: string;
}

interface Module {
  id: string;
  label: string;
  icon: React.ReactNode;
  permissions: Permission[];
}

const MODULES: Module[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="w-4 h-4" />,
    permissions: [
      { id: "dashboard.view_all", label: "View all dashboard" },
      { id: "dashboard.total_appointments", label: "Total appointments" },
      { id: "dashboard.total_visitors", label: "Total visitors" },
      { id: "dashboard.case_taken", label: "Case taken" },
      { id: "dashboard.total_revenue", label: "Total revenue" },
      { id: "dashboard.new_registrations", label: "New registrations" },
      { id: "dashboard.total_patients", label: "Total patients" },
      { id: "dashboard.pending_cases", label: "Pending cases" },
      { id: "dashboard.doctor_performance", label: "Doctor performance" },
    ],
  },
  {
    id: "patient-list",
    label: "Patient List Page",
    icon: <Users className="w-4 h-4" />,
    permissions: [
      { id: "patient_list.view", label: "View patient list" },
      { id: "patient_list.edit", label: "Edit patient" },
      { id: "patient_list.delete", label: "Delete patient" },
    ],
  },
  {
    id: "patient-detail",
    label: "Patient Detail Page",
    icon: <Stethoscope className="w-4 h-4" />,
    permissions: [
      { id: "patient_detail.all", label: "All patient detail page" },
      { id: "patient_detail.hide_fee", label: "Hide fee structure" },
      { id: "patient_detail.hide_auto_msg", label: "Hide auto message tab" },
    ],
  },
  {
    id: "pharmacy",
    label: "Pharmacy Page",
    icon: <span className="text-sm">💊</span>,
    permissions: [
      { id: "pharmacy.fee_structure", label: "Fee structure" },
      { id: "pharmacy.medicine", label: "Medicine" },
    ],
  },
  {
    id: "appointments",
    label: "Appointments Page",
    icon: <span className="text-sm">📅</span>,
    permissions: [
      { id: "appointments.view_all", label: "View all appointment page" },
      { id: "appointments.book", label: "Access book appointment button" },
    ],
  },
  {
    id: "billing",
    label: "Billing Page",
    icon: <span className="text-sm">💳</span>,
    permissions: [
      { id: "billing.invoice", label: "Invoice" },
      { id: "billing.payment_history", label: "Payment history" },
      { id: "billing.subscription_plan", label: "Subscription plan" },
    ],
  },
  {
    id: "settings",
    label: "Settings Page",
    icon: <span className="text-sm">⚙️</span>,
    permissions: [
      { id: "settings.view_all", label: "View all settings" },
      { id: "settings.clinic_profile", label: "Edit clinic profile" },
      { id: "settings.doctor_profile", label: "Edit doctor profile" },
      { id: "settings.appearance", label: "Edit appearance" },
      { id: "settings.auto_messages", label: "Edit auto messages" },
      { id: "settings.security", label: "Edit security" },
      { id: "settings.billing", label: "View billing settings" },
    ],
  },
  {
    id: "user-management",
    label: "User Management Page",
    icon: <UserCog className="w-4 h-4" />,
    permissions: [
      { id: "um.view_users", label: "View Users" },
      { id: "um.add_user", label: "Add User" },
      { id: "um.edit_user", label: "Edit User" },
      { id: "um.delete_user", label: "Delete User" },
      { id: "um.view_roles", label: "View Roles" },
      { id: "um.edit_role", label: "Edit Role Permissions" },
    ],
  },
];

// ─── Default permissions per role ────────────────────────────────────────────

const ALL_PERMS = MODULES.flatMap((m) => m.permissions.map((p) => p.id));

const DEFAULT_PERMISSIONS: Record<string, string[]> = {
  "main-admin": ALL_PERMS,
  admin: ALL_PERMS,
  doctor: [
    "dashboard.view_all",
    "dashboard.total_appointments",
    "dashboard.total_visitors",
    "dashboard.case_taken",
    "dashboard.total_revenue",
    "dashboard.new_registrations",
    "dashboard.total_patients",
    "dashboard.pending_cases",
    "dashboard.doctor_performance",
    "patient_list.view",
    "patient_list.edit",
    "patient_detail.all",
    "patient_detail.hide_fee",
    "patient_detail.hide_auto_msg",
    "appointments.view_all",
    "appointments.book",
    "billing.invoice",
    "billing.payment_history",
    "settings.view_all",
    "settings.doctor_profile",
    "settings.appearance",
    "settings.auto_messages",
    "settings.security",
  ],
  receptionist: [
    "dashboard.view_all",
    "dashboard.total_appointments",
    "dashboard.total_visitors",
    "dashboard.new_registrations",
    "dashboard.total_patients",
    "dashboard.pending_cases",
    "patient_list.view",
    "patient_list.edit",
    "patient_detail.all",
    "pharmacy.fee_structure",
    "pharmacy.medicine",
    "appointments.view_all",
    "appointments.book",
    "billing.invoice",
    "settings.view_all",
  ],
  pharmacist: [
    "dashboard.view_all",
    "dashboard.total_patients",
    "dashboard.pending_cases",
    "patient_list.view",
    "patient_detail.all",
    "pharmacy.fee_structure",
    "pharmacy.medicine",
    "billing.invoice",
    "billing.payment_history",
    "settings.view_all",
  ],
};

const LS_KEY = (roleId: string) => `role_perms_${roleId}`;

function loadSaved(roleId: string): string[] | null {
  try {
    const raw = localStorage.getItem(LS_KEY(roleId));
    return raw ? (JSON.parse(raw) as string[]) : null;
  } catch {
    return null;
  }
}

// ─── Main component ───────────────────────────────────────────────────────────

function RolePermissionsEditor() {
  const { roleId } = useParams({ from: "/user-management/roles/$roleId" });
  const navigate = useNavigate();

  const meta = ROLE_META[roleId] ?? {
    name: roleId.replace(/-/g, " "),
    color: "sky",
    description: "Custom role",
    isBuiltIn: false,
  };

  const defaultPerms = DEFAULT_PERMISSIONS[roleId] ?? [];

  const [permissions, setPermissions] = useState<string[]>(() => {
    return loadSaved(roleId) ?? defaultPerms;
  });

  // Reload when roleId changes
  useEffect(() => {
    setPermissions(loadSaved(roleId) ?? DEFAULT_PERMISSIONS[roleId] ?? []);
  }, [roleId]);

  function togglePerm(permId: string) {
    setPermissions((prev) =>
      prev.includes(permId)
        ? prev.filter((p) => p !== permId)
        : [...prev, permId],
    );
  }

  function toggleModule(module: Module) {
    const modulePermIds = module.permissions.map((p) => p.id);
    const allChecked = modulePermIds.every((id) => permissions.includes(id));
    if (allChecked) {
      setPermissions((prev) => prev.filter((p) => !modulePermIds.includes(p)));
    } else {
      setPermissions((prev) => [...new Set([...prev, ...modulePermIds])]);
    }
  }

  function handleSave() {
    localStorage.setItem(LS_KEY(roleId), JSON.stringify(permissions));
    toast.success(`Permissions for ${meta.name} saved successfully.`);
  }

  function handleReset() {
    const def = DEFAULT_PERMISSIONS[roleId] ?? [];
    setPermissions(def);
    localStorage.removeItem(LS_KEY(roleId));
    toast.success(`Permissions reset to defaults for ${meta.name}.`);
  }

  const colorSet = ROLE_COLOR_MAP[meta.color] ?? ROLE_COLOR_MAP.sky;

  const visibleModules = useMemo(() => {
    if (roleId === "receptionist" || roleId === "pharmacist") {
      return MODULES;
    }
    return MODULES.filter((m) => m.id !== "pharmacy");
  }, [roleId]);

  return (
    <motion.div
      className="space-y-6 p-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      data-ocid="role-permissions.page"
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              navigate({ to: "/user-management", search: { tab: "roles" } })
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all text-sm"
            data-ocid="role-permissions.back_button"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="p-2.5 rounded-xl bg-primary/15 border border-primary/25">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-display font-bold text-foreground">
                Edit Role:
              </h1>
              <span
                className={`text-sm font-semibold px-3 py-1 rounded-full border ${
                  roleId === "main-admin"
                    ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                    : `${colorSet.bg} ${colorSet.text} ${colorSet.border}`
                }`}
              >
                {meta.name}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {meta.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="gap-2 border-white/20 text-muted-foreground hover:text-foreground"
            data-ocid="role-permissions.reset_button"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Default
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="gap-2 bg-primary hover:bg-primary/90"
            data-ocid="role-permissions.save_button"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Permissions grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visibleModules.map((module) => {
          const modulePermIds = module.permissions.map((p) => p.id);
          const checkedCount = modulePermIds.filter((id) =>
            permissions.includes(id),
          ).length;
          const allChecked = checkedCount === modulePermIds.length;
          const someChecked = checkedCount > 0 && !allChecked;

          return (
            <motion.div
              key={module.id}
              className="glass-card p-5 space-y-3"
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              data-ocid={`role-permissions.module.${module.id}`}
            >
              {/* Module header */}
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-primary">{module.icon}</span>
                  <h3 className="font-semibold text-foreground text-sm">
                    {module.label}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    ({checkedCount}/{modulePermIds.length})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => toggleModule(module)}
                  className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md transition-all border ${
                    allChecked
                      ? "bg-primary/20 text-primary border-primary/30"
                      : someChecked
                        ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                        : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10"
                  }`}
                  data-ocid={`role-permissions.select_all.${module.id}`}
                >
                  {allChecked ? (
                    <CheckSquare className="w-3.5 h-3.5" />
                  ) : (
                    <Square className="w-3.5 h-3.5" />
                  )}
                  Select All
                </button>
              </div>

              {/* Permission rows */}
              <div className="space-y-0.5">
                {module.permissions.map((perm, idx) => {
                  const isChecked = permissions.includes(perm.id);
                  return (
                    <label
                      key={perm.id}
                      className={`flex items-center justify-between py-2 px-1 rounded-md cursor-pointer transition-colors group ${
                        idx < module.permissions.length - 1
                          ? "border-b border-white/5"
                          : ""
                      } hover:bg-white/[0.03]`}
                      data-ocid={`role-permissions.perm.${perm.id}`}
                    >
                      <span
                        className={`text-sm transition-colors ${
                          isChecked
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {perm.label}
                      </span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => togglePerm(perm.id)}
                        className="w-5 h-5 rounded accent-primary cursor-pointer"
                      />
                    </label>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer save */}
      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          className="gap-2 border-white/20 text-muted-foreground hover:text-foreground"
          data-ocid="role-permissions.reset_bottom_button"
        >
          <RotateCcw className="w-4 h-4" />
          Reset to Default
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          className="gap-2 bg-primary hover:bg-primary/90"
          data-ocid="role-permissions.save_bottom_button"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </Button>
      </div>
    </motion.div>
  );
}
