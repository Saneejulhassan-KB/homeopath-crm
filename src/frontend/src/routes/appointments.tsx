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
import { StatusBadge } from "@/components/ui/status-badge";
import { Textarea } from "@/components/ui/textarea";
import { patients } from "@/data/patients";
import { useAppointments } from "@/hooks/useAppointments";
import { cn } from "@/lib/utils";
import type { Appointment, AppointmentStatus, AppointmentType } from "@/types";
import { formatDate, formatTime, getInitials } from "@/utils/formatters";
import { createRoute } from "@tanstack/react-router";
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
const STATUS_DOT: Record<AppointmentStatus, string> = {
  confirmed: "bg-teal-400",
  pending: "bg-yellow-400",
  completed: "bg-zinc-400",
  cancelled: "bg-red-400",
};

// ── Type labels ───────────────────────────────────────────────────────
const TYPE_LABELS: Record<AppointmentType, string> = {
  consultation: "Consultation",
  "follow-up": "Follow-up",
  emergency: "Emergency",
  online: "Online",
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
                      className={cn("w-1.5 h-1.5 rounded-full", STATUS_DOT[s])}
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
            <span className={cn("w-2 h-2 rounded-full", STATUS_DOT[s])} />
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
  doctor: string;
  notes: string;
  status: AppointmentStatus;
}

const DEFAULT_BOOK: BookForm = {
  patientId: "",
  date: format(new Date(), "yyyy-MM-dd"),
  time: "09:00",
  type: "consultation",
  doctor: "Dr. Meera Joshi",
  notes: "",
  status: "confirmed",
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

  const set = <K extends keyof BookForm>(key: K, value: BookForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.patientId) {
      toast.error("Please select a patient");
      return;
    }
    onSubmit(form);
    setForm({ ...DEFAULT_BOOK, date: initialDate ?? DEFAULT_BOOK.date });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-lg glass border-white/10 dark:border-white/10"
        data-ocid="book-appt-modal"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-lg">
            Book Appointment
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Patient</Label>
            <Select
              value={form.patientId}
              onValueChange={(v) => set("patientId", v)}
            >
              <SelectTrigger data-ocid="book-patient-select">
                <SelectValue placeholder="Select patient…" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} — {p.age}y {p.gender}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
                data-ocid="book-date-input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Time</Label>
              <Input
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
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
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

          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) => set("status", v as AppointmentStatus)}
            >
              <SelectTrigger data-ocid="book-status-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea
              placeholder="Case notes, reason for visit…"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={3}
              data-ocid="book-notes-input"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={onClose}>
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
      <DialogContent
        className="max-w-lg glass border-white/10 dark:border-white/10"
        data-ocid="appt-detail-modal"
      >
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
            <StatusBadge status={appointment.status} />
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
      <DialogContent
        className="max-w-sm glass border-white/10"
        data-ocid="reschedule-modal"
      >
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

// ── MAIN PAGE ─────────────────────────────────────────────────────────
function AppointmentsPage() {
  const { appointments, isLoading, addAppointment, updateAppointment } =
    useAppointments();

  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 3, 1)); // April 2026
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [search, setSearch] = useState("");
  const [showBook, setShowBook] = useState(false);
  const [detailAppt, setDetailAppt] = useState<Appointment | null>(null);
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
    return list.sort((a, b) => {
      const d = a.date.localeCompare(b.date);
      if (d !== 0) return d;
      return a.time.localeCompare(b.time);
    });
  }, [appointments, selectedDate, search]);

  function handleBook(form: BookForm) {
    const patient = patients.find((p) => p.id === form.patientId);
    if (!patient) return;
    addAppointment({
      patientId: form.patientId,
      patientName: patient.name,
      date: form.date,
      time: form.time,
      type: form.type,
      status: form.status,
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
        action={{
          label: "Book Appointment",
          icon: <Plus className="h-4 w-4" />,
          onClick: () => setShowBook(true),
        }}
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
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/20">
                {[
                  "Date & Time",
                  "Patient",
                  "Type",
                  "Doctor",
                  "Status",
                  "Actions",
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
                      {(["dt", "pt", "tp", "dr", "st", "ac"] as const).map(
                        (col) => (
                          <td key={col} className="px-4 py-3">
                            <div className="h-4 bg-muted/40 rounded animate-pulse" />
                          </td>
                        ),
                      )}
                    </tr>
                  ))
                ) : filteredAppointments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
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
                      className="border-b border-border/30 hover:bg-white/5 dark:hover:bg-white/3 transition-smooth group"
                      data-ocid={`appt-row-${appt.id}`}
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
                        <span className="text-xs text-muted-foreground capitalize">
                          {TYPE_LABELS[appt.type]}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-xs text-foreground">
                          {appt.doctor}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={appt.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-smooth">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setDetailAppt(appt)}
                            title="View details"
                            data-ocid={`appt-view-${appt.id}`}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          {appt.status !== "cancelled" &&
                            appt.status !== "completed" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => setRescheduleAppt(appt)}
                                title="Reschedule"
                                data-ocid={`appt-edit-${appt.id}`}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          {appt.status !== "cancelled" &&
                            appt.status !== "completed" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() => handleCancel(appt.id)}
                                title="Cancel"
                                data-ocid={`appt-cancel-${appt.id}`}
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            )}
                        </div>
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
    </div>
  );
}
