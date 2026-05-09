import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import {
  AlertTriangle,
  CheckSquare,
  FlaskConical,
  Package,
} from "lucide-react";
import { motion } from "motion/react";
import { containerVariants, itemVariants } from "./shared";

const prescriptionQueue = [
  {
    patient: "Priya Nair",
    doctor: "Dr. Anjali Sharma",
    remedy: "Natrum Muriaticum",
    potency: "1M",
    status: "pending",
  },
  {
    patient: "Hans Mueller",
    doctor: "Dr. Rohan Mehta",
    remedy: "Rhus Toxicodendron",
    potency: "200C",
    status: "pending",
  },
  {
    patient: "Kavitha Reddy",
    doctor: "Dr. Vikram Patel",
    remedy: "Pulsatilla",
    potency: "30C",
    status: "preparing",
  },
  {
    patient: "Arjun Sharma",
    doctor: "Dr. Anjali Sharma",
    remedy: "Nux Vomica",
    potency: "200C",
    status: "ready",
  },
  {
    patient: "Sunita Verma",
    doctor: "Dr. Priya Nair",
    remedy: "Belladonna",
    potency: "30C",
    status: "dispensed",
  },
];

const stockAlerts = [
  { name: "Arnica Montana 30C", stock: 5, severity: "critical" },
  { name: "Belladonna 200C", stock: 3, severity: "critical" },
  { name: "Nux Vomica 1M", stock: 8, severity: "low" },
  { name: "Pulsatilla 200C", stock: 6, severity: "low" },
  { name: "Sulphur 30C", stock: 11, severity: "low" },
];

const statusStyle: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  preparing: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  ready: "bg-green-500/15 text-green-400 border-green-500/25",
  dispensed: "bg-muted/30 text-muted-foreground border-border/30",
};

export function PharmacistDashboard() {
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
          description="Prescription fulfillment, dispensing, and inventory management."
          breadcrumb={[{ label: "Dashboard" }]}
        />
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          title="Prescriptions Pending"
          value={14}
          icon={<FlaskConical className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title="Dispensed Today"
          value={28}
          change={12}
          icon={<CheckSquare className="w-5 h-5" />}
          color="green"
        />
        <StatCard
          title="Low Stock Alerts"
          value={5}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="rose"
        />
        <StatCard
          title="Pending Preparation"
          value={9}
          icon={<Package className="w-5 h-5" />}
          color="purple"
        />
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
      >
        <div
          className="lg:col-span-2 glass-card p-5"
          data-ocid="pharmacist-rx-queue"
        >
          <h3 className="font-display font-semibold text-foreground mb-4">
            Prescription Fulfillment Queue
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {["Patient", "Doctor", "Remedy", "Potency", "Status"].map(
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
                {prescriptionQueue.map((row) => (
                  <tr
                    key={row.patient}
                    className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                    data-ocid={`pharmacist-rx.item.${prescriptionQueue.indexOf(row) + 1}`}
                  >
                    <td className="py-3 pr-4 font-medium text-foreground">
                      {row.patient}
                    </td>
                    <td className="py-3 pr-4 text-xs text-muted-foreground">
                      {row.doctor}
                    </td>
                    <td className="py-3 pr-4 text-xs text-foreground/80">
                      {row.remedy}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-xs font-bold text-primary">
                        {row.potency}
                      </span>
                    </td>
                    <td className="py-3">
                      <span
                        className={`text-xs font-medium px-2.5 py-0.5 rounded-full border capitalize ${statusStyle[row.status]}`}
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

        <div className="glass-card p-5" data-ocid="pharmacist-stock-alerts">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="font-display font-semibold text-foreground">
              Stock Depletion Alerts
            </h3>
          </div>
          <div className="space-y-2.5">
            {stockAlerts.map((item) => (
              <div
                key={item.name}
                className={`flex items-center justify-between p-3 rounded-xl border ${item.severity === "critical" ? "bg-rose-500/10 border-rose-500/20" : "bg-amber-500/10 border-amber-500/20"}`}
                data-ocid={`pharmacist-stock.item.${stockAlerts.indexOf(item) + 1}`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {item.name}
                  </p>
                  <p
                    className={`text-[10px] mt-0.5 ${item.severity === "critical" ? "text-rose-400" : "text-amber-400"}`}
                  >
                    {item.severity === "critical"
                      ? "⚠ Critical"
                      : "↓ Low Stock"}
                  </p>
                </div>
                <span
                  className={`text-sm font-bold tabular-nums ml-2 ${item.severity === "critical" ? "text-rose-400" : "text-amber-400"}`}
                >
                  {item.stock} left
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
