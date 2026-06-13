import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLE_COLOR_MAP, ROLE_CONFIGS } from "@/utils/roleAccess";
import { createRoute, useNavigate } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronUp,
  Lock,
  Pencil,
  Plus,
  Shield,
  Trash2,
  UserCog,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Route as userManagementRoute } from "./user-management";

export const Route = createRoute({
  getParentRoute: () => userManagementRoute,
  path: "/",
  component: UserManagementPage,
});

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserRecord {
  id: string;
  prefix: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  isActive: boolean;
  allowLogin: boolean;
  username: string;
  password: string;
  role: string;
  accessLocations: string[];
  dob?: string;
  gender?: string;
  maritalStatus?: string;
  bloodGroup?: string;
  altMobile?: string;
  familyContact?: string;
  idProofName?: string;
  idProofNumber?: string;
  permanentAddress?: string;
  currentAddress?: string;
  accountHolderName?: string;
  accountNumber?: string;
  bankName?: string;
  bankCode?: string;
  branch?: string;
}

const DEMO_CLINICS = ["All Locations", "Clinic 1", "Clinic 2", "Clinic 3"];

const DEMO_USERS: UserRecord[] = [
  {
    id: "u0",
    prefix: "Dr",
    firstName: "Arjun",
    lastName: "Mehta",
    email: "admin@homeopath.com",
    mobile: "9876543210",
    isActive: true,
    allowLogin: true,
    username: "admin",
    password: "Admin@123",
    role: "Main Admin",
    accessLocations: ["All Locations"],
    dob: "1980-03-15",
    gender: "Male",
    maritalStatus: "Married",
    bloodGroup: "A+",
    permanentAddress: "12 Residency Road, Bangalore, Karnataka",
    currentAddress: "12 Residency Road, Bangalore, Karnataka",
    accountHolderName: "Dr Arjun Mehta",
    accountNumber: "9999888877",
    bankName: "HDFC Bank",
    bankCode: "HDFC0001234",
    branch: "Residency Road Branch",
  },
  {
    id: "u1",
    prefix: "Dr",
    firstName: "Priya",
    lastName: "Sharma",
    email: "priya.sharma@homeopath.com",
    mobile: "9876543210",
    isActive: true,
    allowLogin: true,
    username: "priya.sharma",
    password: "Doc@1234",
    role: "Doctor",
    accessLocations: ["Clinic 1"],
    dob: "1988-04-12",
    gender: "Female",
    maritalStatus: "Married",
    bloodGroup: "O+",
    permanentAddress: "42 MG Road, Bangalore, Karnataka",
    currentAddress: "42 MG Road, Bangalore, Karnataka",
    accountHolderName: "Dr Priya Sharma",
    accountNumber: "1234567890",
    bankName: "State Bank of India",
    bankCode: "SBIN0001234",
    branch: "MG Road Branch",
  },
  {
    id: "u2",
    prefix: "Mrs",
    firstName: "Anika",
    lastName: "Verma",
    email: "anika.verma@homeopath.com",
    mobile: "9123456780",
    isActive: true,
    allowLogin: true,
    username: "anika.verma",
    password: "Rec@1234",
    role: "Receptionist",
    accessLocations: ["Clinic 1", "Clinic 2"],
    dob: "1995-09-23",
    gender: "Female",
    maritalStatus: "Single",
    bloodGroup: "B+",
  },
  {
    id: "u3",
    prefix: "Mr",
    firstName: "Rahul",
    lastName: "Mehta",
    email: "rahul.mehta@homeopath.com",
    mobile: "9988776655",
    isActive: false,
    allowLogin: false,
    username: "rahul.mehta",
    password: "Pharm@123",
    role: "Pharmacist",
    accessLocations: ["All Locations"],
    dob: "1990-11-05",
    gender: "Male",
    idProofName: "Aadhaar",
    idProofNumber: "XXXX-XXXX-1234",
  },
];

