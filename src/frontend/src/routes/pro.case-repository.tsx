import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { casesArchive } from "@/data/casesArchive";
import type { CaseArchiveRecord, CaseOutcome } from "@/types/proTypes";
import { createRoute } from "@tanstack/react-router";
import {
  Archive,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Crown,
  Download,
  Eye,
  GitCompare,
  LayoutGrid,
  List,
  Search,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { Route as proRoute } from "./pro";

export const Route = createRoute({
  getParentRoute: () => proRoute,
  path: "/case-repository",
  component: CaseRepositoryPage,
});

// ── Constants ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

const OUTCOME_CONFIG: Record<
  CaseOutcome,
  { label: string; className: string; dotClass: string; rowClass: string }
> = {
  cured: {
    label: "Cured",
    className:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
    dotClass: "bg-emerald-500",
    rowClass: "border-l-2 border-emerald-500/40",
  },
  improved: {
    label: "Improved",
    className:
      "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/25",
    dotClass: "bg-teal-500",
    rowClass: "border-l-2 border-teal-500/40",
  },
  unchanged: {
    label: "Unchanged",
    className: "bg-muted text-muted-foreground border-border",
    dotClass: "bg-muted-foreground",
    rowClass: "border-l-2 border-border",
  },
  referred: {
    label: "Referred",
    className:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",
    dotClass: "bg-amber-500",
    rowClass: "border-l-2 border-amber-500/40",
  },
};

const AVATAR_PALETTE = [
  "bg-primary/20 text-primary",
  "bg-accent/20 text-accent",
  "bg-purple-500/20 text-purple-500",
  "bg-rose-500/20 text-rose-500",
  "bg-amber-500/20 text-amber-500",
  "bg-teal-500/20 text-teal-500",
];

const SYMPTOM_CHIP_COLORS = [
  "bg-primary/10 text-primary border-primary/20",
  "bg-accent/10 text-accent border-accent/20",
  "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
];

type SortKey = "date-closed" | "duration" | "follow-ups";
type ViewMode = "grid" | "table";

// ── Helpers ────────────────────────────────────────────────────────────────────

function getAvatarClass(ref: string) {
  const num = Number.parseInt(ref.replace(/\D/g, ""), 10) || 0;
  return AVATAR_PALETTE[num % AVATAR_PALETTE.length];
}

function getInitials(ref: string) {
  return ref.replace("Pt #", "P").slice(0, 3);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function computeSimilarity(a: CaseArchiveRecord, b: CaseArchiveRecord): number {
  const setA = new Set([...a.symptoms.map((s) => s.toLowerCase()), ...a.tags]);
  const setB = new Set([...b.symptoms.map((s) => s.toLowerCase()), ...b.tags]);
  const remedyOverlap = a.prescribedRemedies.filter((r) =>
    b.prescribedRemedies.includes(r),
  ).length;
  let matches = 0;
  for (const item of setA) {
    if (setB.has(item)) matches++;
  }
  const union = new Set([...setA, ...setB]).size;
  const jaccard = union > 0 ? matches / union : 0;
  return Math.min(
    Math.round((jaccard * 0.7 + (remedyOverlap > 0 ? 0.3 : 0)) * 100),
    97,
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function OutcomeBadge({ outcome }: { outcome: CaseOutcome }) {
  const cfg = OUTCOME_CONFIG[outcome];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dotClass}`} />
      {cfg.label}
    </span>
  );
}

function SymptomChips({
  symptoms,
  max = 3,
}: { symptoms: string[]; max?: number }) {
  const visible = symptoms.slice(0, max);
  const overflow = symptoms.length - max;
  return (
    <div className="flex flex-wrap gap-1.5">
      {visible.map((s, i) => (
        <span
          key={s}
          className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${SYMPTOM_CHIP_COLORS[i % SYMPTOM_CHIP_COLORS.length]}`}
        >
          {s}
        </span>
      ))}
      {overflow > 0 && (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium border bg-muted/60 text-muted-foreground border-border">
          +{overflow} more
        </span>
      )}
    </div>
  );
}

