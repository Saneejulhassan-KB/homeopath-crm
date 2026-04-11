import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { analytics, topRemedies } from "@/data/analytics";
import { createRoute } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  Download,
  FileBarChart,
  FilePieChart,
  FileText,
  Microscope,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { Route as rootRoute } from "./__root";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reports",
  component: ReportsPage,
});

// ── colour tokens matching our teal/green palette ─────────────────────────────
const CHART_TEAL = "oklch(0.65 0.18 190)";
const CHART_GREEN = "oklch(0.68 0.16 165)";
const CHART_AMBER = "oklch(0.78 0.14 80)";
const CHART_ROSE = "oklch(0.65 0.19 22)";
const PIE_COLORS = [CHART_TEAL, CHART_AMBER, CHART_GREEN, CHART_ROSE];

// ── revenue data: split into consultations vs medicines for dual-bar ──────────
const revenueData = analytics.revenue.map((d) => ({
  month: d.month.slice(0, 3),
  consultations: Math.round(d.value * 0.62),
  medicines: Math.round(d.value * 0.38),
  total: d.value,
}));

const patientData = analytics.patientGrowth.map((d) => ({
  month: d.month.slice(0, 3),
  patients: d.value,
}));

const appointmentPieData = [
  { name: "Completed", value: analytics.appointmentStats.completed },
  { name: "Pending", value: analytics.appointmentStats.pending },
  { name: "Confirmed", value: analytics.appointmentStats.confirmed },
  { name: "Cancelled", value: analytics.appointmentStats.cancelled },
];

