import type { RoleId } from "@/types";

// ─── Storage keys ───────────────────────────────────────────────────────────
export const KEYS = {
  USERS: "HCRM_USERS",
  CLINICS: "HCRM_CLINICS",
  CURRENT_USER: "HCRM_CURRENT_USER",
  SESSIONS: "HCRM_SESSIONS",
} as const;

// ─── Types ───────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  email: string;
  passwordHash: string;
  role: RoleId;
  name: string;
  phone: string;
  clinicIds: string[];
  permissions: { canCreateAccounts: boolean };
  createdAt: string;
  isActive: boolean;
}

export interface Clinic {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  email: string;
  registrationNumber: string;
  createdAt: string;
  ownerId: string;
}

export interface RegisterAdminInput {
  name: string;
  email: string;
  password: string;
  phone: string;
  clinicName: string;
  clinicRegistration: string;
  clinicAddress: string;
  clinicCity: string;
  clinicState: string;
  clinicCountry: string;
  clinicPhone: string;
  clinicEmail: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function hashPassword(password: string): string {
  return btoa(`${password}_hcrm_salt`);
}

function checkPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

function uuid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Read/write helpers ───────────────────────────────────────────────────────
function getUsers(): AuthUser[] {
  try {
    return JSON.parse(localStorage.getItem(KEYS.USERS) ?? "[]") as AuthUser[];
  } catch {
    return [];
  }
}

function setUsers(users: AuthUser[]): void {
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
}

export function getClinics(): Clinic[] {
  try {
    return JSON.parse(localStorage.getItem(KEYS.CLINICS) ?? "[]") as Clinic[];
  } catch {
    return [];
  }
}

function setClinics(clinics: Clinic[]): void {
  localStorage.setItem(KEYS.CLINICS, JSON.stringify(clinics));
}

// ─── Seed data ────────────────────────────────────────────────────────────────
export function seedDemoDataIfEmpty(): void {
  const existing = getUsers();
  if (existing.length > 0) return;

  const clinicId = uuid();
  const adminId = uuid();

  const demoClinic: Clinic = {
    id: clinicId,
    name: "HomeoPath Wellness Clinic",
    address: "42 Healing Grove, MG Road",
    city: "Bangalore",
    state: "Karnataka",
    country: "India",
    phone: "+91-80-4567-8901",
    email: "admin@homeopath.com",
    registrationNumber: "HCRM-2024-001",
    createdAt: new Date().toISOString(),
    ownerId: adminId,
  };

  const demoAdmin: AuthUser = {
    id: adminId,
    email: "admin@homeopath.com",
    passwordHash: hashPassword("Admin@123"),
    role: "main-admin",
    name: "Dr. Arjun Mehta",
    phone: "+91-98765-43210",
    clinicIds: [clinicId],
    permissions: { canCreateAccounts: true },
    createdAt: new Date().toISOString(),
    isActive: true,
  };

  setClinics([demoClinic]);
  setUsers([demoAdmin]);
}

// ─── Auth operations ─────────────────────────────────────────────────────────
export function registerAdmin(data: RegisterAdminInput): {
  success: boolean;
  error?: string;
  user?: AuthUser;
} {
  const users = getUsers();
  if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
    return { success: false, error: "Email already registered." };
  }

  const clinicId = uuid();
  const adminId = uuid();

  const clinic: Clinic = {
    id: clinicId,
    name: data.clinicName,
    address: data.clinicAddress,
    city: data.clinicCity,
    state: data.clinicState,
    country: data.clinicCountry,
    phone: data.clinicPhone,
    email: data.clinicEmail,
    registrationNumber: data.clinicRegistration,
    createdAt: new Date().toISOString(),
    ownerId: adminId,
  };

  const user: AuthUser = {
    id: adminId,
    email: data.email,
    passwordHash: hashPassword(data.password),
    role: "main-admin",
    name: data.name,
    phone: data.phone,
    clinicIds: [clinicId],
    permissions: { canCreateAccounts: true },
    createdAt: new Date().toISOString(),
    isActive: true,
  };

  const clinics = getClinics();
  setClinics([...clinics, clinic]);
  setUsers([...users, user]);

  return { success: true, user };
}

export function loginUser(
  email: string,
  password: string,
): { success: boolean; error?: string; user?: AuthUser } {
  seedDemoDataIfEmpty();
  const users = getUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user)
    return { success: false, error: "No account found with this email." };
  if (!user.isActive)
    return { success: false, error: "This account has been deactivated." };
  if (!checkPassword(password, user.passwordHash))
    return { success: false, error: "Incorrect password." };

  localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
  return { success: true, user };
}

export function logoutUser(): void {
  localStorage.removeItem(KEYS.CURRENT_USER);
  localStorage.removeItem("hcrm_role");
}

export function getCurrentUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(KEYS.CURRENT_USER);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function getAllUsers(): AuthUser[] {
  return getUsers();
}

export function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: RoleId;
  clinicId: string;
  phone?: string;
}): { success: boolean; error?: string; user?: AuthUser } {
  const users = getUsers();
  if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
    return { success: false, error: "Email already in use." };
  }
  const user: AuthUser = {
    id: uuid(),
    email: data.email,
    passwordHash: hashPassword(data.password),
    role: data.role,
    name: data.name,
    phone: data.phone ?? "",
    clinicIds: [data.clinicId],
    permissions: { canCreateAccounts: false },
    createdAt: new Date().toISOString(),
    isActive: true,
  };
  setUsers([...users, user]);
  return { success: true, user };
}

export function updateUserPermissions(
  userId: string,
  permissions: Partial<AuthUser["permissions"]>,
): void {
  const users = getUsers();
  setUsers(
    users.map((u) =>
      u.id === userId
        ? { ...u, permissions: { ...u.permissions, ...permissions } }
        : u,
    ),
  );
}

export function toggleUserActive(userId: string): void {
  const users = getUsers();
  setUsers(
    users.map((u) => (u.id === userId ? { ...u, isActive: !u.isActive } : u)),
  );
}

export function getClinicUsers(clinicId: string): AuthUser[] {
  return getUsers().filter((u) => u.clinicIds.includes(clinicId));
}

export function addClinic(data: {
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  email: string;
  registrationNumber: string;
  ownerId: string;
}): Clinic {
  const clinic: Clinic = {
    id: uuid(),
    ...data,
    createdAt: new Date().toISOString(),
  };
  const clinics = getClinics();
  setClinics([...clinics, clinic]);

  // Associate clinic with owner
  const users = getUsers();
  setUsers(
    users.map((u) =>
      u.id === data.ownerId
        ? { ...u, clinicIds: [...u.clinicIds, clinic.id] }
        : u,
    ),
  );
  return clinic;
}

export function getClinicById(clinicId: string): Clinic | undefined {
  return getClinics().find((c) => c.id === clinicId);
}

export function getUserClinics(userId: string): Clinic[] {
  const users = getUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) return [];
  const all = getClinics();
  return all.filter((c) => user.clinicIds.includes(c.id));
}

export function refreshCurrentUser(): AuthUser | null {
  const stored = getCurrentUser();
  if (!stored) return null;
  const users = getUsers();
  const fresh = users.find((u) => u.id === stored.id);
  if (!fresh) return null;
  localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(fresh));
  return fresh;
}