function RemedyBadges({ remedies }: { remedies: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {remedies.map((r) => (
        <span
          key={r}
          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20"
        >
          {r}
        </span>
      ))}
    </div>
  );
}

// ── Stats Bar ─────────────────────────────────────────────────────────────────

function StatsBar({ cases }: { cases: CaseArchiveRecord[] }) {
  const total = cases.length;
  const curedCount = cases.filter((c) => c.outcome === "cured").length;
  const improvedCount = cases.filter((c) => c.outcome === "improved").length;
  const avgDuration =
    total > 0
      ? Math.round(cases.reduce((s, c) => s + c.duration, 0) / total)
      : 0;

  const stats = [
    {
      icon: <Archive className="w-4 h-4" />,
      label: "Total Cases",
      value: total.toString(),
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: <CheckCircle2 className="w-4 h-4" />,
      label: "Cured %",
      value: total > 0 ? `${Math.round((curedCount / total) * 100)}%` : "0%",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      icon: <TrendingUp className="w-4 h-4" />,
      label: "Improved %",
      value: total > 0 ? `${Math.round((improvedCount / total) * 100)}%` : "0%",
      color: "text-teal-600 dark:text-teal-400",
      bg: "bg-teal-500/10",
    },
    {
      icon: <Clock className="w-4 h-4" />,
      label: "Avg Duration",
      value: `${avgDuration}d`,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <motion.div
      className="grid grid-cols-2 md:grid-cols-4 gap-3"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.04 }}
      data-ocid="case-repo-stats"
    >
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          className="glass-card p-4 flex items-center gap-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.06 + i * 0.05 }}
        >
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${stat.bg} ${stat.color}`}
          >
            {stat.icon}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
              {stat.label}
            </p>
            <p
              className={`text-xl font-display font-bold tabular-nums leading-tight ${stat.color}`}
            >
              {stat.value}
            </p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ── Case Card ─────────────────────────────────────────────────────────────────

function CaseCard({
  record,
  index,
  onView,
}: {
  record: CaseArchiveRecord;
  index: number;
  onView: (r: CaseArchiveRecord) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
        delay: index * 0.04,
      }}
      className="glass-card p-5 flex flex-col gap-4 group hover:border-primary/30 transition-all duration-200"
      data-ocid={`case-card-${record.caseId}`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${getAvatarClass(record.patientRef)}`}
          >
            {getInitials(record.patientRef)}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium">
              {record.patientRef} · {record.caseId}
            </p>
            <p className="text-sm font-display font-semibold text-foreground truncate leading-tight mt-0.5">
              {record.chiefComplaint}
            </p>
          </div>
        </div>
        <OutcomeBadge outcome={record.outcome} />
      </div>

      {/* Symptoms */}
      <div>
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-1.5">
          Key Symptoms
        </p>
        <SymptomChips symptoms={record.symptoms} max={3} />
      </div>

      {/* Remedies */}
      <div>
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-1.5">
          Remedies Prescribed
        </p>
        <RemedyBadges remedies={record.prescribedRemedies} />
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1 border-t border-border/50">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {record.duration}d
        </span>
        <span className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          {record.followUps} follow-ups
        </span>
        <span className="flex items-center gap-1 ml-auto">
          <Calendar className="w-3 h-3" />
          {formatDate(record.dateClosed)}
        </span>
      </div>

      {/* CTA */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-between text-xs group-hover:bg-primary/5 transition-colors duration-150"
        onClick={() => onView(record)}
        data-ocid={`view-case-${record.caseId}`}
      >
        <span className="flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5" />
          View Full Case
        </span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-150" />
      </Button>
    </motion.div>
  );
}

// ── Table Row ─────────────────────────────────────────────────────────────────

