import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
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
  Calendar,
  CalendarDays,
  CheckCircle,
  Clock,
  UserCheck,
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

// ─── Dummy data ──────────────────────────────────────────────────────────────

const APPT_TREND_DATA = {
  Daily: [
    { label: "9 AM", appointments: 3 },
    { label: "10 AM", appointments: 5 },
    { label: "11 AM", appointments: 7 },
    { label: "12 PM", appointments: 4 },
    { label: "2 PM", appointments: 6 },
    { label: "3 PM", appointments: 5 },
    { label: "4 PM", appointments: 3 },
    { label: "5 PM", appointments: 2 },
  ],
  Weekly: [
    { label: "Mon", appointments: 22 },
    { label: "Tue", appointments: 30 },
    { label: "Wed", appointments: 27 },
    { label: "Thu", appointments: 34 },
    { label: "Fri", appointments: 28 },
    { label: "Sat", appointments: 18 },
    { label: "Sun", appointments: 6 },
  ],
  Monthly: [
    { label: "Week 1", appointments: 112 },
    { label: "Week 2", appointments: 135 },
    { label: "Week 3", appointments: 121 },
    { label: "Week 4", appointments: 148 },
  ],
  Yearly: [
    { label: "Jan", appointments: 420 },
    { label: "Feb", appointments: 465 },
    { label: "Mar", appointments: 510 },
    { label: "Apr", appointments: 548 },
    { label: "May", appointments: 532 },
    { label: "Jun", appointments: 580 },
    { label: "Jul", appointments: 555 },
    { label: "Aug", appointments: 598 },
    { label: "Sep", appointments: 620 },
    { label: "Oct", appointments: 603 },
    { label: "Nov", appointments: 645 },
    { label: "Dec", appointments: 672 },
  ],
};

const REG_TREND_DATA = {
  "This Week": [
    { label: "Mon", registrations: 2 },
    { label: "Tue", registrations: 5 },
    { label: "Wed", registrations: 3 },
    { label: "Thu", registrations: 4 },
    { label: "Fri", registrations: 6 },
    { label: "Sat", registrations: 2 },
    { label: "Sun", registrations: 1 },
  ],
  "This Month": [
    { label: "Week 1", registrations: 18 },
    { label: "Week 2", registrations: 24 },
    { label: "Week 3", registrations: 21 },
    { label: "Week 4", registrations: 27 },
  ],
  "3M": [
    { label: "Feb", registrations: 72 },
    { label: "Mar", registrations: 84 },
    { label: "Apr", registrations: 91 },
  ],
};

const ALL_APPTS = [
  {
    time: "08:30 AM",
    patient: "Arjun Sharma",
    type: "Consultation",
    mode: "OP" as const,
    doctor: "Dr. Anjali Sharma",
    status: "completed" as const,
  },
  {
    time: "09:00 AM",
    patient: "Fatima Al-Zahra",
    type: "Follow Up",
    mode: "Online" as const,
    doctor: "Dr. Rohan Mehta",
    status: "completed" as const,
  },
  {
    time: "09:30 AM",
    patient: "Priya Nair",
    type: "Case Taking",
    mode: "OP" as const,
    doctor: "Dr. Anjali Sharma",
    status: "checked-in" as const,
  },
  {
    time: "10:00 AM",
    patient: "Hans Mueller",
    type: "Consultation",
    mode: "OP" as const,
    doctor: "Dr. Priya Nair",
    status: "waiting" as const,
  },
  {
    time: "10:30 AM",
    patient: "Kavitha Reddy",
    type: "Follow Up",
    mode: "Online" as const,
    doctor: "Dr. Vikram Patel",
    status: "waiting" as const,
  },
  {
    time: "11:00 AM",
    patient: "Ravi Krishnan",
    type: "Consultation",
    mode: "OP" as const,
    doctor: "Dr. Rohan Mehta",
    status: "pending" as const,
  },
  {
    time: "11:30 AM",
    patient: "Sara Ahmed",
    type: "Case Taking",
    mode: "OP" as const,
    doctor: "Dr. Sunita Joshi",
    status: "pending" as const,
  },
  {
    time: "02:00 PM",
    patient: "Meera Iyer",
    type: "Follow Up",
    mode: "Online" as const,
    doctor: "Dr. Anjali Sharma",
    status: "pending" as const,
  },
  {
    time: "02:30 PM",
    patient: "Aditya Gupta",
    type: "Consultation",
    mode: "OP" as const,
    doctor: "Dr. Vikram Patel",
    status: "pending" as const,
  },
  {
    time: "03:00 PM",
    patient: "Isabella Rossi",
    type: "Case Taking",
    mode: "Online" as const,
    doctor: "Dr. Priya Nair",
    status: "pending" as const,
  },
];

