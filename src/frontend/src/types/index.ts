export type PatientStatus = "active" | "inactive";
export type AppointmentStatus =
  | "confirmed"
  | "pending"
  | "completed"
  | "cancelled";
export type PrescriptionStatus = "active" | "completed" | "stopped";
export type InvoiceStatus = "paid" | "pending" | "overdue";
export type NotificationType =
  | "appointment"
  | "payment"
  | "reminder"
  | "system"
  | "alert";
export type { AuthUser, Clinic } from "@/utils/auth";
export type Role =
  | "Main Admin"
  | "Doctor"
  | "Receptionist"
  | "Pharmacist"
  | "Nurse/Compounder"
  | "Billing Staff";

export type RoleId =
  | "main-admin"
  | "doctor"
  | "receptionist"
  | "pharmacist"
  | "nurse"
  | "billing";

export interface RoleConfig {
  id: RoleId;
  displayName: string;
  icon: string;
  color: string;
  description: string;
  gradient: string;
}

export type ModuleAccess = "full" | "view-only" | "filtered" | "none";

export interface RolePermissions {
  [module: string]: ModuleAccess;
}
export type Language = "en" | "hi" | "es" | "fr";
export type AppointmentType = "consultation" | "follow-up" | "case-taking";

export type VisitMode = "OP" | "Online";

export interface Patient {
  id: string;
  registrationId: string;
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  email: string;
  phone: string;
  place: string;
  address: string;
  bloodGroup: string;
  chiefComplaint: string;
  lastVisit: string;
  createdAt: string;
  status: PatientStatus;
  totalVisits: number;
  consultationFee: number;
  avatar?: string;
}

export type AmountStatus = "pending" | "paid";

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  type: AppointmentType;
  visitMode: VisitMode;
  status: AppointmentStatus;
  doctor: string;
  notes: string;
  amount?: number;
  amountStatus?: AmountStatus;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  remedy: string;
  potency: string;
  dosage: string;
  frequency: string;
  duration: string;
  caseNotes: string;
  symptoms: string[];
  status: PrescriptionStatus;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  amount: number;
  status: InvoiceStatus;
  items: InvoiceItem[];
  paymentMethod: string;
}

export interface Remedy {
  id: string;
  name: string;
  commonName: string;
  keynotes: string[];
  potencies: string[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: NotificationType;
}

export interface MonthlyData {
  month: string;
  value: number;
}

export interface Analytics {
  patientGrowth: MonthlyData[];
  revenue: MonthlyData[];
  appointmentStats: {
    confirmed: number;
    pending: number;
    completed: number;
    cancelled: number;
  };
}
