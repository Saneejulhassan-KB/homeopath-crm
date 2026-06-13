import { Button } from "@/components/ui/button";
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
  AlertCircle,
  Bell,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  DollarSign,
  Eye,
  FileText,
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
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { GlassTooltip, containerVariants, itemVariants } from "./shared";

// ── Types ────────────────────────────────────────────────────────────────────
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

type RevenuePeriod = "3M" | "6M" | "1Y";
type PaymentPeriod = "Daily" | "Weekly" | "Monthly";
type InvoicePeriod = "Today" | "This Week" | "All";

// ── Date filter helpers ───────────────────────────────────────────────────────
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

function formatDateRangeLabel(range: { from: Date; to: Date }): string {
  if (format(range.from, "yyyy-MM-dd") === format(range.to, "yyyy-MM-dd")) {
    return format(range.from, "MMM d, yyyy");
  }
  return `${format(range.from, "MMM d")} – ${format(range.to, "MMM d, yyyy")}`;
}

// ── Chart data ────────────────────────────────────────────────────────────────
const REVENUE_TREND: Record<
  RevenuePeriod,
  { label: string; collected: number; expected: number }[]
> = {
  "3M": [
    { label: "Apr", collected: 228000, expected: 260000 },
    { label: "May", collected: 251000, expected: 270000 },
    { label: "Jun", collected: 284500, expected: 290000 },
  ],
  "6M": [
    { label: "Jan", collected: 196000, expected: 220000 },
    { label: "Feb", collected: 238000, expected: 250000 },
    { label: "Mar", collected: 251000, expected: 265000 },
    { label: "Apr", collected: 228000, expected: 260000 },
    { label: "May", collected: 271000, expected: 280000 },
    { label: "Jun", collected: 284500, expected: 290000 },
  ],
  "1Y": [
    { label: "Jul", collected: 172000, expected: 190000 },
    { label: "Aug", collected: 185000, expected: 200000 },
    { label: "Sep", collected: 194000, expected: 210000 },
    { label: "Oct", collected: 208000, expected: 220000 },
    { label: "Nov", collected: 182000, expected: 215000 },
    { label: "Dec", collected: 214000, expected: 230000 },
    { label: "Jan", collected: 196000, expected: 220000 },
    { label: "Feb", collected: 238000, expected: 250000 },
    { label: "Mar", collected: 251000, expected: 265000 },
    { label: "Apr", collected: 228000, expected: 260000 },
    { label: "May", collected: 271000, expected: 280000 },
    { label: "Jun", collected: 284500, expected: 290000 },
  ],
};

const PAYMENT_STATUS: Record<
  PaymentPeriod,
  { label: string; paid: number; pending: number; overdue: number }[]
> = {
  Daily: [
    { label: "9 AM", paid: 4, pending: 2, overdue: 1 },
    { label: "10 AM", paid: 6, pending: 3, overdue: 0 },
    { label: "11 AM", paid: 5, pending: 1, overdue: 2 },
    { label: "12 PM", paid: 7, pending: 2, overdue: 1 },
    { label: "2 PM", paid: 3, pending: 4, overdue: 1 },
    { label: "3 PM", paid: 8, pending: 1, overdue: 0 },
    { label: "4 PM", paid: 5, pending: 2, overdue: 1 },
  ],
  Weekly: [
    { label: "Mon", paid: 18, pending: 6, overdue: 3 },
    { label: "Tue", paid: 24, pending: 4, overdue: 2 },
    { label: "Wed", paid: 21, pending: 7, overdue: 4 },
    { label: "Thu", paid: 29, pending: 3, overdue: 1 },
    { label: "Fri", paid: 31, pending: 5, overdue: 2 },
    { label: "Sat", paid: 15, pending: 8, overdue: 3 },
  ],
  Monthly: [
    { label: "Week 1", paid: 84, pending: 22, overdue: 8 },
    { label: "Week 2", paid: 97, pending: 18, overdue: 6 },
    { label: "Week 3", paid: 112, pending: 14, overdue: 9 },
    { label: "Week 4", paid: 88, pending: 26, overdue: 11 },
  ],
};

