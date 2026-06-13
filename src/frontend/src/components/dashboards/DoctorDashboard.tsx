import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { useAppStore } from "@/store";
import {
  addDays,
  endOfDay,
  endOfMonth,
  endOfYear,
  format,
  isWithinInterval,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
  subYears,
} from "date-fns";
import {
  AlertCircle,
  Calendar,
  CalendarDays,
  ClipboardList,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { type DateRange, DayPicker } from "react-day-picker";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "react-day-picker/style.css";
import { GlassTooltip, containerVariants, itemVariants } from "./shared";

const _todayQueue = [
  {
    time: "09:00 AM",
    patient: "Arjun Sharma",
    reason: "Follow-up: Migraine",
    status: "completed" as const,
  },
  {
    time: "10:00 AM",
    patient: "Fatima Al-Zahra",
    reason: "New: Chronic IBS",
    status: "completed" as const,
  },
  {
    time: "11:00 AM",
    patient: "Priya Nair",
    reason: "Review: Eczema",
    status: "confirmed" as const,
  },
  {
    time: "12:00 PM",
    patient: "Hans Mueller",
    reason: "New: Joint Pain",
    status: "pending" as const,
  },
  {
    time: "02:30 PM",
    patient: "Kavitha Reddy",
    reason: "Follow-up: Anxiety",
    status: "pending" as const,
  },
];

// ─── Data ──────────────────────────────────────────────────────────────────

const VISIT_TREND_DATA = {
  "3M": [
    { label: "Feb", visits: 54 },
    { label: "Mar", visits: 61 },
    { label: "Apr", visits: 58 },
  ],
  "6M": [
    { label: "Nov", visits: 42 },
    { label: "Dec", visits: 48 },
    { label: "Jan", visits: 51 },
    { label: "Feb", visits: 54 },
    { label: "Mar", visits: 61 },
    { label: "Apr", visits: 58 },
  ],
  "1Y": [
    { label: "May", visits: 36 },
    { label: "Jun", visits: 40 },
    { label: "Jul", visits: 38 },
    { label: "Aug", visits: 44 },
    { label: "Sep", visits: 47 },
    { label: "Oct", visits: 45 },
    { label: "Nov", visits: 42 },
    { label: "Dec", visits: 48 },
    { label: "Jan", visits: 51 },
    { label: "Feb", visits: 54 },
    { label: "Mar", visits: 61 },
    { label: "Apr", visits: 58 },
  ],
};

const APPT_VOLUME_DATA = {
  Daily: [
    { label: "9 AM", appointments: 3 },
    { label: "10 AM", appointments: 5 },
    { label: "11 AM", appointments: 4 },
    { label: "12 PM", appointments: 6 },
    { label: "2 PM", appointments: 4 },
    { label: "3 PM", appointments: 3 },
    { label: "4 PM", appointments: 2 },
    { label: "5 PM", appointments: 1 },
  ],
  Weekly: [
    { label: "Mon", appointments: 14 },
    { label: "Tue", appointments: 18 },
    { label: "Wed", appointments: 16 },
    { label: "Thu", appointments: 20 },
    { label: "Fri", appointments: 17 },
    { label: "Sat", appointments: 10 },
    { label: "Sun", appointments: 4 },
  ],
  Monthly: [
    { label: "Week 1", appointments: 56 },
    { label: "Week 2", appointments: 68 },
    { label: "Week 3", appointments: 62 },
    { label: "Week 4", appointments: 72 },
  ],
  Yearly: [
    { label: "Jan", appointments: 220 },
    { label: "Feb", appointments: 240 },
    { label: "Mar", appointments: 258 },
    { label: "Apr", appointments: 275 },
    { label: "May", appointments: 260 },
    { label: "Jun", appointments: 290 },
    { label: "Jul", appointments: 278 },
    { label: "Aug", appointments: 300 },
    { label: "Sep", appointments: 315 },
    { label: "Oct", appointments: 305 },
    { label: "Nov", appointments: 320 },
    { label: "Dec", appointments: 340 },
  ],
};

const APPT_QUEUE_DATA = {
  Today: [
    {
      time: "09:00 AM",
      patient: "Arjun Sharma",
      type: "Case Taking",
      mode: "OP",
      status: "completed",
    },
    {
      time: "10:00 AM",
      patient: "Fatima Al-Zahra",
      type: "Consultation",
      mode: "Online",
      status: "completed",
    },
    {
      time: "10:45 AM",
      patient: "Priya Nair",
      type: "Follow Up",
      mode: "OP",
      status: "completed",
    },
    {
      time: "11:30 AM",
      patient: "Hans Mueller",
      type: "Consultation",
      mode: "OP",
      status: "pending",
    },
    {
      time: "12:15 PM",
      patient: "Kavitha Reddy",
      type: "Follow Up",
      mode: "Online",
      status: "pending",
    },
    {
      time: "02:00 PM",
      patient: "Rajesh Kumar",
      type: "Case Taking",
      mode: "OP",
      status: "pending",
    },
    {
      time: "03:00 PM",
      patient: "Nadia Khan",
      type: "Consultation",
      mode: "Online",
      status: "pending",
    },
    {
      time: "04:30 PM",
      patient: "Suresh Babu",
      type: "Follow Up",
      mode: "OP",
      status: "cancelled",
    },
  ],
  Tomorrow: [
    {
      time: "09:30 AM",
      patient: "Deepa Menon",
      type: "Consultation",
      mode: "OP",
      status: "pending",
    },
    {
      time: "10:15 AM",
      patient: "Vivek Anand",
      type: "Case Taking",
      mode: "Online",
      status: "pending",
    },
    {
      time: "11:00 AM",
      patient: "Lakshmi Patel",
      type: "Follow Up",
      mode: "OP",
      status: "pending",
    },
    {
      time: "12:00 PM",
      patient: "Arun Pillai",
      type: "Consultation",
      mode: "OP",
      status: "pending",
    },
    {
      time: "02:30 PM",
      patient: "Meena Rajan",
      type: "Follow Up",
      mode: "Online",
      status: "pending",
    },
  ],
  "This Week": [
    {
      time: "Mon 10:00 AM",
      patient: "Rahul Singh",
      type: "Consultation",
      mode: "OP",
      status: "completed",
    },
    {
      time: "Mon 11:30 AM",
      patient: "Sunita Verma",
      type: "Case Taking",
      mode: "OP",
      status: "completed",
    },
    {
      time: "Tue 09:15 AM",
      patient: "Vikram Patel",
      type: "Follow Up",
      mode: "Online",
      status: "completed",
    },
    {
      time: "Tue 02:00 PM",
      patient: "Anita Joshi",
      type: "Consultation",
      mode: "OP",
      status: "completed",
    },
    {
      time: "Wed 10:45 AM",
      patient: "Ravi Krishnan",
      type: "Follow Up",
      mode: "OP",
      status: "completed",
    },
    {
      time: "Thu 09:00 AM",
      patient: "Fatima Al-Zahra",
      type: "Case Taking",
      mode: "Online",
      status: "pending",
    },
    {
      time: "Thu 11:00 AM",
      patient: "Hans Mueller",
      type: "Consultation",
      mode: "OP",
      status: "pending",
    },
    {
      time: "Fri 10:00 AM",
      patient: "Kavitha Reddy",
      type: "Follow Up",
      mode: "OP",
      status: "pending",
    },
    {
      time: "Fri 02:00 PM",
      patient: "Arjun Sharma",
      type: "Consultation",
      mode: "Online",
      status: "pending",
    },
  ],
};

const RECENT_CASES_DATA = {
  Today: [
    {
      patient: "Arjun Sharma",
      date: "Today 09:00 AM",
      complaint: "Chronic headache with nausea",
      status: "case-taken",
    },
    {
      patient: "Fatima Al-Zahra",
      date: "Today 10:00 AM",
      complaint: "Bloating & abdominal cramps",
      status: "follow-up",
    },
    {
      patient: "Priya Nair",
      date: "Today 10:45 AM",
      complaint: "Skin rash — eczema flare-up",
      status: "follow-up",
    },
  ],
  "This Week": [
    {
      patient: "Arjun Sharma",
      date: "Mon 09:00 AM",
      complaint: "Chronic headache with nausea",
      status: "case-taken",
    },
    {
      patient: "Sunita Verma",
      date: "Mon 11:30 AM",
      complaint: "Chronic sinusitis, seasonal",
      status: "case-taken",
    },
    {
      patient: "Vikram Patel",
      date: "Tue 09:15 AM",
      complaint: "Joint stiffness — R. Arthritis",
      status: "follow-up",
    },
    {
      patient: "Anita Joshi",
      date: "Tue 02:00 PM",
      complaint: "Anxiety & sleep disturbances",
      status: "case-taken",
    },
    {
      patient: "Ravi Krishnan",
      date: "Wed 10:45 AM",
      complaint: "IBS — bloating & loose stools",
      status: "follow-up",
    },
  ],
  "This Month": [
    {
      patient: "Arjun Sharma",
      date: "Jun 2, 09:00 AM",
      complaint: "Chronic headache with nausea",
      status: "case-taken",
    },
    {
      patient: "Sunita Verma",
      date: "Jun 2, 11:30 AM",
      complaint: "Chronic sinusitis, seasonal",
      status: "case-taken",
    },
    {
      patient: "Vikram Patel",
      date: "Jun 3, 09:15 AM",
      complaint: "Joint stiffness — R. Arthritis",
      status: "follow-up",
    },
    {
      patient: "Anita Joshi",
      date: "Jun 3, 02:00 PM",
      complaint: "Anxiety & sleep disturbances",
      status: "case-taken",
    },
    {
      patient: "Ravi Krishnan",
      date: "Jun 4, 10:45 AM",
      complaint: "IBS — bloating & loose stools",
      status: "follow-up",
    },
    {
      patient: "Nadia Khan",
      date: "Jun 5, 11:00 AM",
      complaint: "Migraine — throbbing left side",
      status: "case-taken",
    },
  ],
};

// ─── Date filter helpers (mirrors AdminDashboard) ─────────────────────────

type DateFilterOption =
  | "Custom Range"
  | "Next 30 Days"
  | "Next 7 Days"
  | "Tomorrow"
  | "Today"
  | "Yesterday"
  | "Last 7 Days"
  | "Last 30 Days"
  | "This Month"
  | "Last Month"
  | "This Month Last Year"
  | "This Year Last Year";

const DATE_FILTER_OPTIONS: DateFilterOption[] = [
  "Custom Range",
  "Next 30 Days",
  "Next 7 Days",
  "Tomorrow",
  "Today",
  "Yesterday",
  "Last 7 Days",
  "Last 30 Days",
  "This Month",
  "Last Month",
  "This Month Last Year",
  "This Year Last Year",
];

function getDateRange(
  option: DateFilterOption,
): { from: Date; to: Date } | null {
  const now = new Date();
  const today = startOfDay(now);
  switch (option) {
    case "Today":
      return { from: today, to: endOfDay(now) };
    case "Yesterday":
      return {
        from: startOfDay(subDays(today, 1)),
        to: endOfDay(subDays(today, 1)),
      };
    case "Tomorrow":
      return {
        from: startOfDay(addDays(today, 1)),
        to: endOfDay(addDays(today, 1)),
      };
    case "Last 7 Days":
      return { from: startOfDay(subDays(today, 6)), to: endOfDay(today) };
    case "Next 7 Days":
      return { from: startOfDay(today), to: endOfDay(addDays(today, 6)) };
    case "Last 30 Days":
      return { from: startOfDay(subDays(today, 29)), to: endOfDay(today) };
    case "Next 30 Days":
      return { from: startOfDay(today), to: endOfDay(addDays(today, 29)) };
    case "This Month":
      return { from: startOfMonth(today), to: endOfMonth(today) };
    case "Last Month": {
      const lm = subMonths(today, 1);
      return { from: startOfMonth(lm), to: endOfMonth(lm) };
    }
    case "This Month Last Year": {
      const tml = subYears(today, 1);
      return { from: startOfMonth(tml), to: endOfMonth(tml) };
    }
    case "This Year Last Year": {
      const tyl = subYears(today, 1);
      return { from: startOfYear(tyl), to: endOfYear(tyl) };
    }
    default:
      return null;
  }
}

function fmtRange(range: { from: Date; to: Date }): string {
  if (format(range.from, "yyyy-MM-dd") === format(range.to, "yyyy-MM-dd"))
    return format(range.from, "MMM d, yyyy");
  return `${format(range.from, "MMM d")} – ${format(range.to, "MMM d, yyyy")}`;
}

// ─── Dummy records for stat card computation ──────────────────────────────

function generateDoctorDummyData() {
  const appts: { date: string; type: string; status: string }[] = [];
  const patients: { id: string; createdAt: string }[] = [];
  const usedIds = new Set<string>();
  const now = new Date();

  for (let d = -730; d <= 60; d++) {
    const dateStr = format(addDays(now, d), "yyyy-MM-dd");
    const dow = addDays(now, d).getDay();
    const count =
      (dow === 0 || dow === 6 ? 3 : 7) + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
      const types = ["Consultation", "Follow Up", "Case Taking"];
      const statuses = ["pending", "completed", "cancelled"];
      appts.push({
        date: dateStr,
        type: types[Math.floor(Math.random() * types.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
      });
    }
  }

  for (let d = -730; d <= 30; d++) {
    const dateStr = format(addDays(now, d), "yyyy-MM-dd");
    const count = Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
      const pid = `doc-p-${d}-${i}`;
      if (!usedIds.has(pid)) {
        usedIds.add(pid);
        patients.push({ id: pid, createdAt: dateStr });
      }
    }
  }

  return { appts, patients };
}

const { appts: doctorAppts, patients: doctorPatients } =
  generateDoctorDummyData();

function computeDoctorStats(range: { from: Date; to: Date }) {
  const inRange = (d: string) =>
    isWithinInterval(parseISO(d), { start: range.from, end: range.to });
  const apptCount = doctorAppts.filter((a) => inRange(a.date)).length;
  const casesTaken = doctorAppts.filter(
    (a) => inRange(a.date) && a.type === "Case Taking",
  ).length;
  const openCases = Math.round(apptCount * 0.14);
  const newRegs = doctorPatients.filter((p) => inRange(p.createdAt)).length;
  const totalPatients = 248 + Math.floor(apptCount * 0.04);
  return { apptCount, totalPatients, casesTaken, openCases, newRegs };
}

// ─── Status badge helpers ─────────────────────────────────────────────────

function queueStatusBadge(status: string) {
  switch (status) {
    case "completed":
      return "bg-green-500/15 text-green-400 border-green-500/25";
    case "cancelled":
      return "bg-red-500/15 text-red-400 border-red-500/25";
    default:
      return "bg-amber-500/15 text-amber-400 border-amber-500/25";
  }
}

function caseStatusBadge(status: string) {
  return status === "case-taken"
    ? "bg-purple-500/15 text-purple-400 border-purple-500/25"
    : "bg-teal-500/15 text-teal-400 border-teal-500/25";
}

// ─── Component ────────────────────────────────────────────────────────────

export function DoctorDashboard() {
  const { accentColor } = useAppStore();

  const accentOklch =
    accentColor === "teal"
      ? "oklch(0.65 0.15 185)"
      : accentColor === "purple"
        ? "oklch(0.65 0.18 290)"
        : accentColor === "rose"
          ? "oklch(0.65 0.18 10)"
          : accentColor === "amber"
            ? "oklch(0.70 0.16 75)"
            : accentColor === "sky"
              ? "oklch(0.65 0.15 220)"
              : accentColor === "violet"
                ? "oklch(0.60 0.20 270)"
                : "oklch(0.65 0.15 185)";

  const barAccent =
    accentColor === "teal"
      ? "oklch(0.65 0.15 190)"
      : accentColor === "purple"
        ? "oklch(0.65 0.18 285)"
        : accentColor === "rose"
          ? "oklch(0.65 0.18 15)"
          : accentColor === "amber"
            ? "oklch(0.68 0.16 80)"
            : accentColor === "sky"
              ? "oklch(0.65 0.15 215)"
              : accentColor === "violet"
                ? "oklch(0.62 0.20 265)"
                : "oklch(0.65 0.15 190)";

  const [visitPeriod, setVisitPeriod] = useState<"3M" | "6M" | "1Y">("6M");
  const [apptPeriod, setApptPeriod] = useState<
    "Daily" | "Weekly" | "Monthly" | "Yearly"
  >("Weekly");
  const [queuePeriod, setQueuePeriod] = useState<
    "Today" | "Tomorrow" | "This Week"
  >("Today");
  const [casesPeriod, setCasesPeriod] = useState<
    "Today" | "This Week" | "This Month"
  >("Today");

  const [dateFilterOpen, setDateFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] =
    useState<DateFilterOption>("Today");
  const [customRange, setCustomRange] = useState<DateRange | undefined>(
    undefined,
  );
  const [showCustomCalendar, setShowCustomCalendar] = useState(false);
  const dateFilterRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStart = useRef<Date | null>(null);

  const activeDateRange = ((): { from: Date; to: Date } | null => {
    if (
      selectedFilter === "Custom Range" &&
      customRange?.from &&
      customRange?.to
    )
      return {
        from: startOfDay(customRange.from),
        to: endOfDay(customRange.to),
      };
    return getDateRange(selectedFilter);
  })();

  const filteredStats = activeDateRange
    ? computeDoctorStats(activeDateRange)
    : null;

  const filterButtonLabel = ((): string => {
    if (
      selectedFilter === "Custom Range" &&
      customRange?.from &&
      customRange?.to
    )
      return fmtRange({ from: customRange.from, to: customRange.to });
    return selectedFilter;
  })();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dateFilterRef.current &&
        !dateFilterRef.current.contains(e.target as Node)
      ) {
        setDateFilterOpen(false);
        setShowCustomCalendar(false);
      }
    }
    if (dateFilterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [dateFilterOpen]);

  useEffect(() => {
    function handleMouseUp() {
      if (isDragging.current) {
        isDragging.current = false;
        dragStart.current = null;
        if (customRange?.from && customRange?.to) {
          setSelectedFilter("Custom Range");
          setDateFilterOpen(false);
          setShowCustomCalendar(false);
        }
      }
    }
    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, [customRange]);

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      data-ocid="doctor-dashboard"
    >
      {/* Header row */}
      <motion.div
        variants={itemVariants}
        className="flex items-start justify-between gap-4 flex-wrap"
      >
        <PageHeader
          title="My Dashboard"
          description="Good morning, Doctor. Here's your schedule and case summary."
          breadcrumb={[{ label: "Dashboard" }]}
        />
        <div className="ml-auto flex items-center gap-2 flex-wrap">
          <div className="relative" ref={dateFilterRef}>
            <button
              type="button"
              onClick={() => {
                setDateFilterOpen((v) => !v);
                setShowCustomCalendar(false);
              }}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-white/15 text-muted-foreground hover:text-foreground hover:border-white/30 transition-all"
              data-ocid="doctor.date_filter_button"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              {filterButtonLabel}
            </button>
            <AnimatePresence>
              {dateFilterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 rounded-xl border border-white/15 bg-card/95 backdrop-blur-xl shadow-2xl z-50 overflow-hidden"
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    width: showCustomCalendar ? "auto" : "14rem",
                  }}
                >
                  <div className="flex flex-col" style={{ minWidth: "14rem" }}>
                    {DATE_FILTER_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          if (opt === "Custom Range") {
                            setShowCustomCalendar(true);
                          } else {
                            setSelectedFilter(opt);
                            setDateFilterOpen(false);
                            setShowCustomCalendar(false);
                          }
                        }}
                        className={`w-full text-left px-4 py-2 text-xs transition-colors ${
                          selectedFilter === opt && !showCustomCalendar
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                        }`}
                        data-ocid={`doctor.date_filter.option.${opt.toLowerCase().replace(/\s+/g, "_")}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  {showCustomCalendar && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-3 border-l border-white/10"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-foreground">
                          Select Range
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowCustomCalendar(false)}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          Close
                        </button>
                      </div>
                      <div
                        onMouseDown={(e) => {
                          const dayBtn = (e.target as HTMLElement).closest(
                            "[data-day]",
                          ) as HTMLElement | null;
                          if (dayBtn) {
                            const d = new Date(
                              dayBtn.getAttribute("data-day") ?? "",
                            );
                            isDragging.current = true;
                            dragStart.current = d;
                            setCustomRange({ from: d, to: d });
                          }
                        }}
                        onMouseMove={(e) => {
                          if (!isDragging.current || !dragStart.current) return;
                          const dayBtn = (e.target as HTMLElement).closest(
                            "[data-day]",
                          ) as HTMLElement | null;
                          if (dayBtn) {
                            const end = new Date(
                              dayBtn.getAttribute("data-day") ?? "",
                            );
                            const start = dragStart.current;
                            setCustomRange(
                              start <= end
                                ? { from: start, to: end }
                                : { from: end, to: start },
                            );
                          }
                        }}
                      >
                        <DayPicker
                          mode="range"
                          selected={customRange}
                          onSelect={(range) => {
                            setCustomRange(range);
                            if (range?.from && range?.to) {
                              setSelectedFilter("Custom Range");
                              setDateFilterOpen(false);
                              setShowCustomCalendar(false);
                            }
                          }}
                          numberOfMonths={2}
                          className="rdp-custom"
                        />
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {(selectedFilter !== "Today" || customRange) && (
            <button
              type="button"
              onClick={() => {
                setSelectedFilter("Today");
                setCustomRange(undefined);
                setDateFilterOpen(false);
                setShowCustomCalendar(false);
              }}
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full border border-red-400/20 text-red-400/80 hover:text-red-400 hover:border-red-400/40 hover:bg-red-400/10 transition-all"
              data-ocid="doctor.clear_filter_button"
            >
              <X className="w-3 h-3" />
              Clear Filter
            </button>
          )}
        </div>
      </motion.div>

      {/* Row 1 – Stat Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
      >
        <StatCard
          title="Today's Appointments"
          value={filteredStats?.apptCount ?? 12}
          change={4}
          icon={<Calendar className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          title="Total Patients"
          value={filteredStats?.totalPatients ?? 248}
          change={6}
          icon={<Users className="w-5 h-5" />}
          color="teal"
        />
        <StatCard
          title="Cases Taken Today"
          value={filteredStats?.casesTaken ?? 8}
          change={2}
          icon={<ClipboardList className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title="Open Cases"
          value={filteredStats?.openCases ?? 34}
          change={-2}
          icon={<AlertCircle className="w-5 h-5" />}
          color="rose"
        />
        <StatCard
          title="New Registrations"
          value={filteredStats?.newRegs ?? 5}
          change={1}
          icon={<UserPlus className="w-5 h-5" />}
          color="green"
        />
      </motion.div>

      {/* Row 2 – Charts */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-5 gap-4"
      >
        {/* Patient Visit Trend – 60% */}
        <div
          className="lg:col-span-3 glass-card p-5"
          data-ocid="doctor-visit-trend-chart"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-foreground">
                Patient Visit Trend
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {visitPeriod === "3M"
                  ? "Last 3 months"
                  : visitPeriod === "6M"
                    ? "Last 6 months"
                    : "Last 12 months"}
              </p>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
              +18%
            </span>
          </div>
          <div className="flex gap-2 mb-4">
            {(["3M", "6M", "1Y"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setVisitPeriod(p)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                  visitPeriod === p
                    ? "bg-primary/20 text-primary border-primary/40 ring-1 ring-primary/30"
                    : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/25 hover:text-foreground"
                }`}
                data-ocid={`doctor.visit_toggle.${p.toLowerCase()}`}
              >
                {p}
              </button>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={VISIT_TREND_DATA[visitPeriod]}
              margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.06)"
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<GlassTooltip />} />
              <Line
                type="monotone"
                dataKey="visits"
                name="Visits"
                stroke={accentOklch}
                strokeWidth={2.5}
                dot={{ fill: accentOklch, r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: accentOklch, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Appointment Volume – 40% */}
        <div
          className="lg:col-span-2 glass-card p-5"
          data-ocid="doctor-appt-volume-chart"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-foreground">
                Appointment Volume
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {apptPeriod === "Daily"
                  ? "Today"
                  : apptPeriod === "Weekly"
                    ? "This week"
                    : apptPeriod === "Monthly"
                      ? "This month"
                      : "This year"}
              </p>
            </div>
          </div>
          <div className="flex gap-2 mb-4 flex-wrap">
            {(["Daily", "Weekly", "Monthly", "Yearly"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setApptPeriod(p)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                  apptPeriod === p
                    ? "bg-primary/20 text-primary border-primary/40 ring-1 ring-primary/30"
                    : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/25 hover:text-foreground"
                }`}
                data-ocid={`doctor.appt_toggle.${p.toLowerCase()}`}
              >
                {p}
              </button>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={APPT_VOLUME_DATA[apptPeriod]}
              margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.06)"
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<GlassTooltip />} />
              <Bar
                dataKey="appointments"
                name="Appointments"
                fill={barAccent}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Row 3 – Queue + Recent Cases */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-5 gap-4"
      >
        {/* Appointment Queue – 60% */}
        <div
          className="lg:col-span-3 glass-card p-5"
          data-ocid="doctor-appt-queue"
        >
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="font-display font-semibold text-foreground">
              Today's Appointment Queue
            </h3>
            <div className="flex gap-1.5">
              {(["Today", "Tomorrow", "This Week"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setQueuePeriod(p)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                    queuePeriod === p
                      ? "bg-primary/20 text-primary border-primary/40 ring-1 ring-primary/30"
                      : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/25 hover:text-foreground"
                  }`}
                  data-ocid={`doctor.queue_toggle.${p.toLowerCase().replace(" ", "_")}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {["Time", "Patient", "Type", "OP/Online", "Status"].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left text-xs font-semibold text-muted-foreground py-2 pr-3 last:pr-0"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {APPT_QUEUE_DATA[queuePeriod].map((row, i) => (
                  <tr
                    key={`${row.time}-${row.patient}`}
                    className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                    data-ocid={`doctor.appt_queue.item.${i + 1}`}
                  >
                    <td className="py-3 pr-3 text-xs font-bold text-primary tabular-nums whitespace-nowrap">
                      {row.time}
                    </td>
                    <td className="py-3 pr-3 font-medium text-foreground whitespace-nowrap">
                      {row.patient}
                    </td>
                    <td className="py-3 pr-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {row.type}
                      </span>
                    </td>
                    <td className="py-3 pr-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border ${
                          row.mode === "Online"
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            : "bg-white/5 text-muted-foreground border-white/15"
                        }`}
                      >
                        {row.mode}
                      </span>
                    </td>
                    <td className="py-3">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full border capitalize ${queueStatusBadge(row.status)}`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Cases – 40% */}
        <div
          className="lg:col-span-2 glass-card p-5"
          data-ocid="doctor-recent-cases"
        >
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="font-display font-semibold text-foreground">
              Recent Cases
            </h3>
            <div className="flex gap-1.5">
              {(["Today", "This Week", "This Month"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setCasesPeriod(p)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                    casesPeriod === p
                      ? "bg-primary/20 text-primary border-primary/40 ring-1 ring-primary/30"
                      : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/25 hover:text-foreground"
                  }`}
                  data-ocid={`doctor.cases_toggle.${p.toLowerCase().replace(" ", "_")}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2.5">
            {RECENT_CASES_DATA[casesPeriod].map((c, i) => (
              <div
                key={`${c.patient}-${c.date}`}
                className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-smooth"
                data-ocid={`doctor.recent_case.item.${i + 1}`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-semibold text-foreground">
                    {c.patient}
                  </p>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full border whitespace-nowrap ${caseStatusBadge(c.status)}`}
                  >
                    {c.status === "case-taken" ? "Case Taken" : "Follow Up"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{c.complaint}</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  {c.date}
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