const PENDING_CONFIRMATIONS = [
  {
    patient: "Sunita Verma",
    time: "10:00 AM",
    date: "Today",
    doctor: "Dr. Vikram Patel",
    type: "Follow Up",
  },
  {
    patient: "Deepak Joshi",
    time: "11:30 AM",
    date: "Today",
    doctor: "Dr. Anjali Sharma",
    type: "Consultation",
  },
  {
    patient: "Lakshmi Das",
    time: "02:00 PM",
    date: "Today",
    doctor: "Dr. Rohan Mehta",
    type: "Case Taking",
  },
  {
    patient: "Vinod Patel",
    time: "09:30 AM",
    date: "Tomorrow",
    doctor: "Dr. Sunita Joshi",
    type: "Consultation",
  },
  {
    patient: "Rekha Sharma",
    time: "03:30 PM",
    date: "Tomorrow",
    doctor: "Dr. Priya Nair",
    type: "Follow Up",
  },
];

// ─── Date filter types ───────────────────────────────────────────────────────

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

function getDateRangeForFilter(
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
    case "Custom Range":
      return null;
    default:
      return null;
  }
}

function formatDateRangeLabel(range: { from: Date; to: Date }): string {
  if (format(range.from, "yyyy-MM-dd") === format(range.to, "yyyy-MM-dd")) {
    return format(range.from, "MMM d, yyyy");
  }
  return `${format(range.from, "MMM d")} – ${format(range.to, "MMM d, yyyy")}`;
}

function generateDummyReceptionData() {
  const records: {
    date: string;
    appts: number;
    walkins: number;
    regs: number;
    checkins: number;
    waiting: number;
  }[] = [];
  const today = new Date();
  for (let d = -730; d <= 60; d++) {
    const date = format(addDays(today, d), "yyyy-MM-dd");
    const dow = addDays(today, d).getDay();
    const base = dow === 0 || dow === 6 ? 5 : 12;
    const appts = base + Math.floor(Math.random() * 8);
    records.push({
      date,
      appts,
      walkins: Math.floor(Math.random() * 4),
      regs: Math.floor(Math.random() * 3),
      checkins: Math.floor(appts * 0.65),
      waiting: Math.floor(appts * 0.15),
    });
  }
  return records;
}

const DUMMY_RECORDS = generateDummyReceptionData();

function computeFilteredStats(range: { from: Date; to: Date }) {
  const inRange = DUMMY_RECORDS.filter((r) => {
    const d = parseISO(r.date);
    return isWithinInterval(d, { start: range.from, end: range.to });
  });
  return {
    appointments: inRange.reduce((s, r) => s + r.appts, 0),
    checkedIn: inRange.reduce((s, r) => s + r.checkins, 0),
    waiting: inRange.reduce((s, r) => s + r.waiting, 0),
    newRegistrations: inRange.reduce((s, r) => s + r.regs, 0),
    walkIns: inRange.reduce((s, r) => s + r.walkins, 0),
  };
}

// ─── Status helpers ──────────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, string> = {
  completed: "bg-green-500/15 text-green-400 border-green-500/25",
  "checked-in": "bg-teal-500/15 text-teal-400 border-teal-500/25",
  waiting: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  pending: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  cancelled: "bg-rose-500/15 text-rose-400 border-rose-500/25",
};

const STATUS_LABEL: Record<string, string> = {
  completed: "Completed",
  "checked-in": "Checked In",
  waiting: "Waiting",
  pending: "Pending",
  cancelled: "Cancelled",
};