// ── Invoice & overdue data ────────────────────────────────────────────────────
type InvoiceRow = {
  id: string;
  patient: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
  status: "Pending" | "Overdue" | "Partially Paid";
  isoDate: string;
};

const ALL_INVOICES: InvoiceRow[] = [
  {
    id: "INV-2401",
    patient: "Priya Sharma",
    amount: 3200,
    dueDate: "Jun 2",
    daysOverdue: 10,
    status: "Overdue",
    isoDate: "2026-06-02",
  },
  {
    id: "INV-2402",
    patient: "Hans Mueller",
    amount: 2800,
    dueDate: "Jun 5",
    daysOverdue: 7,
    status: "Overdue",
    isoDate: "2026-06-05",
  },
  {
    id: "INV-2403",
    patient: "Fatima Al-Zahra",
    amount: 4500,
    dueDate: "Jun 8",
    daysOverdue: 4,
    status: "Pending",
    isoDate: "2026-06-08",
  },
  {
    id: "INV-2404",
    patient: "Ravi Krishnan",
    amount: 1900,
    dueDate: "Jun 9",
    daysOverdue: 3,
    status: "Pending",
    isoDate: "2026-06-09",
  },
  {
    id: "INV-2405",
    patient: "Isabella Rossi",
    amount: 5600,
    dueDate: "Jun 10",
    daysOverdue: 2,
    status: "Partially Paid",
    isoDate: "2026-06-10",
  },
  {
    id: "INV-2406",
    patient: "Aditya Gupta",
    amount: 3600,
    dueDate: "Jun 11",
    daysOverdue: 1,
    status: "Overdue",
    isoDate: "2026-06-11",
  },
  {
    id: "INV-2407",
    patient: "Sunita Verma",
    amount: 2200,
    dueDate: "Jun 12",
    daysOverdue: 0,
    status: "Pending",
    isoDate: "2026-06-12",
  },
  {
    id: "INV-2408",
    patient: "Meera Iyer",
    amount: 4100,
    dueDate: "Jun 12",
    daysOverdue: 0,
    status: "Pending",
    isoDate: "2026-06-12",
  },
  {
    id: "INV-2409",
    patient: "Chen Wei",
    amount: 2750,
    dueDate: "Jun 13",
    daysOverdue: 0,
    status: "Partially Paid",
    isoDate: "2026-06-13",
  },
  {
    id: "INV-2410",
    patient: "Nadia Okonkwo",
    amount: 3300,
    dueDate: "Jun 14",
    daysOverdue: 0,
    status: "Pending",
    isoDate: "2026-06-14",
  },
];

const OVERDUE_ACCOUNTS = [
  {
    id: 1,
    patient: "Sunita Verma",
    totalDue: 7400,
    daysOverdue: 42,
    lastPayment: "Apr 1, 2026",
    urgency: "critical" as const,
  },
  {
    id: 2,
    patient: "Hans Mueller",
    totalDue: 3200,
    daysOverdue: 34,
    lastPayment: "May 8, 2026",
    urgency: "high" as const,
  },
  {
    id: 3,
    patient: "Ravi Krishnan",
    totalDue: 1900,
    daysOverdue: 39,
    lastPayment: "Apr 4, 2026",
    urgency: "high" as const,
  },
  {
    id: 4,
    patient: "Meera Iyer",
    totalDue: 5100,
    daysOverdue: 51,
    lastPayment: "Mar 22, 2026",
    urgency: "critical" as const,
  },
  {
    id: 5,
    patient: "Rahul Das",
    totalDue: 2600,
    daysOverdue: 33,
    lastPayment: "May 10, 2026",
    urgency: "medium" as const,
  },
  {
    id: 6,
    patient: "Ananya Singh",
    totalDue: 4800,
    daysOverdue: 38,
    lastPayment: "May 5, 2026",
    urgency: "high" as const,
  },
];

// ── Badge helpers ─────────────────────────────────────────────────────────────
const statusBadge: Record<string, string> = {
  Overdue: "bg-rose-500/15 text-rose-400 border-rose-500/25",
  Pending: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  "Partially Paid": "bg-blue-500/15 text-blue-400 border-blue-500/25",
};

