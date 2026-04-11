import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { materiaMedicaEntries } from "@/data/materiamedica";
import type { MateriaMedicaEntry } from "@/types/proTypes";
import { Link, createRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  ChevronDown,
  Crown,
  Download,
  GitCompare,
  Plus,
  Search,
  Sparkles,
  Star,
  ThumbsDown,
  ThumbsUp,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { toast } from "sonner";
import { Route as proRoute } from "./pro";

export const Route = createRoute({
  getParentRoute: () => proRoute,
  path: "/remedy-comparison",
  component: RemedyComparisonPage,
});

// ── Constants ──────────────────────────────────────────────────────────────────

// Pre-load 2 demo remedies as required
const DEFAULT_IDS = ["mm001", "mm002"];

const HEATMAP_CATEGORIES = [
  "Mental",
  "Head",
  "Chest",
  "Digestion",
  "Skin",
  "General",
] as const;
type HeatmapCategory = (typeof HEATMAP_CATEGORIES)[number];

const RADAR_COLORS = [
  { stroke: "#0d9488", fill: "#0d9488" }, // teal-600
  { stroke: "#b45309", fill: "#b45309" }, // amber-700
  { stroke: "#7c3aed", fill: "#7c3aed" }, // violet-700
  { stroke: "#be185d", fill: "#be185d" }, // pink-700
];

const CATEGORY_AFFINITY_MAP: Record<HeatmapCategory, string[]> = {
  Mental: ["Mind"],
  Head: ["Head", "Nervous system"],
  Chest: [
    "Lungs",
    "Respiratory",
    "Respiratory system",
    "Cardiovascular",
    "Blood",
    "Pleura",
  ],
  Digestion: ["GI tract", "Liver", "Digestion", "Stomach"],
  Skin: ["Skin", "Mucous membranes"],
  General: [
    "General",
    "Metabolism",
    "Blood",
    "Lymph glands",
    "Glands",
    "Connective tissue",
  ],
};

const CATEGORY_KEYWORD_MAP: Record<HeatmapCategory, RegExp> = {
  Mental:
    /mind|mental|grief|anger|anxiety|fear|depress|emotion|intellectual|mood/i,
  Head: /head|migrain|skull|brain|hair|scalp|temple|vertex/i,
  Chest:
    /chest|lung|breath|cough|pneumon|asthma|cardiac|heart|respiratory|pleura/i,
  Digestion:
    /digest|bowel|stool|gastric|liver|nausea|vomit|constipat|flatulence|bloat|GI/i,
  Skin: /skin|eczema|erupt|itch|rash|hives|urticaria|wart|pustule/i,
  General:
    /energy|fatigue|fever|sweat|chilly|cold|general|sleep|night|temperature/i,
};

// ── Score derivation ───────────────────────────────────────────────────────────

function deriveHeatmapScore(
  entry: MateriaMedicaEntry,
  cat: HeatmapCategory,
): number {
  let score = 0;
  const affinityKeywords = CATEGORY_AFFINITY_MAP[cat];
  const keywordRe = CATEGORY_KEYWORD_MAP[cat];

  for (const aff of entry.affinities) {
    if (
      affinityKeywords.some((k) => aff.toLowerCase().includes(k.toLowerCase()))
    )
      score += 2;
  }
  for (const kn of entry.keynotes) {
    if (keywordRe.test(kn)) score += 1;
  }
  if (cat === "Mental") score += Math.min(entry.mentalSymptoms.length, 3);
  for (const ps of entry.physicalSymptoms) {
    if (keywordRe.test(ps)) score += 0.5;
  }

  return Math.min(Math.round(score), 10);
}

// ── Heatmap cell color ─────────────────────────────────────────────────────────

function heatColor(score: number): string {
  if (score === 0) return "bg-muted/30 text-muted-foreground/40";
  if (score <= 2)
    return "bg-teal-100/50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300";
  if (score <= 4)
    return "bg-teal-200/70 dark:bg-teal-800/50 text-teal-800 dark:text-teal-200";
  if (score <= 6)
    return "bg-teal-400/60 dark:bg-teal-600/60 text-teal-900 dark:text-teal-100";
  if (score <= 8) return "bg-teal-500/75 dark:bg-teal-500/70 text-white";
  return "bg-teal-700 dark:bg-teal-400 text-white dark:text-teal-900 font-bold";
}

function intensityLabel(score: number): string {
  if (score === 0) return "None";
  if (score <= 2) return "Low";
  if (score <= 4) return "Mild";
  if (score <= 6) return "Mod";
  if (score <= 8) return "High";
  return "Strong";
}

// ── Source badge color ─────────────────────────────────────────────────────────

function sourceBadgeClass(source: string): string {
  switch (source) {
    case "plant":
      return "border-emerald-400/50 bg-emerald-50/60 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";
    case "mineral":
      return "border-slate-400/50 bg-slate-50/60 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300";
    case "animal":
      return "border-orange-400/50 bg-orange-50/60 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300";
    case "nosode":
      return "border-violet-400/50 bg-violet-50/60 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300";
    default:
      return "border-border/50";
  }
}

// ── Contraindication check ─────────────────────────────────────────────────────

function hasOpposingModalities(entries: MateriaMedicaEntry[]): boolean {
  if (entries.length < 2) return false;
  const betterSets = entries.map((e) =>
    e.modalities.better.map((m) => m.toLowerCase()),
  );
  const worseSets = entries.map((e) =>
    e.modalities.worse.map((m) => m.toLowerCase()),
  );
  const keys = ["heat", "warm", "cold", "motion", "rest", "pressure"];
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      for (const b of betterSets[i]) {
        for (const w of worseSets[j]) {
          if (keys.some((k) => b.includes(k) && w.includes(k))) return true;
        }
      }
      for (const b of betterSets[j]) {
        for (const w of worseSets[i]) {
          if (keys.some((k) => b.includes(k) && w.includes(k))) return true;
        }
      }
    }
  }
  return false;
}

