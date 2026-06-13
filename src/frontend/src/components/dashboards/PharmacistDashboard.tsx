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
  AlertTriangle,
  CalendarDays,
  CheckSquare,
  FlaskConical,
  Package,
  RefreshCw,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { type DateRange, DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
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

// ─── Chart data ────────────────────────────────────────────────────────────

const DISPENSING_DATA = {
  Daily: [
    { label: "9 AM", dispensed: 3 },
    { label: "10 AM", dispensed: 6 },
    { label: "11 AM", dispensed: 4 },
    { label: "12 PM", dispensed: 7 },
    { label: "2 PM", dispensed: 5 },
    { label: "3 PM", dispensed: 4 },
    { label: "4 PM", dispensed: 3 },
    { label: "5 PM", dispensed: 2 },
  ],
  Weekly: [
    { label: "Mon", dispensed: 22 },
    { label: "Tue", dispensed: 30 },
    { label: "Wed", dispensed: 28 },
    { label: "Thu", dispensed: 35 },
    { label: "Fri", dispensed: 32 },
    { label: "Sat", dispensed: 18 },
    { label: "Sun", dispensed: 6 },
  ],
  Monthly: [
    { label: "Week 1", dispensed: 98 },
    { label: "Week 2", dispensed: 115 },
    { label: "Week 3", dispensed: 108 },
    { label: "Week 4", dispensed: 124 },
  ],
  Yearly: [
    { label: "Jan", dispensed: 380 },
    { label: "Feb", dispensed: 420 },
    { label: "Mar", dispensed: 460 },
    { label: "Apr", dispensed: 510 },
    { label: "May", dispensed: 490 },
    { label: "Jun", dispensed: 530 },
    { label: "Jul", dispensed: 500 },
    { label: "Aug", dispensed: 545 },
    { label: "Sep", dispensed: 570 },
    { label: "Oct", dispensed: 555 },
    { label: "Nov", dispensed: 590 },
    { label: "Dec", dispensed: 615 },
  ],
};

const STOCK_TREND_DATA = {
  "3M": [
    { label: "Feb", Arnica: 120, Belladonna: 85, Nux: 60 },
    { label: "Mar", Arnica: 95, Belladonna: 70, Nux: 48 },
    { label: "Apr", Arnica: 70, Belladonna: 55, Nux: 35 },
  ],
  "6M": [
    { label: "Nov", Arnica: 200, Belladonna: 150, Nux: 110 },
    { label: "Dec", Arnica: 175, Belladonna: 130, Nux: 95 },
    { label: "Jan", Arnica: 155, Belladonna: 115, Nux: 82 },
    { label: "Feb", Arnica: 120, Belladonna: 85, Nux: 60 },
    { label: "Mar", Arnica: 95, Belladonna: 70, Nux: 48 },
    { label: "Apr", Arnica: 70, Belladonna: 55, Nux: 35 },
  ],
  "1Y": [
    { label: "May", Arnica: 310, Belladonna: 240, Nux: 180 },
    { label: "Jun", Arnica: 285, Belladonna: 220, Nux: 165 },
    { label: "Jul", Arnica: 260, Belladonna: 200, Nux: 148 },
    { label: "Aug", Arnica: 240, Belladonna: 185, Nux: 135 },
    { label: "Sep", Arnica: 215, Belladonna: 168, Nux: 122 },
    { label: "Oct", Arnica: 198, Belladonna: 155, Nux: 110 },
    { label: "Nov", Arnica: 200, Belladonna: 150, Nux: 110 },
    { label: "Dec", Arnica: 175, Belladonna: 130, Nux: 95 },
    { label: "Jan", Arnica: 155, Belladonna: 115, Nux: 82 },
    { label: "Feb", Arnica: 120, Belladonna: 85, Nux: 60 },
    { label: "Mar", Arnica: 95, Belladonna: 70, Nux: 48 },
    { label: "Apr", Arnica: 70, Belladonna: 55, Nux: 35 },
  ],
};

// ─── Prescription queue data ─────────────────────────────────────────────────

type RxStatus = "Pending" | "Dispensed" | "In Preparation";
type RxType = "Regular" | "Urgent";

interface PrescriptionRow {
  patient: string;
  doctor: string;
  medicines: number;
  type: RxType;
  status: RxStatus;
  isToday: boolean;
  isThisWeek: boolean;
}

const ALL_PRESCRIPTIONS: PrescriptionRow[] = [
  {
    patient: "Priya Nair",
    doctor: "Dr. Anjali Sharma",
    medicines: 3,
    type: "Urgent",
    status: "Pending",
    isToday: true,
    isThisWeek: true,
  },
  {
    patient: "Hans Mueller",
    doctor: "Dr. Rohan Mehta",
    medicines: 2,
    type: "Regular",
    status: "Pending",
    isToday: true,
    isThisWeek: true,
  },
  {
    patient: "Kavitha Reddy",
    doctor: "Dr. Vikram Patel",
    medicines: 4,
    type: "Regular",
    status: "In Preparation",
    isToday: true,
    isThisWeek: true,
  },
  {
    patient: "Arjun Sharma",
    doctor: "Dr. Anjali Sharma",
    medicines: 1,
    type: "Urgent",
    status: "Pending",
    isToday: true,
    isThisWeek: true,
  },
  {
    patient: "Sunita Verma",
    doctor: "Dr. Priya Nair",
    medicines: 2,
    type: "Regular",
    status: "Dispensed",
    isToday: true,
    isThisWeek: true,
  },
  {
    patient: "Ravi Kumar",
    doctor: "Dr. Rohan Mehta",
    medicines: 3,
    type: "Regular",
    status: "Dispensed",
    isToday: true,
    isThisWeek: true,
  },
  {
    patient: "Meena Pillai",
    doctor: "Dr. Sunita Joshi",
    medicines: 2,
    type: "Regular",
    status: "Dispensed",
    isToday: false,
    isThisWeek: true,
  },
  {
    patient: "David John",
    doctor: "Dr. Anjali Sharma",
    medicines: 4,
    type: "Urgent",
    status: "Dispensed",
    isToday: false,
    isThisWeek: true,
  },
  {
    patient: "Lakshmi Iyer",
    doctor: "Dr. Vikram Patel",
    medicines: 1,
    type: "Regular",
    status: "Dispensed",
    isToday: false,
    isThisWeek: false,
  },
  {
    patient: "Omar Sheikh",
    doctor: "Dr. Rohan Mehta",
    medicines: 3,
    type: "Regular",
    status: "Dispensed",
    isToday: false,
    isThisWeek: false,
  },
];

// ─── Low stock ──────────────────────────────────────────────────────────────

const LOW_STOCK_ITEMS = [
  {
    name: "Arnica Montana 30C",
    stock: 5,
    minThreshold: 20,
    severity: "critical" as const,
  },
  {
    name: "Belladonna 200C",
    stock: 3,
    minThreshold: 15,
    severity: "critical" as const,
  },
  {
    name: "Nux Vomica 1M",
    stock: 8,
    minThreshold: 25,
    severity: "low" as const,
  },
  {
    name: "Pulsatilla 200C",
    stock: 11,
    minThreshold: 30,
    severity: "low" as const,
  },
  {
    name: "Rhus Tox 30C",
    stock: 6,
    minThreshold: 20,
    severity: "low" as const,
  },
  {
    name: "Sulphur 30C",
    stock: 14,
    minThreshold: 30,
    severity: "low" as const,
  },
];

// ─── Status styles ───────────────────────────────────────────────────────────

const rxStatusStyle: Record<RxStatus, string> = {
  Pending: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  "In Preparation": "bg-blue-500/15 text-blue-400 border-blue-500/25",
  Dispensed: "bg-green-500/15 text-green-400 border-green-500/25",
};

const rxTypeStyle: Record<RxType, string> = {
  Regular: "bg-muted/30 text-muted-foreground border-border/30",
  Urgent: "bg-rose-500/15 text-rose-400 border-rose-500/25",
};

// ─── Date filter helpers ───────────────────────────────────────────────────────

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
  const tod = startOfDay(now);
  switch (option) {
    case "Today":
      return { from: tod, to: endOfDay(now) };
    case "Yesterday":
      return {
        from: startOfDay(subDays(tod, 1)),
        to: endOfDay(subDays(tod, 1)),
      };
    case "Tomorrow":
      return {
        from: startOfDay(addDays(tod, 1)),
        to: endOfDay(addDays(tod, 1)),
      };
    case "Last 7 Days":
      return { from: startOfDay(subDays(tod, 6)), to: endOfDay(tod) };
    case "Next 7 Days":
      return { from: startOfDay(tod), to: endOfDay(addDays(tod, 6)) };
    case "Last 30 Days":
      return { from: startOfDay(subDays(tod, 29)), to: endOfDay(tod) };
    case "Next 30 Days":
      return { from: startOfDay(tod), to: endOfDay(addDays(tod, 29)) };
    case "This Month":
      return { from: startOfMonth(tod), to: endOfMonth(tod) };
    case "Last Month": {
      const lm = subMonths(tod, 1);
      return { from: startOfMonth(lm), to: endOfMonth(lm) };
    }
    case "This Month Last Year": {
      const tml = subYears(tod, 1);
      return { from: startOfMonth(tml), to: endOfMonth(tml) };
    }
    case "This Year Last Year": {
      const tyl = subYears(tod, 1);
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

// Dummy dispensing data for stat cards filtering
function generateDummyDispensing() {
  const records: {
    date: string;
    dispensed: number;
    pending: number;
    prepared: number;
  }[] = [];
  const ref = new Date();
  for (let d = -730; d <= 60; d++) {
    const dt = addDays(ref, d);
    const dow = dt.getDay();
    const base = dow === 0 || dow === 6 ? 8 : 20;
    records.push({
      date: format(dt, "yyyy-MM-dd"),
      dispensed: base + Math.floor(Math.random() * 15),
      pending: 2 + Math.floor(Math.random() * 8),
      prepared: 1 + Math.floor(Math.random() * 6),
    });
  }
  return records;
}

const dummyDispensing = generateDummyDispensing();

function computePharmacistStats(range: { from: Date; to: Date }) {
  const rows = dummyDispensing.filter((r) => {
    const d = parseISO(r.date);
    return isWithinInterval(d, { start: range.from, end: range.to });
  });
  return {
    dispensed: rows.reduce((s, r) => s + r.dispensed, 0),
    pending: rows.reduce((s, r) => s + r.pending, 0),
    prepared: rows.reduce((s, r) => s + r.prepared, 0),
  };
}

// ─── Main component ──────────────────────────────────────────────────────────

export function PharmacistDashboard() {
  const [dispensePeriod, setDispensePeriod] = useState<
    "Daily" | "Weekly" | "Monthly" | "Yearly"
  >("Weekly");
  const [stockPeriod, setStockPeriod] = useState<"3M" | "6M" | "1Y">("6M");
  const [rxPeriod, setRxPeriod] = useState<"Today" | "This Week" | "All">(
    "Today",
  );
  const [reorderClicked, setReorderClicked] = useState<Record<string, boolean>>(
    {},
  );
  const [dispenseClicked, setDispenseClicked] = useState<
    Record<string, boolean>
  >({});

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
    ? computePharmacistStats(activeDateRange)
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

  const filteredRx = ALL_PRESCRIPTIONS.filter((r) => {
    if (rxPeriod === "All") return true;
    if (rxPeriod === "Today") return r.isToday;
    return r.isThisWeek;
  });

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      data-ocid="pharmacist-dashboard"
    >
      <motion.div variants={itemVariants}>
        <PageHeader
          title="Pharmacy Dashboard"
          description="Prescription fulfillment, dispensing queues, and inventory management."
          breadcrumb={[{ label: "Dashboard" }]}
        />
      </motion.div>

      {/* Top-right date filter */}
      <motion.div variants={itemVariants} className="flex justify-end">
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <div className="relative" ref={dateFilterRef}>
            <button
              type="button"
              onClick={() => {
                setDateFilterOpen((v) => !v);
                setShowCustomCalendar(false);
              }}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-white/15 text-muted-foreground hover:text-foreground hover:border-white/30 transition-all"
              data-ocid="pharmacist.date_filter_button"
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
                        data-ocid={`pharmacist.date_filter.option.${opt.toLowerCase().replace(/\s+/g, "_")}`}
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
                          const dayBtn = (e.target as HTMLElement).closest(
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
              data-ocid="pharmacist.clear_filter_button"
            >
              <X className="w-3 h-3" /> Clear Filter
            </button>
          )}
        </div>
      </motion.div>

      {/* Row 1 — Stat Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
      >
        <StatCard
          title="Pending Prescriptions"
          value={filteredStats?.pending ?? 14}
          icon={<FlaskConical className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title="Dispensed Today"
          value={filteredStats?.dispensed ?? 32}
          change={12}
          icon={<CheckSquare className="w-5 h-5" />}
          color="green"
        />
        <StatCard
          title="Low Stock Alerts"
          value={7}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="rose"
        />
        <StatCard
          title="Total Medicines in Stock"
          value={186}
          change={2}
          icon={<Package className="w-5 h-5" />}
          color="teal"
        />
        <StatCard
          title="Pending Preparation"
          value={filteredStats?.prepared ?? 9}
          icon={<RefreshCw className="w-5 h-5" />}
          color="purple"
        />
      </motion.div>

      {/* Row 2 — Charts */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-5 gap-4"
      >
        {/* Dispensing Activity — 60% */}
        <div
          className="lg:col-span-3 glass-card p-5"
          data-ocid="pharmacist-dispensing-chart"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-foreground">
                Dispensing Activity
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {dispensePeriod === "Daily"
                  ? "Today"
                  : dispensePeriod === "Weekly"
                    ? "This week"
                    : dispensePeriod === "Monthly"
                      ? "This month"
                      : "This year"}
              </p>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              {dispensePeriod}
            </span>
          </div>
          <div className="flex gap-2 mb-4">
            {(["Daily", "Weekly", "Monthly", "Yearly"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setDispensePeriod(p)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                  dispensePeriod === p
                    ? "bg-primary/20 text-primary border-primary/40 ring-1 ring-primary/30"
                    : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/25 hover:text-foreground"
                }`}
                data-ocid={`pharmacist.dispense_toggle.${p.toLowerCase()}`}
              >
                {p}
              </button>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={DISPENSING_DATA[dispensePeriod]}
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
                dataKey="dispensed"
                name="Dispensed"
                fill="oklch(0.65 0.18 190)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Stock Level Trend — 40% */}
        <div
          className="lg:col-span-2 glass-card p-5"
          data-ocid="pharmacist-stock-trend-chart"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-foreground">
                Stock Level Trend
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Top medicines quantity
              </p>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
              Depleting
            </span>
          </div>
          <div className="flex gap-2 mb-4">
            {(["3M", "6M", "1Y"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setStockPeriod(p)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                  stockPeriod === p
                    ? "bg-primary/20 text-primary border-primary/40 ring-1 ring-primary/30"
                    : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/25 hover:text-foreground"
                }`}
                data-ocid={`pharmacist.stock_trend_toggle.${p.toLowerCase()}`}
              >
                {p}
              </button>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart
              data={STOCK_TREND_DATA[stockPeriod]}
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
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<GlassTooltip />} />
              <Line
                type="monotone"
                dataKey="Arnica"
                name="Arnica"
                stroke="oklch(0.65 0.18 150)"
                strokeWidth={2}
                dot={{ r: 2, strokeWidth: 0, fill: "oklch(0.65 0.18 150)" }}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="Belladonna"
                name="Belladonna"
                stroke="oklch(0.65 0.18 30)"
                strokeWidth={2}
                dot={{ r: 2, strokeWidth: 0, fill: "oklch(0.65 0.18 30)" }}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="Nux"
                name="Nux Vomica"
                stroke="oklch(0.65 0.18 280)"
                strokeWidth={2}
                dot={{ r: 2, strokeWidth: 0, fill: "oklch(0.65 0.18 280)" }}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Row 3 — Prescription Queue + Low Stock */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
      >
        {/* Prescription Queue — 65% */}
        <div
          className="lg:col-span-2 glass-card p-5"
          data-ocid="pharmacist-rx-queue"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-foreground">
              Prescription Queue
            </h3>
            <div className="flex gap-2">
              {(["Today", "This Week", "All"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setRxPeriod(p)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                    rxPeriod === p
                      ? "bg-primary/20 text-primary border-primary/40 ring-1 ring-primary/30"
                      : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/25 hover:text-foreground"
                  }`}
                  data-ocid={`pharmacist.rx_toggle.${p.toLowerCase().replace(" ", "_")}`}
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
                  {[
                    "Patient Name",
                    "Doctor",
                    "Medicines",
                    "Type",
                    "Status",
                    "Action",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left text-xs font-semibold text-muted-foreground py-2 pr-4 last:pr-0"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRx.map((row, i) => (
                  <tr
                    key={`${row.patient}-${i}`}
                    className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                    data-ocid={`pharmacist-rx.item.${i + 1}`}
                  >
                    <td className="py-3 pr-4 font-medium text-foreground">
                      {row.patient}
                    </td>
                    <td className="py-3 pr-4 text-xs text-muted-foreground">
                      {row.doctor}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-xs font-bold text-primary">
                        {row.medicines}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full border ${rxTypeStyle[row.type]}`}
                      >
                        {row.type}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${rxStatusStyle[row.status]}`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3">
                      {row.status === "Pending" &&
                      !dispenseClicked[row.patient] ? (
                        <button
                          type="button"
                          onClick={() =>
                            setDispenseClicked((prev) => ({
                              ...prev,
                              [row.patient]: true,
                            }))
                          }
                          className="text-xs px-2.5 py-1 rounded-lg bg-primary/15 text-primary border border-primary/25 hover:bg-primary/30 transition-all font-medium"
                          data-ocid={`pharmacist.dispense_button.${i + 1}`}
                        >
                          Dispense
                        </button>
                      ) : row.status === "Pending" &&
                        dispenseClicked[row.patient] ? (
                        <span className="text-xs text-green-400 font-medium">
                          ✓ Done
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredRx.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-8 text-center text-xs text-muted-foreground"
                      data-ocid="pharmacist-rx.empty_state"
                    >
                      No prescriptions found for this period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts — 35% */}
        <div className="glass-card p-5" data-ocid="pharmacist-low-stock-panel">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <h3 className="font-display font-semibold text-foreground">
              Low Stock Alerts
            </h3>
          </div>
          <div className="space-y-2.5">
            {LOW_STOCK_ITEMS.map((item, i) => (
              <div
                key={item.name}
                className={`flex items-center justify-between p-3 rounded-xl border ${
                  item.severity === "critical"
                    ? "bg-rose-500/8 border-rose-500/20"
                    : "bg-amber-500/8 border-amber-500/20"
                }`}
                data-ocid={`pharmacist-stock.item.${i + 1}`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {item.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${
                        item.severity === "critical"
                          ? "bg-rose-500/15 text-rose-400 border-rose-500/25"
                          : "bg-amber-500/15 text-amber-400 border-amber-500/25"
                      }`}
                    >
                      {item.severity === "critical" ? "⚠ Critical" : "↓ Low"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Min: {item.minThreshold}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 ml-2 shrink-0">
                  <span
                    className={`text-sm font-bold tabular-nums ${
                      item.severity === "critical"
                        ? "text-rose-400"
                        : "text-amber-400"
                    }`}
                  >
                    {item.stock} left
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setReorderClicked((prev) => ({
                        ...prev,
                        [item.name]: true,
                      }))
                    }
                    className={`text-[10px] px-2 py-0.5 rounded-full border transition-all font-medium ${
                      reorderClicked[item.name]
                        ? "bg-green-500/15 text-green-400 border-green-500/25"
                        : "bg-white/5 border-white/15 text-muted-foreground hover:border-white/30 hover:text-foreground"
                    }`}
                    data-ocid={`pharmacist.reorder_button.${i + 1}`}
                  >
                    {reorderClicked[item.name] ? "✓ Ordered" : "Reorder"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
