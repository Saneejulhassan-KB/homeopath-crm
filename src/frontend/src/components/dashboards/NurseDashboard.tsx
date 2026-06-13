import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { useAppStore } from "@/store";
import { ACCENT_COLOR_MAP } from "@/utils/accentColors";
import {
  addDays,
  endOfDay,
  endOfMonth,
  endOfYear,
  startOfDay,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
  subYears,
} from "date-fns";
import {
  Activity,
  CalendarDays,
  CheckSquare,
  ClipboardList,
  FlaskConical,
  Leaf,
  Package,
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
import { GlassTooltip, containerVariants, itemVariants } from "./shared";

// ── Types ─────────────────────────────────────────────────────────────────
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

type TaskPriority = "Urgent" | "Normal";
type TaskStatus = "Pending" | "In Progress" | "Completed";

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

const STATS_BY_FILTER: Record<
  string,
  {
    prep: number;
    completed: number;
    pending: number;
    stock: number;
    medicines: number;
  }
> = {
  Today: { prep: 18, completed: 11, pending: 7, stock: 4, medicines: 23 },
  Yesterday: { prep: 16, completed: 14, pending: 2, stock: 2, medicines: 20 },
  Tomorrow: { prep: 20, completed: 0, pending: 20, stock: 5, medicines: 0 },
  "Last 7 Days": {
    prep: 98,
    completed: 72,
    pending: 26,
    stock: 18,
    medicines: 140,
  },
  "Last 30 Days": {
    prep: 420,
    completed: 310,
    pending: 110,
    stock: 64,
    medicines: 590,
  },
  "Next 7 Days": {
    prep: 22,
    completed: 0,
    pending: 22,
    stock: 6,
    medicines: 0,
  },
  "Next 30 Days": {
    prep: 80,
    completed: 0,
    pending: 80,
    stock: 20,
    medicines: 0,
  },
  "This Month": {
    prep: 385,
    completed: 290,
    pending: 95,
    stock: 58,
    medicines: 540,
  },
  "Last Month": {
    prep: 398,
    completed: 305,
    pending: 93,
    stock: 61,
    medicines: 556,
  },
  "This Month Last Year": {
    prep: 360,
    completed: 280,
    pending: 80,
    stock: 50,
    medicines: 490,
  },
  "This Year Last Year": {
    prep: 4320,
    completed: 3350,
    pending: 970,
    stock: 640,
    medicines: 6200,
  },
  "Custom Range": {
    prep: 55,
    completed: 42,
    pending: 13,
    stock: 12,
    medicines: 78,
  },
};

// ── Chart Data ───────────────────────────────────────────────────────────
const TASK_TREND_DATA: Record<
  string,
  { label: string; assigned: number; completed: number }[]
> = {
  "This Week": [
    { label: "Mon", assigned: 18, completed: 15 },
    { label: "Tue", assigned: 20, completed: 18 },
    { label: "Wed", assigned: 22, completed: 19 },
    { label: "Thu", assigned: 17, completed: 14 },
    { label: "Fri", assigned: 21, completed: 17 },
    { label: "Sat", assigned: 12, completed: 11 },
    { label: "Sun", assigned: 8, completed: 7 },
  ],
  "This Month": [
    { label: "Week 1", assigned: 85, completed: 72 },
    { label: "Week 2", assigned: 92, completed: 80 },
    { label: "Week 3", assigned: 88, completed: 75 },
    { label: "Week 4", assigned: 95, completed: 83 },
  ],
  "3M": [
    { label: "Feb", assigned: 340, completed: 298 },
    { label: "Mar", assigned: 372, completed: 325 },
    { label: "Apr", assigned: 395, completed: 351 },
  ],
};

const REMEDY_CATEGORY_DATA: Record<string, { label: string; count: number }[]> =
  {
    Daily: [
      { label: "Dilutions", count: 8 },
      { label: "Tinctures", count: 5 },
      { label: "Biochemics", count: 6 },
      { label: "Triturations", count: 4 },
    ],
    Weekly: [
      { label: "Dilutions", count: 52 },
      { label: "Tinctures", count: 38 },
      { label: "Biochemics", count: 45 },
      { label: "Triturations", count: 29 },
    ],
    Monthly: [
      { label: "Dilutions", count: 210 },
      { label: "Tinctures", count: 158 },
      { label: "Biochemics", count: 185 },
      { label: "Triturations", count: 122 },
    ],
  };

// ── Preparation Queue ────────────────────────────────────────────────────
const ALL_PREP_TASKS: {
  task: string;
  patient: string;
  doctor: string;
  remedy: string;
  priority: TaskPriority;
  status: TaskStatus;
}[] = [
  {
    task: "Prepare Arnica 30C",
    patient: "Aarav Mehta",
    doctor: "Dr. Anjali Sharma",
    remedy: "Arnica Montana 30C",
    priority: "Urgent",
    status: "In Progress",
  },
  {
    task: "Prepare Belladonna 200C",
    patient: "Sneha Iyer",
    doctor: "Dr. Rohan Mehta",
    remedy: "Belladonna 200C",
    priority: "Normal",
    status: "Pending",
  },
  {
    task: "Prepare Nux Vomica 1M",
    patient: "Ravi Kumar",
    doctor: "Dr. Vikram Patel",
    remedy: "Nux Vomica 1M",
    priority: "Urgent",
    status: "Pending",
  },
  {
    task: "Prepare Pulsatilla 30C",
    patient: "Meena Pillai",
    doctor: "Dr. Anjali Sharma",
    remedy: "Pulsatilla 30C",
    priority: "Normal",
    status: "Completed",
  },
  {
    task: "Prepare Sulphur 200C",
    patient: "Arjun Bhat",
    doctor: "Dr. Priya Nair",
    remedy: "Sulphur 200C",
    priority: "Normal",
    status: "Completed",
  },
  {
    task: "Prepare Calc Carb 1M",
    patient: "Divya Sharma",
    doctor: "Dr. Rohan Mehta",
    remedy: "Calcarea Carbonica 1M",
    priority: "Urgent",
    status: "In Progress",
  },
  {
    task: "Prepare Lycopodium 30C",
    patient: "Suresh Nair",
    doctor: "Dr. Priya Nair",
    remedy: "Lycopodium 30C",
    priority: "Normal",
    status: "Pending",
  },
  {
    task: "Prepare Natrum Mur 200C",
    patient: "Kavitha Reddy",
    doctor: "Dr. Vikram Patel",
    remedy: "Natrum Muriaticum 200C",
    priority: "Normal",
    status: "Pending",
  },
  {
    task: "Prepare Phosphorus 30C",
    patient: "Mohan Krishnan",
    doctor: "Dr. Anjali Sharma",
    remedy: "Phosphorus 30C",
    priority: "Urgent",
    status: "Pending",
  },
  {
    task: "Prepare Rhus Tox 1M",
    patient: "Lakshmi Menon",
    doctor: "Dr. Rohan Mehta",
    remedy: "Rhus Toxicodendron 1M",
    priority: "Normal",
    status: "Completed",
  },
];

const TOMORROW_TASKS: typeof ALL_PREP_TASKS = [
  {
    task: "Prepare Aconite 30C",
    patient: "Vijay Shetty",
    doctor: "Dr. Anjali Sharma",
    remedy: "Aconitum Napellus 30C",
    priority: "Urgent",
    status: "Pending",
  },
  {
    task: "Prepare Bryonia 200C",
    patient: "Anjali Nayak",
    doctor: "Dr. Priya Nair",
    remedy: "Bryonia Alba 200C",
    priority: "Normal",
    status: "Pending",
  },
  {
    task: "Prepare Ignatia 1M",
    patient: "Prasad Rao",
    doctor: "Dr. Vikram Patel",
    remedy: "Ignatia Amara 1M",
    priority: "Normal",
    status: "Pending",
  },
  {
    task: "Prepare Sepia 30C",
    patient: "Uma Devi",
    doctor: "Dr. Rohan Mehta",
    remedy: "Sepia 30C",
    priority: "Normal",
    status: "Pending",
  },
  {
    task: "Prepare Mercurius 200C",
    patient: "Kishore Babu",
    doctor: "Dr. Anjali Sharma",
    remedy: "Mercurius Sol 200C",
    priority: "Urgent",
    status: "Pending",
  },
];

const THIS_WEEK_TASKS: typeof ALL_PREP_TASKS = [
  ...ALL_PREP_TASKS.slice(0, 8),
  ...TOMORROW_TASKS,
];

// ── Stock Levels ─────────────────────────────────────────────────────────
const STOCK_CATEGORIES = [
  {
    label: "Dilutions",
    count: 186,
    usageToday: 8,
    max: 250,
    icon: "💧",
    color: "bg-sky-500/15 border-sky-500/20",
    text: "text-sky-400",
    bar: "bg-sky-400",
  },
  {
    label: "Tinctures",
    count: 94,
    usageToday: 5,
    max: 150,
    icon: "🌿",
    color: "bg-green-500/15 border-green-500/20",
    text: "text-green-400",
    bar: "bg-green-400",
  },
  {
    label: "Biochemics",
    count: 62,
    usageToday: 6,
    max: 120,
    icon: "⚗️",
    color: "bg-amber-500/15 border-amber-500/20",
    text: "text-amber-400",
    bar: "bg-amber-400",
  },
  {
    label: "Triturations",
    count: 38,
    usageToday: 4,
    max: 80,
    icon: "🔬",
    color: "bg-purple-500/15 border-purple-500/20",
    text: "text-purple-400",
    bar: "bg-purple-400",
  },
];

const taskStatusStyle: Record<TaskStatus, string> = {
  Pending: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  "In Progress": "bg-blue-500/15 text-blue-400 border-blue-500/25",
  Completed: "bg-green-500/15 text-green-400 border-green-500/25",
};

const priorityStyle: Record<TaskPriority, string> = {
  Urgent: "bg-rose-500/15 text-rose-400 border-rose-500/25",
  Normal: "bg-muted/40 text-muted-foreground border-border/50",
};

// ── Helpers ───────────────────────────────────────────────────────────────
function PeriodToggle<T extends string>({
  options,
  value,
  onChange,
  prefix,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
  prefix: string;
}) {
  return (
    <div className="flex gap-1.5">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
            value === opt
              ? "bg-primary/20 text-primary border-primary/40 ring-1 ring-primary/30"
              : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/25 hover:text-foreground"
          }`}
          data-ocid={`${prefix}.${opt.toLowerCase().replace(/\s+/g, "_")}`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export function NurseDashboard() {
  const { accentColor } = useAppStore();
  const palette = ACCENT_COLOR_MAP[accentColor] ?? ACCENT_COLOR_MAP.teal;
  const chartColor1 = `oklch(${palette.primary})`;
  const chartColor2 = `oklch(${palette.light})`;

  // Date filter state
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

  // Chart period states
  const [taskTrendPeriod, setTaskTrendPeriod] = useState<
    "This Week" | "This Month" | "3M"
  >("This Week");
  const [remedyCatPeriod, setRemedyCatPeriod] = useState<
    "Daily" | "Weekly" | "Monthly"
  >("Daily");
  const [queuePeriod, setQueuePeriod] = useState<
    "Today" | "Tomorrow" | "This Week"
  >("Today");

  // Editable task statuses
  const [taskStatuses, setTaskStatuses] = useState<Record<number, TaskStatus>>(
    Object.fromEntries(ALL_PREP_TASKS.map((t, i) => [i, t.status])),
  );

  const activeStats = STATS_BY_FILTER[selectedFilter] ?? STATS_BY_FILTER.Today;

  const filterButtonLabel = (() => {
    if (
      selectedFilter === "Custom Range" &&
      customRange?.from &&
      customRange?.to
    ) {
      return `${customRange.from.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – ${customRange.to.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`;
    }
    return selectedFilter;
  })();

  const queueRows =
    queuePeriod === "Today"
      ? ALL_PREP_TASKS
      : queuePeriod === "Tomorrow"
        ? TOMORROW_TASKS
        : THIS_WEEK_TASKS;

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

  function advanceStatus(idx: number) {
    setTaskStatuses((prev) => {
      const cur = prev[idx];
      const next: TaskStatus =
        cur === "Pending"
          ? "In Progress"
          : cur === "In Progress"
            ? "Completed"
            : "Completed";
      return { ...prev, [idx]: next };
    });
  }

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      data-ocid="nurse-dashboard"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <PageHeader
          title="Nurse / Compounder"
          description="Manage remedy preparations, stock tracking, and task queue."
          breadcrumb={[{ label: "Dashboard" }]}
        />
      </motion.div>

      {/* Date Filter + Controls */}
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
            data-ocid="nurse.date_filter_button"
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
                      data-ocid={`nurse.date_filter.option.${opt.toLowerCase().replace(/\s+/g, "_")}`}
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
                        className="text-muted-foreground hover:text-foreground text-xs"
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
                          const dayAttr = dayBtn.getAttribute("data-day");
                          if (dayAttr) {
                            const d = new Date(dayAttr);
                            isDragging.current = true;
                            dragStart.current = d;
                            setCustomRange({ from: d, to: d });
                          }
                        }
                      }}
                      onMouseMove={(e) => {
                        if (!isDragging.current || !dragStart.current) return;
                        const dayBtn = (e.target as HTMLElement).closest(
                          "[data-day]",
                        ) as HTMLElement | null;
                        if (dayBtn) {
                          const dayAttr = dayBtn.getAttribute("data-day");
                          if (dayAttr) {
                            const end = new Date(dayAttr);
                            const start = dragStart.current;
                            setCustomRange(
                              start <= end
                                ? { from: start, to: end }
                                : { from: end, to: start },
                            );
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
            data-ocid="nurse.clear_filter_button"
          >
            <X className="w-3 h-3" /> Clear Filter
          </button>
        )}
      </motion.div>

      {/* Row 1 — Stat Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
      >
        <StatCard
          title="Prep Tasks Today"
          value={activeStats.prep}
          change={5}
          icon={<ClipboardList className="w-5 h-5" />}
          color="teal"
        />
        <StatCard
          title="Completed Tasks"
          value={activeStats.completed}
          change={15}
          icon={<CheckSquare className="w-5 h-5" />}
          color="green"
        />
        <StatCard
          title="Pending Remedies"
          value={activeStats.pending}
          icon={<Leaf className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title="Stock Requests"
          value={activeStats.stock}
          icon={<Package className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          title="Medicines Prepared"
          value={activeStats.medicines}
          change={8}
          icon={<FlaskConical className="w-5 h-5" />}
          color="rose"
        />
      </motion.div>

      {/* Row 2 — Charts */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-5 gap-4"
      >
        {/* Task Completion Trend — 60% width */}
        <div
          className="lg:col-span-3 glass-card p-5"
          data-ocid="nurse-task-trend-chart"
        >
          <div className="flex items-center justify-between mb-1">
            <div>
              <h3 className="font-display font-semibold text-foreground">
                Task Completion Trend
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Assigned vs Completed
              </p>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              {taskTrendPeriod}
            </span>
          </div>
          <div className="mb-4">
            <PeriodToggle
              options={["This Week", "This Month", "3M"] as const}
              value={taskTrendPeriod}
              onChange={(v) =>
                setTaskTrendPeriod(v as "This Week" | "This Month" | "3M")
              }
              prefix="nurse.task_trend"
            />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={TASK_TREND_DATA[taskTrendPeriod]}
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
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<GlassTooltip />} />
              <Line
                type="monotone"
                dataKey="assigned"
                name="Assigned"
                stroke={chartColor2}
                strokeWidth={2}
                strokeDasharray="4 2"
                dot={{ fill: chartColor2, r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: chartColor2, strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="completed"
                name="Completed"
                stroke={chartColor1}
                strokeWidth={2.5}
                dot={{ fill: chartColor1, r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: chartColor1, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div className="flex items-center gap-4 mt-2">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span
                className="w-5 h-0.5 rounded"
                style={{
                  background: chartColor2,
                  opacity: 0.7,
                  display: "inline-block",
                }}
              />
              Assigned
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span
                className="w-5 h-0.5 rounded"
                style={{ background: chartColor1, display: "inline-block" }}
              />
              Completed
            </span>
          </div>
        </div>

        {/* Remedy Preparation by Category — 40% width */}
        <div
          className="lg:col-span-2 glass-card p-5"
          data-ocid="nurse-remedy-category-chart"
        >
          <div className="flex items-center justify-between mb-1">
            <div>
              <h3 className="font-display font-semibold text-foreground">
                Remedy Prep by Category
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Count prepared
              </p>
            </div>
          </div>
          <div className="mb-4">
            <PeriodToggle
              options={["Daily", "Weekly", "Monthly"] as const}
              value={remedyCatPeriod}
              onChange={(v) =>
                setRemedyCatPeriod(v as "Daily" | "Weekly" | "Monthly")
              }
              prefix="nurse.remedy_cat"
            />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={REMEDY_CATEGORY_DATA[remedyCatPeriod]}
              margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.06)"
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<GlassTooltip />} />
              <Bar
                dataKey="count"
                name="Remedies"
                fill={chartColor1}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Row 3 — Queue + Stock */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
      >
        {/* Today's Preparation Queue — 65% */}
        <div
          className="lg:col-span-2 glass-card p-5"
          data-ocid="nurse-prep-queue"
        >
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-display font-semibold text-foreground">
              Today's Preparation Queue
            </h3>
            <span className="text-xs text-muted-foreground bg-muted/30 px-2.5 py-1 rounded-full border border-border/50">
              {queueRows.length} tasks
            </span>
          </div>
          <div className="mb-4">
            <PeriodToggle
              options={["Today", "Tomorrow", "This Week"] as const}
              value={queuePeriod}
              onChange={(v) =>
                setQueuePeriod(v as "Today" | "Tomorrow" | "This Week")
              }
              prefix="nurse.queue"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {[
                    "Task",
                    "Patient",
                    "Doctor",
                    "Remedy",
                    "Priority",
                    "Status",
                    "Action",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left text-xs font-semibold text-muted-foreground py-2 pr-3 last:pr-0 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {queueRows.map((row, i) => (
                  <tr
                    key={`${row.task}-${i}`}
                    className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                    data-ocid={`nurse-prep.item.${i + 1}`}
                  >
                    <td className="py-3 pr-3 font-medium text-foreground text-xs whitespace-nowrap">
                      {row.task}
                    </td>
                    <td className="py-3 pr-3 text-xs text-muted-foreground whitespace-nowrap">
                      {row.patient}
                    </td>
                    <td className="py-3 pr-3 text-xs text-muted-foreground whitespace-nowrap">
                      {row.doctor}
                    </td>
                    <td className="py-3 pr-3 text-xs text-foreground/80 whitespace-nowrap">
                      {row.remedy}
                    </td>
                    <td className="py-3 pr-3">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full border whitespace-nowrap ${priorityStyle[row.priority]}`}
                      >
                        {row.priority}
                      </span>
                    </td>
                    <td className="py-3 pr-3">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full border whitespace-nowrap ${taskStatusStyle[taskStatuses[ALL_PREP_TASKS.indexOf(row)] ?? row.status]}`}
                      >
                        {taskStatuses[ALL_PREP_TASKS.indexOf(row)] ??
                          row.status}
                      </span>
                    </td>
                    <td className="py-3">
                      {(taskStatuses[ALL_PREP_TASKS.indexOf(row)] ??
                        row.status) !== "Completed" ? (
                        <button
                          type="button"
                          onClick={() =>
                            advanceStatus(ALL_PREP_TASKS.indexOf(row))
                          }
                          className="text-xs px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-smooth whitespace-nowrap"
                          data-ocid={`nurse-prep.action.${i + 1}`}
                        >
                          {(taskStatuses[ALL_PREP_TASKS.indexOf(row)] ??
                            row.status) === "Pending"
                            ? "Start"
                            : "Complete"}
                        </button>
                      ) : (
                        <span className="text-xs text-green-400 font-medium">
                          ✓ Done
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stock Levels by Category — 35% */}
        <div className="glass-card p-5" data-ocid="nurse-stock-levels">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-foreground">
                Stock Levels
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                by Category
              </p>
            </div>
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <div className="space-y-4">
            {STOCK_CATEGORIES.map((cat, i) => {
              const pct = Math.round((cat.count / cat.max) * 100);
              return (
                <div
                  key={cat.label}
                  data-ocid={`nurse-stock-cat.item.${i + 1}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-8 h-8 rounded-lg border flex items-center justify-center text-base shrink-0 ${cat.color}`}
                    >
                      {cat.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-foreground">
                          {cat.label}
                        </span>
                        <span
                          className={`text-sm font-bold tabular-nums ${cat.text}`}
                        >
                          {cat.count}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-xs text-muted-foreground">
                          Used today: {cat.usageToday}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {pct}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${cat.bar}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-3 border-t border-white/10">
            <p className="text-xs text-muted-foreground">Total stock items</p>
            <p className="text-2xl font-bold font-display text-foreground mt-0.5 tabular-nums">
              {STOCK_CATEGORIES.reduce((s, c) => s + c.count, 0)}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
