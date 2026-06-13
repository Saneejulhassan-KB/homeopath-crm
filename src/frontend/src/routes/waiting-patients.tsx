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
import { appointments } from "@/data/appointments";
import { patients } from "@/data/patients";
import { useAppointments } from "@/hooks/useAppointments";
import { cn } from "@/lib/utils";
import type {
  AmountStatus,
  AppointmentStatus,
  AppointmentType,
  VisitMode,
} from "@/types";
import { formatDate, formatTime, getInitials } from "@/utils/formatters";
import { createRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, Eye, Pencil, Search, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Route as rootRoute } from "./__root";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/waiting-patients",
  component: WaitingPatientsPage,
});

// ── Status helpers (same as appointments.tsx) ──────────────────────────
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

function toDisplayStatus(s: AppointmentStatus): DisplayStatus {
  if (s === "confirmed") return "pending";
  return s as DisplayStatus;
}

const AMOUNT_STATUS_STYLE: Record<AmountStatus, string> = {
  pending: "bg-amber-500/15 text-amber-500 border border-amber-500/25",
  paid: "bg-emerald-500/15 text-emerald-500 border border-emerald-500/25",
};

const TYPE_LABELS: Record<AppointmentType, string> = {
  consultation: "Consultation",
  "follow-up": "Follow-up",
  "case-taking": "Case Taking",
};

const VISIT_MODE_STYLE: Record<VisitMode, string> = {
  OP: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
  Online: "bg-violet-500/15 text-violet-400 border border-violet-500/20",
};

function formatCurrency(amount: number): string {
  return `\u20b9${amount.toLocaleString("en-IN")}`;
}

// ── PAGE ─────────────────────────────────────────────────────────────
function WaitingPatientsPage() {
  const navigate = useNavigate();
  const { appointments, updateAppointment } = useAppointments();
  const [rescheduleAppt, setRescheduleAppt] = useState<
    (typeof appointments)[number] | null
  >(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");

  const [search, setSearch] = useState("");

  function handleRowClick(patientId: string) {
    navigate({ to: `/patients/${patientId}` });
  }

  const pendingAppointments = useMemo(() => {
    let list = appointments.filter(
      (a) => a.status === "pending" || a.status === "confirmed",
    );
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((a) => a.patientName.toLowerCase().includes(q));
    }
    return list.sort((a, b) => {
      const d = a.date.localeCompare(b.date);
      if (d !== 0) return d;
      return a.time.localeCompare(b.time);
    });
  }, [appointments, search]);

  function handleCancel(id: string) {
    updateAppointment(id, { status: "cancelled" });
    toast.success("Appointment cancelled.");
  }

  function openReschedule(appt: (typeof appointments)[number]) {
    setRescheduleAppt(appt);
    setRescheduleDate(appt.date);
    setRescheduleTime(appt.time);
  }

  function handleRescheduleSave(e: React.FormEvent) {
    e.preventDefault();
    if (rescheduleAppt) {
      updateAppointment(rescheduleAppt.id, {
        date: rescheduleDate,
        time: rescheduleTime,
      });
      toast.success("Appointment rescheduled!");
      setRescheduleAppt(null);
    }
  }

  return (
    <div className="space-y-6" data-ocid="waiting-patients-page">
      <PageHeader
        title="Waiting Patients"
        description="All pending appointments awaiting consultation."
        breadcrumb={[
          { label: "Dashboard", href: "/" },
          { label: "Waiting Patients" },
        ]}
        action={{
          label: "Back to Dashboard",
          icon: <ArrowLeft className="h-4 w-4" />,
          onClick: () => navigate({ to: "/" }),
        }}
      />

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="glass-card overflow-hidden"
        data-ocid="waiting-patients-table-section"
      >
        {/* Table header bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            <h3 className="font-display font-semibold text-foreground text-sm">
              Pending Appointments
            </h3>
            <span className="text-xs text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full">
              {pendingAppointments.length}
            </span>
          </div>
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              placeholder="Search by patient…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs w-full rounded-md border border-white/10 bg-white/5 px-3 py-1 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              data-ocid="waiting-patients-search-input"
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
                {pendingAppointments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="py-16 text-center"
                      data-ocid="waiting-patients-empty-state"
                    >
                      <CalendarDays className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">
                        No pending appointments
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        All patients have been attended to
                      </p>
                    </td>
                  </tr>
                ) : (
                  pendingAppointments.map((appt, idx) => (
                    <motion.tr
                      key={appt.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      transition={{ duration: 0.2, delay: idx * 0.03 }}
                      className="border-b border-border/30 hover:bg-white/5 dark:hover:bg-white/3 transition-smooth group cursor-pointer"
                      onClick={() => handleRowClick(appt.patientId)}
                      data-ocid={`waiting-patient-row-${appt.id}`}
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
                              handleRowClick(appt.patientId);
                            }}
                            title="View patient"
                            data-ocid={`waiting-patient-view-${appt.id}`}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              openReschedule(appt);
                            }}
                            title="Edit / Reschedule"
                            data-ocid={`waiting-patient-edit-${appt.id}`}
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
                            data-ocid={`waiting-patient-cancel-${appt.id}`}
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
      {/* Reschedule Modal */}
      <Dialog
        open={!!rescheduleAppt}
        onOpenChange={(o) => !o && setRescheduleAppt(null)}
      >
        <DialogContent
          className="max-w-sm glass"
          data-ocid="waiting-reschedule-modal"
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              Reschedule Appointment
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRescheduleSave} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>New Date</Label>
              <Input
                type="date"
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                data-ocid="waiting-reschedule-date-input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>New Time</Label>
              <Input
                type="time"
                value={rescheduleTime}
                onChange={(e) => setRescheduleTime(e.target.value)}
                data-ocid="waiting-reschedule-time-input"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setRescheduleAppt(null)}
              >
                Cancel
              </Button>
              <Button type="submit" data-ocid="waiting-reschedule-save-btn">
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
