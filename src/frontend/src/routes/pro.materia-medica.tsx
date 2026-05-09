import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  materiaMedicaEntries,
  periodicTableRemedies,
} from "@/data/materiamedica";
import type {
  MateriaMedicaEntry,
  PeriodicTableRemedy,
  RemedySource,
} from "@/types/proTypes";
import { Link, createRoute } from "@tanstack/react-router";
import {
  Atom,
  BookOpen,
  ChevronRight,
  Crown,
  FlaskConical,
  Grid3X3,
  Heart,
  Info,
  Leaf,
  List,
  Pill,
  Plus,
  Search,
  Table2,
  TrendingUp,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useMemo, useState } from "react";
import { Route as proRoute } from "./pro";

export const Route = createRoute({
  getParentRoute: () => proRoute,
  path: "materia-medica",
  component: MateriaMedicaPage,
});

// ── Periodic table shell data ────────────────────────────────────────────────
const PERIODIC_GRID: {
  atomicNumber: number;
  symbol: string;
  group: number;
  period: number;
}[] = [
  { atomicNumber: 1, symbol: "H", group: 1, period: 1 },
  { atomicNumber: 2, symbol: "He", group: 18, period: 1 },
  { atomicNumber: 3, symbol: "Li", group: 1, period: 2 },
  { atomicNumber: 4, symbol: "Be", group: 2, period: 2 },
  { atomicNumber: 5, symbol: "B", group: 13, period: 2 },
  { atomicNumber: 6, symbol: "C", group: 14, period: 2 },
  { atomicNumber: 7, symbol: "N", group: 15, period: 2 },
  { atomicNumber: 8, symbol: "O", group: 16, period: 2 },
  { atomicNumber: 9, symbol: "F", group: 17, period: 2 },
  { atomicNumber: 10, symbol: "Ne", group: 18, period: 2 },
  { atomicNumber: 11, symbol: "Na", group: 1, period: 3 },
  { atomicNumber: 12, symbol: "Mg", group: 2, period: 3 },
  { atomicNumber: 13, symbol: "Al", group: 13, period: 3 },
  { atomicNumber: 14, symbol: "Si", group: 14, period: 3 },
  { atomicNumber: 15, symbol: "P", group: 15, period: 3 },
  { atomicNumber: 16, symbol: "S", group: 16, period: 3 },
  { atomicNumber: 17, symbol: "Cl", group: 17, period: 3 },
  { atomicNumber: 18, symbol: "Ar", group: 18, period: 3 },
  { atomicNumber: 19, symbol: "K", group: 1, period: 4 },
  { atomicNumber: 20, symbol: "Ca", group: 2, period: 4 },
  { atomicNumber: 26, symbol: "Fe", group: 8, period: 4 },
  { atomicNumber: 29, symbol: "Cu", group: 11, period: 4 },
  { atomicNumber: 30, symbol: "Zn", group: 12, period: 4 },
  { atomicNumber: 33, symbol: "As", group: 15, period: 4 },
  { atomicNumber: 35, symbol: "Br", group: 17, period: 4 },
  { atomicNumber: 47, symbol: "Ag", group: 11, period: 5 },
  { atomicNumber: 53, symbol: "I", group: 17, period: 5 },
  { atomicNumber: 56, symbol: "Ba", group: 2, period: 6 },
  { atomicNumber: 78, symbol: "Pt", group: 10, period: 6 },
  { atomicNumber: 79, symbol: "Au", group: 11, period: 6 },
  { atomicNumber: 80, symbol: "Hg", group: 12, period: 6 },
  { atomicNumber: 83, symbol: "Bi", group: 15, period: 6 },
];

const EXAMPLE_SYMPTOM_SEARCHES = [
  "worse from cold",
  "fears being alone",
  "burning pain relieved by heat",
];

const PAGE_SIZE = 24;

type ViewMode = "grid" | "periodic" | "symptom";
type SourceFilter = RemedySource | "all" | "favorites";

const sourceColors: Record<RemedySource, string> = {
  plant: "bg-green-500/15 text-green-400 border-green-500/30",
  mineral: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  animal: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  nosode: "bg-purple-500/15 text-purple-400 border-purple-500/30",
};

const sourceIcons: Record<RemedySource, typeof Leaf> = {
  plant: Leaf,
  mineral: Atom,
  animal: FlaskConical,
  nosode: Pill,
};