function TableRow({
  record,
  index,
  onView,
}: {
  record: CaseArchiveRecord;
  index: number;
  onView: (r: CaseArchiveRecord) => void;
}) {
  return (
    <motion.tr
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
      className={`group border-b border-border/40 hover:bg-muted/30 transition-colors duration-150 cursor-pointer ${OUTCOME_CONFIG[record.outcome].rowClass}`}
      onClick={() => onView(record)}
      data-ocid={`table-row-${record.caseId}`}
    >
      <td className="px-4 py-3 text-xs font-mono text-muted-foreground">
        {record.caseId}
      </td>
      <td className="px-4 py-3 max-w-[200px]">
        <p className="text-sm font-medium text-foreground truncate">
          {record.chiefComplaint}
        </p>
        <p className="text-[10px] text-muted-foreground">{record.patientRef}</p>
      </td>
      <td className="px-4 py-3 hidden md:table-cell">
        <div className="flex flex-wrap gap-1 max-w-[180px]">
          {record.prescribedRemedies.slice(0, 2).map((r) => (
            <span
              key={r}
              className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-teal-500/10 text-teal-600 dark:text-teal-400"
            >
              {r}
            </span>
          ))}
          {record.prescribedRemedies.length > 2 && (
            <span className="px-1.5 py-0.5 rounded text-[10px] text-muted-foreground">
              +{record.prescribedRemedies.length - 2}
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <OutcomeBadge outcome={record.outcome} />
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums hidden sm:table-cell">
        {record.duration}d
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums hidden lg:table-cell">
        {record.followUps}
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground hidden xl:table-cell">
        {formatDate(record.dateClosed)}
      </td>
      <td className="px-4 py-3">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-[11px] opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onView(record);
          }}
        >
          <Eye className="w-3.5 h-3.5 mr-1" />
          View
        </Button>
      </td>
    </motion.tr>
  );
}

// ── Pagination ─────────────────────────────────────────────────────────────────

function Pagination({
  page,
  totalPages,
  total,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  const start = (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, total);

  return (
    <div
      className="flex items-center justify-between gap-4 pt-2"
      data-ocid="pagination"
    >
      <p className="text-xs text-muted-foreground">
        Showing{" "}
        <span className="font-semibold text-foreground">
          {start}–{end}
        </span>{" "}
        of <span className="font-semibold text-foreground">{total}</span> cases
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-3 text-xs gap-1.5"
          onClick={onPrev}
          disabled={page <= 1}
          data-ocid="pagination-prev"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Prev
        </Button>
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let pageNum = i + 1;
            if (totalPages > 5 && page > 3) {
              pageNum = page - 2 + i;
            }
            if (pageNum > totalPages) return null;
            return (
              <span
                key={pageNum}
                className={[
                  "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-medium transition-colors cursor-pointer",
                  pageNum === page
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted/60",
                ].join(" ")}
              >
                {pageNum}
              </span>
            );
          })}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-3 text-xs gap-1.5"
          onClick={onNext}
          disabled={page >= totalPages}
          data-ocid="pagination-next"
        >
          Next
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ── Case Detail Modal ─────────────────────────────────────────────────────────

