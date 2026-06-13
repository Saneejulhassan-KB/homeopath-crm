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
import { Textarea } from "@/components/ui/textarea";
import { patients } from "@/data/patients";
import { useAppointments } from "@/hooks/useAppointments";
import { usePatients } from "@/hooks/usePatients";
import { cn } from "@/lib/utils";
import type {
  AmountStatus,
  Appointment,
  AppointmentStatus,
  AppointmentType,
  VisitMode,
} from "@/types";
import { formatDate, formatTime, getInitials } from "@/utils/formatters";
import { createRoute, useNavigate } from "@tanstack/react-router";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Plus,
  Search,
  UserPlus,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { Route as rootRoute } from "./__root";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/appointments",
  component: AppointmentsPage,
});

// ── Status dot colors ────────────────────────────────────────────────
// display map: 'confirmed' is treated as 'pending' in badge display
type DisplayStatus = "pending" | "completed" | "cancelled";

const DISPLAY_STATUS_STYLE: Record<DisplayStatus, string> = {
  pending: "bg-yellow-500/15 text-yellow-500 border border-yellow-500/25",
  completed: "bg-zinc-500/15 text-zinc-400 border border-zinc-500/25",
  cancelled: "bg-red-500/15 text-red-400 border border-red-500/25",
};

const DISPLAY_STATUS_DOT: Record<DisplayStatus, string> = {
  pending: "bg-yellow-400",
  completed: "bg-zinc-400",
  cancelled: "bg-red-400",
};

// Calendar dot colours — covers all 4 raw AppointmentStatus values
const CALENDAR_DOT: Record<AppointmentStatus, string> = {
  confirmed: "bg-emerald-400",
  pending: "bg-yellow-400",
  completed: "bg-zinc-400",
  cancelled: "bg-red-400",
};

function toDisplayStatus(s: AppointmentStatus): DisplayStatus {
  if (s === "confirmed") return "pending";
  return s as DisplayStatus;
}

const AMOUNT_STATUS_STYLE: Record<AmountStatus, string> = {
  pending: "bg-amber-500/15 text-amber-500 border border-amber-500/25",
  paid: "bg-emerald-500/15 text-emerald-500 border border-emerald-500/25",
};

function formatCurrency(amount: number): string {
  return `\u20b9${amount.toLocaleString("en-IN")}`;
}

// ── Type labels ───────────────────────────────────────────────────────
const TYPE_LABELS: Record<AppointmentType, string> = {
  consultation: "Consultation",
  "follow-up": "Follow-up",
  "case-taking": "Case Taking",
};

// ── Visit mode colors ─────────────────────────────────────────────────
const VISIT_MODE_STYLE: Record<VisitMode, string> = {
  OP: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
  Online: "bg-violet-500/15 text-violet-400 border border-violet-500/20",
};

// ── CALENDAR ──────────────────────────────────────────────────────────
interface CalendarProps {
  currentMonth: Date;
  appointments: Appointment[];
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  onPrev: () => void;
  onNext: () => void;
}