// Potency recommendation table data
const POTENCY_TABLE: {
  potency: string;
  scale: string;
  useCase: string;
  frequency: string;
  color: string;
}[] = [
  {
    potency: "6C",
    scale: "Centesimal",
    useCase: "Acute conditions, sensitive patients, children",
    frequency: "3–4× daily",
    color: "bg-green-500/10 text-green-400",
  },
  {
    potency: "12C",
    scale: "Centesimal",
    useCase: "Early constitutional treatment, acute sub-acute",
    frequency: "2–3× daily",
    color: "bg-teal-500/10 text-teal-400",
  },
  {
    potency: "30C",
    scale: "Centesimal",
    useCase: "Standard constitutional, chronic conditions",
    frequency: "Once daily or weekly",
    color: "bg-primary/10 text-primary",
  },
  {
    potency: "200C",
    scale: "Centesimal",
    useCase: "Deep constitutional, emotional conditions",
    frequency: "Single dose monthly",
    color: "bg-blue-500/10 text-blue-400",
  },
  {
    potency: "LM1–LM6",
    scale: "LM / Q",
    useCase: "Sensitive patients, long-term chronic therapy",
    frequency: "Daily (in water)",
    color: "bg-premium/10 text-premium",
  },
];

function SourceBadge({ source }: { source: RemedySource }) {
  const Icon = sourceIcons[source];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${sourceColors[source]}`}
    >
      <Icon className="w-2.5 h-2.5" />
      {source.charAt(0).toUpperCase() + source.slice(1)}
    </span>
  );
}

function highlightText(text: string, query: string) {
  if (!query.trim()) return <>{text}</>;
  const regex = new RegExp(
    `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi",
  );
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            // biome-ignore lint/suspicious/noArrayIndexKey: split parts have no unique id
            key={i}
            className="bg-yellow-400/40 text-foreground rounded px-0.5"
          >
            {part}
          </mark>
        ) : (
          // biome-ignore lint/suspicious/noArrayIndexKey: split parts have no unique id
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

// ── Stats Header ──────────────────────────────────────────────────────────────
function StatsHeader() {
  const stats = useMemo(() => {
    const total = materiaMedicaEntries.length;
    const plant = materiaMedicaEntries.filter(
      (e) => e.source === "plant",
    ).length;
    const mineral = materiaMedicaEntries.filter(
      (e) => e.source === "mineral",
    ).length;
    const animal = materiaMedicaEntries.filter(
      (e) => e.source === "animal",
    ).length;
    const nosode = materiaMedicaEntries.filter(
      (e) => e.source === "nosode",
    ).length;
    return [
      {
        label: "Total Remedies",
        value: total,
        icon: BookOpen,
        color: "text-primary",
        bg: "bg-primary/10",
      },
      {
        label: "Plant Sources",
        value: plant,
        icon: Leaf,
        color: "text-green-400",
        bg: "bg-green-500/10",
      },
      {
        label: "Mineral Sources",
        value: mineral,
        icon: Atom,
        color: "text-sky-400",
        bg: "bg-sky-500/10",
      },
      {
        label: "Animal Sources",
        value: animal,
        icon: FlaskConical,
        color: "text-orange-400",
        bg: "bg-orange-500/10",
      },
      {
        label: "Nosodes",
        value: nosode,
        icon: Pill,
        color: "text-purple-400",
        bg: "bg-purple-500/10",
      },
    ];
  }, []);

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
      data-ocid="mm-stats-header"
    >
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="glass-card p-4 flex items-center gap-3"
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${stat.bg}`}
            >
              <Icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <div className="min-w-0">
              <p
                className={`text-xl font-display font-bold tabular-nums leading-none ${stat.color}`}
              >
                {stat.value}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                {stat.label}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ── Potency Table ─────────────────────────────────────────────────────────────
function PotencyTable({ potencies }: { potencies: string[] }) {
  const relevant = POTENCY_TABLE.filter((row) =>
    potencies.some((p) => p.startsWith(row.potency.split("–")[0])),
  );
  const rows = relevant.length > 0 ? relevant : POTENCY_TABLE.slice(0, 3);

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-3.5 h-3.5 text-premium shrink-0" />
        <p className="text-xs font-semibold text-foreground uppercase tracking-wider">
          Potency Recommendations
        </p>
      </div>
      <div className="overflow-x-auto rounded-xl border border-border/50">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border/50 bg-muted/20">
              <th className="text-left px-3 py-2 text-muted-foreground font-semibold">
                Potency
              </th>
              <th className="text-left px-3 py-2 text-muted-foreground font-semibold hidden sm:table-cell">
                Scale
              </th>
              <th className="text-left px-3 py-2 text-muted-foreground font-semibold">
                Use Case
              </th>
              <th className="text-left px-3 py-2 text-muted-foreground font-semibold hidden sm:table-cell">
                Frequency
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.potency}
                className="border-b border-border/30 last:border-0"
              >
                <td className="px-3 py-2.5">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${row.color}`}
                  >
                    {row.potency}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-muted-foreground hidden sm:table-cell">
                  {row.scale}
                </td>
                <td className="px-3 py-2.5 text-foreground/80 leading-tight">
                  {row.useCase}
                </td>
                <td className="px-3 py-2.5 text-muted-foreground hidden sm:table-cell">
                  {row.frequency}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Remedy Detail Modal ───────────────────────────────────────────────────────
function RemedyModal({
  remedy,
  onClose,
  favorites,
  onToggleFavorite,
}: {
  remedy: MateriaMedicaEntry;
  onClose: () => void;
  favorites: Set<string>;
  onToggleFavorite: (id: string) => void;
}) {
  const isFav = favorites.has(remedy.id);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      data-ocid="remedy-modal-overlay"
    >
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/10 bg-card shadow-2xl flex flex-col"
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.97 }}
        transition={{ duration: 0.25 }}
        data-ocid="remedy-modal"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 p-5 pb-4 border-b border-border/50 bg-card shrink-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h2 className="font-display font-bold text-foreground text-xl leading-tight">
                {remedy.name}
              </h2>
              <SourceBadge source={remedy.source} />
            </div>
            <p className="text-sm text-muted-foreground font-body">
              {remedy.commonName}
            </p>
            {remedy.family && (
              <p className="text-xs text-muted-foreground/70 mt-0.5">
                Family: {remedy.family}
              </p>
            )}
            {remedy.element && !remedy.family && (
              <p className="text-xs text-muted-foreground/70 mt-0.5">
                Element: {remedy.element}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onToggleFavorite(remedy.id)}
              className={`p-2 rounded-xl border transition-smooth ${isFav ? "bg-red-500/10 border-red-500/30 text-red-400" : "border-border bg-muted/20 text-muted-foreground hover:text-red-400 hover:border-red-500/30"}`}
              aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
              data-ocid="modal-favorite-btn"
            >
              <Heart className={`w-4 h-4 ${isFav ? "fill-current" : ""}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl border border-border bg-muted/20 text-muted-foreground hover:text-foreground transition-smooth"
              aria-label="Close"
              data-ocid="modal-close-btn"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1">
          <Tabs defaultValue="overview" className="h-full">
            <TabsList className="w-full rounded-none border-b border-border/50 bg-transparent h-auto p-0 justify-start overflow-x-auto">
              {[
                "overview",
                "symptoms",
                "modalities",
                "clinical",
                "potencies",
              ].map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="capitalize px-4 py-3 text-xs font-semibold rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary whitespace-nowrap"
                  data-ocid={`modal-tab-${tab}`}
                >
                  {tab === "potencies" ? "Potencies & Uses" : tab}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="p-5">
              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-0 space-y-4">
                <div className="glass rounded-xl p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Constitutional Type
                  </p>
                  <p className="text-sm text-foreground leading-relaxed">
                    {remedy.constitutionalType}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Keynotes
                  </p>
                  <div className="space-y-2">
                    {remedy.keynotes.map((k, i) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: list items have no unique id
                      <div key={i} className="flex items-start gap-2.5">
                        <ChevronRight className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <p className="text-sm text-foreground/90">{k}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Affinities
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {remedy.affinities.map((a) => (
                        <span
                          key={a}
                          className="px-2.5 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/20"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Potencies
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {remedy.potencies.map((p) => (
                        <span
                          key={p}
                          className="px-2.5 py-1 rounded-full text-xs bg-muted/40 text-muted-foreground border border-border/50"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Symptoms Tab */}
              <TabsContent value="symptoms" className="mt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <p className="text-xs font-semibold text-foreground uppercase tracking-wider">
                        Mental Symptoms
                      </p>
                    </div>
                    <div className="space-y-2">
                      {remedy.mentalSymptoms.map((s, i) => (
                        <div
                          key={s}
                          className="flex items-start gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/10"
                        >
                          <span className="text-primary font-bold text-xs shrink-0 mt-0.5">
                            {i + 1}.
                          </span>
                          <p className="text-xs text-foreground/90 leading-relaxed">
                            {s}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-accent" />
                      <p className="text-xs font-semibold text-foreground uppercase tracking-wider">
                        Physical Symptoms
                      </p>
                    </div>
                    <div className="space-y-2">
                      {remedy.physicalSymptoms.map((s, i) => (
                        <div
                          key={s}
                          className="flex items-start gap-2 p-2.5 rounded-lg bg-accent/5 border border-accent/10"
                        >
                          <span className="text-accent font-bold text-xs shrink-0 mt-0.5">
                            {i + 1}.
                          </span>
                          <p className="text-xs text-foreground/90 leading-relaxed">
                            {s}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Modalities Tab */}
              <TabsContent value="modalities" className="mt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-green-400" />
                      <p className="text-xs font-semibold text-green-400 uppercase tracking-wider">
                        Better From
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {remedy.modalities.better.map((b) => (
                        <span
                          key={b}
                          className="px-3 py-1.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/25"
                        >
                          ↑ {b}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-red-400" />
                      <p className="text-xs font-semibold text-red-400 uppercase tracking-wider">
                        Worse From
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {remedy.modalities.worse.map((w) => (
                        <span
                          key={w}
                          className="px-3 py-1.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/25"
                        >
                          ↓ {w}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Clinical Tab */}
              <TabsContent value="clinical" className="mt-0 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Clinical Pearls
                  </p>
                  <div className="space-y-2.5">
                    {remedy.clinicalPearls.map((pearl, i) => (
                      <div
                        key={pearl}
                        className="flex items-start gap-3 p-3 rounded-xl glass-card border-l-2 border-premium/50"
                      >
                        <span className="text-premium font-bold text-xs shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <p className="text-sm text-foreground/90 leading-relaxed">
                          {pearl}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Dosage Guidance
                  </p>
                  {remedy.dosages.map((d) => (
                    <p key={d} className="text-sm text-foreground/80">
                      • {d}
                    </p>
                  ))}
                </div>
                <Button
                  size="sm"
                  className="w-full bg-premium/90 hover:bg-premium text-premium-foreground border-premium/50 font-semibold"
                  data-ocid="add-to-prescription-btn"
                >
                  <Plus className="w-3.5 h-3.5 mr-2" />
                  Add to Prescription
                </Button>
              </TabsContent>

              {/* Potencies & Uses Tab */}
              <TabsContent value="potencies" className="mt-0 space-y-5">
                <PotencyTable potencies={remedy.potencies} />

                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    This Remedy's Potencies
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {remedy.potencies.map((p) => (
                      <span
                        key={p}
                        className="px-3 py-1.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-muted/20 border border-border/40">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <span className="font-semibold text-foreground/70">
                      Note:{" "}
                    </span>
                    Potency selection should be guided by the sensitivity of the
                    patient, the nature of the condition (acute vs. chronic),
                    and the clarity of the remedy match. Higher potencies are
                    generally reserved for well-individualized constitutional
                    prescriptions.
                  </p>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </motion.div>
    </div>
  );
}

// ── Periodic Table Cell ───────────────────────────────────────────────────────
function ElementCell({
  atomicNumber,
  symbol,
  remedy,
  onClick,
}: {
  atomicNumber: number;
  symbol: string;
  remedy?: PeriodicTableRemedy;
  onClick?: () => void;
}) {
  if (remedy) {
    return (
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.96 }}
        className="relative w-14 h-14 rounded-lg flex flex-col items-center justify-center p-1 cursor-pointer border-2 border-primary/40 bg-primary/10 hover:bg-primary/20 hover:border-primary/70 transition-smooth shadow-lg group"
        title={remedy.name}
        data-ocid={`element-cell-${symbol}`}
      >
        <span className="absolute top-0.5 left-1 text-[8px] text-primary/70 font-mono leading-none">
          {atomicNumber > 0 ? atomicNumber : ""}
        </span>
        <span className="font-display font-bold text-primary text-base leading-none">
          {symbol}
        </span>
        <span className="text-[7px] text-primary/70 text-center leading-tight mt-0.5 max-w-full px-0.5 truncate">
          {remedy.name.split(" ")[0]}
        </span>
      </motion.button>
    );
  }
  return (
    <div className="relative w-14 h-14 rounded-lg flex flex-col items-center justify-center p-1 border border-border/20 bg-muted/10 opacity-40">
      <span className="absolute top-0.5 left-1 text-[8px] text-muted-foreground/50 font-mono leading-none">
        {atomicNumber > 0 ? atomicNumber : ""}
      </span>
      <span className="font-display font-semibold text-muted-foreground/60 text-sm leading-none">
        {symbol}
      </span>
    </div>
  );
}

// ── Grid View ─────────────────────────────────────────────────────────────────
function GridView({
  entries,
  searchQuery,
  favorites,
  onToggleFavorite,
  onSelectRemedy,
}: {
  entries: MateriaMedicaEntry[];
  searchQuery: string;
  favorites: Set<string>;
  onToggleFavorite: (id: string) => void;
  onSelectRemedy: (r: MateriaMedicaEntry) => void;
}) {
  const [filter, setFilter] = useState<SourceFilter>("all");
  const [sort, setSort] = useState<"az" | "source" | "affinity">("az");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    let result = entries;
    if (filter === "favorites")
      result = result.filter((e) => favorites.has(e.id));
    else if (filter !== "all")
      result = result.filter((e) => e.source === filter);
    if (sort === "az")
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "source")
      result = [...result].sort((a, b) => a.source.localeCompare(b.source));
    else if (sort === "affinity")
      result = [...result].sort(
        (a, b) => a.affinities[0]?.localeCompare(b.affinities[0] ?? "") ?? 0,
      );
    return result;
  }, [entries, filter, sort, favorites]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const filterPills: {
    label: string;
    value: SourceFilter;
    icon?: typeof Leaf;
  }[] = [
    { label: "All", value: "all" },
    { label: "Plant", value: "plant", icon: Leaf },
    { label: "Mineral", value: "mineral", icon: Atom },
    { label: "Animal", value: "animal", icon: FlaskConical },
    { label: "Nosode", value: "nosode", icon: Pill },
    { label: `Favorites (${favorites.size})`, value: "favorites", icon: Heart },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div
          className="flex items-center gap-2 flex-wrap"
          data-ocid="filter-pills"
        >
          {filterPills.map((pill) => {
            const Icon = pill.icon;
            return (
              <button
                type="button"
                key={pill.value}
                onClick={() => {
                  setFilter(pill.value);
                  setVisibleCount(PAGE_SIZE);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-smooth border flex items-center gap-1.5 ${
                  filter === pill.value
                    ? pill.value === "favorites"
                      ? "bg-red-500/20 text-red-400 border-red-500/40"
                      : "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/20 text-muted-foreground border-border/50 hover:border-primary/40 hover:text-foreground"
                }`}
                data-ocid={`filter-pill-${pill.value}`}
              >
                {Icon && <Icon className="w-3 h-3" />}
                {pill.label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2" data-ocid="sort-controls">
          <span className="text-xs text-muted-foreground">Sort:</span>
          {(["az", "source", "affinity"] as const).map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => setSort(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-smooth border ${sort === s ? "bg-muted/60 text-foreground border-border" : "text-muted-foreground border-transparent hover:text-foreground"}`}
            >
              {s === "az"
                ? "A–Z"
                : s === "source"
                  ? "By Source"
                  : "By Affinity"}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <div
          className="text-center py-16 text-muted-foreground"
          data-ocid="empty-state"
        >
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">
            {filter === "favorites" ? "No favorites yet" : "No remedies found"}
          </p>
          <p className="text-xs mt-1">
            {filter === "favorites"
              ? "Click the heart icon on any remedy to save it here"
              : "Try adjusting your search or filter"}
          </p>
        </div>
      )}

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        data-ocid="remedy-grid"
        layout
      >
        <AnimatePresence mode="popLayout">
          {visible.map((remedy, index) => {
            const isFav = favorites.has(remedy.id);
            return (
              <motion.div
                key={remedy.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: Math.min(index * 0.04, 0.3) }}
                className="glass-premium group flex flex-col gap-3 p-4 cursor-pointer hover:border-primary/30 transition-smooth"
                data-ocid={`remedy-card-${remedy.id}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display font-bold text-foreground text-sm leading-snug truncate">
                      {remedy.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {remedy.commonName}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(remedy.id);
                    }}
                    className={`p-1.5 rounded-lg border shrink-0 transition-smooth ${isFav ? "bg-red-500/10 border-red-500/30 text-red-400" : "border-transparent text-muted-foreground/40 hover:text-red-400"}`}
                    aria-label={
                      isFav ? "Remove from favorites" : "Add to favorites"
                    }
                    data-ocid={`favorite-btn-${remedy.id}`}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${isFav ? "fill-current" : ""}`}
                    />
                  </button>
                </div>

                <SourceBadge source={remedy.source} />

                <div className="space-y-1.5 flex-1">
                  {remedy.keynotes.slice(0, 2).map((k) => (
                    <p
                      key={k}
                      className="text-xs text-muted-foreground leading-relaxed line-clamp-1"
                    >
                      • {searchQuery ? highlightText(k, searchQuery) : k}
                    </p>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1">
                  {remedy.affinities.slice(0, 3).map((a) => (
                    <span
                      key={a}
                      className="px-2 py-0.5 rounded-full text-[10px] bg-muted/30 text-muted-foreground border border-border/40"
                    >
                      {a}
                    </span>
                  ))}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSelectRemedy(remedy)}
                  className="w-full justify-between text-xs group-hover:bg-primary/10 group-hover:text-primary transition-smooth mt-auto"
                  data-ocid={`details-btn-${remedy.id}`}
                >
                  View Details
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center pt-2" data-ocid="load-more-section">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button
              variant="outline"
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              className="px-6 border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-smooth"
              data-ocid="load-more-btn"
            >
              Load More ({filtered.length - visibleCount} remaining)
            </Button>
          </motion.div>
        </div>
      )}

      {/* Results count */}
      {filtered.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          Showing {Math.min(visibleCount, filtered.length)} of {filtered.length}{" "}
          remedies
        </p>
      )}
    </div>
  );
}

// ── Periodic Table View ───────────────────────────────────────────────────────
function PeriodicTableView({
  onSelectRemedyByPT,
}: {
  onSelectRemedyByPT: (r: MateriaMedicaEntry) => void;
}) {
  const remedyBySymbol = useMemo(() => {
    const map = new Map<string, PeriodicTableRemedy>();
    for (const r of periodicTableRemedies) {
      if (r.atomicNumber > 0) map.set(r.symbol, r);
    }
    return map;
  }, []);

  const mmByName = useMemo(() => {
    const map = new Map<string, MateriaMedicaEntry>();
    for (const e of materiaMedicaEntries) map.set(e.name, e);
    return map;
  }, []);

  const handleClick = useCallback(
    (ptr: PeriodicTableRemedy) => {
      const entry = mmByName.get(ptr.name) ?? mmByName.get(ptr.commonName);
      if (entry) onSelectRemedyByPT(entry);
      else {
        const synth: MateriaMedicaEntry = {
          id: ptr.id,
          name: ptr.name,
          commonName: ptr.commonName,
          source: "mineral",
          element: ptr.elementName,
          keynotes: ptr.keynotes,
          mentalSymptoms: ptr.keynotes,
          physicalSymptoms: ptr.keynotes,
          modalities: { better: [], worse: [] },
          dosages: [],
          potencies: ptr.potencies,
          affinities: [],
          clinicalPearls: [],
          constitutionalType: ptr.keynotes[0] ?? "",
          isFavorite: false,
        };
        onSelectRemedyByPT(synth);
      }
    },
    [mmByName, onSelectRemedyByPT],
  );

  const grid: Record<number, Record<number, (typeof PERIODIC_GRID)[0]>> = {};
  for (const el of PERIODIC_GRID) {
    if (!grid[el.period]) grid[el.period] = {};
    grid[el.period][el.group] = el;
  }

  const periods = [1, 2, 3, 4, 5, 6];
  const groups = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
  ];

  return (
    <div className="space-y-5" data-ocid="periodic-table-view">
      <div className="flex items-center gap-3 flex-wrap">
        <h3 className="font-display font-bold text-foreground text-lg">
          Mineral Remedies Periodic Table
        </h3>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-primary/20 border border-primary/40 inline-block" />
            Homeopathic remedy available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-muted/20 border border-border/30 opacity-40 inline-block" />
            No remedy data
          </span>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="space-y-1 min-w-max" data-ocid="periodic-table-grid">
          <div className="flex gap-1 mb-1 ml-16">
            {groups.map((g) => (
              <div
                key={g}
                className="w-14 text-center text-[9px] text-muted-foreground/40 font-mono"
              >
                {g}
              </div>
            ))}
          </div>
          {periods.map((period) => (
            <div key={period} className="flex items-center gap-1">
              <div className="w-14 text-[9px] text-muted-foreground/40 font-mono text-right pr-2 shrink-0">
                P{period}
              </div>
              {groups.map((group) => {
                const el = grid[period]?.[group];
                if (!el)
                  return <div key={group} className="w-14 h-14 shrink-0" />;
                const ptr = remedyBySymbol.get(el.symbol);
                return (
                  <div key={group} className="relative shrink-0">
                    <ElementCell
                      atomicNumber={el.atomicNumber}
                      symbol={el.symbol}
                      remedy={ptr}
                      onClick={ptr ? () => handleClick(ptr) : undefined}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Mineral Remedies (
          {periodicTableRemedies.filter((r) => r.atomicNumber > 0).length} in
          table)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {periodicTableRemedies
            .filter((r) => r.atomicNumber > 0)
            .map((r) => (
              <button
                type="button"
                key={r.id}
                onClick={() => handleClick(r)}
                className="flex items-center gap-3 p-3 rounded-xl glass text-left hover:border-primary/30 transition-smooth group"
                data-ocid={`periodic-remedy-${r.id}`}
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <span className="font-display font-bold text-primary text-xs">
                    {r.symbol}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground text-xs truncate group-hover:text-primary transition-colors">
                    {r.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {r.commonName}
                  </p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary shrink-0 transition-colors" />
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}

// ── Symptom Search View ───────────────────────────────────────────────────────
function SymptomSearchView({
  onSelectRemedy,
}: {
  onSelectRemedy: (r: MateriaMedicaEntry) => void;
}) {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState("");

  const results = useMemo(() => {
    if (!searched.trim()) return [];
    const q = searched.toLowerCase();
    return materiaMedicaEntries
      .filter((entry) => {
        const allSymptoms = [
          ...entry.keynotes,
          ...entry.mentalSymptoms,
          ...entry.physicalSymptoms,
          ...entry.modalities.better,
          ...entry.modalities.worse,
        ];
        return allSymptoms.some((s) => s.toLowerCase().includes(q));
      })
      .map((entry) => {
        const allSymptoms = [
          ...entry.keynotes,
          ...entry.mentalSymptoms,
          ...entry.physicalSymptoms,
          ...entry.modalities.better,
          ...entry.modalities.worse,
        ];
        const matchingSymptoms = allSymptoms.filter((s) =>
          s.toLowerCase().includes(q),
        );
        return { entry, matchingSymptoms };
      });
  }, [searched]);

  const handleSearch = () => setSearched(query);

  return (
    <div className="space-y-5" data-ocid="symptom-search-view">
      <p className="text-sm text-muted-foreground">
        Enter a symptom to find all matching remedies from the materia medica.
      </p>

      <div className="flex gap-2 max-w-xl">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="e.g., burning pain, worse cold, fears alone..."
          className="bg-muted/20 border-border/60 text-sm"
          data-ocid="symptom-search-input"
        />
        <Button
          onClick={handleSearch}
          className="shrink-0"
          data-ocid="symptom-search-btn"
        >
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground">Try:</span>
        {EXAMPLE_SYMPTOM_SEARCHES.map((ex) => (
          <button
            type="button"
            key={ex}
            onClick={() => {
              setQuery(ex);
              setSearched(ex);
            }}
            className="px-3 py-1 rounded-full text-xs bg-muted/20 text-muted-foreground border border-border/50 hover:border-primary/40 hover:text-primary transition-smooth"
            data-ocid={`example-search-${ex.replace(/\s+/g, "-")}`}
          >
            "{ex}"
          </button>
        ))}
      </div>

      {searched && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground">
              {results.length} remedies matching{" "}
              <span className="text-primary">"{searched}"</span>
            </p>
            {results.length === 0 && (
              <span className="text-xs text-muted-foreground">
                — try a different symptom
              </span>
            )}
          </div>

          {results.map(({ entry, matchingSymptoms }, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card p-4 flex items-start gap-4 hover:border-primary/20 transition-smooth cursor-pointer group"
              onClick={() => onSelectRemedy(entry)}
              data-ocid={`symptom-result-${entry.id}`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="font-display font-bold text-foreground text-sm">
                    {entry.name}
                  </span>
                  <SourceBadge source={entry.source} />
                </div>
                <div className="space-y-1">
                  {matchingSymptoms.slice(0, 3).map((sym) => (
                    <p
                      key={sym}
                      className="text-xs text-muted-foreground leading-relaxed"
                    >
                      • {highlightText(sym, searched)}
                    </p>
                  ))}
                  {matchingSymptoms.length > 3 && (
                    <p className="text-[10px] text-muted-foreground/60">
                      +{matchingSymptoms.length - 3} more matching symptoms
                    </p>
                  )}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary shrink-0 mt-0.5 transition-colors" />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
function MateriaMedicaPage() {
  const [view, setView] = useState<ViewMode>("grid");
  const [search, setSearch] = useState("");
  const [selectedRemedy, setSelectedRemedy] =
    useState<MateriaMedicaEntry | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem("mm-favorites");
      return new Set(saved ? (JSON.parse(saved) as string[]) : []);
    } catch {
      return new Set();
    }
  });

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem("mm-favorites", JSON.stringify([...next]));
      } catch {
        /* noop */
      }
      return next;
    });
  }, []);

  const filteredEntries = useMemo(() => {
    if (!search.trim()) return materiaMedicaEntries;
    const q = search.toLowerCase();
    return materiaMedicaEntries.filter((e) => {
      return (
        e.name.toLowerCase().includes(q) ||
        e.commonName.toLowerCase().includes(q) ||
        e.keynotes.some((k) => k.toLowerCase().includes(q)) ||
        e.mentalSymptoms.some((s) => s.toLowerCase().includes(q)) ||
        e.physicalSymptoms.some((s) => s.toLowerCase().includes(q))
      );
    });
  }, [search]);

  const viewButtons: { mode: ViewMode; icon: typeof Grid3X3; label: string }[] =
    [
      { mode: "grid", icon: Grid3X3, label: "Grid View" },
      { mode: "periodic", icon: Table2, label: "Periodic Table" },
      { mode: "symptom", icon: List, label: "Symptom Search" },
    ];

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      data-ocid="materia-medica-page"
    >
      {/* Header */}
      <div className="space-y-1" data-ocid="mm-page-header">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link to="/pro" className="hover:text-foreground transition-colors">
            Pro Features
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground">Materia Medica</span>
        </nav>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-premium shrink-0" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-display font-bold text-foreground">
                  Homeopathic Materia Medica
                </h1>
                <span className="pro-badge hidden sm:inline-block">PRO</span>
                <span
                  className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border"
                  style={{
                    background: "oklch(var(--premium) / 0.1)",
                    borderColor: "oklch(var(--premium) / 0.3)",
                    color: "oklch(var(--premium))",
                  }}
                >
                  <Crown className="w-2.5 h-2.5" />
                  {materiaMedicaEntries.length}+ Remedies
                </span>
              </div>
              <p className="text-sm text-muted-foreground font-body mt-0.5">
                Comprehensive digital reference with constitutional types,
                modalities &amp; clinical pearls
              </p>
            </div>
          </div>
          {favorites.size > 0 && (
            <Badge
              variant="outline"
              className="border-red-500/30 bg-red-500/10 text-red-400 gap-1.5"
              data-ocid="favorites-count-badge"
            >
              <Heart className="w-3 h-3 fill-current" />
              {favorites.size} saved
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Header */}
      <StatsHeader />

      {/* Search + View Toggle */}
      <div
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
        data-ocid="search-and-view-bar"
      >
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by remedy name, symptom or keynote..."
            className="pl-9 bg-muted/20 border-border/60"
            data-ocid="mm-search-input"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div
          className="flex items-center gap-1 p-1 rounded-xl glass border border-border/50"
          data-ocid="view-toggle"
          aria-label="View mode"
        >
          {viewButtons.map(({ mode, icon: Icon, label }) => (
            <button
              type="button"
              key={mode}
              onClick={() => setView(mode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-smooth ${view === mode ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              aria-pressed={view === mode}
              data-ocid={`view-toggle-${mode}`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* View Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {view === "grid" && (
            <GridView
              entries={filteredEntries}
              searchQuery={search}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              onSelectRemedy={setSelectedRemedy}
            />
          )}
          {view === "periodic" && (
            <PeriodicTableView onSelectRemedyByPT={setSelectedRemedy} />
          )}
          {view === "symptom" && (
            <SymptomSearchView onSelectRemedy={setSelectedRemedy} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Remedy Detail Modal */}
      <AnimatePresence>
        {selectedRemedy && (
          <RemedyModal
            remedy={selectedRemedy}
            onClose={() => setSelectedRemedy(null)}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
