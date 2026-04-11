import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { analytics, appointments, patients } from "@/data/index";
import { formatTime } from "@/utils/formatters";
import { createRoute } from "@tanstack/react-router";
import {
  Activity,
  Calendar,
  Pill,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import type { Variants } from "motion/react";
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
import { Route as rootRoute } from "./__root";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DashboardPage,
});

// Abbreviated month label: "May 2025" → "May"
function shortMonth(label: string) {
  return label.split(" ")[0];
}

// Hardcoded 6-month appointment data (deterministic)
const apptBarData = [
  { month: "Nov", confirmed: 14, pending: 6, completed: 22 },
  { month: "Dec", confirmed: 17, pending: 8, completed: 26 },
  { month: "Jan", confirmed: 13, pending: 5, completed: 19 },
  { month: "Feb", confirmed: 19, pending: 7, completed: 28 },
  { month: "Mar", confirmed: 21, pending: 9, completed: 31 },
  { month: "Apr", confirmed: 16, pending: 5, completed: 24 },
];

// Activity items derived from notifications + recent appointment data
const activityItems = [
  {
    id: "act1",
    icon: UserPlus,
    color: "text-primary bg-primary/10 border-primary/20",
    dot: "bg-primary",
    title: "New patient registered",
    detail: "Fatima Al-Zahra added to system",
    time: "2h ago",
  },
  {
    id: "act2",
    icon: Calendar,
    color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    dot: "bg-blue-400",
    title: "Appointment booked",
    detail: "Hans Mueller — Apr 16, 11:00 AM",
    time: "3h ago",
  },
  {
    id: "act3",
    icon: Pill,
    color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    dot: "bg-purple-400",
    title: "Prescription created",
    detail: "Arjun Sharma — Natrum Mur 1M",
    time: "5h ago",
  },
  {
    id: "act4",
    icon: TrendingUp,
    color: "text-green-400 bg-green-500/10 border-green-500/20",
    dot: "bg-green-400",
    title: "Payment received",
    detail: "Priya Nair — ₹1,800 for INV-002",
    time: "7h ago",
  },
  {
    id: "act5",
    icon: UserPlus,
    color: "text-primary bg-primary/10 border-primary/20",
    dot: "bg-primary",
    title: "New patient registered",
    detail: "Isabella Rossi — IBS consultation",
    time: "Yesterday",
  },
  {
    id: "act6",
    icon: Pill,
    color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    dot: "bg-purple-400",
    title: "Prescription renewed",
    detail: "Kavitha Reddy — Pulsatilla 200C",
    time: "Yesterday",
  },
];

const patientGrowthData = analytics.patientGrowth.map((d) => ({
  month: shortMonth(d.month),
  patients: d.value,
}));

// Custom glass tooltip for recharts
function GlassTooltip({
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
    <div className="glass rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name}:{" "}
          <span className="font-medium text-foreground">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

function DashboardPage() {
  const todayAppts = appointments.filter((a) => a.date === "2026-04-14");
  const activeCases = patients.filter(
    (p) => p.status === "active" || p.status === "inactive",
  ).length;

  const containerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
    },
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      data-ocid="dashboard-page"
    >
      <motion.div variants={itemVariants}>
        <PageHeader
          title="Dashboard"
          description="Good morning, Dr. Joshi. Here's your clinic overview for today."
          breadcrumb={[{ label: "Dashboard" }]}
        />
      </motion.div>

      {/* Stat Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        data-ocid="stat-cards-row"
      >
        <StatCard
          title="Total Patients"
          value={248}
          change={12}
          icon={<Users className="w-5 h-5" />}
          color="teal"
        />
        <StatCard
          title="Today's Appointments"
          value={todayAppts.length}
          change={3}
          icon={<Calendar className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          title="Monthly Revenue"
          value="₹1,24,500"
          change={8}
          icon={<TrendingUp className="w-5 h-5" />}
          color="green"
        />
        <StatCard
          title="Active Cases"
          value={activeCases}
          change={-2}
          icon={<Activity className="w-5 h-5" />}
          color="amber"
        />
      </motion.div>

      {/* Charts Row */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        data-ocid="charts-row"
      >
        {/* Patient Growth Line Chart */}
        <div className="glass-card p-5" data-ocid="patient-growth-chart">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-foreground">
                Patient Growth
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Last 12 months
              </p>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              +139%
            </span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart
              data={patientGrowthData}
              margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.06)"
              />
              <XAxis
                dataKey="month"
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
                dataKey="patients"
                name="Patients"
                stroke="oklch(0.65 0.18 190)"
                strokeWidth={2.5}
                dot={{ fill: "oklch(0.65 0.18 190)", r: 3, strokeWidth: 0 }}
                activeDot={{
                  r: 5,
                  fill: "oklch(0.65 0.18 190)",
                  strokeWidth: 0,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Appointments Bar Chart */}
        <div className="glass-card p-5" data-ocid="appointments-chart">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-foreground">
                Appointments
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Last 6 months
              </p>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-accent/10 text-accent border border-accent/20">
              6-month view
            </span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={apptBarData}
              margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.06)"
              />
              <XAxis
                dataKey="month"
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
              <Legend
                wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                formatter={(value) => (
                  <span style={{ color: "hsl(var(--muted-foreground))" }}>
                    {value}
                  </span>
                )}
              />
              <Bar
                dataKey="confirmed"
                name="Confirmed"
                fill="oklch(0.65 0.18 190)"
                radius={[3, 3, 0, 0]}
              />
              <Bar
                dataKey="pending"
                name="Pending"
                fill="oklch(0.75 0.15 120)"
                radius={[3, 3, 0, 0]}
              />
              <Bar
                dataKey="completed"
                name="Completed"
                fill="oklch(0.60 0.20 130)"
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Activity + Schedule Row */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        data-ocid="activity-schedule-row"
      >
        {/* Recent Activity */}
        <div className="glass-card p-5" data-ocid="recent-activity">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-foreground">
              Recent Activity
            </h3>
            <span className="text-xs text-muted-foreground">Today</span>
          </div>
          <div className="space-y-3">
            {activityItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.06 }}
                  className="flex items-start gap-3"
                >
                  <div
                    className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${item.color}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground leading-tight">
                      {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {item.detail}
                    </p>
                  </div>
                  <span className="text-[10px] text-muted-foreground/60 shrink-0 mt-0.5">
                    {item.time}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="glass-card p-5" data-ocid="todays-schedule">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-foreground">
              Today's Schedule
            </h3>
            <span className="text-xs text-muted-foreground bg-muted/30 px-2.5 py-1 rounded-full border border-border/50">
              {todayAppts.length} appointments
            </span>
          </div>
          <div className="space-y-2.5">
            {todayAppts.map((appt, index) => (
              <motion.div
                key={appt.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.06 }}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-smooth border border-white/5 cursor-pointer"
                data-ocid={`schedule-item-${appt.id}`}
              >
                {/* Time column */}
                <div className="w-14 shrink-0 text-center">
                  <p className="text-xs font-bold text-primary tabular-nums">
                    {formatTime(appt.time)}
                  </p>
                  <p className="text-[10px] text-muted-foreground capitalize mt-0.5">
                    {appt.type}
                  </p>
                </div>
                {/* Divider */}
                <div className="w-px h-8 bg-border/40 shrink-0" />
                {/* Patient info */}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {appt.patientName}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                    {appt.doctor}
                  </p>
                </div>
                <StatusBadge status={appt.status} />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
