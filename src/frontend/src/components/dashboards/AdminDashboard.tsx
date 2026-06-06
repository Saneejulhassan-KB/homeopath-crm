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
import { StatCard } from "@/components/ui/stat-card";
import { addClinic, getCurrentUser, getUserClinics } from "@/utils/auth";
import type { Clinic } from "@/utils/auth";
import {
  Activity,
  AlertCircle,
  BriefcaseMedical,
  Building2,
  Calendar,
  ChevronRight,
  DollarSign,
  Plus,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
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
import { toast } from "sonner";
import { GlassTooltip, containerVariants, itemVariants } from "./shared";

const REVENUE_DATA = {
  "3 Months": [
    { label: "Feb", revenue: 248000 },
    { label: "Mar", revenue: 267000 },
    { label: "Apr", revenue: 284500 },
  ],
  "6 Months": [
    { label: "Nov", revenue: 198000 },
    { label: "Dec", revenue: 224000 },
    { label: "Jan", revenue: 211000 },
    { label: "Feb", revenue: 248000 },
    { label: "Mar", revenue: 267000 },
    { label: "Apr", revenue: 284500 },
  ],
  "1 Year": [
    { label: "May", revenue: 172000 },
    { label: "Jun", revenue: 185000 },
    { label: "Jul", revenue: 179000 },
    { label: "Aug", revenue: 192000 },
    { label: "Sep", revenue: 205000 },
    { label: "Oct", revenue: 188000 },
    { label: "Nov", revenue: 198000 },
    { label: "Dec", revenue: 224000 },
    { label: "Jan", revenue: 211000 },
    { label: "Feb", revenue: 248000 },
    { label: "Mar", revenue: 267000 },
    { label: "Apr", revenue: 284500 },
  ],
};

const APPT_DATA = {
  Daily: [
    { label: "9 AM", appointments: 4 },
    { label: "10 AM", appointments: 7 },
    { label: "11 AM", appointments: 5 },
    { label: "12 PM", appointments: 8 },
    { label: "2 PM", appointments: 6 },
    { label: "3 PM", appointments: 4 },
    { label: "4 PM", appointments: 3 },
    { label: "5 PM", appointments: 2 },
  ],
  Weekly: [
    { label: "Mon", appointments: 28 },
    { label: "Tue", appointments: 35 },
    { label: "Wed", appointments: 31 },
    { label: "Thu", appointments: 40 },
    { label: "Fri", appointments: 34 },
    { label: "Sat", appointments: 22 },
    { label: "Sun", appointments: 8 },
  ],
  Monthly: [
    { label: "Week 1", appointments: 120 },
    { label: "Week 2", appointments: 145 },
    { label: "Week 3", appointments: 132 },
    { label: "Week 4", appointments: 158 },
  ],
  Yearly: [
    { label: "Jan", appointments: 480 },
    { label: "Feb", appointments: 520 },
    { label: "Mar", appointments: 560 },
    { label: "Apr", appointments: 610 },
    { label: "May", appointments: 590 },
    { label: "Jun", appointments: 630 },
    { label: "Jul", appointments: 600 },
    { label: "Aug", appointments: 640 },
    { label: "Sep", appointments: 670 },
    { label: "Oct", appointments: 650 },
    { label: "Nov", appointments: 690 },
    { label: "Dec", appointments: 720 },
  ],
};

const DOCTOR_PERFORMANCE_DATA = {
  Today: [
    { name: "Dr. Anjali Sharma", patients: 14, openCases: 3, rating: 4.9 },
    { name: "Dr. Rohan Mehta", patients: 11, openCases: 2, rating: 4.7 },
    { name: "Dr. Priya Nair", patients: 9, openCases: 4, rating: 4.8 },
    { name: "Dr. Vikram Patel", patients: 8, openCases: 1, rating: 4.6 },
    { name: "Dr. Sunita Joshi", patients: 7, openCases: 2, rating: 4.5 },
  ],
  Week: [
    { name: "Dr. Anjali Sharma", patients: 68, openCases: 5, rating: 4.9 },
    { name: "Dr. Rohan Mehta", patients: 54, openCases: 4, rating: 4.7 },
    { name: "Dr. Priya Nair", patients: 49, openCases: 6, rating: 4.8 },
    { name: "Dr. Vikram Patel", patients: 42, openCases: 3, rating: 4.6 },
    { name: "Dr. Sunita Joshi", patients: 38, openCases: 4, rating: 4.5 },
  ],
  Month: [
    { name: "Dr. Anjali Sharma", patients: 280, openCases: 12, rating: 4.9 },
    { name: "Dr. Rohan Mehta", patients: 235, openCases: 9, rating: 4.7 },
    { name: "Dr. Priya Nair", patients: 210, openCases: 14, rating: 4.8 },
    { name: "Dr. Vikram Patel", patients: 195, openCases: 7, rating: 4.6 },
    { name: "Dr. Sunita Joshi", patients: 178, openCases: 10, rating: 4.5 },
  ],
  Year: [
    { name: "Dr. Anjali Sharma", patients: 3240, openCases: 45, rating: 4.9 },
    { name: "Dr. Rohan Mehta", patients: 2890, openCases: 38, rating: 4.7 },
    { name: "Dr. Priya Nair", patients: 2650, openCases: 52, rating: 4.8 },
    { name: "Dr. Vikram Patel", patients: 2410, openCases: 29, rating: 4.6 },
    { name: "Dr. Sunita Joshi", patients: 2180, openCases: 35, rating: 4.5 },
  ],
};

// Per-clinic mock stats so switching clinics shows different numbers
const CLINIC_STATS: Record<
  number,
  { patients: string; revenue: string; appts: number; doctors: number }
> = {
  0: { patients: "1,247", revenue: "₹2,84,500", appts: 34, doctors: 6 },
  1: { patients: "873", revenue: "₹1,94,200", appts: 21, doctors: 4 },
  2: { patients: "512", revenue: "₹98,700", appts: 14, doctors: 3 },
};

export function AdminDashboard() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [addOpen, setAddOpen] = useState(false);
  const [newClinic, setNewClinic] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    phone: "",
    email: "",
    registrationNumber: "",
  });
  const [adding, setAdding] = useState(false);
  const [revenuePeriod, setRevenuePeriod] = useState<
    "3 Months" | "6 Months" | "1 Year"
  >("6 Months");
  const [apptPeriod, setApptPeriod] = useState<
    "Daily" | "Weekly" | "Monthly" | "Yearly"
  >("Weekly");
  const [doctorPeriod, setDoctorPeriod] = useState<
    "Today" | "Week" | "Month" | "Year"
  >("Today");

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) return;
    setClinics(getUserClinics(user.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function refreshClinics() {
    const user = getCurrentUser();
    if (!user) return;
    setClinics(getUserClinics(user.id));
  }

  async function handleAddClinic() {
    if (!newClinic.name.trim()) {
      toast.error("Clinic name is required.");
      return;
    }
    const user = getCurrentUser();
    if (!user) return;
    setAdding(true);
    await new Promise((r) => setTimeout(r, 400));
    addClinic({ ...newClinic, ownerId: user.id });
    setAdding(false);
    setAddOpen(false);
    setNewClinic({
      name: "",
      address: "",
      city: "",
      state: "",
      country: "India",
      phone: "",
      email: "",
      registrationNumber: "",
    });
    refreshClinics();
    toast.success("New clinic added!");
  }

  const stats = CLINIC_STATS[activeIdx] ?? CLINIC_STATS[0];

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      data-ocid="admin-dashboard"
    >
      <motion.div variants={itemVariants}>
        <PageHeader
          title="Admin Dashboard"
          description="Clinic-wide overview — all operations at a glance."
          breadcrumb={[{ label: "Dashboard" }]}
        />
      </motion.div>

      {/* Clinic Count Badge + Switcher */}
      <motion.div
        variants={itemVariants}
        className="flex flex-wrap items-center gap-3"
      >
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
          <Building2 className="w-4 h-4" />
          Managing {clinics.length} Clinic{clinics.length !== 1 ? "s" : ""}
        </div>
        {clinics.length > 1 && (
          <div
            className="flex gap-2 overflow-x-auto pb-1"
            data-ocid="admin.clinic_switcher"
          >
            {clinics.map((c, i) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveIdx(i)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all whitespace-nowrap ${
                  activeIdx === i
                    ? "bg-primary/20 text-primary border-primary/40 ring-1 ring-primary/30 shadow-sm"
                    : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/25 hover:text-foreground"
                }`}
                data-ocid={`admin.clinic_tab.${i + 1}`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="ml-auto flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-white/15 text-muted-foreground hover:text-foreground hover:border-white/30 transition-all"
          data-ocid="admin.add_clinic_button"
        >
          <Plus className="w-3.5 h-3.5" /> Add Clinic
        </button>
      </motion.div>

      {/* Active clinic label */}
      {clinics[activeIdx] && (
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-2 text-xs text-muted-foreground"
        >
          <ChevronRight className="w-3.5 h-3.5" />
          <span>
            Showing stats for{" "}
            <strong className="text-foreground">
              {clinics[activeIdx]?.name}
            </strong>
          </span>
        </motion.div>
      )}

      {/* Stat Cards — First Row */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          title="Total Appointments"
          value={stats.appts}
          change={5}
          icon={<Calendar className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          title="Total Visitors"
          value="1,580"
          change={12}
          icon={<Users className="w-5 h-5" />}
          color="teal"
        />
        <StatCard
          title="Cases Taken"
          value="312"
          change={8}
          icon={<Activity className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title="Total Revenue"
          value={stats.revenue}
          change={8}
          icon={<DollarSign className="w-5 h-5" />}
          color="green"
        />
      </motion.div>

      {/* Stat Cards — Second Row */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <StatCard
          title="Total Patients"
          value={stats.patients}
          change={12}
          icon={<Users className="w-5 h-5" />}
          color="teal"
        />
        <div
          className="glass-card p-5 flex items-center gap-4"
          data-ocid="admin-pending-cases"
        >
          <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/20">
            <AlertCircle className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <p className="text-3xl font-bold font-display text-foreground">
              23
            </p>
            <p className="text-sm text-muted-foreground">Pending Cases</p>
            <p className="text-xs text-amber-400 mt-1">
              Needs follow-up this week
            </p>
          </div>
        </div>
        <div
          className="glass-card p-5 flex items-center gap-4"
          data-ocid="admin-waiting-patients"
        >
          <div className="p-3 rounded-xl bg-primary/15 border border-primary/20">
            <Activity className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-3xl font-bold font-display text-foreground">
              18
            </p>
            <p className="text-sm text-muted-foreground">
              Waiting Patients Today
            </p>
            <p className="text-xs text-primary mt-1">Average wait ~12 min</p>
          </div>
        </div>
      </motion.div>

      {/* Charts */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        <div className="glass-card p-5" data-ocid="admin-revenue-chart">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-foreground">
                Revenue Trend
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {revenuePeriod === "3 Months"
                  ? "Last 3 months"
                  : revenuePeriod === "1 Year"
                    ? "Last 12 months"
                    : "Last 6 months"}
              </p>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
              +43%
            </span>
          </div>
          <div className="flex gap-2 mb-4">
            {(["3 Months", "6 Months", "1 Year"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setRevenuePeriod(p)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                  revenuePeriod === p
                    ? "bg-primary/20 text-primary border-primary/40 ring-1 ring-primary/30"
                    : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/25 hover:text-foreground"
                }`}
                data-ocid={`admin.revenue_toggle.${p.toLowerCase().replace(" ", "_")}`}
              >
                {p}
              </button>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart
              data={REVENUE_DATA[revenuePeriod]}
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
              <Line
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="oklch(0.65 0.18 150)"
                strokeWidth={2.5}
                dot={{ fill: "oklch(0.65 0.18 150)", r: 3, strokeWidth: 0 }}
                activeDot={{
                  r: 5,
                  fill: "oklch(0.65 0.18 150)",
                  strokeWidth: 0,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-card p-5" data-ocid="admin-appt-chart">
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
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
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
                data-ocid={`admin.appt_toggle.${p.toLowerCase()}`}
              >
                {p}
              </button>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={APPT_DATA[apptPeriod]}
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
                fill="oklch(0.65 0.18 190)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Doctor Performance Table */}
      <motion.div variants={itemVariants}>
        <div className="glass-card p-5" data-ocid="admin-doctor-table">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-foreground">
              Doctor Performance
            </h3>
            <div className="flex gap-2">
              {(["Today", "Week", "Month", "Year"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setDoctorPeriod(p)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                    doctorPeriod === p
                      ? "bg-primary/20 text-primary border-primary/40 ring-1 ring-primary/30"
                      : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/25 hover:text-foreground"
                  }`}
                  data-ocid={`admin.doctor_toggle.${p.toLowerCase()}`}
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
                    "Doctor Name",
                    doctorPeriod === "Today"
                      ? "Patients Today"
                      : doctorPeriod === "Week"
                        ? "Patients This Week"
                        : doctorPeriod === "Month"
                          ? "Patients This Month"
                          : "Patients This Year",
                    "Cases Open",
                    "Avg Rating",
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
                {DOCTOR_PERFORMANCE_DATA[doctorPeriod].map((row, i) => (
                  <tr
                    key={row.name}
                    className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                    data-ocid={`admin-doctor.item.${i + 1}`}
                  >
                    <td className="py-3 pr-4 font-medium text-foreground">
                      {row.name}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground tabular-nums">
                      {row.patients}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${row.openCases > 3 ? "bg-amber-500/15 text-amber-400" : "bg-green-500/15 text-green-400"}`}
                      >
                        {row.openCases}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <span className="text-xs font-bold text-primary">
                        ⭐ {row.rating}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* Add Clinic Modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent
          className="glass border-white/10 bg-card/95 backdrop-blur-xl"
          data-ocid="admin.add_clinic.dialog"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" /> Add New Clinic
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">
                Clinic Name *
              </Label>
              <Input
                value={newClinic.name}
                onChange={(e) =>
                  setNewClinic((c) => ({ ...c, name: e.target.value }))
                }
                placeholder="Healing Roots Clinic"
                className="glass border-white/10 bg-white/5"
                data-ocid="admin.add_clinic.name_input"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">
                  City
                </Label>
                <Input
                  value={newClinic.city}
                  onChange={(e) =>
                    setNewClinic((c) => ({ ...c, city: e.target.value }))
                  }
                  placeholder="Mumbai"
                  className="glass border-white/10 bg-white/5"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">
                  Country
                </Label>
                <Input
                  value={newClinic.country}
                  onChange={(e) =>
                    setNewClinic((c) => ({ ...c, country: e.target.value }))
                  }
                  placeholder="India"
                  className="glass border-white/10 bg-white/5"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">
                Address
              </Label>
              <Input
                value={newClinic.address}
                onChange={(e) =>
                  setNewClinic((c) => ({ ...c, address: e.target.value }))
                }
                placeholder="Street address"
                className="glass border-white/10 bg-white/5"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setAddOpen(false)}
              className="flex-1"
              data-ocid="admin.add_clinic.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAddClinic}
              disabled={adding}
              className="flex-1 bg-primary hover:bg-primary/90"
              data-ocid="admin.add_clinic.confirm_button"
            >
              {adding ? "Adding..." : "Add Clinic"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