// ── Selector Slot ──────────────────────────────────────────────────────────────

interface SelectorSlotProps {
  index: number;
  selectedId: string | null;
  taken: string[];
  onSelect: (id: string | null) => void;
  onRemove: () => void;
  canRemove: boolean;
}

function SelectorSlot({
  index,
  selectedId,
  taken,
  onSelect,
  onRemove,
  canRemove,
}: SelectorSlotProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const selected = selectedId
    ? materiaMedicaEntries.find((e) => e.id === selectedId)
    : null;

  const filtered = useMemo(() => {
    const pool = materiaMedicaEntries.filter(
      (e) => !taken.includes(e.id) || e.id === selectedId,
    );
    if (!query.trim()) return pool.slice(0, 12);
    const q = query.toLowerCase();
    return pool.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.commonName.toLowerCase().includes(q) ||
        e.source.toLowerCase().includes(q),
    );
  }, [query, taken, selectedId]);

  return (
    <div className="relative flex-1 min-w-0" data-ocid={`remedy-slot-${index}`}>
      {selected ? (
        <div className="flex items-center gap-3 p-3 rounded-xl border border-primary/25 bg-primary/5 dark:bg-primary/10">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
            style={{
              background: `${RADAR_COLORS[index % RADAR_COLORS.length].fill}33`,
              color: RADAR_COLORS[index % RADAR_COLORS.length].stroke,
            }}
          >
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display font-semibold text-foreground text-sm truncate">
              {selected.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {selected.commonName}
            </p>
          </div>
          <Badge
            variant="outline"
            className={`text-[10px] shrink-0 capitalize ${sourceBadgeClass(selected.source)}`}
          >
            {selected.source}
          </Badge>
          {canRemove && (
            <button
              type="button"
              onClick={() => {
                onSelect(null);
                onRemove();
              }}
              className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-destructive/15 text-muted-foreground hover:text-destructive transition-colors"
              aria-label="Remove remedy"
              data-ocid={`remedy-remove-${index}`}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            <Search className="w-3.5 h-3.5" />
          </div>
          <Input
            className="pl-9 pr-8 h-10 text-sm glass border-border/60"
            placeholder={`Select remedy ${index + 1}…`}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            data-ocid={`remedy-search-${index}`}
          />
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="absolute z-50 w-full mt-1 glass-card border border-border/60 rounded-xl overflow-hidden shadow-elevated"
              >
                <div className="max-h-52 overflow-y-auto divide-y divide-border/40">
                  {filtered.length === 0 && (
                    <p className="p-3 text-xs text-muted-foreground text-center">
                      No remedies found
                    </p>
                  )}
                  {filtered.map((entry) => (
                    <button
                      type="button"
                      key={entry.id}
                      className="w-full text-left px-3 py-2.5 hover:bg-primary/8 transition-colors"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        onSelect(entry.id);
                        setQuery("");
                        setOpen(false);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {entry.name}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[9px] capitalize shrink-0 ${sourceBadgeClass(entry.source)}`}
                        >
                          {entry.source}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {entry.commonName}
                      </p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
      {open && !selected && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
          role="presentation"
        />
      )}
    </div>
  );
}

// ── Radar Chart ────────────────────────────────────────────────────────────────

interface RadarChartProps {
  entries: MateriaMedicaEntry[];
}

function RemedyRadarChart({ entries }: RadarChartProps) {
  const radarData = HEATMAP_CATEGORIES.map((cat) => ({
    subject: cat,
    ...Object.fromEntries(
      entries.map((e) => [e.name.split(" ")[0], deriveHeatmapScore(e, cat)]),
    ),
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart
        data={radarData}
        margin={{ top: 10, right: 30, bottom: 10, left: 30 }}
      >
        <PolarGrid stroke="currentColor" className="text-border/40" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{
            fontSize: 11,
            fill: "currentColor",
            className: "text-muted-foreground",
          }}
        />
        {entries.map((entry, idx) => (
          <Radar
            key={entry.id}
            name={entry.name}
            dataKey={entry.name.split(" ")[0]}
            stroke={RADAR_COLORS[idx % RADAR_COLORS.length].stroke}
            fill={RADAR_COLORS[idx % RADAR_COLORS.length].fill}
            fillOpacity={0.15}
            strokeWidth={2}
          />
        ))}
        <Legend
          iconType="line"
          wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
        />
        <Tooltip
          contentStyle={{
            background: "hsl(var(--popover))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            fontSize: "11px",
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// ── Keynotes & Modalities Card ─────────────────────────────────────────────────

interface RemedyDetailCardProps {
  entry: MateriaMedicaEntry;
  index: number;
}

function RemedyDetailCard({ entry, index }: RemedyDetailCardProps) {
  const accentColor = RADAR_COLORS[index % RADAR_COLORS.length].stroke;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.07 * index, duration: 0.4 }}
      className="glass-card p-5 space-y-5 flex flex-col"
      data-ocid={`remedy-detail-card-${index}`}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
          style={{ background: `${accentColor}22`, color: accentColor }}
        >
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-display font-bold text-foreground text-sm truncate">
            {entry.name}
          </h4>
          <p className="text-xs text-muted-foreground truncate">
            {entry.commonName}
          </p>
        </div>
        <Badge
          variant="outline"
          className={`text-[10px] capitalize shrink-0 ${sourceBadgeClass(entry.source)}`}
        >
          {entry.source}
        </Badge>
      </div>

      {/* Constitutional Type */}
      <div className="rounded-lg bg-primary/5 dark:bg-primary/10 border border-primary/15 p-3">
        <div className="flex items-center gap-1.5 mb-1.5">
          <User className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
            Constitutional Type
          </span>
        </div>
        <p className="text-xs text-foreground/80 leading-relaxed">
          {entry.constitutionalType}
        </p>
      </div>

      {/* Keynotes */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-premium shrink-0" />
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Keynotes
          </span>
        </div>
        <ul className="space-y-1.5">
          {entry.keynotes.slice(0, 5).map((kn) => (
            <li
              key={kn}
              className="flex items-start gap-2 text-xs text-foreground/80 leading-relaxed"
            >
              <Star
                className="w-2.5 h-2.5 mt-0.5 shrink-0"
                style={{ color: accentColor }}
              />
              <span>{kn}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Modalities */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <ThumbsUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Better
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {entry.modalities.better.map((m) => (
              <span
                key={m}
                className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-emerald-50/80 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-700/40"
              >
                {m}
              </span>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <ThumbsDown className="w-3 h-3 text-rose-500 dark:text-rose-400 shrink-0" />
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Worse
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {entry.modalities.worse.map((m) => (
              <span
                key={m}
                className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-rose-50/80 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300 border border-rose-200/60 dark:border-rose-700/40"
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Potencies */}
      <div className="pt-2 border-t border-border/30 flex items-center gap-2 flex-wrap">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider shrink-0">
          Potencies:
        </span>
        {entry.potencies.map((p) => (
          <span
            key={p}
            className="inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-muted/40 text-muted-foreground border border-border/40"
          >
            {p}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

function RemedyComparisonPage() {
  const [slots, setSlots] = useState<
    Array<{ id: string; remedyId: string | null }>
  >(DEFAULT_IDS.map((remedyId, i) => ({ id: `slot-${i}`, remedyId })));
  const [compared, setCompared] = useState<MateriaMedicaEntry[]>(
    DEFAULT_IDS.map(
      (id) => materiaMedicaEntries.find((e) => e.id === id)!,
    ).filter(Boolean),
  );

  const selectedEntries = useMemo(
    () =>
      slots
        .filter(
          (s): s is { id: string; remedyId: string } => s.remedyId !== null,
        )
        .map((s) => materiaMedicaEntries.find((e) => e.id === s.remedyId))
        .filter((e): e is MateriaMedicaEntry => e !== undefined),
    [slots],
  );

  const takenIds = useMemo(
    () =>
      slots.map((s) => s.remedyId).filter((id): id is string => id !== null),
    [slots],
  );

  const showWarning = useMemo(
    () => hasOpposingModalities(compared),
    [compared],
  );

  const heatmapData = useMemo(
    () =>
      compared.map((entry) => ({
        name: entry.name,
        scores: HEATMAP_CATEGORIES.map((cat) => ({
          category: cat,
          score: deriveHeatmapScore(entry, cat),
        })),
      })),
    [compared],
  );

  function handleSetSlot(index: number, id: string | null) {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], remedyId: id };
      return next;
    });
  }

  function handleRemoveSlot(index: number) {
    setSlots((prev) => prev.filter((_, i) => i !== index));
  }

  function handleAddSlot() {
    if (slots.length < 4) {
      setSlots((prev) => [
        ...prev,
        { id: `slot-${Date.now()}`, remedyId: null },
      ]);
    }
  }

  function handleCompare() {
    setCompared(selectedEntries);
  }

  function handleExport() {
    toast.success("Comparison saved successfully!", {
      description: `${compared.length} remedies — differential analysis exported as PDF.`,
      duration: 4000,
    });
  }

  const hasResults = compared.length >= 2;

  return (
    <motion.div
      className="space-y-8 pb-10"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
      data-ocid="remedy-comparison-page"
    >
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="min-w-0">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
            <Link to="/pro" className="hover:text-foreground transition-colors">
              Pro Features
            </Link>
            <span className="opacity-40">/</span>
            <span className="text-foreground">Remedy Comparison</span>
          </nav>
          <div className="flex items-center gap-3">
            <div className="feature-icon-premium shrink-0">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">
                Smart Remedy Comparison
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5 font-body">
                Side-by-side differential analysis of up to 4 remedies
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {hasResults && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-premium/30 text-premium hover:bg-premium/10 hover:border-premium/50 transition-smooth"
              onClick={handleExport}
              data-ocid="export-comparison-btn"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </Button>
          )}
          <Badge
            variant="outline"
            className="border-premium/40 bg-premium/10 text-premium font-semibold gap-1.5 h-8 px-3"
          >
            <Crown className="w-3.5 h-3.5" />
            PRO Feature
          </Badge>
        </div>
      </div>

      {/* ── Selector Panel ──────────────────────────────────────────────── */}
      <motion.div
        className="glass-premium p-5 space-y-4"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        data-ocid="remedy-selector-panel"
      >
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-premium" />
          <h2 className="font-display font-semibold text-foreground text-sm">
            Select Remedies to Compare
          </h2>
          <span className="text-xs text-muted-foreground ml-auto">
            {slots.length} / 4 slots
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          {slots.map((slot, idx) => (
            <SelectorSlot
              key={slot.id}
              index={idx}
              selectedId={slot.remedyId}
              taken={takenIds}
              onSelect={(newId) => handleSetSlot(idx, newId)}
              onRemove={() => handleRemoveSlot(idx)}
              canRemove={slots.length > 1}
            />
          ))}
          {slots.length < 4 && (
            <Button
              variant="outline"
              size="sm"
              className="h-10 gap-2 border-dashed border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40 shrink-0"
              onClick={handleAddSlot}
              data-ocid="add-remedy-slot"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Remedy
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-muted-foreground">
            {selectedEntries.length < 2
              ? "Select at least 2 remedies to compare"
              : `Ready to compare ${selectedEntries.length} remedies`}
          </p>
          <Button
            onClick={handleCompare}
            disabled={selectedEntries.length < 2}
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
            data-ocid="compare-remedies-btn"
          >
            <GitCompare className="w-4 h-4" />
            Compare{" "}
            {selectedEntries.length > 0 ? `(${selectedEntries.length})` : ""}
          </Button>
        </div>
      </motion.div>

      {/* ── Contraindication Warning ─────────────────────────────────────── */}
      <AnimatePresence>
        {showWarning && hasResults && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div
              className="flex items-start gap-3 px-4 py-3 rounded-xl border border-amber-400/40 bg-amber-50/60 dark:bg-amber-950/30 dark:border-amber-500/30"
              data-ocid="contraindication-banner"
            >
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
                <span className="font-semibold">Clinical Note: </span>
                Selected remedies have opposing modalities (e.g. one better from
                heat, another worse from heat). Review the full case carefully
                before prescribing. Consider differential diagnosis.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Empty State ──────────────────────────────────────────────────── */}
      {!hasResults && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-12 text-center"
          data-ocid="comparison-empty-state"
        >
          <div className="empty-state-icon mx-auto">
            <GitCompare className="w-8 h-8" />
          </div>
          <h3 className="font-display font-semibold text-foreground text-lg">
            Select 2–4 Remedies
          </h3>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-sm mx-auto">
            Use the selectors above to pick 2 to 4 remedies, then click Compare
            to see the side-by-side differential analysis.
          </p>
        </motion.div>
      )}

      {hasResults && (
        <>
          {/* ── Heatmap ──────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="glass-card p-5 space-y-5"
            data-ocid="trait-heatmap"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-display font-semibold text-foreground text-sm">
                  Symptom Category Heatmap
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Affinity intensity across 6 clinical categories (0–10 scale)
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-[10px] text-muted-foreground">
                <span>Weak</span>
                {[0, 2, 4, 6, 8, 10].map((n) => (
                  <div
                    key={n}
                    className={`w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold ${heatColor(n)}`}
                  >
                    {n}
                  </div>
                ))}
                <span>Strong</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border-separate border-spacing-1">
                <thead>
                  <tr>
                    <th className="text-left text-muted-foreground font-semibold pb-1 w-36 min-w-[9rem]" />
                    {HEATMAP_CATEGORIES.map((cat) => (
                      <th
                        key={cat}
                        className="text-center text-muted-foreground font-semibold pb-1 min-w-[5rem]"
                      >
                        {cat}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {heatmapData.map((row, ri) => (
                    <motion.tr
                      key={row.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * ri, duration: 0.35 }}
                    >
                      <td className="pr-3 py-1 font-display font-semibold text-foreground text-xs whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{
                              background:
                                RADAR_COLORS[ri % RADAR_COLORS.length].stroke,
                            }}
                          />
                          <span className="truncate max-w-[7rem]">
                            {row.name.split(" ")[0]}
                          </span>
                        </div>
                      </td>
                      {row.scores.map(({ category, score }) => (
                        <td
                          key={category}
                          className="text-center py-1"
                          data-ocid={`heat-cell-${ri}-${category}`}
                        >
                          <div
                            className={`mx-auto w-full max-w-[4.5rem] rounded-lg py-2 transition-all duration-300 ${heatColor(score)}`}
                            title={`${row.name} — ${category}: ${score}/10`}
                          >
                            <div className="font-bold leading-none text-[11px]">
                              {score}
                            </div>
                            <div className="text-[9px] opacity-80 mt-0.5">
                              {intensityLabel(score)}
                            </div>
                          </div>
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* ── Radar Chart ──────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.4 }}
            className="glass-card p-5 space-y-4"
            data-ocid="radar-chart-section"
          >
            <div>
              <h3 className="font-display font-semibold text-foreground text-sm">
                Coverage Radar
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Overlapping symptom coverage shapes — larger area indicates
                broader action
              </p>
            </div>
            <RemedyRadarChart entries={compared} />
          </motion.div>

          {/* ── Differential Table ───────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="glass-card overflow-hidden"
            data-ocid="comparison-table"
          >
            <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <GitCompare className="w-4 h-4 text-primary" />
                <h3 className="font-display font-semibold text-foreground text-sm">
                  Differential Analysis Table
                </h3>
              </div>
              <span className="text-xs text-muted-foreground">
                {compared.length} remedies
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/20">
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground w-36 min-w-[9rem]">
                      Property
                    </th>
                    {compared.map((entry, idx) => (
                      <th
                        key={entry.id}
                        className="text-left px-4 py-3 min-w-[12rem]"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{
                              background:
                                RADAR_COLORS[idx % RADAR_COLORS.length].stroke,
                            }}
                          />
                          <div>
                            <div className="font-display font-bold text-foreground">
                              {entry.name}
                            </div>
                            <div className="text-[10px] font-normal text-muted-foreground mt-0.5">
                              {entry.commonName}
                            </div>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      label: "Source",
                      render: (e: MateriaMedicaEntry) =>
                        e.source.charAt(0).toUpperCase() + e.source.slice(1),
                    },
                    {
                      label: "Family / Element",
                      render: (e: MateriaMedicaEntry) =>
                        e.family ?? e.element ?? "—",
                    },
                    {
                      label: "Constitutional Type",
                      render: (e: MateriaMedicaEntry) => e.constitutionalType,
                    },
                    {
                      label: "Top Keynotes",
                      render: (e: MateriaMedicaEntry) =>
                        e.keynotes.slice(0, 3).join(" · "),
                    },
                    {
                      label: "Mental Symptoms",
                      render: (e: MateriaMedicaEntry) =>
                        e.mentalSymptoms.slice(0, 2).join(" · "),
                    },
                    {
                      label: "Physical Symptoms",
                      render: (e: MateriaMedicaEntry) =>
                        e.physicalSymptoms.slice(0, 2).join(" · "),
                    },
                    {
                      label: "Better Modalities",
                      render: (e: MateriaMedicaEntry) =>
                        e.modalities.better.join(", "),
                    },
                    {
                      label: "Worse Modalities",
                      render: (e: MateriaMedicaEntry) =>
                        e.modalities.worse.join(", "),
                    },
                    {
                      label: "Common Potencies",
                      render: (e: MateriaMedicaEntry) => e.potencies.join(", "),
                    },
                    {
                      label: "Affinities",
                      render: (e: MateriaMedicaEntry) =>
                        e.affinities.join(", "),
                    },
                  ].map((row, rowIdx) => (
                    <tr
                      key={row.label}
                      className={`border-b border-border/30 transition-colors ${rowIdx % 2 === 0 ? "bg-background" : "bg-muted/10"}`}
                    >
                      <td className="px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap">
                        {row.label}
                      </td>
                      {compared.map((entry) => (
                        <td
                          key={entry.id}
                          className="px-4 py-3 text-foreground/85 leading-relaxed"
                        >
                          {row.render(entry)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* ── Keynotes & Modalities Cards ──────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32, duration: 0.4 }}
            className="space-y-4"
            data-ocid="remedy-detail-cards"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-premium" />
              <h3 className="font-display font-semibold text-foreground text-sm">
                Keynotes, Modalities & Constitutional Type
              </h3>
            </div>
            <div
              className={`grid gap-4 ${compared.length <= 2 ? "grid-cols-1 md:grid-cols-2" : compared.length === 3 ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2 xl:grid-cols-4"}`}
            >
              {compared.map((entry, idx) => (
                <RemedyDetailCard key={entry.id} entry={entry} index={idx} />
              ))}
            </div>
          </motion.div>

          {/* ── Save CTA ─────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="glass-premium p-5 flex flex-col sm:flex-row items-center justify-between gap-4"
            data-ocid="save-comparison-section"
          >
            <div className="text-center sm:text-left">
              <p className="font-display font-semibold text-foreground text-sm">
                Save this comparison
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Export as a PDF to add to patient records or share with
                colleagues.
              </p>
            </div>
            <Button
              onClick={handleExport}
              className="gap-2 bg-premium/90 hover:bg-premium text-white font-semibold shrink-0"
              data-ocid="save-comparison-btn"
            >
              <Download className="w-4 h-4" />
              Save Comparison
            </Button>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
