import { createRoute } from "@tanstack/react-router";
import {
  AlertCircle,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  FlaskConical,
  IndianRupee,
  Pill,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { usePharmacyStore } from "../store/pharmacyStore";
import { Route as rootRoute } from "./__root";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pharmacy",
  component: PharmacyPage,
});

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

function PharmacyPage() {
  const { queue, confirmEntry, getPendingCount } = usePharmacyStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [localDue, setLocalDue] = useState<Record<string, number>>({});
  const [localNextVisit, setLocalNextVisit] = useState<Record<string, string>>(
    {},
  );
  const [toasts, setToasts] = useState<Toast[]>([]);

  const pendingQueue = queue.filter((e) => e.status === "pending");
  const pendingCount = getPendingCount();

  function addToast(message: string, type: "success" | "error" = "success") {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }

  function handleToggleExpand(id: string, dueAmount: number) {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      setLocalDue((prev) => ({ ...prev, [id]: prev[id] ?? dueAmount }));
      setLocalNextVisit((prev) => ({ ...prev, [id]: prev[id] ?? "" }));
    }
  }

  function handleConfirm(id: string, patientName: string) {
    const due = localDue[id] ?? 0;
    const nextVisit = localNextVisit[id] ?? undefined;
    confirmEntry(id, due, nextVisit || undefined);
    setExpandedId(null);
    addToast(`Payment confirmed for ${patientName}`, "success");
  }

  return (
    <div className="min-h-screen p-6 bg-background">
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all animate-in slide-in-from-right-5 ${
              t.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/40 dark:border-emerald-700 dark:text-emerald-200"
                : "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/40 dark:border-red-700 dark:text-red-200"
            }`}
            data-ocid="pharmacy.toast"
          >
            {t.type === "success" ? (
              <Check className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            {t.message}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20">
            <Pill className="h-5 w-5 text-primary" />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground font-display">
              Pharmacy Queue
            </h1>
            {pendingCount > 0 && (
              <span
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                data-ocid="pharmacy.pending-badge"
              >
                {pendingCount} pending
              </span>
            )}
          </div>
        </div>
        <p className="text-muted-foreground text-sm ml-[52px]">
          Manage prescriptions and payments sent by doctors
        </p>
      </div>

      {/* Content */}
      {pendingQueue.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-24 bg-white/5 dark:bg-white/5 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 dark:border-white/10"
          data-ocid="pharmacy.empty_state"
        >
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mb-4">
            <FlaskConical className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            No pending pharmacy requests
          </h3>
          <p className="text-sm text-muted-foreground">
            Prescriptions sent by doctors will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-w-4xl" data-ocid="pharmacy.queue-list">
          {pendingQueue.map((entry, idx) => {
            const isExpanded = expandedId === entry.id;
            const medicineText = stripHtml(entry.medicines);
            const medicinePreview =
              medicineText.length > 80
                ? `${medicineText.slice(0, 80)}…`
                : medicineText;

            return (
              <div
                key={entry.id}
                className="bg-white/10 dark:bg-white/5 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 dark:border-white/10 overflow-hidden"
                data-ocid={`pharmacy.item.${idx + 1}`}
              >
                {/* Card main row */}
                <div className="p-5">
                  {/* Top row */}
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 shrink-0 mt-0.5">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-base text-foreground">
                          {entry.patientName}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground font-mono">
                            {entry.patientRegId}
                          </span>
                          <span className="text-muted-foreground/40 text-xs">
                            ·
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {entry.doctorName}
                          </span>
                          <span className="text-muted-foreground/40 text-xs">
                            ·
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatDate(entry.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 rounded-full px-2.5 py-0.5 text-xs font-semibold">
                      <IndianRupee className="h-3 w-3" />
                      {entry.totalAmount.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {/* Medicines preview + process button */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm italic text-muted-foreground flex-1 min-w-0 truncate">
                      {medicinePreview || "No medicines specified"}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        handleToggleExpand(entry.id, entry.dueAmount)
                      }
                      className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-colors shrink-0"
                      data-ocid={`pharmacy.process-button.${idx + 1}`}
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-4 w-4" />
                          Close
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          Process
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded panel */}
                {isExpanded && (
                  <div className="border-t border-white/20 dark:border-white/10 bg-black/5 dark:bg-black/20 px-5 py-5">
                    <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                      <IndianRupee className="h-4 w-4 text-primary" />
                      Fee Breakdown
                    </h4>

                    {/* Medicine section */}
                    <div className="mb-4 p-3 rounded-xl bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                        Prescribed Medicines
                      </p>
                      <div
                        className="text-sm text-foreground prose prose-sm dark:prose-invert max-w-none"
                        // biome-ignore lint/security/noDangerouslySetInnerHtml: controlled content from doctor's editor
                        dangerouslySetInnerHTML={{
                          __html:
                            entry.medicines || "<p>No medicines specified</p>",
                        }}
                      />
                    </div>

                    {/* Fee grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      {[
                        { label: "Consultation", value: entry.consultationFee },
                        {
                          label: "Medicine (Regular)",
                          value: entry.medicineFee,
                        },
                        {
                          label: "Extra Medicine",
                          value: entry.extraMedicineFee,
                        },
                        { label: "Registration", value: entry.registrationFee },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="bg-white/10 dark:bg-white/5 rounded-xl px-3 py-3 border border-white/20 dark:border-white/10"
                        >
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
                            {item.label}
                          </p>
                          <p className="text-sm font-semibold text-foreground">
                            ₹{item.value.toLocaleString("en-IN")}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Total */}
                    <div className="flex items-center gap-2 mb-5 px-3 py-2.5 rounded-xl bg-primary/10 border border-primary/20">
                      <IndianRupee className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">
                        Total Amount:
                      </span>
                      <span className="text-base font-bold text-primary ml-auto">
                        ₹{entry.totalAmount.toLocaleString("en-IN")}
                      </span>
                    </div>

                    {/* Editable fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                      <div>
                        <label
                          htmlFor={`due-${entry.id}`}
                          className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide"
                        >
                          Due Amount (₹)
                        </label>
                        <div className="relative">
                          <IndianRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                          <input
                            id={`due-${entry.id}`}
                            type="number"
                            min={0}
                            value={localDue[entry.id] ?? entry.dueAmount}
                            onChange={(e) =>
                              setLocalDue((prev) => ({
                                ...prev,
                                [entry.id]: Number(e.target.value),
                              }))
                            }
                            className="w-full pl-8 pr-3 py-2 text-sm rounded-lg bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            data-ocid={`pharmacy.due-amount-input.${idx + 1}`}
                          />
                        </div>
                      </div>
                      <div>
                        <label
                          htmlFor={`next-visit-${entry.id}`}
                          className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide"
                        >
                          Schedule Next Visit
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                          <input
                            id={`next-visit-${entry.id}`}
                            type="date"
                            value={localNextVisit[entry.id] ?? ""}
                            onChange={(e) =>
                              setLocalNextVisit((prev) => ({
                                ...prev,
                                [entry.id]: e.target.value,
                              }))
                            }
                            className="w-full pl-8 pr-3 py-2 text-sm rounded-lg bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            data-ocid={`pharmacy.next-visit-input.${idx + 1}`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleConfirm(entry.id, entry.patientName)
                        }
                        className="flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors shadow-sm"
                        data-ocid={`pharmacy.confirm-button.${idx + 1}`}
                      >
                        <Check className="h-4 w-4" />
                        Confirm Payment
                      </button>
                      <button
                        type="button"
                        onClick={() => setExpandedId(null)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                        data-ocid={`pharmacy.cancel-button.${idx + 1}`}
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default PharmacyPage;