// ── Custom Tooltip ─────────────────────────────────────────────────────────────
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-4 py-3 text-sm shadow-elevated min-w-[140px]">
      <p className="text-xs text-muted-foreground mb-2 font-medium">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-6">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: p.color }}
            />
            {p.name}
          </span>
          <span className="font-semibold text-foreground tabular-nums">
            {typeof p.value === "number" && p.value > 999
              ? `₹${p.value.toLocaleString("en-IN")}`
              : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Stat cards ────────────────────────────────────────────────────────────────
const statsData = [
  {
    title: "Total Revenue YTD",
    value: "₹15,45,000",
    change: 18,
    icon: <Wallet className="w-4 h-4" />,
    color: "teal" as const,
  },
  {
    title: "Total Patients",
    value: "248",
    change: 12,
    icon: <Users className="w-4 h-4" />,
    color: "green" as const,
  },
  {
    title: "Avg Case Value",
    value: "₹6,230",
    change: 5,
    icon: <TrendingUp className="w-4 h-4" />,
    color: "purple" as const,
  },
  {
    title: "Patient Retention",
    value: "78%",
    change: 3,
    icon: <Activity className="w-4 h-4" />,
    color: "amber" as const,
  },
];

// ── Download report cards ─────────────────────────────────────────────────────
const reportCards = [
  {
    id: "patient",
    label: "Patient Report",
    desc: "Full patient list with visit history",
    icon: <Users className="w-5 h-5" />,
    color: "bg-primary/10 text-primary border-primary/20",
  },
  {
    id: "revenue",
    label: "Revenue Report",
    desc: "Monthly income & payment breakdown",
    icon: <Wallet className="w-5 h-5" />,
    color: "bg-green-500/10 text-green-400 border-green-500/20",
  },
  {
    id: "appointment",
    label: "Appointment Summary",
    desc: "Status-wise appointment analytics",
    icon: <FileText className="w-5 h-5" />,
    color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  {
    id: "prescription",
    label: "Prescription Analysis",
    desc: "Top remedies and prescribing patterns",
    icon: <Microscope className="w-5 h-5" />,
    color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  },
];

// ── Recharts gradients ────────────────────────────────────────────────────────
function ChartDefs() {
  return (
    <defs>
      <linearGradient id="gradTeal" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor={CHART_TEAL} stopOpacity={0.35} />
        <stop offset="95%" stopColor={CHART_TEAL} stopOpacity={0.0} />
      </linearGradient>
    </defs>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
function ReportsPage() {
  return (
    <div className="space-y-8" data-ocid="reports-page">
      <PageHeader
        title="Reports & Analytics"
        description="Patient growth, revenue trends, and downloadable insights."
        breadcrumb={[{ label: "Dashboard", href: "/" }, { label: "Reports" }]}
        action={{
          label: "Download Report",
          icon: <Download className="w-4 h-4" />,
          onClick: () =>
            toast.success("Report generated! PDF download starting…", {
              description: "Your full analytics report is being prepared.",
            }),
        }}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <StatCard
              title={s.title}
              value={s.value}
              change={s.change}
              icon={s.icon}
              color={s.color}
            />
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Patient Growth – AreaChart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass-card p-5"
          data-ocid="chart-patient-growth"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground font-display">
                Patient Growth
              </h3>
              <p className="text-xs text-muted-foreground">
                Monthly active patients — last 12 months
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={patientData}
              margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
            >
              <ChartDefs />
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.06)"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fill: "oklch(0.6 0 0)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "oklch(0.6 0 0)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="patients"
                name="Patients"
                stroke={CHART_TEAL}
                strokeWidth={2.5}
                fill="url(#gradTeal)"
                dot={false}
                activeDot={{ r: 4, fill: CHART_TEAL, stroke: "transparent" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Revenue – Dual BarChart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass-card p-5"
          data-ocid="chart-revenue"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
              <BarChart3 className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground font-display">
                Revenue Breakdown
              </h3>
              <p className="text-xs text-muted-foreground">
                Consultations vs. medicines — last 12 months
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={revenueData}
              margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
              barSize={10}
              barCategoryGap="28%"
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.06)"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fill: "oklch(0.6 0 0)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "oklch(0.6 0 0)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) =>
                  v >= 1000 ? `₹${v / 1000}k` : `₹${v}`
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: "11px", color: "oklch(0.6 0 0)" }}
              />
              <Bar
                dataKey="consultations"
                name="Consultations"
                fill={CHART_TEAL}
                radius={[3, 3, 0, 0]}
              />
              <Bar
                dataKey="medicines"
                name="Medicines"
                fill={CHART_GREEN}
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Appointment Status – DonutChart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="glass-card p-5"
          data-ocid="chart-appointment-status"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <FilePieChart className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground font-display">
                Appointment Status
              </h3>
              <p className="text-xs text-muted-foreground">
                Distribution across all appointment states
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="55%" height={200}>
              <PieChart>
                <Pie
                  data={appointmentPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="transparent"
                >
                  {appointmentPieData.map((entry, i) => (
                    <Cell
                      key={entry.name}
                      fill={PIE_COLORS[i % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2.5 flex-1">
              {appointmentPieData.map((entry, i) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                  />
                  <span className="text-xs text-muted-foreground flex-1">
                    {entry.name}
                  </span>
                  <span className="text-xs font-semibold text-foreground tabular-nums">
                    {entry.value}
                  </span>
                </div>
              ))}
              <div className="mt-1 pt-2 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground flex-1 font-medium">
                    Total
                  </span>
                  <span className="text-xs font-bold text-foreground tabular-nums">
                    {appointmentPieData.reduce((s, d) => s + d.value, 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Top Remedies – Horizontal BarChart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="glass-card p-5"
          data-ocid="chart-top-remedies"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <FileBarChart className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground font-display">
                Top Remedies Prescribed
              </h3>
              <p className="text-xs text-muted-foreground">
                Most frequently prescribed homeopathic remedies
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              layout="vertical"
              data={topRemedies}
              margin={{ top: 0, right: 20, left: 20, bottom: 0 }}
              barSize={12}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.06)"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fill: "oklch(0.6 0 0)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: "oklch(0.6 0 0)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={75}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Prescriptions" radius={[0, 4, 4, 0]}>
                {topRemedies.map((remedy, i) => (
                  <Cell
                    key={remedy.name}
                    fill={`oklch(0.65 0.${14 + i * 2} ${190 - i * 8})`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Download Reports Section */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="glass-card p-6"
        data-ocid="download-reports-section"
      >
        <div className="flex items-center gap-2 mb-5">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <Download className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground font-display">
              Download Reports
            </h3>
            <p className="text-xs text-muted-foreground">
              Export clinic data as PDF reports
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportCards.map((rc, i) => (
            <motion.div
              key={rc.id}
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ y: -3 }}
              className="glass rounded-xl p-4 flex flex-col gap-3 cursor-pointer group"
              data-ocid={`report-card-${rc.id}`}
            >
              <div className={`p-2.5 rounded-xl border self-start ${rc.color}`}>
                {rc.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  {rc.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {rc.desc}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full flex items-center gap-1.5 text-xs opacity-80 group-hover:opacity-100 transition-smooth"
                onClick={() =>
                  toast.success(`Generating ${rc.label}…`, {
                    description: "Your report will download in a moment.",
                  })
                }
                data-ocid={`download-btn-${rc.id}`}
              >
                <Download className="w-3 h-3" />
                Download PDF
              </Button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
