import { createRoute, useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Banknote,
  Building2,
  Calendar,
  CheckCircle2,
  CreditCard,
  Droplets,
  Heart,
  Home,
  IdCard,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  UserCog,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import { Route as userManagementRoute } from "./user-management";
import type { UserRecord } from "./user-management.index";

export const Route = createRoute({
  getParentRoute: () => userManagementRoute,
  path: "$userId",
  component: UserProfilePage,
});

// ─── Demo data (same source as index) ────────────────────────────────────────

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
    altMobile: "9876540000",
    familyContact: "9876541111",
    idProofName: "Aadhaar",
    idProofNumber: "XXXX-XXXX-0000",
    permanentAddress: "12 Residency Road, Bangalore, Karnataka 560001",
    currentAddress: "12 Residency Road, Bangalore, Karnataka 560001",
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
    altMobile: "9876540000",
    familyContact: "9876541111",
    idProofName: "Aadhaar",
    idProofNumber: "XXXX-XXXX-5678",
    permanentAddress: "42 MG Road, Bangalore, Karnataka 560001",
    currentAddress: "42 MG Road, Bangalore, Karnataka 560001",
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

// ─── Role color helper ────────────────────────────────────────────────────────

function getRoleBadgeStyle(role: string) {
  const map: Record<string, string> = {
    Doctor: "bg-sky-500/15 text-sky-300 border-sky-400/40",
    Receptionist: "bg-emerald-500/15 text-emerald-300 border-emerald-400/40",
    Pharmacist: "bg-amber-500/15 text-amber-300 border-amber-400/40",
    Admin: "bg-violet-500/15 text-violet-300 border-violet-400/40",
    Cashier: "bg-emerald-500/15 text-emerald-300 border-emerald-400/40",
  };
  return map[role] ?? "bg-primary/15 text-primary border-primary/40";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InfoCard({
  title,
  icon,
  children,
  accent,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card p-5 space-y-4 ${
        accent ? "border-amber-500/20 bg-amber-500/5" : ""
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={`p-2 rounded-lg ${
            accent
              ? "bg-amber-500/15 text-amber-400"
              : "bg-primary/15 text-primary"
          }`}
        >
          {icon}
        </div>
        <h3 className="font-semibold text-foreground text-sm">{title}</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>
    </motion.div>
  );
}

function DetailField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | undefined | null;
}) {
  const display = value?.trim() ? value : "—";
  const isEmpty = display === "—";
  return (
    <div className="flex flex-col gap-1 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-colors">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <span className="w-3.5 h-3.5 shrink-0 opacity-70">{icon}</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p
        className={`text-sm font-medium truncate ${
          isEmpty ? "text-muted-foreground/50 italic" : "text-foreground"
        }`}
      >
        {display}
      </p>
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium border ${
        active
          ? "bg-green-500/15 text-green-400 border-green-500/30"
          : "bg-red-500/15 text-red-400 border-red-500/30"
      }`}
    >
      {active ? (
        <CheckCircle2 className="w-3 h-3" />
      ) : (
        <XCircle className="w-3 h-3" />
      )}
      {active ? "Active" : "Inactive"}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function UserProfilePage() {
  const { userId } = useParams({ from: "/user-management/$userId" });
  const navigate = useNavigate();

  const user = useMemo(
    () => DEMO_USERS.find((u) => u.id === userId) ?? null,
    [userId],
  );

  const initials = user
    ? `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase()
    : "?";

  const fullName = user
    ? `${user.prefix} ${user.firstName} ${user.lastName}`
    : "";

  if (!user) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-6"
        data-ocid="user-profile.not_found"
      >
        <div className="p-5 rounded-2xl bg-muted/30 border border-white/10">
          <UserCog className="w-12 h-12 text-muted-foreground opacity-40" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-display font-bold text-foreground mb-2">
            User Not Found
          </h2>
          <p className="text-sm text-muted-foreground">
            The employee profile you&apos;re looking for doesn&apos;t exist or
            has been removed.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate({ to: "/user-management" })}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/15 border border-primary/30 text-primary text-sm font-medium hover:bg-primary/25 transition-colors"
          data-ocid="user-profile.back_button"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to User Management
        </button>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6 p-6 max-w-5xl mx-auto"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      data-ocid="user-profile.page"
    >
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate({ to: "/user-management" })}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        data-ocid="user-profile.back_button"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to User Management
      </button>

      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass-card p-6"
        data-ocid="user-profile.header"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-primary/20 border-2 border-primary/40 flex items-center justify-center text-2xl font-bold text-primary shadow-lg shadow-primary/20">
              {initials}
            </div>
            <div
              className={`absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full border-2 border-card flex items-center justify-center ${
                user.isActive ? "bg-green-500" : "bg-red-500"
              }`}
            />
          </div>

          {/* Name + badges */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1.5">
              <h1 className="text-2xl font-display font-bold text-foreground">
                {fullName}
              </h1>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium border ${getRoleBadgeStyle(
                  user.role,
                )}`}
              >
                {user.role}
              </span>
              <StatusBadge active={user.isActive} />
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                {user.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                {user.mobile}
              </span>
              <span className="flex items-center gap-1.5">
                <UserCog className="w-3.5 h-3.5" />@{user.username}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Account & Personal Details — side by side on md+ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Account Details */}
        <InfoCard
          title="Account Details"
          icon={<ShieldCheck className="w-4 h-4" />}
        >
          <DetailField
            icon={<User className="w-3.5 h-3.5" />}
            label="Username"
            value={user.username}
          />
          <DetailField
            icon={<IdCard className="w-3.5 h-3.5" />}
            label="Role"
            value={user.role}
          />
          <DetailField
            icon={<CheckCircle2 className="w-3.5 h-3.5" />}
            label="Active Status"
            value={user.isActive ? "Active" : "Inactive"}
          />
          <DetailField
            icon={<Lock className="w-3.5 h-3.5" />}
            label="Allow Login"
            value={user.allowLogin ? "Yes" : "No"}
          />
          <div className="sm:col-span-2">
            <DetailField
              icon={<MapPin className="w-3.5 h-3.5" />}
              label="Access Locations"
              value={user.accessLocations.join(", ") || "—"}
            />
          </div>
        </InfoCard>

        {/* Personal Details */}
        <InfoCard title="Personal Details" icon={<User className="w-4 h-4" />}>
          <DetailField
            icon={<Calendar className="w-3.5 h-3.5" />}
            label="Date of Birth"
            value={user.dob}
          />
          <DetailField
            icon={<User className="w-3.5 h-3.5" />}
            label="Gender"
            value={user.gender}
          />
          <DetailField
            icon={<Heart className="w-3.5 h-3.5" />}
            label="Marital Status"
            value={user.maritalStatus}
          />
          <DetailField
            icon={<Droplets className="w-3.5 h-3.5" />}
            label="Blood Group"
            value={user.bloodGroup}
          />
          <DetailField
            icon={<Phone className="w-3.5 h-3.5" />}
            label="Alternative Mobile"
            value={user.altMobile}
          />
          <DetailField
            icon={<Phone className="w-3.5 h-3.5" />}
            label="Family Contact"
            value={user.familyContact}
          />
          <DetailField
            icon={<IdCard className="w-3.5 h-3.5" />}
            label="ID Proof Name"
            value={user.idProofName}
          />
          <DetailField
            icon={<IdCard className="w-3.5 h-3.5" />}
            label="ID Proof Number"
            value={user.idProofNumber}
          />
        </InfoCard>
      </div>

      {/* Address Details */}
      <InfoCard title="Address Details" icon={<Home className="w-4 h-4" />}>
        <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
              <MapPin className="w-3.5 h-3.5" />
              <span className="text-[10px] font-semibold uppercase tracking-wider">
                Permanent Address
              </span>
            </div>
            <p
              className={`text-sm leading-relaxed ${
                user.permanentAddress
                  ? "text-foreground"
                  : "text-muted-foreground/50 italic"
              }`}
            >
              {user.permanentAddress || "—"}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
              <Building2 className="w-3.5 h-3.5" />
              <span className="text-[10px] font-semibold uppercase tracking-wider">
                Current Address
              </span>
            </div>
            <p
              className={`text-sm leading-relaxed ${
                user.currentAddress
                  ? "text-foreground"
                  : "text-muted-foreground/50 italic"
              }`}
            >
              {user.currentAddress || "—"}
            </p>
          </div>
        </div>
      </InfoCard>

      {/* Bank Details */}
      <InfoCard
        title="Bank Details"
        icon={<Banknote className="w-4 h-4" />}
        accent
      >
        <DetailField
          icon={<User className="w-3.5 h-3.5" />}
          label="Account Holder"
          value={user.accountHolderName}
        />
        <DetailField
          icon={<CreditCard className="w-3.5 h-3.5" />}
          label="Account Number"
          value={user.accountNumber}
        />
        <DetailField
          icon={<Building2 className="w-3.5 h-3.5" />}
          label="Bank Name"
          value={user.bankName}
        />
        <DetailField
          icon={<IdCard className="w-3.5 h-3.5" />}
          label="IFSC / SWIFT Code"
          value={user.bankCode}
        />
        <DetailField
          icon={<MapPin className="w-3.5 h-3.5" />}
          label="Branch"
          value={user.branch}
        />
      </InfoCard>
    </motion.div>
  );
}