const EMPTY_FORM: Omit<UserRecord, "id"> = {
  prefix: "",
  firstName: "",
  lastName: "",
  email: "",
  mobile: "",
  isActive: true,
  allowLogin: true,
  username: "",
  password: "",
  role: "",
  accessLocations: [],
  dob: "",
  gender: "",
  maritalStatus: "",
  bloodGroup: "",
  altMobile: "",
  familyContact: "",
  idProofName: "",
  idProofNumber: "",
  permanentAddress: "",
  currentAddress: "",
  accountHolderName: "",
  accountNumber: "",
  bankName: "",
  bankCode: "",
  branch: "",
};

// ─── Roles data ───────────────────────────────────────────────────────────────

const ROLES_TABLE = [
  {
    id: "main-admin",
    name: "Main Admin",
    description:
      "Full clinic oversight, staff management, analytics & settings",
    accessLevel: "Full Access",
    color: "violet",
    isMainAdmin: true,
  },
  {
    id: "doctor",
    name: "Doctor",
    description:
      "Consultations, prescriptions, patient case history & follow-ups",
    accessLevel: "Clinical Access",
    color: "sky",
    isMainAdmin: false,
  },
  {
    id: "receptionist",
    name: "Receptionist",
    description: "Appointment booking, patient registration & front-desk ops",
    accessLevel: "Front Desk Access",
    color: "emerald",
    isMainAdmin: false,
  },
  {
    id: "pharmacist",
    name: "Pharmacist",
    description:
      "Remedy dispensing, inventory management & prescription review",
    accessLevel: "Pharmacy Access",
    color: "amber",
    isMainAdmin: false,
  },
  {
    id: "admin",
    name: "Admin",
    description: "Administrative tasks, reporting & staff coordination",
    accessLevel: "Administrative Access",
    color: "sky",
    isMainAdmin: false,
  },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

function UserManagementPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"users" | "roles">("users");
  const [users, setUsers] = useState<UserRecord[]>(DEMO_USERS);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<UserRecord, "id">>(EMPTY_FORM);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [moreOpen, setMoreOpen] = useState(false);

  // Roles tab state
  const [roles, setRoles] = useState(ROLES_TABLE);
  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null);
  const [showAddRole, setShowAddRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");

  function openAddForm() {
    setForm(EMPTY_FORM);
    setConfirmPassword("");
    setErrors({});
    setEditingId(null);
    setMoreOpen(false);
    setShowForm(true);
  }

  function openEditForm(user: UserRecord) {
    const { id, ...rest } = user;
    void id;
    setForm({ ...rest });
    setConfirmPassword(rest.password);
    setErrors({});
    setEditingId(user.id);
    setMoreOpen(false);
    setShowForm(true);
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.prefix) e.prefix = "Required";
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!form.email.trim()) e.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Invalid email";
    if (!form.mobile.trim()) e.mobile = "Required";
    if (!form.username.trim()) e.username = "Required";
    if (!editingId && !form.password) e.password = "Required";
    if (!editingId && form.password !== confirmPassword)
      e.confirmPassword = "Passwords do not match";
    if (editingId && confirmPassword && form.password !== confirmPassword)
      e.confirmPassword = "Passwords do not match";
    if (!form.role) e.role = "Required";
    if (form.accessLocations.length === 0)
      e.accessLocations = "Select at least one location";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    if (editingId) {
      setUsers((prev) =>
        prev.map((u) => (u.id === editingId ? { id: editingId, ...form } : u)),
      );
      toast.success("User updated successfully.");
    } else {
      const newUser: UserRecord = { id: `u${Date.now()}`, ...form };
      setUsers((prev) => [...prev, newUser]);
      toast.success("User added successfully.");
    }
    setShowForm(false);
    setEditingId(null);
  }

  function handleDelete(id: string) {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setDeleteId(null);
    toast.success("User deleted.");
  }

  function handleDeleteRole(id: string) {
    setRoles((prev) => prev.filter((r) => r.id !== id));
    setDeleteRoleId(null);
    toast.success("Role deleted.");
  }

  function handleAddRole() {
    if (!newRoleName.trim()) return;
    const id = newRoleName.toLowerCase().replace(/\s+/g, "-");
    setRoles((prev) => [
      ...prev,
      {
        id,
        name: newRoleName.trim(),
        description: newRoleDesc.trim() || "Custom role",
        accessLevel: "Custom Access",
        color: "sky",
        isMainAdmin: false,
      },
    ]);
    setNewRoleName("");
    setNewRoleDesc("");
    setShowAddRole(false);
    toast.success(`Role "${newRoleName.trim()}" added.`);
  }

  function toggleLocation(loc: string) {
    setForm((prev) => {
      const has = prev.accessLocations.includes(loc);
      if (loc === "All Locations") {
        return { ...prev, accessLocations: has ? [] : ["All Locations"] };
      }
      const filtered = prev.accessLocations.filter(
        (l) => l !== "All Locations",
      );
      return {
        ...prev,
        accessLocations: has
          ? filtered.filter((l) => l !== loc)
          : [...filtered, loc],
      };
    });
  }

  return (
    <motion.div
      className="space-y-6 p-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      data-ocid="user-management.page"
    >
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/15 border border-primary/25">
            <UserCog className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              User Management
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage users, roles, and access permissions
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1 bg-white/5 rounded-xl p-1 w-fit border border-white/10"
        data-ocid="user-management.tabs"
      >
        {(["users", "roles"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              activeTab === tab
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            data-ocid={`user-management.tab.${tab}`}
          >
            {tab === "users" ? (
              <Users className="w-4 h-4" />
            ) : (
              <Shield className="w-4 h-4" />
            )}
            {tab === "users" ? "Users" : "Roles"}
          </button>
        ))}
      </div>

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="space-y-5" data-ocid="user-management.users_tab">
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={openAddForm}
              className="gap-2 bg-primary hover:bg-primary/90"
              data-ocid="user-management.add_user_button"
            >
              <Plus className="w-4 h-4" />
              Add User
            </Button>
          </div>

          {/* Add / Edit form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="glass-card p-6 space-y-6"
                data-ocid="user-management.user_form"
              >
                <h3 className="font-semibold text-foreground text-lg">
                  {editingId ? "Edit User" : "Add New User"}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FormField label="Prefix *" error={errors.prefix}>
                    <Select
                      value={form.prefix}
                      onValueChange={(v) =>
                        setForm((p) => ({ ...p, prefix: v }))
                      }
                    >
                      <SelectTrigger
                        className="glass border-white/10 bg-white/5"
                        data-ocid="user-management.prefix_select"
                      >
                        <SelectValue placeholder="Select prefix" />
                      </SelectTrigger>
                      <SelectContent className="glass border-white/10 bg-card/95">
                        {["Mr", "Mrs", "Ms", "Dr", "Prof"].map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField label="First Name *" error={errors.firstName}>
                    <Input
                      value={form.firstName}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, firstName: e.target.value }))
                      }
                      placeholder="First name"
                      className="glass border-white/10 bg-white/5"
                      data-ocid="user-management.first_name_input"
                    />
                  </FormField>

                  <FormField label="Last Name *" error={errors.lastName}>
                    <Input
                      value={form.lastName}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, lastName: e.target.value }))
                      }
                      placeholder="Last name"
                      className="glass border-white/10 bg-white/5"
                      data-ocid="user-management.last_name_input"
                    />
                  </FormField>

                  <FormField label="Email *" error={errors.email}>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, email: e.target.value }))
                      }
                      placeholder="user@clinic.com"
                      className="glass border-white/10 bg-white/5"
                      data-ocid="user-management.email_input"
                    />
                  </FormField>

                  <FormField label="Mobile Number *" error={errors.mobile}>
                    <Input
                      value={form.mobile}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, mobile: e.target.value }))
                      }
                      placeholder="9876543210"
                      className="glass border-white/10 bg-white/5"
                      data-ocid="user-management.mobile_input"
                    />
                  </FormField>

                  <FormField label="Username *" error={errors.username}>
                    <Input
                      value={form.username}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, username: e.target.value }))
                      }
                      placeholder="username"
                      className="glass border-white/10 bg-white/5"
                      data-ocid="user-management.username_input"
                    />
                  </FormField>

                  <FormField label="Password *" error={errors.password}>
                    <Input
                      type="password"
                      value={form.password}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, password: e.target.value }))
                      }
                      placeholder="••••••••"
                      className="glass border-white/10 bg-white/5"
                      data-ocid="user-management.password_input"
                    />
                  </FormField>

                  <FormField
                    label="Confirm Password *"
                    error={errors.confirmPassword}
                  >
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="glass border-white/10 bg-white/5"
                      data-ocid="user-management.confirm_password_input"
                    />
                  </FormField>

                  <FormField label="Role *" error={errors.role}>
                    <Select
                      value={form.role}
                      onValueChange={(v) => setForm((p) => ({ ...p, role: v }))}
                    >
                      <SelectTrigger
                        className="glass border-white/10 bg-white/5"
                        data-ocid="user-management.role_select"
                      >
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent className="glass border-white/10 bg-card/95">
                        {["Admin", "Pharmacist", "Doctor", "Receptionist"].map(
                          (r) => (
                            <SelectItem key={r} value={r}>
                              {r}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>

                <div className="flex flex-wrap gap-6">
                  <ToggleField
                    label="Is Active"
                    checked={form.isActive}
                    onChange={(v) => setForm((p) => ({ ...p, isActive: v }))}
                    ocid="user-management.is_active_toggle"
                  />
                  <ToggleField
                    label="Allow Login"
                    checked={form.allowLogin}
                    onChange={(v) => setForm((p) => ({ ...p, allowLogin: v }))}
                    ocid="user-management.allow_login_toggle"
                  />
                </div>

                <div>
                  <Label className="text-xs font-medium text-muted-foreground mb-2 block">
                    Access Location *
                  </Label>
                  {errors.accessLocations && (
                    <p className="text-xs text-red-400 mb-2">
                      {errors.accessLocations}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {DEMO_CLINICS.map((loc) => {
                      const selected = form.accessLocations.includes(loc);
                      return (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => toggleLocation(loc)}
                          className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                            selected
                              ? "bg-primary/20 text-primary border-primary/30"
                              : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/20"
                          }`}
                          data-ocid={`user-management.location.${loc.toLowerCase().replace(/\s+/g, "-")}`}
                        >
                          {loc}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={handleSave}
                    className="bg-primary hover:bg-primary/90 gap-2"
                    data-ocid="user-management.save_button"
                  >
                    Save
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSave}
                    className="border-primary/30 text-primary hover:bg-primary/10 gap-2"
                    data-ocid="user-management.confirm_add_button"
                  >
                    Confirm to Add User
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowForm(false)}
                    data-ocid="user-management.cancel_button"
                  >
                    Cancel
                  </Button>
                </div>

                <div className="border-t border-white/10 pt-4">
                  <button
                    type="button"
                    onClick={() => setMoreOpen((v) => !v)}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    data-ocid="user-management.more_details_toggle"
                  >
                    {moreOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                    {moreOpen ? "Hide" : "More"} Details
                    <span className="text-xs text-muted-foreground/60">
                      (optional — can be added later)
                    </span>
                  </button>

                  <AnimatePresence>
                    {moreOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <MoreDetailsFields form={form} setForm={setForm} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Users Table */}
          <div
            className="glass-card overflow-hidden"
            data-ocid="user-management.users_table"
          >
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-semibold text-foreground text-sm">
                All Users
              </h3>
              <span className="text-xs text-muted-foreground">
                {users.length} user{users.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    {[
                      "Username",
                      "Name",
                      "Role",
                      "Email",
                      "Status",
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
                  {users.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-12 text-muted-foreground text-sm"
                        data-ocid="user-management.empty_state"
                      >
                        <div className="flex flex-col items-center gap-3">
                          <Users className="w-10 h-10 opacity-20" />
                          <p>
                            No users yet. Click &quot;Add User&quot; to get
                            started.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    users.map((user, i) => (
                      <tr
                        key={user.id}
                        className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                        data-ocid={`user-management.user_row.${i + 1}`}
                      >
                        <td className="px-5 py-3 font-mono text-xs text-foreground">
                          {user.username}
                        </td>
                        <td className="px-5 py-3 font-medium text-foreground">
                          {user.prefix} {user.firstName} {user.lastName}
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                            {user.role}
                          </span>
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
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                navigate({
                                  to: "/user-management/$userId",
                                  params: { userId: user.id },
                                })
                              }
                              className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                              aria-label="View user profile"
                              data-ocid={`user-management.view_button.${i + 1}`}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-label="View user"
                              >
                                <title>View user</title>
                                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditForm(user)}
                              className="p-1.5 rounded-md text-muted-foreground hover:text-amber-400 hover:bg-amber-400/10 transition-colors"
                              aria-label="Edit user"
                              data-ocid={`user-management.edit_button.${i + 1}`}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteId(user.id)}
                              className="p-1.5 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors"
                              aria-label="Delete user"
                              data-ocid={`user-management.delete_button.${i + 1}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Roles Tab */}
      {activeTab === "roles" && (
        <div className="space-y-5" data-ocid="user-management.roles_tab">
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={() => setShowAddRole(true)}
              className="gap-2 bg-primary hover:bg-primary/90"
              data-ocid="user-management.add_role_button"
            >
              <Plus className="w-4 h-4" />
              Add Role
            </Button>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-foreground text-sm">
                  All Roles
                </h3>
              </div>
              <span className="text-xs text-muted-foreground">
                {roles.length} roles
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    {[
                      "Role",
                      "Description",
                      "Access Level",
                      "Users",
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
                  {roles.map((role, i) => {
                    const colorSet =
                      ROLE_COLOR_MAP[role.color] ?? ROLE_COLOR_MAP.sky;
                    const usersForRole =
                      role.id === "main-admin"
                        ? users.filter((u) => u.role === "Main Admin")
                        : users.filter(
                            (u) =>
                              u.role.toLowerCase() === role.name.toLowerCase(),
                          );
                    const isBuiltIn =
                      role.isMainAdmin ||
                      [
                        "admin",
                        "doctor",
                        "receptionist",
                        "pharmacist",
                      ].includes(role.id);

                    return (
                      <tr
                        key={role.id}
                        className={`border-b border-white/5 transition-colors ${
                          role.isMainAdmin
                            ? "bg-amber-500/5 hover:bg-amber-500/10"
                            : "hover:bg-white/[0.03]"
                        }`}
                        data-ocid={`user-management.role_row.${i + 1}`}
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2.5">
                            {role.isMainAdmin && (
                              <span className="text-amber-400 text-base">
                                ★
                              </span>
                            )}
                            <span
                              className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                                role.isMainAdmin
                                  ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                                  : `${colorSet.bg} ${colorSet.text} ${colorSet.border}`
                              }`}
                            >
                              {role.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-muted-foreground text-xs max-w-xs">
                          {role.description}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                              role.isMainAdmin
                                ? "bg-amber-500/10 text-amber-300"
                                : "bg-white/5 text-foreground border border-white/10"
                            }`}
                          >
                            {role.accessLevel}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-xs font-semibold text-foreground">
                            {role.id === "main-admin" ? 1 : usersForRole.length}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                navigate({
                                  to: "/user-management/roles/$roleId",
                                  params: { roleId: role.id },
                                })
                              }
                              className="p-1.5 rounded-md text-muted-foreground hover:text-amber-400 hover:bg-amber-400/10 transition-colors"
                              aria-label={`Edit ${role.name} permissions`}
                              data-ocid={`user-management.role_edit_button.${i + 1}`}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            {isBuiltIn ? (
                              <div
                                className="p-1.5 rounded-md text-muted-foreground/40 cursor-not-allowed"
                                title="Built-in role cannot be deleted"
                                aria-label="Built-in role cannot be deleted"
                              >
                                <Lock className="w-4 h-4" />
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setDeleteRoleId(role.id)}
                                className="p-1.5 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors"
                                aria-label={`Delete ${role.name}`}
                                data-ocid={`user-management.role_delete_button.${i + 1}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Role Dialog */}
      <Dialog open={showAddRole} onOpenChange={setShowAddRole}>
        <DialogContent
          className="glass border-white/10 bg-card/95 backdrop-blur-xl max-w-sm"
          data-ocid="user-management.add_role_dialog"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Shield className="w-5 h-5 text-primary" />
              Add New Role
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Role Name *
              </Label>
              <Input
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="e.g. Lab Technician"
                className="glass border-white/10 bg-white/5"
                data-ocid="user-management.new_role_name_input"
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Description
              </Label>
              <Input
                value={newRoleDesc}
                onChange={(e) => setNewRoleDesc(e.target.value)}
                placeholder="Brief description of role responsibilities"
                className="glass border-white/10 bg-white/5"
                data-ocid="user-management.new_role_desc_input"
              />
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                onClick={handleAddRole}
                className="flex-1 bg-primary hover:bg-primary/90"
                data-ocid="user-management.confirm_add_role_button"
              >
                Add Role
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddRole(false)}
                className="flex-1 border-white/10"
                data-ocid="user-management.cancel_add_role_button"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Role Dialog */}
      <Dialog open={!!deleteRoleId} onOpenChange={() => setDeleteRoleId(null)}>
        <DialogContent
          className="glass border-white/10 bg-card/95 backdrop-blur-xl max-w-sm"
          data-ocid="user-management.delete_role_dialog"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <Trash2 className="w-5 h-5" />
              Delete Role
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this role? This action cannot be
            undone.
          </p>
          <div className="flex gap-3 mt-2">
            <Button
              type="button"
              variant="destructive"
              onClick={() => deleteRoleId && handleDeleteRole(deleteRoleId)}
              className="flex-1"
              data-ocid="user-management.confirm_delete_role_button"
            >
              Delete
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteRoleId(null)}
              className="flex-1 border-white/10"
              data-ocid="user-management.cancel_delete_role_button"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirm Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent
          className="glass border-white/10 bg-card/95 backdrop-blur-xl max-w-sm"
          data-ocid="user-management.delete_dialog"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <Trash2 className="w-5 h-5" />
              Delete User
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this user? This action cannot be
            undone.
          </p>
          <div className="flex gap-3 mt-2">
            <Button
              type="button"
              variant="destructive"
              onClick={() => deleteId && handleDelete(deleteId)}
              className="flex-1"
              data-ocid="user-management.confirm_delete_button"
            >
              Delete
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteId(null)}
              className="flex-1 border-white/10"
              data-ocid="user-management.cancel_delete_button"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