const urgencyBadge: Record<string, string> = {
  critical: "bg-rose-500/15 text-rose-400 border-rose-500/25",
  high: "bg-orange-500/15 text-orange-400 border-orange-500/25",
  medium: "bg-amber-500/15 text-amber-400 border-amber-500/25",
};

const urgencyLabel: Record<string, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
};

// ── Filtered stat data ────────────────────────────────────────────────────────
const BASE_STATS: Record<
  string,
  {
    collected: number;
    unpaid: number;
    overdue: number;
    renewals: number;
    newInvoices: number;
  }
> = {
  Today: {
    collected: 48200,
    unpaid: 23,
    overdue: 12800,
    renewals: 5,
    newInvoices: 8,
  },
  Yesterday: {
    collected: 39800,
    unpaid: 19,
    overdue: 11200,
    renewals: 3,
    newInvoices: 6,
  },
  "Last 7 Days": {
    collected: 192500,
    unpaid: 64,
    overdue: 38400,
    renewals: 14,
    newInvoices: 42,
  },
  "Last 30 Days": {
    collected: 814000,
    unpaid: 187,
    overdue: 96200,
    renewals: 38,
    newInvoices: 151,
  },
  "This Month": {
    collected: 284500,
    unpaid: 74,
    overdue: 42800,
    renewals: 18,
    newInvoices: 68,
  },
  "Last Month": {
    collected: 251000,
    unpaid: 61,
    overdue: 36100,
    renewals: 12,
    newInvoices: 57,
  },
};

function getStatsForFilter(filter: DateFilterOption) {
  return BASE_STATS[filter] ?? BASE_STATS.Today;
}

