import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { patientTimelines } from "@/data/patientTimeline";
import type {
  PatientTimelineData,
  TimelineEvent,
  TimelineEventType,
} from "@/types/proTypes";
import { createRoute } from "@tanstack/react-router";
import {
  Activity,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Crown,
  Download,
  FileText,
  Filter,
  Pill,
  Plus,
  Star,
  TrendingUp,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { Route as proRoute } from "./pro";

export const Route = createRoute({
  getParentRoute: () => proRoute,
  path: "/patient-timeline",
  component: PatientTimelinePage,
});

// ── Colour tokens ─────────────────────────────────────────────────────────────
const TEAL = "oklch(0.65 0.18 190)";
const GOLD = "oklch(0.78 0.14 60)";
const EMERALD = "oklch(0.68 0.15 150)";
const ROSE = "oklch(0.65 0.18 10)";
const MUTED_STR = "oklch(0.55 0 0)";

const SYMPTOM_COLORS = [TEAL, GOLD, EMERALD, ROSE];

// ── Filter options ────────────────────────────────────────────────────────────
const FILTER_OPTIONS: { value: "all" | TimelineEventType; label: string }[] = [
  { value: "all", label: "All Events" },
  { value: "appointment", label: "Appointments" },
  { value: "prescription", label: "Prescriptions" },
  { value: "note", label: "Notes" },
  { value: "milestone", label: "Milestones" },
];

// ── Event styling maps ────────────────────────────────────────────────────────
const EVENT_CONFIG: Record<
  TimelineEventType,
  { icon: ReactNode; dot: string; badge: string; label: string }
> = {
  appointment: {
    icon: <Calendar className="w-3.5 h-3.5" />,
    dot: "bg-primary border-primary/40",
    badge: "bg-primary/10 text-primary border-primary/30",
    label: "Appointment",
  },
  prescription: {
    icon: <Pill className="w-3.5 h-3.5" />,
    dot: "bg-accent border-accent/40",
    badge: "bg-accent/10 text-accent border-accent/30",
    label: "Prescription",
  },
  note: {
    icon: <FileText className="w-3.5 h-3.5" />,
    dot: "bg-muted-foreground border-border",
    badge: "bg-muted text-muted-foreground border-border",
    label: "Note",
  },
  milestone: {
    icon: <Star className="w-3.5 h-3.5" />,
    dot: "bg-premium border-premium/40",
    badge: "bg-premium/10 text-premium border-premium/30",
    label: "Milestone",
  },
};

// ── Custom multi-line tooltip ─────────────────────────────────────────────────
function MultiLineTooltip({
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
    <div className="glass-card px-3 py-2.5 text-xs shadow-elevated min-w-[160px]">
      <p className="text-muted-foreground mb-2 font-medium">{label}</p>
      <div className="space-y-1">
        {payload.map((entry) => (
          <div
            key={entry.name}
            className="flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: entry.color }}
              />
              <span className="text-muted-foreground truncate max-w-[90px]">
                {entry.name}
              </span>
            </div>
            <span
              className="font-bold tabular-nums"
              style={{ color: entry.color }}
            >
              {entry.value}/10
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Metric card ───────────────────────────────────────────────────────────────
function MetricCard({
  icon,
  label,
  value,
  sub,
  delay,
  highlight,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  sub: string;
  delay: number;
  highlight?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className={
        highlight
          ? "pro-card p-4 flex flex-col gap-2"
          : "glass-card p-4 flex flex-col gap-2"
      }
      data-ocid="metric-card"
    >
      <div className="flex items-center gap-2 text-muted-foreground text-xs">
        <span
          className={
            highlight
              ? "feature-icon-premium w-7 h-7 rounded-md"
              : "feature-icon w-7 h-7 rounded-md"
          }
        >
          {icon}
        </span>
        <span className="font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold font-display text-foreground leading-none">
        {value}
      </p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </motion.div>
  );
}

// ── Timeline Event Card ───────────────────────────────────────────────────────
function TimelineCard({
  event,
  index,
  isLast,
}: {
  event: TimelineEvent;
  index: number;
  isLast: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const cfg = EVENT_CONFIG[event.type];
  const isMilestone = event.type === "milestone";
  const dateObj = new Date(event.date);
  const dateStr = dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16, scale: 0.97 }}
      transition={{ delay: index * 0.07, duration: 0.32 }}
      className="relative flex gap-3"
      data-ocid={`timeline-event-${event.type}`}
    >
      {/* Vertical line */}
      {!isLast && (
        <div className="absolute left-[13px] top-8 bottom-0 w-px bg-gradient-to-b from-border/70 to-border/10" />
      )}

      {/* Dot */}
      <div className="shrink-0 mt-1 z-10">
        <span
          className={`flex items-center justify-center w-7 h-7 rounded-full border-2 text-white ${cfg.dot} ${isMilestone ? "ring-2 ring-premium/30 ring-offset-1 ring-offset-background" : ""}`}
        >
          {cfg.icon}
        </span>
      </div>

      {/* Card */}
      <div className="flex-1 min-w-0 mb-4">
        <button
          type="button"
          className={`w-full text-left rounded-xl p-3.5 transition-smooth group ${
            isMilestone
              ? "glass-premium hover:border-premium/50"
              : "glass hover:bg-white/8"
          }`}
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          data-ocid={`timeline-expand-${event.id}`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cfg.badge}`}
                >
                  {cfg.label}
                </span>
                {isMilestone && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-premium">
                    <Crown className="w-2.5 h-2.5" />
                    Milestone
                  </span>
                )}
              </div>
              <p
                className={`text-sm font-semibold leading-snug truncate ${isMilestone ? "text-premium" : "text-foreground"}`}
              >
                {event.title}
              </p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  {dateStr}
                </span>
                {event.doctor && (
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <User className="w-2.5 h-2.5" />
                    {event.doctor}
                  </span>
                )}
              </div>
            </div>
            <span className="text-muted-foreground group-hover:text-foreground transition-smooth shrink-0 mt-1">
              {expanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </span>
          </div>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22 }}
                className="overflow-hidden"
              >
                <p className="text-xs text-muted-foreground mt-2.5 leading-relaxed border-t border-white/10 pt-2.5">
                  {event.description}
                </p>
                {event.remedy && (
                  <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-medium text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-full">
                      {event.remedy}
                    </span>
                    {event.potency && (
                      <span className="text-[10px] font-medium text-muted-foreground bg-muted/40 border border-border px-2 py-0.5 rounded-full">
                        {event.potency}
                      </span>
                    )}
                  </div>
                )}
                {event.symptomScores.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {event.symptomScores.map((ss) => (
                      <div
                        key={ss.symptomName}
                        className="text-[10px] bg-muted/30 border border-border rounded-lg px-2 py-1"
                      >
                        <span className="text-muted-foreground">
                          {ss.symptomName}:
                        </span>{" "}
                        <span
                          className="font-bold"
                          style={{
                            color:
                              ss.score <= 3
                                ? TEAL
                                : ss.score >= 7
                                  ? GOLD
                                  : MUTED_STR,
                          }}
                        >
                          {ss.score}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {event.followUpDate && (
                  <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                    <Calendar className="w-2.5 h-2.5" />
                    Follow-up:{" "}
                    {new Date(event.followUpDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.div>
  );
}

// ── Multi-symptom chart ────────────────────────────────────────────────────────
function SymptomChartPanel({ patient }: { patient: PatientTimelineData }) {
  const progressions = patient.symptomProgressions;

  // Build unified date axis
  const allDates = Array.from(
    new Set(progressions.flatMap((p) => p.data.map((d) => d.date))),
  ).sort();

  const chartData = allDates.map((date) => {
    const point: Record<string, number | string> = {
      date: new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    };
    for (const prog of progressions) {
      const match = prog.data.find((d) => d.date === date);
      if (match) point[prog.symptomName] = match.score;
    }
    return point;
  });

  const firstScores = progressions.map((p) => p.data[0]?.score ?? 5);
  const lastScores = progressions.map(
    (p) => p.data[p.data.length - 1]?.score ?? 5,
  );
  const avgImprove =
    progressions.reduce((acc, _p, i) => {
      const diff = firstScores[i] - lastScores[i];
      return acc + (firstScores[i] > 0 ? (diff / firstScores[i]) * 100 : 0);
    }, 0) / progressions.length;

  return (
    <div className="flex flex-col gap-4">
      {/* Improve tag */}
      {avgImprove > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-accent/10 border border-accent/20 rounded-full px-2.5 py-1">
            <TrendingUp className="w-3 h-3 text-accent" />
            <span className="text-[11px] font-semibold text-accent">
              {Math.round(avgImprove)}% avg. improvement across all symptoms
            </span>
          </div>
        </div>
      )}

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="glass-card p-5"
        data-ocid="symptom-chart"
      >
        <div className="mb-3">
          <h4 className="text-sm font-semibold text-foreground font-display">
            Symptom Progression Over Time
          </h4>
          <p className="text-xs text-muted-foreground">
            Score 1–10 · lower is better for symptoms, higher for functional
            capacity
          </p>
        </div>

        <ResponsiveContainer width="100%" height={230}>
          <LineChart
            data={chartData}
            margin={{ top: 8, right: 16, left: -20, bottom: 0 }}
          >
            <defs>
              {progressions.map((prog, i) => (
                <linearGradient
                  key={`grad-${prog.symptomName}`}
                  id={`lineGrad${i}`}
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >
                  <stop
                    offset="0%"
                    stopColor={SYMPTOM_COLORS[i % SYMPTOM_COLORS.length]}
                    stopOpacity={0.7}
                  />
                  <stop
                    offset="100%"
                    stopColor={SYMPTOM_COLORS[i % SYMPTOM_COLORS.length]}
                    stopOpacity={1}
                  />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fill: MUTED_STR, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 10]}
              tick={{ fill: MUTED_STR, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              ticks={[0, 2, 4, 6, 8, 10]}
            />
            <Tooltip content={<MultiLineTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 10, paddingTop: 8 }}
            />
            <ReferenceLine
              y={5}
              stroke={MUTED_STR}
              strokeDasharray="4 4"
              strokeOpacity={0.4}
            />
            {progressions.map((prog, i) => (
              <Line
                key={prog.symptomName}
                type="monotone"
                dataKey={prog.symptomName}
                stroke={SYMPTOM_COLORS[i % SYMPTOM_COLORS.length]}
                strokeWidth={2}
                dot={{
                  r: 3,
                  fill: SYMPTOM_COLORS[i % SYMPTOM_COLORS.length],
                  strokeWidth: 0,
                }}
                activeDot={{
                  r: 5,
                  fill: SYMPTOM_COLORS[i % SYMPTOM_COLORS.length],
                  stroke: "transparent",
                }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>

        {/* Score legend */}
        <div className="flex items-center gap-4 pt-2 border-t border-white/10 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: GOLD }}
            />
            <span className="text-[10px] text-muted-foreground">
              High severity (7–10)
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: TEAL }}
            />
            <span className="text-[10px] text-muted-foreground">
              Low/resolved (1–4)
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-5 h-px border-t border-dashed"
              style={{ borderColor: MUTED_STR }}
            />
            <span className="text-[10px] text-muted-foreground">
              Moderate threshold
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Add Note Modal ────────────────────────────────────────────────────────────
function AddNoteModal({
  open,
  onClose,
  patientName,
}: {
  open: boolean;
  onClose: () => void;
  patientName: string;
}) {
  const [noteType, setNoteType] = useState<TimelineEventType>("note");
  const [noteText, setNoteText] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!noteText.trim()) {
      toast.error("Note content is required");
      return;
    }
    toast.success("Note added", {
      description: `${EVENT_CONFIG[noteType].label} for ${patientName} recorded.`,
    });
    setNoteText("");
    setNoteType("note");
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="glass-card border-white/15 max-w-md"
        data-ocid="add-note-modal"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-base flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" />
            Add Timeline Entry
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div>
            <Label className="text-xs font-medium mb-1.5 block">Patient</Label>
            <p className="text-sm font-semibold text-foreground">
              {patientName}
            </p>
          </div>

          <div>
            <Label
              className="text-xs font-medium mb-1.5 block"
              htmlFor="note-type"
            >
              Entry Type
            </Label>
            <Select
              value={noteType}
              onValueChange={(v) => setNoteType(v as TimelineEventType)}
            >
              <SelectTrigger
                id="note-type"
                className="glass border-border"
                data-ocid="note-type-select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="note">
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" /> Note
                  </div>
                </SelectItem>
                <SelectItem value="appointment">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" /> Appointment
                  </div>
                </SelectItem>
                <SelectItem value="prescription">
                  <div className="flex items-center gap-2">
                    <Pill className="w-3.5 h-3.5" /> Prescription
                  </div>
                </SelectItem>
                <SelectItem value="milestone">
                  <div className="flex items-center gap-2">
                    <Star className="w-3.5 h-3.5" /> Milestone
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label
              className="text-xs font-medium mb-1.5 block"
              htmlFor="note-text"
            >
              Clinical Note
            </Label>
            <Textarea
              id="note-text"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Enter clinical observations, follow-up details, or milestone description…"
              className="glass border-border min-h-[120px] text-sm resize-none"
              data-ocid="note-textarea"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={onClose}
              data-ocid="note-cancel-btn"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              data-ocid="note-submit-btn"
            >
              Add Entry
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
function PatientTimelinePage() {
  const [selectedId, setSelectedId] = useState(patientTimelines[0].patientId);
  const [activeFilter, setActiveFilter] = useState<"all" | TimelineEventType>(
    "all",
  );
  const [noteModalOpen, setNoteModalOpen] = useState(false);

  const patient = patientTimelines.find((p) => p.patientId === selectedId)!;
  const m = patient.healthMetrics;

  const filteredEvents =
    activeFilter === "all"
      ? patient.timelineEvents
      : patient.timelineEvents.filter((e) => e.type === activeFilter);

  const daysOnTreatment =
    patient.daysOnTreatment ??
    Math.round(
      (new Date(m.lastVisit).getTime() -
        new Date(patient.timelineEvents[0]?.date ?? m.lastVisit).getTime()) /
        (1000 * 60 * 60 * 24),
    );

  return (
    <div className="space-y-6" data-ocid="patient-timeline-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Crown className="w-5 h-5 text-premium" />
            <h1 className="text-2xl font-bold font-display text-foreground">
              Patient Health Timeline
            </h1>
            <span className="pro-badge">PRO</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Longitudinal case journey — events, symptom progression, and health
            metrics.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs"
            onClick={() =>
              toast.success("Exporting PDF…", {
                description: "Patient timeline PDF is being generated.",
              })
            }
            data-ocid="export-pdf-btn"
          >
            <Download className="w-3.5 h-3.5" />
            Export PDF
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs"
            onClick={() =>
              toast.success("Exporting CSV…", {
                description: "Symptom data CSV download starting.",
              })
            }
            data-ocid="export-csv-btn"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Patient Selector */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="glass-card p-4 flex flex-wrap items-center gap-4"
        data-ocid="patient-selector"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Activity className="w-4 h-4 text-primary" />
          Select Patient
        </div>
        <Select
          value={selectedId}
          onValueChange={(v) => {
            setSelectedId(v);
            setActiveFilter("all");
          }}
        >
          <SelectTrigger
            className="w-[220px] glass border-border"
            data-ocid="patient-select-trigger"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {patientTimelines.map((p) => (
              <SelectItem key={p.patientId} value={p.patientId}>
                {p.patientName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge variant="outline" className="text-muted-foreground text-xs">
          Last visit:{" "}
          {new Date(m.lastVisit).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </Badge>
        <Button
          size="sm"
          className="gap-1.5 text-xs ml-auto bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => setNoteModalOpen(true)}
          data-ocid="add-note-btn"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Entry
        </Button>
      </motion.div>

      {/* Metric Cards */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${selectedId}-metrics`}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <MetricCard
            icon={<Calendar className="w-3.5 h-3.5" />}
            label="Total Visits"
            value={String(m.totalVisits)}
            sub="Consultation sessions"
            delay={0}
          />
          <MetricCard
            icon={<TrendingUp className="w-3.5 h-3.5" />}
            label="Improvement Rate"
            value={`${m.improvementRate}%`}
            sub="Overall symptom resolution"
            delay={0.07}
            highlight
          />
          <MetricCard
            icon={<Pill className="w-3.5 h-3.5" />}
            label="Active Remedies"
            value={String(m.activeRemedies)}
            sub={
              m.activeRemedies === 0
                ? "Case closed — cured"
                : "Currently prescribed"
            }
            delay={0.14}
          />
          <MetricCard
            icon={<Clock className="w-3.5 h-3.5" />}
            label="Days on Treatment"
            value={`${daysOnTreatment}d`}
            sub="Total treatment duration"
            delay={0.21}
          />
        </motion.div>
      </AnimatePresence>

      {/* Split Panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${selectedId}-panel`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 xl:grid-cols-5 gap-5"
        >
          {/* LEFT: Timeline */}
          <div className="xl:col-span-2 flex flex-col">
            <div className="glass-card p-5 flex flex-col gap-4 h-full">
              {/* Timeline header + filter */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h3 className="text-sm font-semibold font-display text-foreground flex items-center gap-2">
                  <span className="feature-icon w-6 h-6 rounded-md text-xs">
                    <Calendar className="w-3.5 h-3.5" />
                  </span>
                  Case Timeline
                </h3>
                <div className="flex items-center gap-1.5">
                  <Filter className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground font-medium">
                    Filter:
                  </span>
                </div>
              </div>

              {/* Filter pills */}
              <div
                className="flex gap-1.5 flex-wrap"
                data-ocid="timeline-filter"
              >
                {FILTER_OPTIONS.map((opt) => (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => setActiveFilter(opt.value)}
                    className={`text-[10px] px-2.5 py-1 rounded-full border font-medium transition-smooth ${
                      activeFilter === opt.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "glass text-muted-foreground border-border hover:text-foreground"
                    }`}
                    data-ocid={`filter-${opt.value}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Timeline feed */}
              <div className="flex-1 overflow-y-auto max-h-[480px] pr-1 scroll-smooth">
                <AnimatePresence mode="popLayout">
                  {filteredEvents.length === 0 ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="empty-state py-10"
                      data-ocid="timeline-empty-state"
                    >
                      <div className="empty-state-icon w-10 h-10 text-sm">
                        <Filter className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-semibold text-foreground mt-2">
                        No events found
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        No {activeFilter} events for this patient.
                      </p>
                      <button
                        type="button"
                        className="text-xs text-primary mt-3 hover:underline"
                        onClick={() => setActiveFilter("all")}
                      >
                        Clear filter
                      </button>
                    </motion.div>
                  ) : (
                    filteredEvents.map((event, i) => (
                      <TimelineCard
                        key={event.id}
                        event={event}
                        index={i}
                        isLast={i === filteredEvents.length - 1}
                      />
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* RIGHT: Charts */}
          <div className="xl:col-span-3 flex flex-col">
            <div className="glass-card p-5 flex-1">
              <h3 className="text-sm font-semibold font-display text-foreground mb-4 flex items-center gap-2">
                <span className="feature-icon w-6 h-6 rounded-md text-xs">
                  <TrendingUp className="w-3.5 h-3.5" />
                </span>
                Symptom Progression
              </h3>
              {patient.symptomProgressions.length > 0 ? (
                <SymptomChartPanel patient={patient} />
              ) : (
                <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                  No symptom data available
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Add Note Modal */}
      <AddNoteModal
        open={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        patientName={patient.patientName}
      />
    </div>
  );
}