function CaseDetailModal({
  record,
  onClose,
  onFindSimilar,
}: {
  record: CaseArchiveRecord;
  onClose: () => void;
  onFindSimilar: (r: CaseArchiveRecord) => void;
}) {
  const remedyTimeline = record.prescribedRemedies.map((remedy, i) => {
    const startMs = new Date(record.dateOpened).getTime();
    const step =
      (record.duration / record.prescribedRemedies.length) * 86400000;
    const date = new Date(startMs + i * step).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    return { remedy, date };
  });

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        data-ocid="case-detail-overlay"
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <motion.div
          className="relative z-10 w-full max-w-2xl glass-card overflow-hidden"
          initial={{ opacity: 0, scale: 0.95, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 24 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          onClick={(e) => e.stopPropagation()}
          data-ocid="case-detail-modal"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${getAvatarClass(record.patientRef)}`}
              >
                {getInitials(record.patientRef)}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">
                  {record.patientRef} · {record.caseId}
                </p>
                <p className="font-display font-semibold text-foreground text-sm leading-tight truncate">
                  {record.chiefComplaint}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <OutcomeBadge outcome={record.outcome} />
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-muted/60 transition-colors"
                aria-label="Close modal"
                data-ocid="case-detail-close"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          <ScrollArea className="max-h-[70vh]">
            <div className="px-6 py-5 space-y-5">
              {/* Symptoms */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                  Presenting Symptoms
                </p>
                <div className="flex flex-wrap gap-2">
                  {record.symptoms.map((s, i) => (
                    <span
                      key={s}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${SYMPTOM_CHIP_COLORS[i % SYMPTOM_CHIP_COLORS.length]}`}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Remedy timeline */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                  Treatment Timeline
                </p>
                <div className="relative pl-5">
                  <div className="absolute left-2 top-0 bottom-0 w-px bg-border/60" />
                  {remedyTimeline.map(({ remedy, date }) => (
                    <div key={remedy} className="relative mb-4 last:mb-0">
                      <div className="absolute -left-[13px] top-1 w-2.5 h-2.5 rounded-full bg-teal-500/80 border-2 border-background" />
                      <p className="text-[10px] text-muted-foreground mb-0.5">
                        {date}
                      </p>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                        {remedy}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    label: "Case Opened",
                    value: formatDate(record.dateOpened),
                  },
                  {
                    label: "Case Closed",
                    value: formatDate(record.dateClosed),
                  },
                  { label: "Duration", value: `${record.duration} days` },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="bg-muted/40 rounded-xl p-3 text-center"
                  >
                    <p className="text-[10px] text-muted-foreground mb-1">
                      {label}
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Follow-up count */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/5 border border-primary/15">
                <Users className="w-4 h-4 text-primary shrink-0" />
                <p className="text-sm text-foreground">
                  <span className="font-semibold text-primary">
                    {record.followUps}
                  </span>{" "}
                  follow-up appointments completed
                </p>
              </div>

              {/* Clinician notes */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                  Clinician Notes
                </p>
                <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                  <p className="text-sm text-foreground/85 leading-relaxed">
                    {record.clinicianNotes}
                  </p>
                </div>
              </div>

              {/* Tags */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                  Tags
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {record.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-secondary/60 text-secondary-foreground border border-border/50"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border/60 flex items-center justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs"
              data-ocid="case-detail-close-btn"
            >
              Close
            </Button>
            <Button
              size="sm"
              className="text-xs gap-2 bg-primary/90 hover:bg-primary"
              onClick={() => {
                onFindSimilar(record);
                onClose();
              }}
              data-ocid="find-similar-btn"
            >
              <GitCompare className="w-3.5 h-3.5" />
              Find Similar Cases
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Similar Cases Panel ───────────────────────────────────────────────────────

function SimilarCasesPanel({
  anchor: anchorCase,
  allCases,
  onClose,
  onView,
}: {
  anchor: CaseArchiveRecord;
  allCases: CaseArchiveRecord[];
  onClose: () => void;
  onView: (r: CaseArchiveRecord) => void;
}) {
  const similar = useMemo(() => {
    return allCases
      .filter((c) => c.caseId !== anchorCase.caseId)
      .map((c) => ({ record: c, score: computeSimilarity(anchorCase, c) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [anchorCase, allCases]);

  return (
    <motion.div
      className="fixed inset-y-0 right-0 z-40 w-full max-w-sm bg-card border-l border-border shadow-2xl flex flex-col"
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      data-ocid="similar-cases-panel"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-display font-semibold text-foreground">
              Similar Cases
            </p>
            <p className="text-[10px] text-muted-foreground">
              Based on {anchorCase.caseId}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-muted/60 transition-colors"
          aria-label="Close panel"
          data-ocid="similar-panel-close"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="px-5 py-3 bg-muted/40 border-b border-border/40">
        <p className="text-[10px] text-muted-foreground mb-1">
          Comparing against
        </p>
        <p className="text-xs font-semibold text-foreground truncate">
          {anchorCase.chiefComplaint}
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {similar.map(({ record, score }, index) => (
            <motion.div
              key={record.caseId}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.07, duration: 0.3 }}
              className="glass-card p-4 gap-3 flex flex-col cursor-pointer hover:border-primary/30 transition-all duration-150"
              onClick={() => onView(record)}
              data-ocid={`similar-case-${record.caseId}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${getAvatarClass(record.patientRef)}`}
                  >
                    {getInitials(record.patientRef)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground">
                      {record.patientRef}
                    </p>
                    <p className="text-xs font-semibold text-foreground truncate leading-tight">
                      {record.chiefComplaint}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div
                    className="text-sm font-bold tabular-nums"
                    style={{
                      color: score > 60 ? "oklch(var(--primary))" : undefined,
                    }}
                  >
                    {score}%
                  </div>
                  <p className="text-[9px] text-muted-foreground">match</p>
                </div>
              </div>
              <div className="h-1 rounded-full bg-border/60 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ delay: 0.2 + index * 0.07, duration: 0.5 }}
                />
              </div>
              <div className="flex items-center justify-between">
                <OutcomeBadge outcome={record.outcome} />
                <span className="text-[10px] text-muted-foreground">
                  {record.prescribedRemedies[0]}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

function CaseRepositoryPage() {
  const [query, setQuery] = useState("");
  const [outcomeFilter, setOutcomeFilter] = useState<CaseOutcome | "all">(
    "all",
  );
  const [remedyFilter, setRemedyFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortKey>("date-closed");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [page, setPage] = useState(1);
  const [selectedCase, setSelectedCase] = useState<CaseArchiveRecord | null>(
    null,
  );
  const [similarAnchor, setSimilarAnchor] = useState<CaseArchiveRecord | null>(
    null,
  );

  const uniqueRemedies = useMemo(() => {
    const set = new Set<string>();
    for (const c of casesArchive) {
      for (const r of c.prescribedRemedies) set.add(r);
    }
    return Array.from(set).sort();
  }, []);

  const handleFindSimilar = useCallback((record: CaseArchiveRecord) => {
    setSimilarAnchor(record);
  }, []);

  const filtered = useMemo(() => {
    let result = [...casesArchive];

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (c) =>
          c.chiefComplaint.toLowerCase().includes(q) ||
          c.symptoms.some((s) => s.toLowerCase().includes(q)) ||
          c.prescribedRemedies.some((r) => r.toLowerCase().includes(q)) ||
          c.clinicianNotes.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    if (outcomeFilter !== "all") {
      result = result.filter((c) => c.outcome === outcomeFilter);
    }

    if (remedyFilter !== "all") {
      result = result.filter((c) =>
        c.prescribedRemedies.includes(remedyFilter),
      );
    }

    result.sort((a, b) => {
      if (sortBy === "date-closed")
        return b.dateClosed.localeCompare(a.dateClosed);
      if (sortBy === "duration") return b.duration - a.duration;
      if (sortBy === "follow-ups") return b.followUps - a.followUps;
      return 0;
    });

    return result;
  }, [query, outcomeFilter, remedyFilter, sortBy]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const outcomeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: casesArchive.length };
    for (const c of casesArchive) {
      counts[c.outcome] = (counts[c.outcome] ?? 0) + 1;
    }
    return counts;
  }, []);

  const hasActiveFilters =
    query || outcomeFilter !== "all" || remedyFilter !== "all";

  const clearFilters = () => {
    setQuery("");
    setOutcomeFilter("all");
    setRemedyFilter("all");
    setSimilarAnchor(null);
    setPage(1);
  };

  const handleExportCSV = () => {
    toast.success("Export started!", {
      description: `Preparing ${filtered.length} case records as CSV…`,
      duration: 4000,
    });
  };

  // Reset page when filters change
  const handleQueryChange = (v: string) => {
    setQuery(v);
    setPage(1);
  };
  const handleOutcomeChange = (v: CaseOutcome | "all") => {
    setOutcomeFilter(v);
    setPage(1);
  };
  const handleRemedyChange = (v: string) => {
    setRemedyFilter(v);
    setPage(1);
  };

  return (
    <div className="space-y-5" data-ocid="case-repository-page">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <motion.div
        className="flex items-start justify-between gap-4"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        data-ocid="case-repo-header"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 mb-1 flex-wrap">
            <div className="w-8 h-8 rounded-xl bg-premium/10 flex items-center justify-center shrink-0">
              <Crown className="w-4 h-4 text-premium" />
            </div>
            <h1 className="text-xl font-display font-bold text-foreground">
              Case Repository
            </h1>
            <span className="pro-badge text-[10px]" data-ocid="pro-badge">
              PRO
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Anonymized evidence-based archive with full outcome tracking and
            remedy analytics
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 gap-2 text-xs border-border/60 hover:bg-muted/40"
          onClick={handleExportCSV}
          data-ocid="export-csv-btn"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </Button>
      </motion.div>

      {/* ── Stats Bar ───────────────────────────────────────────────────── */}
      <StatsBar cases={casesArchive} />

      {/* ── Search & Filters ─────────────────────────────────────────────── */}
      <motion.div
        className="glass-card p-4 space-y-4"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        data-ocid="case-repo-filters"
      >
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by complaint, symptoms, remedy, or notes…"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            className="pl-9 pr-9 bg-background/60 border-border/60 text-sm"
            data-ocid="case-search-input"
          />
          {query && (
            <button
              type="button"
              onClick={() => handleQueryChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter + controls row */}
        <div className="flex flex-wrap gap-2 items-center">
          {/* Outcome filter pills */}
          <div
            className="flex items-center gap-1.5 flex-wrap"
            data-ocid="outcome-filters"
          >
            {(
              ["all", "cured", "improved", "unchanged", "referred"] as const
            ).map((o) => {
              const isActive = outcomeFilter === o;
              const count = outcomeCounts[o] ?? 0;
              return (
                <button
                  type="button"
                  key={o}
                  onClick={() => handleOutcomeChange(o)}
                  className={[
                    "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150",
                    isActive
                      ? "bg-primary/15 text-primary border-primary/40"
                      : "bg-muted/40 text-muted-foreground border-border/50 hover:bg-muted/60",
                  ].join(" ")}
                  data-ocid={`outcome-filter-${o}`}
                >
                  {o === "all" ? "All" : OUTCOME_CONFIG[o].label}{" "}
                  <span className="opacity-60">({count})</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 ml-auto flex-wrap">
            {/* Remedy filter */}
            <Select value={remedyFilter} onValueChange={handleRemedyChange}>
              <SelectTrigger
                className="w-44 text-xs h-8 border-border/60 bg-background/60"
                data-ocid="remedy-filter-select"
              >
                <SelectValue placeholder="Filter by remedy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Remedies</SelectItem>
                {uniqueRemedies.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select
              value={sortBy}
              onValueChange={(v) => setSortBy(v as SortKey)}
            >
              <SelectTrigger
                className="w-38 text-xs h-8 border-border/60 bg-background/60"
                data-ocid="sort-select"
              >
                <SlidersHorizontal className="w-3 h-3 mr-1 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-closed">Date Closed</SelectItem>
                <SelectItem value="duration">Duration</SelectItem>
                <SelectItem value="follow-ups">Follow-ups</SelectItem>
              </SelectContent>
            </Select>

            {/* View toggle */}
            <div
              className="flex items-center border border-border/60 rounded-lg overflow-hidden"
              data-ocid="view-toggle"
            >
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={[
                  "p-1.5 transition-colors",
                  viewMode === "grid"
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-muted/40",
                ].join(" ")}
                aria-label="Grid view"
                data-ocid="view-grid"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={[
                  "p-1.5 transition-colors",
                  viewMode === "table"
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-muted/40",
                ].join(" ")}
                aria-label="Table view"
                data-ocid="view-table"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 underline-offset-2 hover:underline transition-colors"
                data-ocid="clear-filters-btn"
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Similar filter indicator */}
        {similarAnchor && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/8 border border-primary/20 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="text-primary font-medium">
              Showing cases similar to:{" "}
              <span className="font-semibold">
                {similarAnchor.chiefComplaint}
              </span>
            </span>
            <button
              type="button"
              onClick={() => setSimilarAnchor(null)}
              className="ml-auto text-primary/60 hover:text-primary"
              aria-label="Clear similar filter"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </motion.div>

      {/* ── Results count ────────────────────────────────────────────────── */}
      <motion.div
        className="flex items-center justify-between text-xs text-muted-foreground"
        layout
      >
        <span>
          <span className="text-foreground font-semibold">
            {filtered.length}
          </span>{" "}
          of {casesArchive.length} cases
          {hasActiveFilters && (
            <span className="ml-1.5 text-primary/80 font-medium">
              · Filtered
            </span>
          )}
        </span>
        <span className="text-muted-foreground/60">
          Page {page} of {totalPages || 1}
        </span>
      </motion.div>

      {/* ── Grid View ────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <motion.div
          className="glass-card p-12 flex flex-col items-center text-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          data-ocid="case-repo-empty"
        >
          <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center">
            <Archive className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-display font-semibold text-foreground mb-1">
              No cases found
            </p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="text-xs"
          >
            Clear Filters
          </Button>
        </motion.div>
      ) : viewMode === "grid" ? (
        <>
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            data-ocid="case-cards-grid"
          >
            <AnimatePresence mode="popLayout">
              {paginated.map((record, i) => (
                <CaseCard
                  key={record.caseId}
                  record={record}
                  index={i}
                  onView={setSelectedCase}
                />
              ))}
            </AnimatePresence>
          </motion.div>
          <Pagination
            page={page}
            totalPages={totalPages}
            total={filtered.length}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
          />
        </>
      ) : (
        <>
          <motion.div
            className="glass-card overflow-hidden"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            data-ocid="case-table"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/20">
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      ID
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Complaint
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground hidden md:table-cell">
                      Remedies
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Outcome
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground hidden sm:table-cell">
                      Duration
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground hidden lg:table-cell">
                      Follow-ups
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground hidden xl:table-cell">
                      Closed
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {paginated.map((record, i) => (
                      <TableRow
                        key={record.caseId}
                        record={record}
                        index={i}
                        onView={setSelectedCase}
                      />
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </motion.div>
          <Pagination
            page={page}
            totalPages={totalPages}
            total={filtered.length}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
          />
        </>
      )}

      {/* ── Case Detail Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedCase && (
          <CaseDetailModal
            record={selectedCase}
            onClose={() => setSelectedCase(null)}
            onFindSimilar={handleFindSimilar}
          />
        )}
      </AnimatePresence>

      {/* ── Similar Cases Panel ────────────────────────────────────────── */}
      <AnimatePresence>
        {similarAnchor && !selectedCase && (
          <>
            <motion.div
              className="fixed inset-0 z-30 bg-black/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSimilarAnchor(null)}
              data-ocid="similar-panel-backdrop"
            />
            <SimilarCasesPanel
              anchor={similarAnchor}
              allCases={casesArchive}
              onClose={() => setSimilarAnchor(null)}
              onView={(r) => {
                setSimilarAnchor(null);
                setSelectedCase(r);
              }}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
