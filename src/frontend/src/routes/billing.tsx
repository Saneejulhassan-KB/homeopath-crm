import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { invoices } from "@/data/billing";
import type { Invoice, InvoiceStatus } from "@/types";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { createRoute } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Download,
  Eye,
  FilePlus,
  Printer,
  Receipt,
  Search,
  Sparkles,
  Star,
  TrendingUp,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Route as rootRoute } from "./__root";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/billing",
  component: BillingPage,
});

// ── helpers ──────────────────────────────────────────────────────────────────
const APRIL_2026 = "2026-04";

function thisMonthPaid(list: Invoice[]) {
  return list
    .filter((inv) => inv.status === "paid" && inv.date.startsWith(APRIL_2026))
    .reduce((s, inv) => s + inv.amount, 0);
}

function paymentMethodColor(method: string) {
  const m = method.toLowerCase();
  if (m === "cash") return "bg-green-500/10 text-green-400 border-green-500/20";
  if (m.includes("credit") || m.includes("card"))
    return "bg-blue-500/10 text-blue-400 border-blue-500/20";
  if (m === "upi")
    return "bg-purple-500/10 text-purple-400 border-purple-500/20";
  if (m === "stripe" || m === "paypal")
    return "bg-primary/10 text-primary border-primary/20";
  return "bg-muted/50 text-muted-foreground border-border";
}