function AppointmentCalendar({
  currentMonth,
  appointments,
  selectedDate,
  onSelectDate,
  onPrev,
  onNext,
}: CalendarProps) {
  const calDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const appointmentsByDate = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const appt of appointments) {
      const key = appt.date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(appt);
    }
    return map;
  }, [appointments]);

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="glass-card p-5"
      data-ocid="appointments-calendar"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-display font-semibold text-foreground">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onPrev}
            data-ocid="calendar-prev"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onNext}
            data-ocid="calendar-next"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {weekdays.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-medium text-muted-foreground uppercase tracking-wide pb-2"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {calDays.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const dayAppts = appointmentsByDate.get(key) ?? [];
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = selectedDate
            ? isSameDay(day, selectedDate)
            : false;
          const todayFlag = isToday(day);
          const dotStatuses = Array.from(
            new Set(dayAppts.map((a) => a.status as AppointmentStatus)),
          ).slice(0, 3);

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectDate(day)}
              className={cn(
                "relative flex flex-col items-center justify-start pt-1 pb-1 rounded-lg min-h-[42px] cursor-pointer transition-smooth",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isCurrentMonth ? "text-foreground" : "text-muted-foreground/30",
                isSelected &&
                  "bg-primary/20 ring-2 ring-primary ring-offset-1 ring-offset-transparent",
                !isSelected &&
                  isCurrentMonth &&
                  "hover:bg-white/10 dark:hover:bg-white/5",
                todayFlag && !isSelected && "ring-2 ring-primary/50",
              )}
              data-ocid={`cal-day-${key}`}
            >
              <span
                className={cn(
                  "text-xs font-medium leading-none",
                  todayFlag && "text-primary font-bold",
                )}
              >
                {format(day, "d")}
              </span>
              {dotStatuses.length > 0 && (
                <div className="flex gap-0.5 mt-1">
                  {dotStatuses.map((s) => (
                    <span
                      key={s}
                      className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        CALENDAR_DOT[s],
                      )}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-border/50">
        {(
          [
            ["confirmed", "Confirmed"],
            ["pending", "Pending"],
            ["completed", "Completed"],
            ["cancelled", "Cancelled"],
          ] as [AppointmentStatus, string][]
        ).map(([s, label]) => (
          <div
            key={s}
            className="flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            <span className={cn("w-2 h-2 rounded-full", CALENDAR_DOT[s])} />
            {label}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ── BOOK APPOINTMENT FORM ────────────────────────────────────────────
interface BookForm {
  patientId: string;
  date: string;
  time: string;
  type: AppointmentType;
  visitMode: VisitMode;
  doctor: string;
  notes: string;
}

const DEFAULT_BOOK: BookForm = {
  patientId: "",
  date: format(new Date(), "yyyy-MM-dd"),
  time: "09:00",
  type: "consultation",
  visitMode: "OP",
  doctor: "Dr. Meera Joshi",
  notes: "",
};

interface BookModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: BookForm) => void;
  initialDate?: string;
}

function BookAppointmentModal({
  open,
  onClose,
  onSubmit,
  initialDate,
}: BookModalProps) {
  const [form, setForm] = useState<BookForm>({
    ...DEFAULT_BOOK,
    date: initialDate ?? DEFAULT_BOOK.date,
  });
  const [patientSearch, setPatientSearch] = useState("");
  const [patientDropdownOpen, setPatientDropdownOpen] = useState(false);

  const set = <K extends keyof BookForm>(key: K, value: BookForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const filteredPatients = useMemo(() => {
    const q = patientSearch.toLowerCase().trim();
    if (!q) return patients.slice(0, 8);
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.registrationId.toLowerCase().includes(q) ||
        p.phone.includes(q),
    );
  }, [patientSearch]);

  const selectedPatient = patients.find((p) => p.id === form.patientId);

  function handlePatientSelect(patientId: string, patientName: string) {
    set("patientId", patientId);
    setPatientSearch(patientName);
    setPatientDropdownOpen(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.patientId) {
      toast.error("Please select a patient");
      return;
    }
    onSubmit(form);
    setForm({ ...DEFAULT_BOOK, date: initialDate ?? DEFAULT_BOOK.date });
    setPatientSearch("");
  }

  function handleClose() {
    setPatientSearch("");
    setPatientDropdownOpen(false);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-lg glass" data-ocid="book-appt-modal">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">
            Book Appointment
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Patient smart search */}
          <div className="space-y-1.5">
            <Label htmlFor="patient-search">Patient</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                id="patient-search"
                placeholder="Search by name, Reg ID, or phone…"
                value={patientSearch}
                onChange={(e) => {
                  setPatientSearch(e.target.value);
                  setPatientDropdownOpen(true);
                  if (!e.target.value) set("patientId", "");
                }}
                onFocus={() => setPatientDropdownOpen(true)}
                onBlur={() =>
                  setTimeout(() => setPatientDropdownOpen(false), 150)
                }
                autoComplete="off"
                className="pl-8"
                data-ocid="book-patient-search"
              />
              {selectedPatient && patientSearch === selectedPatient.name && (
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                  {selectedPatient.registrationId}
                </span>
              )}
              {patientDropdownOpen && filteredPatients.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border border-border/60 bg-card shadow-lg overflow-hidden">
                  <ul className="max-h-48 overflow-y-auto py-1">
                    {filteredPatients.map((p) => (
                      <li key={p.id}>
                        <button
                          type="button"
                          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted/50 transition-colors text-left"
                          onMouseDown={() => handlePatientSelect(p.id, p.name)}
                          data-ocid={`book-patient-option-${p.id}`}
                        >
                          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[10px] font-bold shrink-0">
                            {getInitials(p.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {p.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {p.registrationId} · {p.phone}
                            </p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="book-date">Date</Label>
              <Input
                id="book-date"
                type="date"
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
                data-ocid="book-date-input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="book-time">Time</Label>
              <Input
                id="book-time"
                type="time"
                value={form.time}
                onChange={(e) => set("time", e.target.value)}
                data-ocid="book-time-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => set("type", v as AppointmentType)}
              >
                <SelectTrigger data-ocid="book-type-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="follow-up">Follow-up</SelectItem>
                  <SelectItem value="case-taking">Case Taking</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Doctor</Label>
              <Select
                value={form.doctor}
                onValueChange={(v) => set("doctor", v)}
              >
                <SelectTrigger data-ocid="book-doctor-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dr. Meera Joshi">
                    Dr. Meera Joshi
                  </SelectItem>
                  <SelectItem value="Dr. Anand Verma">
                    Dr. Anand Verma
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* OP / Online toggle */}
          <div className="space-y-1.5">
            <span className="text-sm font-medium leading-none text-foreground">
              Visit Mode
            </span>
            <div className="flex gap-2 mt-1" data-ocid="book-visit-mode-toggle">
              {(["OP", "Online"] as VisitMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => set("visitMode", mode)}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-sm font-medium border transition-all duration-200",
                    form.visitMode === mode
                      ? mode === "OP"
                        ? "bg-blue-500/20 border-blue-500/40 text-blue-400 shadow-sm"
                        : "bg-violet-500/20 border-violet-500/40 text-violet-400 shadow-sm"
                      : "bg-muted/30 border-border/40 text-muted-foreground hover:bg-muted/50",
                  )}
                  data-ocid={`book-visit-mode-${mode.toLowerCase()}`}
                >
                  {mode === "OP" ? "🏥 OP (In-person)" : "💻 Online"}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="book-notes">Notes</Label>
            <Textarea
              id="book-notes"
              placeholder="Case notes, reason for visit…"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={3}
              data-ocid="book-notes-input"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" data-ocid="book-submit-btn">
              Book Appointment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── DETAIL MODAL ──────────────────────────────────────────────────────
interface DetailModalProps {
  appointment: Appointment | null;
  onClose: () => void;
  onCancel: (id: string) => void;
  onEdit: (appt: Appointment) => void;
}

function AppointmentDetailModal({
  appointment,
  onClose,
  onCancel,
  onEdit,
}: DetailModalProps) {
  if (!appointment) return null;
  const patient = patients.find((p) => p.id === appointment.patientId);

  return (
    <Dialog open={!!appointment} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg glass" data-ocid="appt-detail-modal">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">
            Appointment Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-1">
          {/* Patient info */}
          {patient && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold shrink-0">
                {getInitials(patient.name)}
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">
                  {patient.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {patient.age}y · {patient.gender} · {patient.bloodGroup}
                </p>
                <p className="text-xs text-muted-foreground">{patient.phone}</p>
              </div>
            </div>
          )}

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ["Date", formatDate(appointment.date)],
              ["Time", formatTime(appointment.time)],
              ["Type", TYPE_LABELS[appointment.type]],
              ["Doctor", appointment.doctor],
            ].map(([label, val]) => (
              <div key={label} className="space-y-0.5">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="font-medium text-foreground">{val}</p>
              </div>
            ))}
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Status:</span>
            {(() => {
              const ds = toDisplayStatus(appointment.status);
              return (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full capitalize",
                    DISPLAY_STATUS_STYLE[ds],
                  )}
                >
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full shrink-0",
                      DISPLAY_STATUS_DOT[ds],
                    )}
                  />
                  {ds}
                </span>
              );
            })()}
          </div>

          {/* Notes */}
          {appointment.notes && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Notes</p>
              <p className="text-sm text-foreground bg-muted/30 rounded-lg p-3 leading-relaxed">
                {appointment.notes}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between gap-2 pt-1">
            {appointment.status !== "cancelled" &&
              appointment.status !== "completed" && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    onCancel(appointment.id);
                    onClose();
                  }}
                  data-ocid="appt-cancel-btn"
                >
                  Cancel Appointment
                </Button>
              )}
            <div className="flex gap-2 ml-auto">
              <Button variant="ghost" size="sm" onClick={onClose}>
                Close
              </Button>
              {appointment.status !== "cancelled" &&
                appointment.status !== "completed" && (
                  <Button
                    size="sm"
                    onClick={() => {
                      onEdit(appointment);
                      onClose();
                    }}
                    data-ocid="appt-reschedule-btn"
                  >
                    Reschedule
                  </Button>
                )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── RESCHEDULE MODAL ──────────────────────────────────────────────────
interface RescheduleModalProps {
  appointment: Appointment | null;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Appointment>) => void;
}

function RescheduleModal({
  appointment,
  onClose,
  onSave,
}: RescheduleModalProps) {
  const [date, setDate] = useState(appointment?.date ?? "");
  const [time, setTime] = useState(appointment?.time ?? "");

  if (!appointment) return null;

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    onSave(appointment!.id, { date, time });
    toast.success("Appointment rescheduled!");
    onClose();
  }

  return (
    <Dialog open={!!appointment} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm glass" data-ocid="reschedule-modal">
        <DialogHeader>
          <DialogTitle className="font-display">
            Reschedule Appointment
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>New Date</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              data-ocid="reschedule-date-input"
            />
          </div>
          <div className="space-y-1.5">
            <Label>New Time</Label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              data-ocid="reschedule-time-input"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" data-ocid="reschedule-save-btn">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── NEW REGISTRATION MODAL ────────────────────────────────────────────
interface RegistrationForm {
  fullName: string;
  dob: string;
  gender: "Male" | "Female" | "Other";
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  maritalStatus: "Single" | "Married" | "Divorced" | "Others";
  occupation: string;
  note: string;
  referralSource: "Social Media" | "Friends" | "Website" | "Others";
  emergencyContact: {
    name: string;
    whatsapp: string;
    mobile: string;
    relationship: string;
  };
}

const DEFAULT_REGISTRATION: RegistrationForm = {
  fullName: "",
  dob: "",
  gender: "Male",
  address: "",
  phone: "",
  whatsapp: "",
  email: "",
  maritalStatus: "Single",
  occupation: "",
  note: "",
  referralSource: "Social Media",
  emergencyContact: {
    name: "",
    whatsapp: "",
    mobile: "",
    relationship: "",
  },
};

interface NewRegistrationModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: RegistrationForm) => void;
}

function NewRegistrationModal({
  open,
  onClose,
  onSubmit,
}: NewRegistrationModalProps) {
  const [form, setForm] = useState<RegistrationForm>(DEFAULT_REGISTRATION);

  const set = <K extends keyof RegistrationForm>(
    key: K,
    value: RegistrationForm[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const setEmergency = <K extends keyof RegistrationForm["emergencyContact"]>(
    key: K,
    value: RegistrationForm["emergencyContact"][K],
  ) =>
    setForm((prev) => ({
      ...prev,
      emergencyContact: { ...prev.emergencyContact, [key]: value },
    }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.fullName.trim()) {
      toast.error("Full name is required");
      return;
    }
    if (!form.phone.trim()) {
      toast.error("Phone number is required");
      return;
    }
    onSubmit(form);
    setForm(DEFAULT_REGISTRATION);
  }

  function handleClose() {
    setForm(DEFAULT_REGISTRATION);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        className="max-w-2xl glass max-h-[90vh] overflow-y-auto"
        data-ocid="new-registration-modal"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-lg flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            New Patient Registration
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {/* Personal Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Personal Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="reg-fullname">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="reg-fullname"
                  placeholder="Enter full name"
                  value={form.fullName}
                  onChange={(e) => set("fullName", e.target.value)}
                  data-ocid="reg-fullname-input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-dob">Date of Birth</Label>
                <Input
                  id="reg-dob"
                  type="date"
                  value={form.dob}
                  onChange={(e) => set("dob", e.target.value)}
                  data-ocid="reg-dob-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Gender</Label>
                <Select
                  value={form.gender}
                  onValueChange={(v) =>
                    set("gender", v as RegistrationForm["gender"])
                  }
                >
                  <SelectTrigger data-ocid="reg-gender-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={form.maritalStatus}
                  onValueChange={(v) =>
                    set("maritalStatus", v as RegistrationForm["maritalStatus"])
                  }
                >
                  <SelectTrigger data-ocid="reg-status-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Single">Single</SelectItem>
                    <SelectItem value="Married">Married</SelectItem>
                    <SelectItem value="Divorced">Divorced</SelectItem>
                    <SelectItem value="Others">Others</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-address">Address</Label>
              <Textarea
                id="reg-address"
                placeholder="Enter full address"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                rows={2}
                data-ocid="reg-address-input"
              />
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Contact Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="reg-phone">
                  Phone Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="reg-phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  data-ocid="reg-phone-input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-whatsapp">WhatsApp Number</Label>
                <Input
                  id="reg-whatsapp"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={form.whatsapp}
                  onChange={(e) => set("whatsapp", e.target.value)}
                  data-ocid="reg-whatsapp-input"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reg-email">Email</Label>
              <Input
                id="reg-email"
                type="email"
                placeholder="patient@example.com"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                data-ocid="reg-email-input"
              />
            </div>
          </div>

          {/* Additional Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Additional Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="reg-occupation">Occupation</Label>
                <Input
                  id="reg-occupation"
                  placeholder="e.g. Teacher, Engineer"
                  value={form.occupation}
                  onChange={(e) => set("occupation", e.target.value)}
                  data-ocid="reg-occupation-input"
                />
              </div>
              <div className="space-y-1.5">
                <Label>How did you hear about us?</Label>
                <Select
                  value={form.referralSource}
                  onValueChange={(v) =>
                    set(
                      "referralSource",
                      v as RegistrationForm["referralSource"],
                    )
                  }
                >
                  <SelectTrigger data-ocid="reg-referral-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Social Media">Social Media</SelectItem>
                    <SelectItem value="Friends">Friends</SelectItem>
                    <SelectItem value="Website">Website</SelectItem>
                    <SelectItem value="Others">Others</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reg-note">Note / Problem Description</Label>
              <Textarea
                id="reg-note"
                placeholder="Describe the patient's problem or any notes..."
                value={form.note}
                onChange={(e) => set("note", e.target.value)}
                rows={3}
                data-ocid="reg-note-input"
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Emergency Contact
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="reg-ec-name">Contact Name</Label>
                <Input
                  id="reg-ec-name"
                  placeholder="Emergency contact name"
                  value={form.emergencyContact.name}
                  onChange={(e) => setEmergency("name", e.target.value)}
                  data-ocid="reg-ec-name-input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-ec-relationship">Relationship</Label>
                <Input
                  id="reg-ec-relationship"
                  placeholder="e.g. Father, Spouse"
                  value={form.emergencyContact.relationship}
                  onChange={(e) => setEmergency("relationship", e.target.value)}
                  data-ocid="reg-ec-relationship-input"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="reg-ec-mobile">Mobile Number</Label>
                <Input
                  id="reg-ec-mobile"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={form.emergencyContact.mobile}
                  onChange={(e) => setEmergency("mobile", e.target.value)}
                  data-ocid="reg-ec-mobile-input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-ec-whatsapp">WhatsApp Number</Label>
                <Input
                  id="reg-ec-whatsapp"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={form.emergencyContact.whatsapp}
                  onChange={(e) => setEmergency("whatsapp", e.target.value)}
                  data-ocid="reg-ec-whatsapp-input"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" data-ocid="reg-submit-btn">
              Register Patient
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────
function AppointmentsPage() {
  const { appointments, isLoading, addAppointment, updateAppointment } =
    useAppointments();
  const { addPatient } = usePatients();

  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 3, 1)); // April 2026
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [search, setSearch] = useState("");
  const [doctorFilter, setDoctorFilter] = useState<string>("all");
  const [showBook, setShowBook] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [detailAppt, setDetailAppt] = useState<Appointment | null>(null);
  const navigate = useNavigate();
  const [rescheduleAppt, setRescheduleAppt] = useState<Appointment | null>(
    null,
  );

  const handleSelectDate = useCallback((day: Date) => {
    setSelectedDate((prev) => (prev && isSameDay(prev, day) ? null : day));
  }, []);

  const filteredAppointments = useMemo(() => {
    let list = [...appointments];
    if (selectedDate) {
      const key = format(selectedDate, "yyyy-MM-dd");
      list = list.filter((a) => a.date === key);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((a) => a.patientName.toLowerCase().includes(q));
    }
    if (doctorFilter !== "all") {
      list = list.filter((a) => a.doctor === doctorFilter);
    }
    return list.sort((a, b) => {
      const d = a.date.localeCompare(b.date);
      if (d !== 0) return d;
      return a.time.localeCompare(b.time);
    });
  }, [appointments, selectedDate, search, doctorFilter]);

  function handleBook(form: BookForm) {
    const patient = patients.find((p) => p.id === form.patientId);
    if (!patient) return;
    addAppointment({
      patientId: form.patientId,
      patientName: patient.name,
      date: form.date,
      time: form.time,
      type: form.type,
      visitMode: form.visitMode,
      status: "confirmed",
      doctor: form.doctor,
      notes: form.notes,
    });
    toast.success("Appointment booked!");
    setShowBook(false);
  }

  function handleCancel(id: string) {
    updateAppointment(id, { status: "cancelled" });
    toast.success("Appointment cancelled.");
  }

  return (
    <div className="space-y-6" data-ocid="appointments-page">
      <PageHeader
        title="Appointments"
        description="Schedule, confirm, and manage all clinic appointments."
        breadcrumb={[
          { label: "Dashboard", href: "/" },
          { label: "Appointments" },
        ]}
        actions={[
          {
            label: "New Registration",
            icon: <UserPlus className="h-4 w-4" />,
            onClick: () => setShowRegistration(true),
            variant: "outline" as const,
          },
          {
            label: "Book Appointment",
            icon: <Plus className="h-4 w-4" />,
            onClick: () => setShowBook(true),
            variant: "default" as const,
          },
        ]}
      />

      {/* Calendar */}
      <AppointmentCalendar
        currentMonth={currentMonth}
        appointments={appointments}
        selectedDate={selectedDate}
        onSelectDate={handleSelectDate}
        onPrev={() => setCurrentMonth((m) => subMonths(m, 1))}
        onNext={() => setCurrentMonth((m) => addMonths(m, 1))}
      />

      {/* Appointments Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="glass-card overflow-hidden"
        data-ocid="appointments-table-section"
      >
        {/* Table header bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            <h3 className="font-display font-semibold text-foreground text-sm">
              {selectedDate
                ? `Appointments — ${format(selectedDate, "dd MMM yyyy")}`
                : "All Appointments"}
            </h3>
            <span className="text-xs text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full">
              {filteredAppointments.length}
            </span>
            {selectedDate && (
              <button
                type="button"
                onClick={() => setSelectedDate(null)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5"
                data-ocid="clear-date-filter"
              >
                <X className="h-3 w-3" /> Clear filter
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search by patient…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs"
                data-ocid="appt-search-input"
              />
            </div>
            <Select
              value={doctorFilter}
              onValueChange={(v) => setDoctorFilter(v)}
            >
              <SelectTrigger
                className="h-8 text-xs w-full sm:w-44"
                data-ocid="appt-doctor-filter"
              >
                <SelectValue placeholder="All Doctors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Doctors</SelectItem>
                {Array.from(new Set(appointments.map((a) => a.doctor))).map(
                  (doc) => (
                    <SelectItem key={doc} value={doc}>
                      {doc}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/20">
                {[
                  "Date & Time",
                  "Name",
                  "Type",
                  "OP/Online",
                  "Doctor",
                  "Status",
                  "Actions",
                  "Amount",
                  "Amount Status",
                ].map((col) => (
                  <th
                    key={col}
                    className="text-left text-xs font-medium text-muted-foreground px-4 py-3 whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <AnimatePresence mode="popLayout">
              <tbody>
                {isLoading ? (
                  (["r1", "r2", "r3", "r4", "r5"] as const).map((rowKey) => (
                    <tr key={rowKey} className="border-b border-border/30">
                      {(
                        [
                          "dt",
                          "pt",
                          "tp",
                          "vm",
                          "dr",
                          "st",
                          "ac",
                          "am",
                          "as",
                        ] as const
                      ).map((col) => (
                        <td key={col} className="px-4 py-3">
                          <div className="h-4 bg-muted/40 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredAppointments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="py-16 text-center"
                      data-ocid="appt-empty-state"
                    >
                      <CalendarDays className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">
                        No appointments found
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        {selectedDate
                          ? "Try selecting another date"
                          : "Book an appointment to get started"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((appt, idx) => (
                    <motion.tr
                      key={appt.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      transition={{ duration: 0.2, delay: idx * 0.03 }}
                      className="border-b border-border/30 hover:bg-white/5 dark:hover:bg-white/3 transition-smooth group cursor-pointer"
                      onClick={() =>
                        navigate({ to: `/patients/${appt.patientId}` })
                      }
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-medium text-foreground text-xs">
                          {formatDate(appt.date)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatTime(appt.time)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-primary text-[10px] font-bold shrink-0">
                            {getInitials(appt.patientName)}
                          </div>
                          <span className="font-medium text-foreground text-xs truncate max-w-[130px]">
                            {appt.patientName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-xs text-muted-foreground">
                          {TYPE_LABELS[appt.type] ?? appt.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={cn(
                            "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                            VISIT_MODE_STYLE[appt.visitMode ?? "OP"],
                          )}
                        >
                          {appt.visitMode ?? "OP"}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-xs text-foreground">
                          {appt.doctor}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {(() => {
                          const ds = toDisplayStatus(appt.status);
                          return (
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full capitalize",
                                DISPLAY_STATUS_STYLE[ds],
                              )}
                            >
                              <span
                                className={cn(
                                  "w-1.5 h-1.5 rounded-full shrink-0",
                                  DISPLAY_STATUS_DOT[ds],
                                )}
                              />
                              {ds}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-smooth">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDetailAppt(appt);
                            }}
                            title="View details"
                            data-ocid={`appt-view-${appt.id}`}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRescheduleAppt(appt);
                            }}
                            title="Edit / Reschedule"
                            data-ocid={`appt-edit-${appt.id}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancel(appt.id);
                            }}
                            title="Cancel"
                            data-ocid={`appt-cancel-${appt.id}`}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-xs font-medium text-foreground">
                          {appt.amount != null
                            ? formatCurrency(appt.amount)
                            : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {appt.amountStatus != null ? (
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full capitalize",
                              AMOUNT_STATUS_STYLE[appt.amountStatus],
                            )}
                          >
                            {appt.amountStatus}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </AnimatePresence>
          </table>
        </div>
      </motion.div>

      {/* Modals */}
      <BookAppointmentModal
        open={showBook}
        onClose={() => setShowBook(false)}
        onSubmit={handleBook}
        initialDate={
          selectedDate ? format(selectedDate, "yyyy-MM-dd") : undefined
        }
      />

      <AppointmentDetailModal
        appointment={detailAppt}
        onClose={() => setDetailAppt(null)}
        onCancel={handleCancel}
        onEdit={(appt) => setRescheduleAppt(appt)}
      />

      <RescheduleModal
        appointment={rescheduleAppt}
        onClose={() => setRescheduleAppt(null)}
        onSave={(id, updates) => updateAppointment(id, updates)}
      />

      <NewRegistrationModal
        open={showRegistration}
        onClose={() => setShowRegistration(false)}
        onSubmit={(data) => {
          const regId = `REG-${String(Math.floor(Math.random() * 9000) + 1000)}`;
          const age = data.dob
            ? Math.floor(
                (Date.now() - new Date(data.dob).getTime()) /
                  (365.25 * 24 * 60 * 60 * 1000),
              )
            : 30;
          addPatient({
            registrationId: regId,
            name: data.fullName,
            age,
            gender: data.gender,
            email: data.email,
            phone: data.phone,
            place: data.address.split(",").pop()?.trim() ?? "",
            address: data.address,
            bloodGroup: "O+",
            chiefComplaint: data.note || "",
            lastVisit: format(new Date(), "yyyy-MM-dd"),
            createdAt: format(new Date(), "yyyy-MM-dd"),
            status: "active",
            totalVisits: 0,
            consultationFee: 800,
            dob: data.dob,
            whatsapp: data.whatsapp,
            maritalStatus: data.maritalStatus,
            occupation: data.occupation,
            note: data.note,
            referralSource: data.referralSource,
            emergencyContact: data.emergencyContact,
          });
          toast.success(`Patient registered successfully! ID: ${regId}`);
          setShowRegistration(false);
        }}
      />
    </div>
  );
}