// ── Period toggle ─────────────────────────────────────────────────────────────
function PeriodBtn<T extends string>({
  options,
  value,
  onChange,
  prefix,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  prefix: string;
}) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {options.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
            value === p
              ? "bg-primary/20 text-primary border-primary/40 ring-1 ring-primary/30"
              : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/25 hover:text-foreground"
          }`}
          data-ocid={`${prefix}.${p.toLowerCase().replace(/\s+/g, "_")}`}
        >
          {p}
        </button>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function BillingDashboard() {
  const [revenuePeriod, setRevenuePeriod] = useState<RevenuePeriod>("6M");
  const [paymentPeriod, setPaymentPeriod] = useState<PaymentPeriod>("Weekly");
  const [invoicePeriod, setInvoicePeriod] = useState<InvoicePeriod>("All");

  const [dateFilterOpen, setDateFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] =
    useState<DateFilterOption>("Today");
  const [customRange, setCustomRange] = useState<DateRange | undefined>();
  const [showCustomCalendar, setShowCustomCalendar] = useState(false);
  const dateFilterRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStart = useRef<Date | null>(null);

  const [markedPaid, setMarkedPaid] = useState<Set<string>>(new Set());
  const [remindSent, setRemindSent] = useState<Set<string>>(new Set());

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

  const stats = getStatsForFilter(selectedFilter);

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

  const showClearFilter = selectedFilter !== "Today" || Boolean(customRange);

  const now = new Date();
  const filteredInvoices = ALL_INVOICES.filter((inv) => {
    if (invoicePeriod === "Today") {
      const d = parseISO(inv.isoDate);
      return isWithinInterval(d, {
        start: startOfDay(now),
        end: endOfDay(now),
      });
    }
    if (invoicePeriod === "This Week") {
      const d = parseISO(inv.isoDate);
      return isWithinInterval(d, {
        start: startOfDay(subDays(now, 6)),
        end: endOfDay(now),
      });
    }
    return true;
  });

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      data-ocid="billing-dashboard"
    >
      <motion.div variants={itemVariants}>
        <PageHeader
          title="Billing Dashboard"
          description="Track collections, unpaid invoices, overdue accounts, and revenue trends."
          breadcrumb={[{ label: "Dashboard" }]}
        />
      </motion.div>

      {/* Date filter controls */}
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
            data-ocid="billing.date_filter_button"
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
                      data-ocid={`billing.date_filter.${opt.toLowerCase().replace(/\s+/g, "_")}`}
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
        {showClearFilter && (
          <button
            type="button"
            onClick={() => {
              setSelectedFilter("Today");
              setCustomRange(undefined);
              setDateFilterOpen(false);
              setShowCustomCalendar(false);
            }}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full border border-red-400/20 text-red-400/80 hover:text-red-400 hover:border-red-400/40 hover:bg-red-400/10 transition-all"
            data-ocid="billing.clear_filter_button"
          >
            <X className="w-3 h-3" /> Clear Filter
          </button>
        )}
      </motion.div>

      {/* Row 1: 5 stat cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
      >
        <StatCard
          title="Total Collected"
          value={`₹${stats.collected.toLocaleString("en-IN")}`}
          change={14}
          icon={<CreditCard className="w-5 h-5" />}
          color="green"
        />
        <StatCard
          title="Unpaid Invoices"
          value={stats.unpaid}
          change={-3}
          icon={<FileText className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title="Overdue Amount"
          value={`₹${stats.overdue.toLocaleString("en-IN")}`}
          change={-8}
          icon={<AlertCircle className="w-5 h-5" />}
          color="rose"
        />
        <StatCard
          title="Renewals Due"
          value={stats.renewals}
          icon={<RefreshCw className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          title="New Invoices Today"
          value={stats.newInvoices}
          change={5}
          icon={<DollarSign className="w-5 h-5" />}
          color="teal"
        />
      </motion.div>

      {/* Row 2: Charts */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-5 gap-4"
      >
        {/* Revenue Collection Trend — 60% */}
        <div
          className="lg:col-span-3 glass-card p-5"
          data-ocid="billing-revenue-chart"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-foreground">
                Revenue Collection Trend
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Collected vs Expected
              </p>
            </div>
            <PeriodBtn
              options={["3M", "6M", "1Y"] as const}
              value={revenuePeriod}
              onChange={setRevenuePeriod}
              prefix="billing.revenue_toggle"
            />
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart
              data={REVENUE_TREND[revenuePeriod]}
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
                tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<GlassTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 11 }}
                formatter={(value) => (
                  <span className="text-muted-foreground">{value}</span>
                )}
              />
              <Line
                type="monotone"
                dataKey="collected"
                name="Collected"
                stroke="oklch(0.65 0.18 150)"
                strokeWidth={2.5}
                dot={{ fill: "oklch(0.65 0.18 150)", r: 3, strokeWidth: 0 }}
                activeDot={{
                  r: 5,
                  fill: "oklch(0.65 0.18 150)",
                  strokeWidth: 0,
                }}
              />
              <Line
                type="monotone"
                dataKey="expected"
                name="Expected"
                stroke="oklch(0.65 0.18 260)"
                strokeWidth={2}
                strokeDasharray="4 3"
                dot={false}
                activeDot={{
                  r: 4,
                  fill: "oklch(0.65 0.18 260)",
                  strokeWidth: 0,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Status Breakdown — 40% */}
        <div
          className="lg:col-span-2 glass-card p-5"
          data-ocid="billing-payment-chart"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-foreground">
                Payment Status
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Paid / Pending / Overdue
              </p>
            </div>
            <PeriodBtn
              options={["Daily", "Weekly", "Monthly"] as const}
              value={paymentPeriod}
              onChange={setPaymentPeriod}
              prefix="billing.payment_toggle"
            />
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={PAYMENT_STATUS[paymentPeriod]}
              margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
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
              <Legend
                wrapperStyle={{ fontSize: 11 }}
                formatter={(value) => (
                  <span className="text-muted-foreground">{value}</span>
                )}
              />
              <Bar
                dataKey="paid"
                name="Paid"
                fill="oklch(0.65 0.18 150)"
                radius={[3, 3, 0, 0]}
                stackId="a"
              />
              <Bar
                dataKey="pending"
                name="Pending"
                fill="oklch(0.72 0.15 80)"
                radius={[0, 0, 0, 0]}
                stackId="a"
              />
              <Bar
                dataKey="overdue"
                name="Overdue"
                fill="oklch(0.62 0.22 20)"
                radius={[3, 3, 0, 0]}
                stackId="a"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Row 3: Invoices table + Overdue accounts */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-5 gap-4"
      >
        {/* Unpaid Invoices — 65% */}
        <div
          className="lg:col-span-3 glass-card p-5"
          data-ocid="billing-invoices-table"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-foreground">
                Unpaid Invoices
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {filteredInvoices.length} invoices
              </p>
            </div>
            <div className="flex items-center gap-2">
              <PeriodBtn
                options={["Today", "This Week", "All"] as const}
                value={invoicePeriod}
                onChange={setInvoicePeriod}
                prefix="billing.invoice_toggle"
              />
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                ₹
                {ALL_INVOICES.reduce((s, i) => s + i.amount, 0).toLocaleString(
                  "en-IN",
                )}
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {[
                    "Invoice #",
                    "Patient Name",
                    "Amount",
                    "Due Date",
                    "Days Overdue",
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
                {filteredInvoices.map((row, i) => (
                  <tr
                    key={row.id}
                    className={`border-b border-white/5 transition-colors ${markedPaid.has(row.id) ? "opacity-40" : "hover:bg-white/[0.03]"}`}
                    data-ocid={`billing-invoice.item.${i + 1}`}
                  >
                    <td className="py-2.5 pr-3 text-xs font-mono text-muted-foreground">
                      {row.id}
                    </td>
                    <td className="py-2.5 pr-3 font-medium text-foreground text-xs">
                      {row.patient}
                    </td>
                    <td className="py-2.5 pr-3 text-xs font-bold text-foreground tabular-nums">
                      ₹{row.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-2.5 pr-3 text-xs text-muted-foreground">
                      {row.dueDate}
                    </td>
                    <td className="py-2.5 pr-3 text-xs tabular-nums">
                      {row.daysOverdue > 0 ? (
                        <span className="text-rose-400 font-medium">
                          {row.daysOverdue}d
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-2.5 pr-3">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full border whitespace-nowrap ${statusBadge[row.status]}`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          title="Mark as Paid"
                          disabled={markedPaid.has(row.id)}
                          onClick={() =>
                            setMarkedPaid((s) => new Set([...s, row.id]))
                          }
                          className="p-1 rounded-lg text-green-400 hover:bg-green-400/10 transition-colors disabled:opacity-30"
                          data-ocid={`billing-invoice.mark_paid.${i + 1}`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Send Reminder"
                          onClick={() =>
                            setRemindSent((s) => new Set([...s, row.id]))
                          }
                          className={`p-1 rounded-lg transition-colors ${remindSent.has(row.id) ? "text-primary opacity-50" : "text-amber-400 hover:bg-amber-400/10"}`}
                          data-ocid={`billing-invoice.remind.${i + 1}`}
                        >
                          <Bell className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          title="View"
                          className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                          data-ocid={`billing-invoice.view.${i + 1}`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredInvoices.length === 0 && (
              <div
                className="py-10 text-center text-sm text-muted-foreground"
                data-ocid="billing-invoices.empty_state"
              >
                No invoices for the selected period.
              </div>
            )}
          </div>
        </div>

        {/* Overdue Accounts — 35% */}
        <div
          className="lg:col-span-2 glass-card p-5"
          data-ocid="billing-overdue-accounts"
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <h3 className="font-display font-semibold text-foreground">
              Overdue Accounts
            </h3>
            <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
              {OVERDUE_ACCOUNTS.length} patients
            </span>
          </div>
          <div className="space-y-2.5">
            {OVERDUE_ACCOUNTS.map((acc, i) => (
              <div
                key={acc.id}
                className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/10 hover:bg-rose-500/10 transition-smooth"
                data-ocid={`billing-overdue.item.${i + 1}`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className="text-xs font-semibold text-foreground truncate flex-1">
                    {acc.patient}
                  </p>
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border shrink-0 ${urgencyBadge[acc.urgency]}`}
                  >
                    {urgencyLabel[acc.urgency]}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-rose-400 tabular-nums">
                      ₹{acc.totalDue.toLocaleString("en-IN")}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {acc.daysOverdue}d overdue · Last: {acc.lastPayment}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-[10px] px-2 text-rose-400 hover:text-rose-300 hover:bg-rose-400/10 border border-rose-400/20"
                    data-ocid={`billing-overdue.contact.${i + 1}`}
                  >
                    Contact
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
