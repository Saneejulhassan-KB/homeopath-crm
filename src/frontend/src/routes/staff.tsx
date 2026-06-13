import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/store";
import type { RoleId } from "@/types";
import {
  createUser,
  getAllUsers,
  getClinicUsers,
  getClinics,
  getCurrentUser,
  getUserClinics,
  toggleUserActive,
  updateUserPermissions,
} from "@/utils/auth";
import type { AuthUser, Clinic } from "@/utils/auth";
import { createRoute } from "@tanstack/react-router";
import {
  CheckCircle2,
  KeyRound,
  Plus,
  ShieldCheck,
  UserCog,
  Users,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Route as rootRoute } from "./__root";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/staff",
  component: StaffPage,
});

const ROLE_OPTIONS: { id: RoleId; label: string }[] = [
  { id: "doctor", label: "Doctor" },
  { id: "receptionist", label: "Receptionist" },
  { id: "pharmacist", label: "Pharmacist" },
];

const TABS = [
  { id: "all", label: "All Staff", icon: Users },
  { id: "create", label: "Create Account", icon: Plus },
  { id: "permissions", label: "Permissions", icon: ShieldCheck },
] as const;
type TabId = (typeof TABS)[number]["id"];

function StaffPage() {
  const { currentRole } = useAppStore();
  const currentUser = getCurrentUser();
  const [tab, setTab] = useState<TabId>("all");
  const [staffList, setStaffList] = useState<AuthUser[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<string>("");

  // Create form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "" as RoleId | "",
    password: "",
    clinicId: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [creating, setCreating] = useState(false);

  // Credentials modal
  const [credsModal, setCredsModal] = useState<{
    email: string;
    password: string;
  } | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) return;
    const userClinics = getUserClinics(user.id);
    setClinics(userClinics);
    const firstClinic = userClinics[0]?.id ?? "";
    setSelectedClinic(firstClinic);
    setForm((f) => ({ ...f, clinicId: firstClinic }));
  }, []);

  useEffect(() => {
    if (selectedClinic) {
      setStaffList(getClinicUsers(selectedClinic));
    }
  }, [selectedClinic]);

  function refreshStaff() {
    if (selectedClinic) setStaffList(getClinicUsers(selectedClinic));
  }

  function handleToggleActive(userId: string) {
    toggleUserActive(userId);
    refreshStaff();
    toast.success("User status updated.");
  }

  function handleTogglePermission(userId: string, current: boolean) {
    updateUserPermissions(userId, { canCreateAccounts: !current });
    refreshStaff();
    toast.success(`Account creation ${!current ? "granted" : "revoked"}.`);
  }

  function validateCreateForm(): boolean {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Invalid email";
    if (!form.role) e.role = "Role is required";
    if (!form.password || form.password.length < 6)
      e.password = "Min. 6 characters";
    if (!form.clinicId) e.clinicId = "Select a clinic";
    setFormErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleCreateUser() {
    if (!validateCreateForm()) return;
    setCreating(true);
    await new Promise((r) => setTimeout(r, 500));
    const result = createUser({
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role as RoleId,
      clinicId: form.clinicId,
    });
    setCreating(false);
    if (!result.success) {
      toast.error(result.error ?? "Failed to create account");
      return;
    }
    toast.success("Staff account created!");
    setCredsModal({ email: form.email, password: form.password });
    setForm({
      name: "",
      email: "",
      role: "",
      password: "",
      clinicId: selectedClinic,
    });
    setFormErrors({});
    refreshStaff();
    setTab("all");
  }

  if (currentRole !== "main-admin") {
    return (
      <div
        className="flex flex-col items-center justify-center h-64 text-muted-foreground"
        data-ocid="staff.unauthorized"
      >
        <ShieldCheck className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-sm">Admin access required to manage staff.</p>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      data-ocid="staff.page"
    >
      <PageHeader
        title="Staff Management"
        description="Create and manage staff accounts, roles, and permissions."
        breadcrumb={[{ label: "Staff Management" }]}
      />

      {/* Clinic selector (if multi-clinic) */}
      {clinics.length > 1 && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Clinic:</span>
          <div className="flex gap-2">
            {clinics.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedClinic(c.id)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                  selectedClinic === c.id
                    ? "bg-primary/20 text-primary border-primary/30"
                    : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/20"
                }`}
                data-ocid={`staff.clinic_tab.${c.id}`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div
        className="flex gap-1 bg-white/5 rounded-xl p-1 w-fit border border-white/10"
        data-ocid="staff.tabs"
      >
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === id
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            data-ocid={`staff.tab.${id}`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "all" && (
        <div className="glass-card overflow-hidden" data-ocid="staff.all_tab">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {[
                    "Name",
                    "Role",
                    "Email",
                    "Status",
                    "Can Create",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left text-xs font-semibold text-muted-foreground px-5 py-3"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {staffList.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-10 text-muted-foreground text-sm"
                      data-ocid="staff.empty_state"
                    >
                      No staff found in this clinic.
                    </td>
                  </tr>
                ) : (
                  staffList.map((user, i) => (
                    <tr
                      key={user.id}
                      className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                      data-ocid={`staff.item.${i + 1}`}
                    >
                      <td className="px-5 py-3 font-medium text-foreground">
                        {user.name}
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant="outline" className="capitalize text-xs">
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground text-xs">
                        {user.email}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            user.isActive
                              ? "bg-green-500/15 text-green-400"
                              : "bg-red-500/15 text-red-400"
                          }`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            user.permissions.canCreateAccounts
                              ? "bg-primary/15 text-primary"
                              : "bg-white/5 text-muted-foreground"
                          }`}
                        >
                          {user.permissions.canCreateAccounts ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {user.id !== currentUser?.id && (
                          <button
                            type="button"
                            onClick={() => handleToggleActive(user.id)}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                            data-ocid={`staff.toggle_active.${i + 1}`}
                          >
                            {user.isActive ? "Deactivate" : "Activate"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "create" && (
        <div className="glass-card p-6 max-w-xl" data-ocid="staff.create_tab">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/15 border border-primary/20">
              <UserCog className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                Create Staff Account
              </h3>
              <p className="text-xs text-muted-foreground">
                New staff will receive login credentials.
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <FormField label="Full Name" error={formErrors.name}>
              <Input
                placeholder="Dr. Priya Sharma"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                className="glass border-white/10 bg-white/5"
                data-ocid="staff.create.name_input"
              />
            </FormField>
            <FormField label="Email" error={formErrors.email}>
              <Input
                type="email"
                placeholder="staff@clinic.com"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                className="glass border-white/10 bg-white/5"
                data-ocid="staff.create.email_input"
              />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Role" error={formErrors.role}>
                <Select
                  value={form.role}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, role: v as RoleId }))
                  }
                >
                  <SelectTrigger
                    className="glass border-white/10 bg-white/5"
                    data-ocid="staff.create.role_select"
                  >
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="glass border-white/10 bg-card/95">
                    {ROLE_OPTIONS.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Temporary Password" error={formErrors.password}>
                <Input
                  type="text"
                  placeholder="Temp@123"
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                  className="glass border-white/10 bg-white/5"
                  data-ocid="staff.create.password_input"
                />
              </FormField>
            </div>
            {clinics.length > 1 && (
              <FormField label="Assign to Clinic" error={formErrors.clinicId}>
                <Select
                  value={form.clinicId}
                  onValueChange={(v) => setForm((f) => ({ ...f, clinicId: v }))}
                >
                  <SelectTrigger
                    className="glass border-white/10 bg-white/5"
                    data-ocid="staff.create.clinic_select"
                  >
                    <SelectValue placeholder="Select clinic" />
                  </SelectTrigger>
                  <SelectContent className="glass border-white/10 bg-card/95">
                    {clinics.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            )}
          </div>
          <Button
            type="button"
            onClick={handleCreateUser}
            disabled={creating}
            className="mt-6 bg-primary hover:bg-primary/90 text-white gap-2"
            data-ocid="staff.create.submit_button"
          >
            <Plus className="w-4 h-4" />
            {creating ? "Creating..." : "Create Account"}
          </Button>
        </div>
      )}

      {tab === "permissions" && (
        <div
          className="glass-card overflow-hidden"
          data-ocid="staff.permissions_tab"
        >
          <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium text-sm">
              Account Creation Permissions
            </span>
          </div>
          <div className="divide-y divide-white/5">
            {staffList
              .filter((u) => u.role !== "main-admin")
              .map((user, i) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between px-5 py-3"
                  data-ocid={`staff.perm.item.${i + 1}`}
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {user.name}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {user.role}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleTogglePermission(
                        user.id,
                        user.permissions.canCreateAccounts,
                      )
                    }
                    className={`relative w-11 h-6 rounded-full transition-all border ${
                      user.permissions.canCreateAccounts
                        ? "bg-primary/80 border-primary"
                        : "bg-white/10 border-white/20"
                    }`}
                    aria-label={`Toggle create permission for ${user.name}`}
                    data-ocid={`staff.perm.toggle.${i + 1}`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
                        user.permissions.canCreateAccounts
                          ? "left-[calc(100%-1.375rem)]"
                          : "left-0.5"
                      }`}
                    />
                  </button>
                </div>
              ))}
            {staffList.filter((u) => u.role !== "main-admin").length === 0 && (
              <div
                className="px-5 py-8 text-center text-sm text-muted-foreground"
                data-ocid="staff.perm.empty_state"
              >
                No staff members to manage.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Credentials Modal */}
      <Dialog open={!!credsModal} onOpenChange={() => setCredsModal(null)}>
        <DialogContent
          className="glass bg-card/95 backdrop-blur-xl"
          data-ocid="staff.creds.dialog"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              Account Created
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Share these credentials with the new staff member:
            </p>
            <div className="bg-white/5 rounded-lg p-4 space-y-2 border border-white/10">
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Email</span>
                <span className="text-xs font-mono text-foreground">
                  {credsModal?.email}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Password</span>
                <span className="text-xs font-mono text-foreground">
                  {credsModal?.password}
                </span>
              </div>
            </div>
            <p className="text-xs text-amber-400">
              ⚠️ Ask staff to change their password after first login.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => setCredsModal(null)}
            className="w-full mt-2"
            data-ocid="staff.creds.close_button"
          >
            Done
          </Button>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

function FormField({
  label,
  error,
  children,
}: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
        {label}
      </Label>
      {children}
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}
