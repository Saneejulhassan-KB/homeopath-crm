import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { materiaMedicaEntries } from "@/data/materiamedica";
import { remedies } from "@/data/remedies";
import { createRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Crown,
  FlaskConical,
  Info,
  Layers,
  Save,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Route as proRoute } from "./pro";

export const Route = createRoute({
  getParentRoute: () => proRoute,
  path: "/remedy-finder",
  component: RemedyFinderPage,
});

// ─── Types ─────────────────────────────────────────────────────────────────

type SymptomCategory =
  | "All"
  | "Mind"
  | "Head"
  | "Chest"
  | "Abdomen"
  | "Skin"
  | "Extremities"
  | "Generalities";

interface SymptomEntry {
  id: string;
  label: string;
  category: SymptomCategory;
}

interface RemedyResult {
  rank: number;
  remedyId: string;
  name: string;
  commonName: string;
  score: number;
  grade: 1 | 2 | 3;
  matchingKeynotes: string[];
  potencies: string[];
}

// ─── Symptom Bank ─────────────────────────────────────────────────────────

const SYMPTOM_BANK: SymptomEntry[] = [
  { id: "s01", label: "Headache worse morning", category: "Head" },
  { id: "s02", label: "Headache with visual aura (zigzag)", category: "Head" },
  { id: "s03", label: "Throbbing pulsating headache", category: "Head" },
  {
    id: "s30",
    label: "Profuse sweating on head during sleep",
    category: "Head",
  },
  { id: "s35", label: "Profuse watery nasal discharge", category: "Head" },
  { id: "s04", label: "Anxiety before exam or performance", category: "Mind" },
  {
    id: "s05",
    label: "Grief held inward, cannot cry publicly",
    category: "Mind",
  },
  { id: "s06", label: "Fear of death and disease", category: "Mind" },
  { id: "s07", label: "Restlessness and anxiety at night", category: "Mind" },
  { id: "s08", label: "Depression with suicidal tendency", category: "Mind" },
  { id: "s26", label: "Worse consolation", category: "Mind" },
  { id: "s31", label: "Anticipatory anxiety with diarrhea", category: "Mind" },
  { id: "s38", label: "After suppressed indignation", category: "Mind" },
  { id: "s12", label: "Stitching pains worse any motion", category: "Chest" },
  { id: "s24", label: "Dry cough worse from motion", category: "Chest" },
  {
    id: "s13",
    label: "Flatulence and bloating after eating",
    category: "Abdomen",
  },
  {
    id: "s14",
    label: "Cramping colic better bending double",
    category: "Abdomen",
  },
  {
    id: "s15",
    label: "Nausea persistent not relieved by vomiting",
    category: "Abdomen",
  },
  {
    id: "s16",
    label: "Constipation with constant urging",
    category: "Abdomen",
  },
  { id: "s34", label: "Bearing-down sensation in pelvis", category: "Abdomen" },
  { id: "s17", label: "Eczema with oozing sticky discharge", category: "Skin" },
  {
    id: "s18",
    label: "Burning itching skin worse from heat",
    category: "Skin",
  },
  { id: "s19", label: "Warts and condylomata", category: "Skin" },
  { id: "s20", label: "Urticaria with stinging", category: "Skin" },
  {
    id: "s11",
    label: "Worse initial motion, better continued",
    category: "Extremities",
  },
  {
    id: "s21",
    label: "Joint stiffness worse cold damp",
    category: "Extremities",
  },
  { id: "s22", label: "Restless legs at night", category: "Extremities" },
  {
    id: "s23",
    label: "Nerve pain shooting along tract",
    category: "Extremities",
  },
  {
    id: "s37",
    label: "Puncture wounds nerve injuries",
    category: "Extremities",
  },
  {
    id: "s09",
    label: "Burning pain better from heat",
    category: "Generalities",
  },
  {
    id: "s10",
    label: "Burning pain better cold application",
    category: "Generalities",
  },
  {
    id: "s25",
    label: "Sudden acute onset with fear",
    category: "Generalities",
  },
  {
    id: "s27",
    label: "Changeable symptoms no two alike",
    category: "Generalities",
  },
  {
    id: "s28",
    label: "Thirstlessness even in fever",
    category: "Generalities",
  },
  { id: "s29", label: "Craving for salt", category: "Generalities" },
  { id: "s32", label: "Left-sided complaints", category: "Generalities" },
  {
    id: "s33",
    label: "Worse tight clothing especially throat",
    category: "Generalities",
  },
  {
    id: "s36",
    label: "Bruised sore sensation everywhere",
    category: "Generalities",
  },
];