function getSessionSlot(time: string): "morning" | "afternoon" {
  const hour = Number.parseInt(time.split(":")[0]);
  const isPM = time.includes("PM");
  const h24 = isPM && hour !== 12 ? hour + 12 : hour;
  return h24 < 12 ? "morning" : "afternoon";
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ReceptionistDashboard() {
  const [apptPeriod, setApptPeriod] = useState<
    "Daily" | "Weekly" | "Monthly" | "Yearly"
  >("Weekly");
  const [regPeriod, setRegPeriod] = useState<"This Week" | "This Month" | "3M">(
    "This Week",
  );
  const [queueSession, setQueueSession] = useState<
    "Morning" | "Afternoon" | "All Day"
  >("All Day");
  const [checkedIn, setCheckedIn] = useState<Set<number>>(new Set());
  const [confirmActions, setConfirmActions] = useState<
    Record<number, "confirmed" | "cancelled">
  >({});

  // Date filter state
  const [dateFilterOpen, setDateFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] =
    useState<DateFilterOption>("Today");
  const [customRange, setCustomRange] = useState<DateRange | undefined>();
  const [showCustomCalendar, setShowCustomCalendar] = useState(false);
  const dateFilterRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStart = useRef<Date | null>(null);

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

  const activeDateRange = ((): { from: Date; to: Date } | null => {
    if (
      selectedFilter === "Custom Range" &&
      customRange?.from &&
      customRange?.to
    ) {
      return {
        from: startOfDay(customRange.from),
        to: endOfDay(customRange.to),
      };
    }
    return getDateRangeForFilter(selectedFilter);
  })();

  const filteredStats = activeDateRange
    ? computeFilteredStats(activeDateRange)
    : null;

  const filterButtonLabel = ((): string => {
    if (
      selectedFilter === "Custom Range" &&
      customRange?.from &&
      customRange?.to
    ) {
      return formatDateRangeLabel({
        from: customRange.from,
        to: customRange.to,
      });
    }
    return selectedFilter;
  })();

  const defaultStats = {
    appointments: 24,
    checkedIn: 18,
    waiting: 6,
    newRegistrations: 4,
    walkIns: 3,
  };
  const stats = filteredStats ?? defaultStats;

  const filteredQueue = ALL_APPTS.filter((a) => {
    if (queueSession === "All Day") return true;
    const slot = getSessionSlot(a.time);
    return (
      (queueSession === "Morning" && slot === "morning") ||
      (queueSession === "Afternoon" && slot === "afternoon")
    );
  });

  function handleCheckIn(idx: number) {
    setCheckedIn((prev) => {
      const next = new Set(prev);
      next.add(idx);
      return next;
    });
  }

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      data-ocid="receptionist-dashboard"
    >
      <motion.div variants={itemVariants}>
        <PageHeader
          title="Front Desk"
          description="Manage appointments, walk-ins, and patient registrations for today."
          breadcrumb={[{ label: "Dashboard" }]}
        />
      </motion.div>

      {/* Header row: date filter */}
      <motion.div
        variants={itemVariants}
        className="flex items-center justify-end gap-2 flex-wrap"
      >
        <div className="relative" ref={dateFilterRef}>
          <button
            type="button"
            onClick={() => {
              setDateFilterOpen((v) => !v);
              setShowCustomCalendar(false);
            }}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-white/15 text-muted-foreground hover:text-foreground hover:border-white/30 transition-all"
            data-ocid="receptionist.date_filter_button"
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
                      data-ocid={`receptionist.date_filter.option.${opt.toLowerCase().replace(/\s+/g, "_")}`}
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
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <span className="text-xs">Close</span>
                      </button>
                    </div>
                    <div
                      onMouseDown={(e) => {
                        const target = e.target as HTMLElement;
                        const dayBtn = target.closest(
                          "[data-day]",
                        ) as HTMLElement | null;
                        if (dayBtn) {
                          const dayAttr = dayBtn.getAttribute("data-day");
                          if (dayAttr) {
                            const day = new Date(dayAttr);
                            isDragging.current = true;
                            dragStart.current = day;
                            setCustomRange({ from: day, to: day });
                          }
                        }
                      }}
                      onMouseMove={(e) => {
                        if (!isDragging.current || !dragStart.current) return;
                        const target = e.target as HTMLElement;
                        const dayBtn = target.closest(
                          "[data-day]",
                        ) as HTMLElement | null;
                        if (dayBtn) {
                          const dayAttr = dayBtn.getAttribute("data-day");
                          if (dayAttr) {
                            const end = new Date(dayAttr);
                            const start = dragStart.current;
                            if (start <= end) {
                              setCustomRange({ from: start, to: end });
                            } else {
                              setCustomRange({ from: end, to: start });
                            }
                          }
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
            data-ocid="receptionist.clear_filter_button"
          >
            <X className="w-3 h-3" />
            Clear Filter
          </button>
        )}
      </motion.div>

      {/* Stat Cards — Row 1 (5 cards) */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
      >
        <StatCard
          title="Appointments Today"
          value={stats.appointments}
          change={4}
          icon={<Calendar className="w-5 h-5" />}
          color="teal"
        />
        <StatCard
          title="Checked In"
          value={stats.checkedIn}
          change={8}
          icon={<CheckCircle className="w-5 h-5" />}
          color="green"
        />
        <StatCard
          title="Waiting Now"
          value={stats.waiting}
          icon={<Clock className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title="New Registrations Today"
          value={stats.newRegistrations}
          change={3}
          icon={<UserPlus className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          title="Walk-Ins Today"
          value={stats.walkIns}
          change={1}
          icon={<UserCheck className="w-5 h-5" />}
          color="rose"
        />
      </motion.div>

      {/* Charts Row */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-5 gap-4"
      >
        {/* Daily Appointment Trend — 60% */}
        <div
          className="lg:col-span-3 glass-card p-5"
          data-ocid="receptionist-appt-trend-chart"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-foreground">
                Daily Appointment Trend
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {apptPeriod === "Daily"
                  ? "Today by hour"
                  : apptPeriod === "Weekly"
                    ? "This week"
                    : apptPeriod === "Monthly"
                      ? "This month"
                      : "This year"}
              </p>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
              {apptPeriod}
            </span>
          </div>
          <div className="flex gap-2 mb-4">
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
                data-ocid={`receptionist.appt_trend_toggle.${p.toLowerCase()}`}
              >
                {p}
              </button>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={APPT_TREND_DATA[apptPeriod]}
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
                fill="oklch(0.65 0.16 195)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Registration Trend — 40% */}
        <div
          className="lg:col-span-2 glass-card p-5"
          data-ocid="receptionist-reg-trend-chart"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-foreground">
                Registration Trend
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                New patient registrations
              </p>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
              +12%
            </span>
          </div>
          <div className="flex gap-2 mb-4">
            {(["This Week", "This Month", "3M"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setRegPeriod(p)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                  regPeriod === p
                    ? "bg-primary/20 text-primary border-primary/40 ring-1 ring-primary/30"
                    : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/25 hover:text-foreground"
                }`}
                data-ocid={`receptionist.reg_trend_toggle.${p.toLowerCase().replace(" ", "_")}`}
              >
                {p}
              </button>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart
              data={REG_TREND_DATA[regPeriod]}
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
              <Line
                type="monotone"
                dataKey="registrations"
                name="Registrations"
                stroke="oklch(0.65 0.18 280)"
                strokeWidth={2.5}
                dot={{ fill: "oklch(0.65 0.18 280)", r: 3, strokeWidth: 0 }}
                activeDot={{
                  r: 5,
                  fill: "oklch(0.65 0.18 280)",
                  strokeWidth: 0,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Row 3: Queue + Pending Confirmations */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
      >
        {/* Today's Appointment Queue — 65% */}
        <div
          className="lg:col-span-2 glass-card p-5"
          data-ocid="receptionist-appt-queue"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-foreground">
                Today's Appointment Queue
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {filteredQueue.length} appointments
              </p>
            </div>
            <div className="flex gap-2">
              {(["Morning", "Afternoon", "All Day"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setQueueSession(s)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                    queueSession === s
                      ? "bg-primary/20 text-primary border-primary/40 ring-1 ring-primary/30"
                      : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/25 hover:text-foreground"
                  }`}
                  data-ocid={`receptionist.queue_session_toggle.${s.toLowerCase().replace(" ", "_")}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {[
                    "Time",
                    "Patient Name",
                    "Type",
                    "OP/Online",
                    "Doctor",
                    "Status",
                    "Action",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left text-xs font-semibold text-muted-foreground py-2 pr-3 last:pr-0"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredQueue.map((row, rawIdx) => {
                  const globalIdx = ALL_APPTS.indexOf(row);
                  const isCheckedIn = checkedIn.has(globalIdx);
                  const effectiveStatus = isCheckedIn
                    ? "checked-in"
                    : row.status;
                  return (
                    <tr
                      key={`${row.time}-${row.patient}`}
                      className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                      data-ocid={`receptionist-appt.item.${rawIdx + 1}`}
                    >
                      <td className="py-3 pr-3 text-xs font-bold text-primary tabular-nums whitespace-nowrap">
                        {row.time}
                      </td>
                      <td className="py-3 pr-3 font-medium text-foreground whitespace-nowrap">
                        {row.patient}
                      </td>
                      <td className="py-3 pr-3 text-xs text-muted-foreground whitespace-nowrap">
                        {row.type}
                      </td>
                      <td className="py-3 pr-3">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                            row.mode === "OP"
                              ? "bg-teal-500/10 text-teal-400 border-teal-500/20"
                              : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          }`}
                        >
                          {row.mode}
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-xs text-muted-foreground whitespace-nowrap">
                        {row.doctor}
                      </td>
                      <td className="py-3 pr-3">
                        <span
                          className={`text-xs font-medium px-2.5 py-0.5 rounded-full border capitalize ${
                            STATUS_STYLE[effectiveStatus]
                          }`}
                        >
                          {STATUS_LABEL[effectiveStatus]}
                        </span>
                      </td>
                      <td className="py-3">
                        {effectiveStatus === "pending" ? (
                          <button
                            type="button"
                            onClick={() => handleCheckIn(globalIdx)}
                            className="text-xs px-2.5 py-1 rounded-lg bg-teal-500/15 text-teal-400 border border-teal-500/25 hover:bg-teal-500/25 transition-all"
                            data-ocid={`receptionist-checkin.item.${rawIdx + 1}`}
                          >
                            Check In
                          </button>
                        ) : (
                          <span className="text-xs text-muted-foreground/40">
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Confirmations — 35% */}
        <div
          className="glass-card p-5"
          data-ocid="receptionist-pending-confirmations"
        >
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-amber-400" />
            <h3 className="font-display font-semibold text-foreground">
              Pending Confirmations
            </h3>
            <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {
                PENDING_CONFIRMATIONS.filter((_, i) => !confirmActions[i])
                  .length
              }{" "}
              pending
            </span>
          </div>
          <div className="space-y-3">
            {PENDING_CONFIRMATIONS.map((p, i) => {
              const action = confirmActions[i];
              return (
                <div
                  key={p.patient}
                  className={`p-3 rounded-xl border transition-all ${
                    action === "confirmed"
                      ? "bg-green-500/5 border-green-500/15"
                      : action === "cancelled"
                        ? "bg-rose-500/5 border-rose-500/15 opacity-60"
                        : "bg-amber-500/5 border-amber-500/15 hover:bg-amber-500/10"
                  }`}
                  data-ocid={`receptionist-confirmation.item.${i + 1}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {p.patient}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {p.date} · {p.time}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {p.doctor}
                      </p>
                      <span className="text-[10px] font-medium text-primary/70">
                        {p.type}
                      </span>
                    </div>
                    {action ? (
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          action === "confirmed"
                            ? "bg-green-500/15 text-green-400"
                            : "bg-rose-500/15 text-rose-400"
                        }`}
                      >
                        {action === "confirmed" ? "✓ Confirmed" : "✕ Cancelled"}
                      </span>
                    ) : (
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            setConfirmActions((prev) => ({
                              ...prev,
                              [i]: "confirmed",
                            }))
                          }
                          className="text-[10px] px-2 py-1 rounded-lg bg-green-500/15 text-green-400 border border-green-500/25 hover:bg-green-500/25 transition-all"
                          data-ocid={`receptionist.confirm_button.${i + 1}`}
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setConfirmActions((prev) => ({
                              ...prev,
                              [i]: "cancelled",
                            }))
                          }
                          className="text-[10px] px-2 py-1 rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/25 hover:bg-rose-500/25 transition-all"
                          data-ocid={`receptionist.cancel_button.${i + 1}`}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
