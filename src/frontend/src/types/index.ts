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
export type Role = "Admin" | "Doctor" | "Receptionist";
export type Language = "en" | "hi" | "es" | "fr";
export type AppointmentType =
  | "consultation"
  | "follow-up"
  | "emergency"
  | "online";

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  email: string;
  phone: string;
  address: string;
  bloodGroup: string;
  chiefComplaint: string;
  lastVisit: string;
  status: PatientStatus;
  totalVisits: number;
  consultationFee: number;
  avatar?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  type: AppointmentType;
  status: AppointmentStatus;
  doctor: string;
  notes: string;
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