// ── Invoice Detail Modal ──────────────────────────────────────────────────────
function InvoiceModal({
  invoice,
  onClose,
}: {
  invoice: Invoice;
  onClose: () => void;
}) {
  const subtotal = invoice.items.reduce((s, it) => s + it.total, 0);
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + tax;
  const invNum = `INV-${invoice.id.replace("inv", "").padStart(3, "0")}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm"
      onClick={onClose}
      data-ocid="invoice-modal-overlay"
    >
      <motion.div
        initial={{ scale: 0.96, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, y: 16 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        data-ocid="invoice-modal"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-primary/15 border border-primary/20">
                <Receipt className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                {invNum}
              </span>
              <StatusBadge status={invoice.status} />
            </div>
            <h2 className="text-xl font-display font-bold text-foreground">
              HomeoPath Clinic
            </h2>
            <p className="text-xs text-muted-foreground">
              42, Wellness Lane, Bengaluru — 560001 · +91 80 4567 8900
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-smooth text-muted-foreground hover:text-foreground"
            aria-label="Close modal"
            data-ocid="invoice-modal-close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Patient */}
        <div className="grid grid-cols-2 gap-4 p-6 border-b border-white/10">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Bill To
            </p>
            <p className="font-semibold text-foreground">
              {invoice.patientName}
            </p>
            <p className="text-xs text-muted-foreground">
              Patient ID: {invoice.patientId.toUpperCase()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Invoice Date
            </p>
            <p className="font-semibold text-foreground">
              {formatDate(invoice.date)}
            </p>
            <p className="text-xs text-muted-foreground">
              Payment: {invoice.paymentMethod}
            </p>
          </div>
        </div>

        {/* Line Items */}
        <div className="p-6 border-b border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground uppercase tracking-wide border-b border-white/10">
                <th className="text-left pb-3 font-medium">Service / Item</th>
                <th className="text-center pb-3 font-medium">Qty</th>
                <th className="text-right pb-3 font-medium">Rate</th>
                <th className="text-right pb-3 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item) => (
                <tr key={item.description} className="border-b border-white/5">
                  <td className="py-3 text-foreground">{item.description}</td>
                  <td className="py-3 text-center text-muted-foreground">
                    {item.quantity}
                  </td>
                  <td className="py-3 text-right text-muted-foreground">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="py-3 text-right font-medium text-foreground">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="p-6 border-b border-white/10">
          <div className="max-w-xs ml-auto space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>GST (18%)</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg text-foreground border-t border-white/10 pt-2 mt-2">
              <span>Total</span>
              <span className="text-primary">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-6">
          <p className="text-xs text-muted-foreground">
            Thank you for choosing HomeoPath Clinic.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.print()}
            className="flex items-center gap-2"
            data-ocid="invoice-print-btn"
          >
            <Printer className="w-3.5 h-3.5" />
            Print
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Invoices Tab ──────────────────────────────────────────────────────────────
function InvoicesTab() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Invoice | null>(null);

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch = inv.patientName
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || inv.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const outstanding = invoices
    .filter((i) => i.status === "pending")
    .reduce((s, i) => s + i.amount, 0);
  const overdue = invoices
    .filter((i) => i.status === "overdue")
    .reduce((s, i) => s + i.amount, 0);
  const overdueCount = invoices.filter((i) => i.status === "overdue").length;
  const collected = thisMonthPaid(invoices);

  const summaryCards = [
    {
      label: "Total Outstanding",
      value: formatCurrency(outstanding),
      icon: <TrendingUp className="w-4 h-4" />,
      color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
    {
      label: "Collected This Month",
      value: formatCurrency(collected),
      icon: <CheckCircle2 className="w-4 h-4" />,
      color: "bg-green-500/10 text-green-400 border-green-500/20",
    },
    {
      label: "Overdue Invoices",
      value: `${overdueCount} invoices · ${formatCurrency(overdue)}`,
      icon: <AlertCircle className="w-4 h-4" />,
      color: "bg-destructive/10 text-destructive border-destructive/20",
    },
  ];

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {summaryCards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card p-4 flex items-center gap-4"
          >
            <div className={`p-2.5 rounded-xl border ${c.color}`}>{c.icon}</div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{c.label}</p>
              <p className="font-semibold text-foreground truncate">
                {c.value}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search patient name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 glass border-white/10"
            data-ocid="invoice-search"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger
            className="w-full sm:w-40 glass border-white/10"
            data-ocid="invoice-status-filter"
          >
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs text-muted-foreground uppercase tracking-wide">
                <th className="text-left px-5 py-4 font-medium">Invoice #</th>
                <th className="text-left px-5 py-4 font-medium">Patient</th>
                <th className="text-left px-5 py-4 font-medium hidden md:table-cell">
                  Date
                </th>
                <th className="text-right px-5 py-4 font-medium">Amount</th>
                <th className="text-center px-5 py-4 font-medium">Status</th>
                <th className="text-right px-5 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv, i) => (
                <motion.tr
                  key={inv.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-smooth group"
                  data-ocid={`invoice-row-${inv.id}`}
                >
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs text-primary">
                      INV-{inv.id.replace("inv", "").padStart(3, "0")}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-medium text-foreground">
                    {inv.patientName}
                  </td>
                  <td className="px-5 py-4 text-muted-foreground hidden md:table-cell">
                    {formatDate(inv.date)}
                  </td>
                  <td className="px-5 py-4 text-right font-semibold tabular-nums">
                    {formatCurrency(inv.amount)}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <StatusBadge status={inv.status as InvoiceStatus} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setSelected(inv)}
                        className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-smooth opacity-50 group-hover:opacity-100"
                        aria-label="View invoice"
                        data-ocid={`view-invoice-${inv.id}`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          toast.success(`Downloading INV-${inv.id}...`)
                        }
                        className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-smooth opacity-50 group-hover:opacity-100"
                        aria-label="Download invoice"
                        data-ocid={`download-invoice-${inv.id}`}
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <p className="text-muted-foreground text-sm">
                      No invoices match your filters.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {selected && (
          <InvoiceModal invoice={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Payment History Tab ───────────────────────────────────────────────────────
const payments = invoices
  .filter((inv) => inv.status === "paid")
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

function PaymentHistoryTab() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");

  const filtered = useMemo(() => {
    return payments.filter((inv) => {
      const matchMethod =
        methodFilter === "all" ||
        inv.paymentMethod.toLowerCase().includes(methodFilter.toLowerCase());
      return matchMethod;
    });
  }, [methodFilter]);

  const totalThisMonth = thisMonthPaid(payments);

  return (
    <div className="space-y-5">
      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5 flex items-center gap-4"
      >
        <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
          <CreditCard className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">
            Total Payments — April 2026
          </p>
          <p className="text-2xl font-display font-bold text-foreground">
            {formatCurrency(totalThisMonth)}
          </p>
        </div>
        <div className="ml-auto text-right hidden sm:block">
          <p className="text-xs text-muted-foreground">Transactions</p>
          <p className="text-lg font-semibold text-foreground">
            {payments.filter((p) => p.date.startsWith(APRIL_2026)).length}
          </p>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 flex-1">
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            placeholder="From date"
            className="glass border-white/10 text-sm"
            data-ocid="payment-date-from"
          />
          <span className="text-muted-foreground text-sm">–</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            placeholder="To date"
            className="glass border-white/10 text-sm"
            data-ocid="payment-date-to"
          />
        </div>
        <Select value={methodFilter} onValueChange={setMethodFilter}>
          <SelectTrigger
            className="w-full sm:w-44 glass border-white/10"
            data-ocid="payment-method-filter"
          >
            <SelectValue placeholder="All Methods" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value="upi">UPI</SelectItem>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="credit">Credit Card</SelectItem>
            <SelectItem value="bank">Bank Transfer</SelectItem>
            <SelectItem value="stripe">Stripe</SelectItem>
            <SelectItem value="paypal">PayPal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs text-muted-foreground uppercase tracking-wide">
                <th className="text-left px-5 py-4 font-medium">Date</th>
                <th className="text-left px-5 py-4 font-medium">Patient</th>
                <th className="text-left px-5 py-4 font-medium hidden sm:table-cell">
                  Invoice #
                </th>
                <th className="text-right px-5 py-4 font-medium">Amount</th>
                <th className="text-center px-5 py-4 font-medium hidden md:table-cell">
                  Method
                </th>
                <th className="text-center px-5 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv, i) => (
                <motion.tr
                  key={inv.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-smooth"
                  data-ocid={`payment-row-${inv.id}`}
                >
                  <td className="px-5 py-4 text-muted-foreground text-xs">
                    {formatDate(inv.date)}
                  </td>
                  <td className="px-5 py-4 font-medium text-foreground">
                    {inv.patientName}
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <span className="font-mono text-xs text-primary">
                      INV-{inv.id.replace("inv", "").padStart(3, "0")}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right font-semibold tabular-nums">
                    {formatCurrency(inv.amount)}
                  </td>
                  <td className="px-5 py-4 text-center hidden md:table-cell">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${paymentMethodColor(inv.paymentMethod)}`}
                    >
                      {inv.paymentMethod}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <StatusBadge status="paid" />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

