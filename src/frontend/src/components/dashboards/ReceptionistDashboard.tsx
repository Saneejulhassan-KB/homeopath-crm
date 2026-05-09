import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Calendar, CheckCircle, Clock, UserPlus, Users } from "lucide-react";
import { motion } from "motion/react";
import { containerVariants, itemVariants } from "./shared";

const todayAppts = [
  {
    time: "09:00 AM",
    patient: "Arjun Sharma",
    doctor: "Dr. Anjali Sharma",
    status: "completed" as const,
  },
  {
    time: "09:30 AM",
    patient: "Fatima Al-Zahra",
    doctor: "Dr. Rohan Mehta",
    status: "completed" as const,
  },
  {
    time: "10:00 AM",
    patient: "Priya Nair",
    doctor: "Dr. Anjali Sharma",
    status: "confirmed" as const,
  },
  {
    time: "10:30 AM",
    patient: "Hans Mueller",
    doctor: "Dr. Priya Nair",
    status: "pending" as const,
  },
  {
    time: "11:00 AM",
    patient: "Kavitha Reddy",
    doctor: "Dr. Vikram Patel",
    status: "confirmed" as const,
  },
  {
    time: "11:30 AM",
    patient: "Ravi Krishnan",
    doctor: "Dr. Rohan Mehta",
    status: "pending" as const,
  },
];

const pendingConfirmations = [
  {
    patient: "Isabella Rossi",
    time: "May 10, 02:00 PM",
    doctor: "Dr. Anjali Sharma",
  },
  {
    patient: "Sunita Verma",
    time: "May 11, 10:00 AM",
    doctor: "Dr. Vikram Patel",
  },
  {
    patient: "Aditya Gupta",
    time: "May 12, 09:30 AM",
    doctor: "Dr. Rohan Mehta",
  },
  { patient: "Meera Iyer", time: "May 13, 03:30 PM", doctor: "Dr. Priya Nair" },
];

export function ReceptionistDashboard() {
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

      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          title="Appointments Today"
          value={34}
          change={4}
          icon={<Calendar className="w-5 h-5" />}
          color="teal"
        />
        <StatCard
          title="Checked In"
          value={18}
          icon={<CheckCircle className="w-5 h-5" />}
          color="green"
        />
        <StatCard
          title="Waiting"
          value={8}
          icon={<Clock className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title="New Registrations"
          value={3}
          icon={<UserPlus className="w-5 h-5" />}
          color="purple"
        />
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row gap-4"
      >
        <button
          type="button"
          className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-primary/20 hover:bg-primary/30 border border-primary/30 transition-smooth text-primary font-semibold text-sm min-w-[200px]"
          data-ocid="receptionist-walkin-button"
        >
          <UserPlus className="w-5 h-5" />
          Walk-in Registration
        </button>
        <div
          className="glass-card flex-1 p-5"
          data-ocid="receptionist-pending-confirmations"
        >
          <h3 className="font-display font-semibold text-foreground mb-3">
            Pending Confirmations
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {pendingConfirmations.map((p) => (
              <div
                key={p.patient}
                className="flex items-start gap-3 p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/15"
                data-ocid={`receptionist-confirmation.item.${pendingConfirmations.indexOf(p) + 1}`}
              >
                <Users className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    {p.patient}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {p.time}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {p.doctor}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="glass-card p-5" data-ocid="receptionist-appt-queue">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-foreground">
              Today's Full Appointment Queue
            </h3>
            <span className="text-xs text-muted-foreground bg-muted/30 px-2.5 py-1 rounded-full border border-border/50">
              34 total
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {["Time", "Patient", "Doctor", "Status", "Action"].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left text-xs font-semibold text-muted-foreground py-2 pr-4 last:pr-0"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {todayAppts.map((row) => (
                  <tr
                    key={row.time}
                    className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                    data-ocid={`receptionist-appt.item.${todayAppts.indexOf(row) + 1}`}
                  >
                    <td className="py-3 pr-4 text-xs font-bold text-primary tabular-nums">
                      {row.time}
                    </td>
                    <td className="py-3 pr-4 font-medium text-foreground">
                      {row.patient}
                    </td>
                    <td className="py-3 pr-4 text-xs text-muted-foreground">
                      {row.doctor}
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="py-3">
                      <button
                        type="button"
                        className="text-xs text-primary hover:underline transition-smooth"
                        data-ocid={`receptionist-checkin.item.${todayAppts.indexOf(row) + 1}`}
                      >
                        Check In
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
