import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { AlertCircle, CreditCard, DollarSign, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { GlassTooltip, containerVariants, itemVariants } from "./shared";

const revenueData = [
  { month: "Nov", revenue: 182000 },
  { month: "Dec", revenue: 214000 },
  { month: "Jan", revenue: 196000 },
  { month: "Feb", revenue: 238000 },
  { month: "Mar", revenue: 251000 },
  { month: "Apr", revenue: 284500 },
];

const unpaidInvoices = [
  {
    patient: "Hans Mueller",
    amount: "₹3,200",
    invoiceDate: "Apr 20",
    dueDate: "May 5",
    status: "overdue",
  },
  {
    patient: "Fatima Al-Zahra",
    amount: "₹2,800",
    invoiceDate: "Apr 25",
    dueDate: "May 10",
    status: "pending",
  },
  {
    patient: "Isabella Rossi",
    amount: "₹4,500",
    invoiceDate: "Apr 28",
    dueDate: "May 13",
    status: "pending",
  },
  {
    patient: "Ravi Krishnan",
    amount: "₹1,900",
    invoiceDate: "Apr 15",
    dueDate: "Apr 30",
    status: "overdue",
  },
  {
    patient: "Aditya Gupta",
    amount: "₹3,600",
    invoiceDate: "May 1",
    dueDate: "May 16",
    status: "pending",
  },
];

const overdueAccounts = [
  { patient: "Sunita Verma", amount: "₹7,400", days: 42 },
  { patient: "Hans Mueller", amount: "₹3,200", days: 34 },
  { patient: "Ravi Krishnan", amount: "₹1,900", days: 39 },
  { patient: "Meera Iyer", amount: "₹5,100", days: 51 },
  { patient: "Rahul Das", amount: "₹2,600", days: 33 },
  { patient: "Ananya Singh", amount: "₹4,800", days: 38 },
  { patient: "Lakshmi Patel", amount: "₹3,900", days: 44 },
];

const invoiceStatusStyle: Record<string, string> = {
  overdue: "bg-rose-500/15 text-rose-400 border-rose-500/25",
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  paid: "bg-green-500/15 text-green-400 border-green-500/25",
};

export function BillingDashboard() {
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
          description="Track invoices, collections, overdue accounts, and revenue."
          breadcrumb={[{ label: "Dashboard" }]}
        />
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          title="Unpaid Invoices"
          value={23}
          icon={<DollarSign className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title="Collected Today"
          value="₹12,400"
          change={18}
          icon={<CreditCard className="w-5 h-5" />}
          color="green"
        />
        <StatCard
          title="Overdue (30+ days)"
          value={7}
          icon={<AlertCircle className="w-5 h-5" />}
          color="rose"
        />
        <StatCard
          title="Renewals Due"
          value={4}
          icon={<RefreshCw className="w-5 h-5" />}
          color="purple"
        />
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
      >
        <div
          className="lg:col-span-2 glass-card p-5"
          data-ocid="billing-invoices-table"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-foreground">
              Unpaid Invoices
            </h3>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              ₹48,200 total
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {[
                    "Patient",
                    "Amount",
                    "Invoice Date",
                    "Due Date",
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
                {unpaidInvoices.map((row) => (
                  <tr
                    key={row.patient}
                    className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                    data-ocid={`billing-invoice.item.${unpaidInvoices.indexOf(row) + 1}`}
                  >
                    <td className="py-3 pr-4 font-medium text-foreground">
                      {row.patient}
                    </td>
                    <td className="py-3 pr-4 text-sm font-bold text-foreground tabular-nums">
                      {row.amount}
                    </td>
                    <td className="py-3 pr-4 text-xs text-muted-foreground">
                      {row.invoiceDate}
                    </td>
                    <td className="py-3 pr-4 text-xs text-muted-foreground">
                      {row.dueDate}
                    </td>
                    <td className="py-3">
                      <span
                        className={`text-xs font-medium px-2.5 py-0.5 rounded-full border capitalize ${invoiceStatusStyle[row.status]}`}
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

        <div className="glass-card p-5" data-ocid="billing-overdue-accounts">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <h3 className="font-display font-semibold text-foreground">
              Overdue Accounts
            </h3>
          </div>
          <div className="space-y-2">
            {overdueAccounts.map((acc) => (
              <div
                key={acc.patient}
                className="flex items-center justify-between p-2.5 rounded-xl bg-rose-500/5 border border-rose-500/15 hover:bg-rose-500/10 transition-smooth"
                data-ocid={`billing-overdue.item.${overdueAccounts.indexOf(acc) + 1}`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {acc.patient}
                  </p>
                  <p className="text-[10px] text-rose-400 mt-0.5">
                    {acc.days} days overdue
                  </p>
                </div>
                <span className="text-sm font-bold text-rose-400 ml-2 tabular-nums shrink-0">
                  {acc.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="glass-card p-5" data-ocid="billing-revenue-chart">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-foreground">
                Monthly Revenue
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Last 6 months
              </p>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
              +56%
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={revenueData}
              margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
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
      </motion.div>
    </motion.div>
  );
}