// ─── More Details Fields ──────────────────────────────────────────────────────

function MoreDetailsFields({
  form,
  setForm,
}: {
  form: Omit<UserRecord, "id">;
  setForm: React.Dispatch<React.SetStateAction<Omit<UserRecord, "id">>>;
}) {
  return (
    <div className="mt-4 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <FormField label="Date of Birth">
          <Input
            type="date"
            value={form.dob ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, dob: e.target.value }))}
            className="glass border-white/10 bg-white/5"
            data-ocid="user-management.dob_input"
          />
        </FormField>

        <FormField label="Gender">
          <Select
            value={form.gender ?? ""}
            onValueChange={(v) => setForm((p) => ({ ...p, gender: v }))}
          >
            <SelectTrigger
              className="glass border-white/10 bg-white/5"
              data-ocid="user-management.gender_select"
            >
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent className="glass border-white/10 bg-card/95">
              {["Male", "Female", "Other"].map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Marital Status">
          <Select
            value={form.maritalStatus ?? ""}
            onValueChange={(v) => setForm((p) => ({ ...p, maritalStatus: v }))}
          >
            <SelectTrigger
              className="glass border-white/10 bg-white/5"
              data-ocid="user-management.marital_status_select"
            >
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent className="glass border-white/10 bg-card/95">
              {["Single", "Married", "Divorced", "Widowed"].map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Blood Group">
          <Select
            value={form.bloodGroup ?? ""}
            onValueChange={(v) => setForm((p) => ({ ...p, bloodGroup: v }))}
          >
            <SelectTrigger
              className="glass border-white/10 bg-white/5"
              data-ocid="user-management.blood_group_select"
            >
              <SelectValue placeholder="Select blood group" />
            </SelectTrigger>
            <SelectContent className="glass border-white/10 bg-card/95">
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                <SelectItem key={bg} value={bg}>
                  {bg}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Alternative Mobile">
          <Input
            value={form.altMobile ?? ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, altMobile: e.target.value }))
            }
            placeholder="Alternative number"
            className="glass border-white/10 bg-white/5"
            data-ocid="user-management.alt_mobile_input"
          />
        </FormField>

        <FormField label="Family Contact Number">
          <Input
            value={form.familyContact ?? ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, familyContact: e.target.value }))
            }
            placeholder="Family contact"
            className="glass border-white/10 bg-white/5"
            data-ocid="user-management.family_contact_input"
          />
        </FormField>

        <FormField label="ID Proof Name">
          <Input
            value={form.idProofName ?? ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, idProofName: e.target.value }))
            }
            placeholder="Aadhaar / Passport etc."
            className="glass border-white/10 bg-white/5"
            data-ocid="user-management.id_proof_name_input"
          />
        </FormField>

        <FormField label="ID Proof Number">
          <Input
            value={form.idProofNumber ?? ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, idProofNumber: e.target.value }))
            }
            placeholder="ID number"
            className="glass border-white/10 bg-white/5"
            data-ocid="user-management.id_proof_number_input"
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Permanent Address">
          <textarea
            value={form.permanentAddress ?? ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, permanentAddress: e.target.value }))
            }
            placeholder="Permanent address"
            rows={3}
            className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            data-ocid="user-management.permanent_address_input"
          />
        </FormField>

        <FormField label="Current Address">
          <textarea
            value={form.currentAddress ?? ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, currentAddress: e.target.value }))
            }
            placeholder="Current address"
            rows={3}
            className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            data-ocid="user-management.current_address_input"
          />
        </FormField>
      </div>

      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
          Bank Details
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField label="Account Holder's Name">
            <Input
              value={form.accountHolderName ?? ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, accountHolderName: e.target.value }))
              }
              placeholder="Account holder name"
              className="glass border-white/10 bg-white/5"
              data-ocid="user-management.account_holder_name_input"
            />
          </FormField>

          <FormField label="Account Number">
            <Input
              value={form.accountNumber ?? ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, accountNumber: e.target.value }))
              }
              placeholder="Account number"
              className="glass border-white/10 bg-white/5"
              data-ocid="user-management.account_number_input"
            />
          </FormField>

          <FormField label="Bank Name">
            <Input
              value={form.bankName ?? ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, bankName: e.target.value }))
              }
              placeholder="Bank name"
              className="glass border-white/10 bg-white/5"
              data-ocid="user-management.bank_name_input"
            />
          </FormField>

          <FormField label="Bank Identifier Code (IFSC/SWIFT)">
            <Input
              value={form.bankCode ?? ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, bankCode: e.target.value }))
              }
              placeholder="IFSC / SWIFT code"
              className="glass border-white/10 bg-white/5"
              data-ocid="user-management.bank_code_input"
            />
          </FormField>

          <FormField label="Branch">
            <Input
              value={form.branch ?? ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, branch: e.target.value }))
              }
              placeholder="Branch name"
              className="glass border-white/10 bg-white/5"
              data-ocid="user-management.branch_input"
            />
          </FormField>
        </div>
      </div>
    </div>
  );
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
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

function ToggleField({
  label,
  checked,
  onChange,
  ocid,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  ocid: string;
}) {
  return (
    <div className="flex items-center gap-2.5 cursor-pointer select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-all border ${
          checked
            ? "bg-primary/80 border-primary"
            : "bg-white/10 border-white/20"
        }`}
        data-ocid={ocid}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
            checked ? "left-[calc(100%-1.375rem)]" : "left-0.5"
          }`}
        />
      </button>
      <span className="text-sm text-foreground">{label}</span>
    </div>
  );
}