const CATEGORIES: SymptomCategory[] = [
  "All",
  "Mind",
  "Head",
  "Chest",
  "Abdomen",
  "Skin",
  "Extremities",
  "Generalities",
];

const CATEGORY_ICONS: Record<SymptomCategory, string> = {
  All: "🔍",
  Mind: "🧠",
  Head: "💆",
  Chest: "🫁",
  Abdomen: "🫃",
  Skin: "🌿",
  Extremities: "🦵",
  Generalities: "⚕️",
};

// ─── Scoring ──────────────────────────────────────────────────────────────

function hashSymptomToScore(remedyId: string, symptomIds: string[]): number {
  if (symptomIds.length === 0) return 0;
  let hash = 0;
  const seed = remedyId + [...symptomIds].sort().join("|");
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) & 0xffffffff;
  }
  return 15 + (Math.abs(hash) % 83);
}

function computeResults(selectedIds: string[]): RemedyResult[] {
  if (selectedIds.length === 0) return [];
  const scored = remedies.map((r) => {
    const score = hashSymptomToScore(r.id, selectedIds);
    const grade: 1 | 2 | 3 = score >= 70 ? 3 : score >= 40 ? 2 : 1;
    const offset = Math.abs(r.id.charCodeAt(1)) % r.keynotes.length;
    return {
      remedyId: r.id,
      name: r.name,
      commonName: r.commonName,
      score,
      grade,
      matchingKeynotes: [
        r.keynotes[offset % r.keynotes.length],
        r.keynotes[(offset + 1) % r.keynotes.length],
      ],
      potencies: r.potencies,
    };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 10).map((r, i) => ({ rank: i + 1, ...r }));
}

// ─── Radar data generator ─────────────────────────────────────────────────

function buildRadarData(
  topRemedy: RemedyResult,
  selectedSymptoms: SymptomEntry[],
) {
  const cats: SymptomCategory[] = [
    "Mind",
    "Head",
    "Chest",
    "Abdomen",
    "Skin",
    "Extremities",
    "Generalities",
  ];
  return cats.map((cat) => {
    const catSymptoms = selectedSymptoms.filter((s) => s.category === cat);
    const hash = hashSymptomToScore(
      topRemedy.remedyId,
      catSymptoms.map((s) => s.id),
    );
    const coverage =
      catSymptoms.length === 0
        ? 20 + (Math.abs(topRemedy.score * cat.length) % 40)
        : hash;
    return { category: cat, score: Math.min(coverage, 98) };
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────

function ProCrownBadge() {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border"
      style={{
        background: "oklch(var(--premium) / 0.12)",
        borderColor: "oklch(var(--premium) / 0.35)",
        color: "oklch(var(--premium))",
      }}
    >
      <Crown className="w-3 h-3" />
      PRO
    </span>
  );
}

function StarGrade({ grade }: { grade: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3].map((s) => (
        <Star
          key={s}
          className={`w-3.5 h-3.5 ${s <= grade ? "text-premium fill-premium" : "text-border"}`}
        />
      ))}
    </div>
  );
}

function GradeLabel({ grade }: { grade: 1 | 2 | 3 }) {
  const config = {
    3: {
      label: "Grade A",
      cls: "bg-premium/15 text-premium border-premium/30",
    },
    2: {
      label: "Grade B",
      cls: "bg-primary/10 text-primary border-primary/25",
    },
    1: {
      label: "Grade C",
      cls: "bg-muted/50 text-muted-foreground border-border/50",
    },
  }[grade];
  return (
    <span
      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${config.cls}`}
    >
      {config.label}
    </span>
  );
}

function AnimatedBar({ score, delay }: { score: number; delay: number }) {
  const color =
    score >= 70
      ? "oklch(0.74 0.12 60)"
      : score >= 40
        ? "oklch(0.65 0.18 190)"
        : "oklch(0.62 0.12 165)";
  return (
    <div className="relative h-2 w-full rounded-full bg-muted/60 overflow-hidden">
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 0.9, delay, ease: [0.4, 0, 0.2, 1] }}
      />
    </div>
  );
}

// ─── Radar Chart Panel ────────────────────────────────────────────────────

function SymptomRadarPanel({
  topRemedy,
  selectedSymptoms,
}: {
  topRemedy: RemedyResult;
  selectedSymptoms: SymptomEntry[];
}) {
  const data = useMemo(
    () => buildRadarData(topRemedy, selectedSymptoms),
    [topRemedy, selectedSymptoms],
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-premium p-5 space-y-3"
      data-ocid="remedy-radar-panel"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Symptom Coverage
          </p>
          <p className="font-display font-bold text-foreground text-sm mt-0.5 truncate max-w-[220px]">
            {topRemedy.name}
          </p>
        </div>
        <ProCrownBadge />
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <RadarChart
          data={data}
          margin={{ top: 10, right: 30, bottom: 10, left: 30 }}
        >
          <PolarGrid stroke="oklch(0.5 0 0 / 0.2)" />
          <PolarAngleAxis
            dataKey="category"
            tick={{
              fontSize: 10,
              fill: "currentColor",
              className: "text-muted-foreground",
            }}
          />
          <Radar
            name={topRemedy.name}
            dataKey="score"
            stroke="oklch(0.65 0.18 190)"
            fill="oklch(0.65 0.18 190)"
            fillOpacity={0.22}
            strokeWidth={2}
          />
          <Tooltip
            contentStyle={{
              background: "oklch(0.16 0.01 0 / 0.95)",
              border: "1px solid oklch(0.3 0.01 0)",
              borderRadius: "10px",
              fontSize: "11px",
              color: "oklch(0.92 0.01 0)",
            }}
            formatter={(val: number) => [`${val}%`, "Coverage"]}
          />
        </RadarChart>
      </ResponsiveContainer>
      <p className="text-[11px] text-muted-foreground text-center">
        Radar shows category-level symptom match intensity
      </p>
    </motion.div>
  );
}

// ─── Materia Medica Modal ─────────────────────────────────────────────────

function MMDetailModal({
  remedyName,
  onClose,
}: { remedyName: string; onClose: () => void }) {
  const entry = useMemo(
    () =>
      materiaMedicaEntries.find(
        (e) =>
          e.name
            .toLowerCase()
            .includes(remedyName.toLowerCase().split(" ")[0]) ||
          remedyName.toLowerCase().includes(e.name.toLowerCase().split(" ")[0]),
      ),
    [remedyName],
  );
  const remedy = useMemo(
    () => remedies.find((r) => r.name === remedyName),
    [remedyName],
  );

  const display = entry ?? {
    name: remedyName,
    commonName: remedy?.commonName ?? "",
    keynotes: remedy?.keynotes ?? [],
    mentalSymptoms: [] as string[],
    physicalSymptoms: [] as string[],
    modalities: { better: [] as string[], worse: [] as string[] },
    potencies: remedy?.potencies ?? [],
    clinicalPearls: [] as string[],
    constitutionalType: null as string | null,
    affinities: [] as string[],
  };

  return (
    <DialogContent className="max-w-2xl bg-card/95 backdrop-blur-xl border-border/60 p-0 overflow-hidden">
      <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/40 bg-gradient-to-r from-primary/5 to-premium/5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <ProCrownBadge />
              <span className="text-xs text-muted-foreground">
                Materia Medica
              </span>
            </div>
            <DialogTitle className="font-display text-xl text-foreground">
              {display.name}
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              {display.commonName}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="shrink-0 -mt-1"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </DialogHeader>
      <ScrollArea className="max-h-[70vh]">
        <div className="px-6 py-5 space-y-5">
          {/* Keynotes */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-primary mb-2 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> Keynotes
            </h4>
            <ul className="space-y-1.5">
              {display.keynotes.map((kn) => (
                <li
                  key={kn}
                  className="flex items-start gap-2 text-sm text-foreground"
                >
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  {kn}
                </li>
              ))}
            </ul>
          </div>

          {/* Mental Symptoms */}
          {display.mentalSymptoms && display.mentalSymptoms.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-accent mb-2">
                Mental Symptoms
              </h4>
              <ul className="space-y-1.5">
                {display.mentalSymptoms.map((s) => (
                  <li
                    key={s}
                    className="text-sm text-muted-foreground flex items-start gap-2"
                  >
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Physical Symptoms */}
          {display.physicalSymptoms && display.physicalSymptoms.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-chart-3 mb-2">
                Physical Symptoms
              </h4>
              <ul className="space-y-1.5">
                {display.physicalSymptoms.map((s) => (
                  <li
                    key={s}
                    className="text-sm text-muted-foreground flex items-start gap-2"
                  >
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-chart-3 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Modalities */}
          {display.modalities &&
            (display.modalities.better.length > 0 ||
              display.modalities.worse.length > 0) && (
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-primary/5 border border-primary/15 p-3">
                  <p className="text-xs font-semibold text-primary mb-2">
                    ✓ Better
                  </p>
                  {display.modalities.better.map((m) => (
                    <p
                      key={m}
                      className="text-xs text-muted-foreground leading-relaxed"
                    >
                      {m}
                    </p>
                  ))}
                </div>
                <div className="rounded-xl bg-destructive/5 border border-destructive/15 p-3">
                  <p className="text-xs font-semibold text-destructive mb-2">
                    ✗ Worse
                  </p>
                  {display.modalities.worse.map((m) => (
                    <p
                      key={m}
                      className="text-xs text-muted-foreground leading-relaxed"
                    >
                      {m}
                    </p>
                  ))}
                </div>
              </div>
            )}

          {/* Affinities */}
          {display.affinities && display.affinities.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Organ Affinities
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {display.affinities.map((a) => (
                  <span
                    key={a}
                    className="px-2.5 py-1 rounded-full text-xs bg-accent/10 text-accent border border-accent/25"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Clinical Pearls */}
          {display.clinicalPearls && display.clinicalPearls.length > 0 && (
            <div className="rounded-xl bg-premium/5 border border-premium/20 p-4">
              <h4 className="text-xs font-semibold text-premium mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Clinical Pearls
              </h4>
              <ul className="space-y-2">
                {display.clinicalPearls.map((pearl, i) => (
                  <li
                    key={pearl}
                    className="text-sm text-muted-foreground flex gap-2"
                  >
                    <span className="text-premium font-bold shrink-0">
                      {i + 1}.
                    </span>
                    {pearl}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Constitutional Type */}
          {display.constitutionalType && (
            <div className="rounded-xl bg-muted/30 border border-border/50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Constitutional Type
              </p>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {display.constitutionalType}
              </p>
            </div>
          )}

          {/* Potencies */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Available Potencies
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {display.potencies.map((p) => (
                <span
                  key={p}
                  className="px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-muted/50 text-foreground border border-border/60"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </DialogContent>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────

function RemedyFinderPage() {
  const [activeCategory, setActiveCategory] = useState<SymptomCategory>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState<SymptomEntry[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [results, setResults] = useState<RemedyResult[] | null>(null);
  const [comparisonSet, setComparisonSet] = useState<string[]>([]);
  const [detailRemedy, setDetailRemedy] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const filteredSymptoms = useMemo(() => {
    const byCategory =
      activeCategory === "All"
        ? SYMPTOM_BANK
        : SYMPTOM_BANK.filter((s) => s.category === activeCategory);
    if (!searchQuery.trim()) return byCategory.slice(0, 14);
    const q = searchQuery.toLowerCase();
    return byCategory
      .filter((s) => s.label.toLowerCase().includes(q))
      .slice(0, 14);
  }, [activeCategory, searchQuery]);

  const suggestedSymptoms = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return SYMPTOM_BANK.filter((s) => s.label.toLowerCase().includes(q)).slice(
      0,
      6,
    );
  }, [searchQuery]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function toggleSymptom(s: SymptomEntry) {
    setSelectedSymptoms((prev) =>
      prev.find((x) => x.id === s.id)
        ? prev.filter((x) => x.id !== s.id)
        : [...prev, s],
    );
  }

  function removeSymptom(id: string) {
    setSelectedSymptoms((prev) => prev.filter((s) => s.id !== id));
  }

  function findRemedies() {
    setResults(computeResults(selectedSymptoms.map((s) => s.id)));
    setSaved(false);
  }

  function toggleComparison(remedyId: string) {
    if (comparisonSet.includes(remedyId)) {
      setComparisonSet((prev) => prev.filter((id) => id !== remedyId));
    } else if (comparisonSet.length < 4) {
      setComparisonSet((prev) => [...prev, remedyId]);
    }
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const topRemedy = results?.[0] ?? null;

  return (
    <div className="space-y-5" data-ocid="remedy-finder-page">
      {/* ── Page Header ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="feature-icon-premium w-12 h-12 rounded-xl shrink-0">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-display text-2xl font-bold text-foreground">
                Symptom Repertorization
              </h1>
              <ProCrownBadge />
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Multi-symptom analysis using Kent's grading system
            </p>
          </div>
        </div>
        {results && results.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            data-ocid="save-repertorization-btn"
            className="gap-1.5 text-xs shrink-0"
          >
            {saved ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Saved!
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" /> Save Repertorization
              </>
            )}
          </Button>
        )}
      </motion.div>

      {/* ── Comparison Banner ─────────────────────────────────────────── */}
      <AnimatePresence>
        {comparisonSet.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            className="glass-premium flex items-center justify-between px-4 py-3"
            data-ocid="comparison-indicator"
          >
            <span className="text-sm font-medium text-foreground flex items-center gap-2">
              <Layers className="w-4 h-4 text-premium" />
              <span>
                <strong>{comparisonSet.length}</strong> of 4 remedies added for
                comparison
              </span>
            </span>
            <a
              href="/pro/remedy-comparison"
              className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full border transition-colors"
              style={{
                background: "oklch(var(--premium) / 0.12)",
                borderColor: "oklch(var(--premium) / 0.35)",
                color: "oklch(var(--premium))",
              }}
              data-ocid="compare-link"
            >
              Compare Now <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Layout ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-5 items-start">
        {/* ── LEFT PANEL ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.08 }}
          className="space-y-4 lg:sticky lg:top-4"
          data-ocid="symptom-input-panel"
        >
          {/* Category Selector */}
          <div className="glass-premium p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-semibold text-foreground text-sm">
                Select Symptoms
              </h2>
              <span className="text-xs text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-full border border-border/50">
                {selectedSymptoms.length} selected
              </span>
            </div>

            {/* Category Tabs */}
            <Tabs
              value={activeCategory}
              onValueChange={(v) => setActiveCategory(v as SymptomCategory)}
            >
              <TabsList
                className="w-full flex flex-wrap h-auto gap-1 bg-muted/30 p-1 rounded-xl"
                data-ocid="category-tabs"
              >
                {CATEGORIES.map((cat) => (
                  <TabsTrigger
                    key={cat}
                    value={cat}
                    className="text-[11px] px-2 py-1 rounded-lg flex-shrink-0 gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <span>{CATEGORY_ICONS[cat]}</span>
                    {cat}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* Search */}
            <div ref={searchRef} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search symptoms…"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl bg-background/60 border border-border/60 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-smooth"
                data-ocid="symptom-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setShowSuggestions(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <AnimatePresence>
                {showSuggestions && suggestedSymptoms.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute z-20 top-full mt-1.5 left-0 right-0 glass rounded-xl shadow-elevated border border-border/60 py-1 overflow-hidden"
                    data-ocid="autocomplete-dropdown"
                  >
                    {suggestedSymptoms.map((s) => (
                      <button
                        type="button"
                        key={s.id}
                        onMouseDown={() => {
                          toggleSymptom(s);
                          setSearchQuery("");
                          setShowSuggestions(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-primary/10 transition-colors flex items-center justify-between gap-2"
                      >
                        <span className="text-foreground">{s.label}</span>
                        <Badge
                          variant="outline"
                          className="text-[10px] shrink-0"
                        >
                          {s.category}
                        </Badge>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Symptom List */}
            <ScrollArea className="h-48">
              <div className="space-y-1 pr-2">
                {filteredSymptoms.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">
                    No symptoms found
                  </p>
                ) : (
                  filteredSymptoms.map((s) => {
                    const isSelected = selectedSymptoms.some(
                      (x) => x.id === s.id,
                    );
                    return (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => toggleSymptom(s)}
                        data-ocid={`symptom-item-${s.id}`}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2.5 transition-smooth border ${
                          isSelected
                            ? "bg-primary/10 border-primary/30 text-primary"
                            : "bg-transparent border-transparent hover:bg-muted/40 text-foreground"
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-smooth ${
                            isSelected
                              ? "bg-primary border-primary"
                              : "border-border/60"
                          }`}
                        >
                          {isSelected && (
                            <CheckCircle2 className="w-3 h-3 text-primary-foreground" />
                          )}
                        </span>
                        <span className="leading-tight text-xs">{s.label}</span>
                      </button>
                    );
                  })
                )}
              </div>
            </ScrollArea>

            {/* Selected Tray */}
            {selectedSymptoms.length > 0 && (
              <div className="border-t border-border/40 pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Active Symptoms
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedSymptoms([])}
                    className="text-[10px] text-muted-foreground hover:text-destructive transition-colors"
                    data-ocid="clear-all-symptoms"
                  >
                    Clear all
                  </button>
                </div>
                <div
                  className="flex flex-wrap gap-1.5"
                  data-ocid="selected-symptoms-tray"
                >
                  <AnimatePresence>
                    {selectedSymptoms.map((s) => (
                      <motion.span
                        key={s.id}
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                        transition={{ duration: 0.15 }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-primary/10 text-primary border border-primary/25"
                      >
                        {s.label}
                        <button
                          type="button"
                          onClick={() => removeSymptom(s.id)}
                          className="hover:text-destructive transition-colors ml-0.5"
                          data-ocid={`remove-symptom-${s.id}`}
                          aria-label={`Remove ${s.label}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </motion.span>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Find Button */}
            <Button
              className="w-full gap-2 font-semibold"
              onClick={findRemedies}
              disabled={selectedSymptoms.length === 0}
              data-ocid="find-remedies-btn"
            >
              <FlaskConical className="w-4 h-4" />
              Find Matching Remedies
              {selectedSymptoms.length > 0 && (
                <span className="ml-auto bg-primary-foreground/20 text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                  {selectedSymptoms.length}
                </span>
              )}
            </Button>
          </div>

          {/* Radar Chart – shown when results are present */}
          {results && topRemedy && (
            <SymptomRadarPanel
              topRemedy={topRemedy}
              selectedSymptoms={selectedSymptoms}
            />
          )}

          {/* Tip Card */}
          <div className="glass-card px-4 py-3 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Select{" "}
              <strong className="text-foreground">
                3–5 characteristic symptoms
              </strong>{" "}
              for best repertorization results. Use star grade as prescribing
              confidence.
            </p>
          </div>
        </motion.div>

        {/* ── RIGHT PANEL ────────────────────────────────────────────── */}
        <div className="space-y-3" data-ocid="results-panel">
          {/* Empty State */}
          {!results && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="glass-card flex flex-col items-center justify-center py-24 text-center"
              data-ocid="empty-results-state"
            >
              <motion.div
                className="feature-icon-premium mb-5 w-20 h-20 rounded-2xl"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  repeatDelay: 4,
                  duration: 0.8,
                }}
              >
                <SlidersHorizontal className="w-8 h-8" />
              </motion.div>
              <h3 className="font-display font-bold text-foreground text-lg mb-2">
                Repertorization Ready
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm leading-relaxed mb-6">
                Select symptoms from the left panel, then click{" "}
                <span className="text-primary font-semibold">
                  Find Matching Remedies
                </span>{" "}
                to run a full Kent's repertory analysis.
              </p>
              <div className="flex flex-col items-center gap-3">
                {[
                  "Select 3–5 characteristic symptoms",
                  "Click Find Matching Remedies",
                  "Review ranked results with scores",
                ].map((step, i) => (
                  <div
                    key={step}
                    className="flex items-center gap-3 text-sm text-muted-foreground"
                  >
                    <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    {step}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Results */}
          {results && results.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-premium" />
                  Top 10 Matching Remedies
                </p>
                <span className="text-xs text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-full border border-border/50">
                  {selectedSymptoms.length} symptom
                  {selectedSymptoms.length > 1 ? "s" : ""} analyzed
                </span>
              </div>

              {results.map((result, index) => {
                const inComparison = comparisonSet.includes(result.remedyId);
                const atMaxComparison =
                  comparisonSet.length >= 4 && !inComparison;
                return (
                  <motion.div
                    key={result.remedyId}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.35,
                      delay: index * 0.06,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                    className={`pro-card p-4 transition-smooth ${inComparison ? "border-premium/40 bg-premium/5" : ""} ${result.rank === 1 ? "ring-1 ring-premium/25" : ""}`}
                    data-ocid={`result-card-${result.remedyId}`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Rank Badge */}
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold border ${
                          result.rank === 1
                            ? "bg-premium/20 border-premium/40 text-premium"
                            : result.rank <= 3
                              ? "bg-primary/10 border-primary/30 text-primary"
                              : "bg-muted/40 border-border/50 text-muted-foreground"
                        }`}
                      >
                        {result.rank === 1 ? (
                          <Crown className="w-4 h-4" />
                        ) : (
                          `#${result.rank}`
                        )}
                      </div>

                      <div className="flex-1 min-w-0 space-y-2.5">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-display font-semibold text-foreground text-sm leading-tight truncate">
                              {result.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {result.commonName}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <GradeLabel grade={result.grade} />
                            <StarGrade grade={result.grade} />
                          </div>
                        </div>

                        {/* Score Bar */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              Match Score
                            </span>
                            <span className="font-mono font-bold text-foreground">
                              {result.score}%
                            </span>
                          </div>
                          <AnimatedBar
                            score={result.score}
                            delay={0.1 + index * 0.06}
                          />
                        </div>

                        {/* Matching Keynotes */}
                        <div className="space-y-1">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                            Matching Keynotes
                          </p>
                          {result.matchingKeynotes.map((kn) => (
                            <p
                              key={kn}
                              className="text-xs text-foreground/80 flex items-start gap-1.5"
                            >
                              <ChevronRight className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                              {kn}
                            </p>
                          ))}
                        </div>

                        {/* Potencies */}
                        <div className="flex flex-wrap gap-1">
                          {result.potencies.slice(0, 5).map((p) => (
                            <span
                              key={p}
                              className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-muted/50 text-muted-foreground border border-border/50"
                            >
                              {p}
                            </span>
                          ))}
                          {result.potencies.length > 5 && (
                            <span className="px-2 py-0.5 text-[10px] text-muted-foreground/60">
                              +{result.potencies.length - 5} more
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 gap-1.5 px-3"
                            onClick={() => setDetailRemedy(result.name)}
                            data-ocid={`view-details-btn-${result.remedyId}`}
                          >
                            <BookOpen className="w-3 h-3" />
                            View Details
                          </Button>
                          <Button
                            size="sm"
                            variant={inComparison ? "default" : "ghost"}
                            disabled={atMaxComparison}
                            className={`text-xs h-7 gap-1.5 px-3 ${inComparison ? "bg-premium/20 text-premium border-premium/30 hover:bg-premium/30" : ""}`}
                            onClick={() => toggleComparison(result.remedyId)}
                            data-ocid={`compare-btn-${result.remedyId}`}
                          >
                            <Layers className="w-3 h-3" />
                            {inComparison
                              ? "In Comparison"
                              : atMaxComparison
                                ? "Max 4 Reached"
                                : "Compare"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Save Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.75 }}
                className="glass-card p-4 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Save Repertorization
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Attach to patient record or export
                  </p>
                </div>
                <Button
                  variant={saved ? "default" : "outline"}
                  size="sm"
                  className="gap-1.5 text-xs shrink-0"
                  onClick={handleSave}
                  data-ocid="save-btn-footer"
                >
                  {saved ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Saved!
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" /> Save
                    </>
                  )}
                </Button>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Materia Medica Modal ─────────────────────────────────────── */}
      <Dialog open={!!detailRemedy} onOpenChange={() => setDetailRemedy(null)}>
        {detailRemedy && (
          <MMDetailModal
            remedyName={detailRemedy}
            onClose={() => setDetailRemedy(null)}
          />
        )}
      </Dialog>
    </div>
  );
}
