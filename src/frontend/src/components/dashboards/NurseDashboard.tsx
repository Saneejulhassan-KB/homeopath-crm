import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { CheckSquare, ClipboardList, Leaf, Package } from "lucide-react";
import { motion } from "motion/react";
import { containerVariants, itemVariants } from "./shared";

const prepQueue = [
  {
    remedy: "Arnica Montana",
    potency: "30C",
    qty: 3,
    doctor: "Dr. Anjali Sharma",
    status: "pending",
  },
  {
    remedy: "Belladonna",
    potency: "200C",
    qty: 2,
    doctor: "Dr. Rohan Mehta",
    status: "in-progress",
  },
  {
    remedy: "Nux Vomica",
    potency: "1M",
    qty: 1,
    doctor: "Dr. Vikram Patel",
    status: "done",
  },
  {
    remedy: "Pulsatilla",
    potency: "30C",
    qty: 4,
    doctor: "Dr. Anjali Sharma",
    status: "pending",
  },
  {
    remedy: "Sulphur",
    potency: "200C",
    qty: 2,
    doctor: "Dr. Priya Nair",
    status: "done",
  },
  {
    remedy: "Calc Carb",
    potency: "1M",
    qty: 1,
    doctor: "Dr. Rohan Mehta",
    status: "in-progress",
  },
];

const stockCategories = [
  {
    label: "Mineral",
    count: 142,
    icon: "💎",
    color: "bg-sky-500/15 border-sky-500/20 text-sky-300",
  },
  {
    label: "Plant",
    count: 218,
    icon: "🌿",
    color: "bg-green-500/15 border-green-500/20 text-green-300",
  },
  {
    label: "Animal",
    count: 34,
    icon: "🦐",
    color: "bg-amber-500/15 border-amber-500/20 text-amber-300",
  },
  {
    label: "Nosode",
    count: 28,
    icon: "🔬",
    color: "bg-purple-500/15 border-purple-500/20 text-purple-300",
  },
];

const statusStyle: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  "in-progress": "bg-blue-500/15 text-blue-400 border-blue-500/25",
  done: "bg-green-500/15 text-green-400 border-green-500/25",
};

export function NurseDashboard() {
  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      data-ocid="nurse-dashboard"
    >
      <motion.div variants={itemVariants}>
        <PageHeader
          title="Nurse / Compounder"
          description="Manage remedy preparations, stock tracking, and task queue."
          breadcrumb={[{ label: "Dashboard" }]}
        />
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          title="Preparation Tasks Today"
          value={18}
          icon={<ClipboardList className="w-5 h-5" />}
          color="teal"
        />
        <StatCard
          title="Completed"
          value={12}
          change={15}
          icon={<CheckSquare className="w-5 h-5" />}
          color="green"
        />
        <StatCard
          title="Pending Remedies"
          value={6}
          icon={<Leaf className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title="Stock Requests"
          value={3}
          icon={<Package className="w-5 h-5" />}
          color="purple"
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="glass-card p-5" data-ocid="nurse-stock-categories">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-foreground">
              Stock Levels by Category
            </h3>
            <button
              type="button"
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-smooth"
              data-ocid="nurse-templates-button"
            >
              Clinical Templates
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stockCategories.map((cat) => (
              <div
                key={cat.label}
                className={`rounded-xl border p-4 flex flex-col items-center gap-1 ${cat.color}`}
                data-ocid={`nurse-stock-cat.item.${stockCategories.indexOf(cat) + 1}`}
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-xl font-bold font-display tabular-nums">
                  {cat.count}
                </span>
                <span className="text-xs font-medium">{cat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="glass-card p-5" data-ocid="nurse-prep-queue">
          <h3 className="font-display font-semibold text-foreground mb-4">
            Preparation Queue
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {[
                    "Remedy Name",
                    "Potency",
                    "Qty",
                    "Doctor Ordered",
                    "Status",
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
                {prepQueue.map((row) => (
                  <tr
                    key={`${row.remedy}-${row.potency}`}
                    className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                    data-ocid={`nurse-prep.item.${prepQueue.indexOf(row) + 1}`}
                  >
                    <td className="py-3 pr-4 font-medium text-foreground">
                      {row.remedy}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-xs font-bold text-primary">
                        {row.potency}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground tabular-nums">
                      {row.qty}
                    </td>
                    <td className="py-3 pr-4 text-xs text-muted-foreground">
                      {row.doctor}
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
      </motion.div>
    </motion.div>
  );
}