// ── Subscription Plans Tab ────────────────────────────────────────────────────
const plans = [
  {
    id: "basic",
    name: "Basic",
    price: 999,
    popular: false,
    current: false,
    features: [
      "Up to 50 patients",
      "Basic appointment calendar",
      "Invoice generation",
      "Basic reports",
      "Email support",
    ],
    color: "border-border",
    accent: "text-muted-foreground",
    btnVariant: "outline" as const,
  },
  {
    id: "professional",
    name: "Professional",
    price: 2499,
    popular: true,
    current: true,
    features: [
      "Unlimited patients",
      "Advanced analytics & charts",
      "AI Assistant (remedies & analysis)",
      "Multi-doctor profiles",
      "Priority support",
      "PDF report export",
    ],
    color: "border-primary/40",
    accent: "text-primary",
    btnVariant: "default" as const,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 5999,
    popular: false,
    current: false,
    features: [
      "Multi-clinic management",
      "White-label branding",
      "API access & webhooks",
      "Custom integrations",
      "Dedicated account manager",
      "SLA guarantee",
    ],
    color: "border-amber-500/30",
    accent: "text-amber-400",
    btnVariant: "outline" as const,
  },
];

function SubscriptionPlansTab() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        You are currently on the{" "}
        <span className="text-primary font-semibold">Professional</span> plan.
        Upgrade or downgrade anytime.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: i * 0.1,
              type: "spring",
              stiffness: 260,
              damping: 22,
            }}
            whileHover={{ scale: 1.02, y: -4 }}
            className={`glass-card p-6 flex flex-col relative border ${plan.color} ${plan.popular ? "shadow-elevated" : ""}`}
            data-ocid={`plan-card-${plan.id}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full shadow">
                  <Star className="w-3 h-3 fill-current" />
                  Most Popular
                </span>
              </div>
            )}

            <div className="mb-5 mt-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className={`text-lg font-display font-bold ${plan.accent}`}>
                  {plan.name}
                </h3>
                {plan.current && (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-primary/10 text-primary border-primary/20"
                    data-ocid="current-plan-badge"
                  >
                    Current
                  </Badge>
                )}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-display font-bold text-foreground">
                  {formatCurrency(plan.price)}
                </span>
                <span className="text-xs text-muted-foreground">/month</span>
              </div>
            </div>

            <ul className="space-y-2.5 mb-6 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <CheckCircle2
                    className={`w-4 h-4 mt-0.5 shrink-0 ${plan.accent}`}
                  />
                  <span className="text-muted-foreground">{f}</span>
                </li>
              ))}
            </ul>

            <Button
              variant={plan.btnVariant}
              className="w-full"
              onClick={() =>
                plan.current
                  ? toast.info("You are already on this plan.")
                  : toast.info("Contact sales to upgrade: sales@homeopath.com")
              }
              data-ocid={`plan-btn-${plan.id}`}
            >
              {plan.current ? "Current Plan" : "Upgrade Plan"}
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
function BillingPage() {
  return (
    <div className="space-y-6" data-ocid="billing-page">
      <PageHeader
        title="Billing & Payments"
        description="Manage invoices, payment history, and subscription plans."
        breadcrumb={[{ label: "Dashboard", href: "/" }, { label: "Billing" }]}
        action={{
          label: "Create Invoice",
          icon: <FilePlus className="w-4 h-4" />,
          onClick: () =>
            toast.success("Invoice builder coming soon!", {
              description: "Draft a new invoice for any patient.",
            }),
        }}
      />

      <Tabs defaultValue="invoices" data-ocid="billing-tabs">
        <TabsList className="glass border border-white/10 p-1">
          <TabsTrigger
            value="invoices"
            className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary"
            data-ocid="tab-invoices"
          >
            <Receipt className="w-3.5 h-3.5 mr-1.5" />
            Invoices
          </TabsTrigger>
          <TabsTrigger
            value="payments"
            className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary"
            data-ocid="tab-payments"
          >
            <CreditCard className="w-3.5 h-3.5 mr-1.5" />
            Payment History
          </TabsTrigger>
          <TabsTrigger
            value="plans"
            className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary"
            data-ocid="tab-plans"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Subscription Plans
          </TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="mt-5">
          <InvoicesTab />
        </TabsContent>

        <TabsContent value="payments" className="mt-5">
          <PaymentHistoryTab />
        </TabsContent>

        <TabsContent value="plans" className="mt-5">
          <SubscriptionPlansTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
