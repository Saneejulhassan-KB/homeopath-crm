import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Activity,
  Calendar,
  ClipboardList,
  FileText,
  Pill,
} from "lucide-react";
import { motion } from "motion/react";
import { containerVariants, itemVariants } from "./shared";

const todayQueue = [
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

const recentCases = [
  {
    patient: "Sunita Verma",
    diagnosis: "Chronic Sinusitis",
    lastVisit: "May 7, 2026",
  },
  {
    patient: "Ravi Krishnan",
    diagnosis: "Irritable Bowel Syndrome",
    lastVisit: "May 5, 2026",
  },
  {
    patient: "Meera Iyer",
    diagnosis: "Anxiety & Insomnia",
    lastVisit: "May 3, 2026",
  },
  {
    patient: "Aditya Gupta",
    diagnosis: "Psoriasis",
    lastVisit: "Apr 30, 2026",
  },
  {
    patient: "Lakshmi Patel",
    diagnosis: "Rheumatoid Arthritis",
    lastVisit: "Apr 28, 2026",
  },
];

export function DoctorDashboard() {
  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      data-ocid="doctor-dashboard"
    >
      <motion.div variants={itemVariants}>
        <PageHeader
          title="My Dashboard"
          description="Good morning, Doctor. Here's your patient schedule and case overview."
          breadcrumb={[{ label: "Dashboard" }]}
        />
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          title="My Patients"
          value={89}
          change={3}
          icon={<Activity className="w-5 h-5" />}
          color="teal"
        />
        <StatCard
          title="Today's Appointments"
          value={12}
          change={0}
          icon={<Calendar className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          title="Open Cases"
          value={7}
          icon={<ClipboardList className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title="Prescriptions This Month"
          value={156}
          change={8}
          icon={<Pill className="w-5 h-5" />}
          color="green"
        />
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
      >
        <div
          className="lg:col-span-2 glass-card p-5"
          data-ocid="doctor-appt-queue"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-foreground">
              Today's Appointment Queue
            </h3>
            <span className="text-xs text-muted-foreground bg-muted/30 px-2.5 py-1 rounded-full border border-border/50">
              3 remaining
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {["Time", "Patient Name", "Reason", "Status"].map((h) => (
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
                {todayQueue.map((row) => (
                  <tr
                    key={row.time}
                    className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                    data-ocid={`doctor-appt.item.${todayQueue.indexOf(row) + 1}`}
                  >
                    <td className="py-3 pr-4 text-xs font-bold text-primary tabular-nums">
                      {row.time}
                    </td>
                    <td className="py-3 pr-4 font-medium text-foreground">
                      {row.patient}
                    </td>
                    <td className="py-3 pr-4 text-xs text-muted-foreground">
                      {row.reason}
                    </td>
                    <td className="py-3">
                      <StatusBadge status={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-card p-5" data-ocid="doctor-quick-actions">
          <h3 className="font-display font-semibold text-foreground mb-4">
            Quick Actions
          </h3>
          <div className="flex flex-col gap-2.5">
            {[
              {
                label: "New Prescription",
                icon: Pill,
                color: "text-primary",
                bg: "bg-primary/10 hover:bg-primary/20 border-primary/20",
              },
              {
                label: "Start Case Taking",
                icon: ClipboardList,
                color: "text-purple-400",
                bg: "bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20",
              },
              {
                label: "Remedy Finder",
                icon: FileText,
                color: "text-amber-400",
                bg: "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20",
              },
            ].map((action) => (
              <button
                key={action.label}
                type="button"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-smooth text-sm font-medium ${action.bg} ${action.color}`}
                data-ocid={`doctor-action-${action.label.toLowerCase().replace(/ /g, "-")}`}
              >
                <action.icon className="w-4 h-4" />
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="glass-card p-5" data-ocid="doctor-recent-cases">
          <h3 className="font-display font-semibold text-foreground mb-4">
            Recent Cases
          </h3>
          <div className="space-y-2.5">
            {recentCases.map((c) => (
              <div
                key={c.patient}
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-smooth"
                data-ocid={`doctor-case.item.${recentCases.indexOf(c) + 1}`}
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {c.patient}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {c.diagnosis}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Last visit</p>
                  <p className="text-xs font-medium text-foreground mt-0.5">
                    {c.lastVisit}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
