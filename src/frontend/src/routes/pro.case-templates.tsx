import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { caseTemplates } from "@/data/caseTemplates";
import type { CaseTemplate, TemplateSymptom } from "@/types/proTypes";
import { createRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  Bone,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  Droplets,
  FlaskConical,
  Heart,
  LayoutGrid,
  Search,
  Star,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Route as proRoute } from "./pro";

export const Route = createRoute({
  getParentRoute: () => proRoute,
  path: "case-templates",
  component: CaseTemplatesPage,
});

// ─── Mock patients for autocomplete ──────────────────────────────────────────
const MOCK_PATIENTS = [
  "Priya Sharma",
  "Rahul Mehta",
  "Ananya Iyer",
  "Suresh Patel",
  "Kavitha Nair",
  "Arjun Reddy",
  "Meena Krishnan",
  "Vikram Joshi",
];

// ─── Category config ──────────────────────────────────────────────────────────
type Category =
  | "All"
  | "Neurological"
  | "Respiratory"
  | "Digestive"
  | "Mental"
  | "Dermatological"
  | "Musculoskeletal";

const CATEGORY_MAP: Record<string, Category> = {
  ct001: "Neurological",
  ct002: "Dermatological",
  ct003: "Mental",
  ct004: "Digestive",
  ct005: "Musculoskeletal",
};

const CATEGORIES: Category[] = [
  "All",
  "Neurological",
  "Mental",
  "Digestive",
  "Dermatological",
  "Musculoskeletal",
];

// ─── Icon map ─────────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, ReactNode> = {
  Brain: <Brain className="w-6 h-6" />,
  Droplets: <Droplets className="w-6 h-6" />,
  Heart: <Heart className="w-6 h-6" />,
  Zap: <Zap className="w-6 h-6" />,
  Bone: <Bone className="w-6 h-6" />,
};

// ─── Symptom category colors ──────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  Mind: "bg-primary/10 text-primary border-primary/20",
  Head: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  Chest: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  Abdomen:
    "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  Skin: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
  General: "bg-accent/10 text-accent border-accent/20",
  Extremities:
    "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  Urinary: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  Female: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
  Male: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
};

// ─── Intensity badge ──────────────────────────────────────────────────────────
const INTENSITY_DOT: Record<string, string> = {
  mild: "bg-accent",
  moderate: "bg-premium",
  severe: "bg-destructive",
};

// ─── Group symptoms by category ───────────────────────────────────────────────
function groupSymptoms(symptoms: TemplateSymptom[]) {
  return symptoms.reduce<Record<string, TemplateSymptom[]>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});
}

// ─── Card component ───────────────────────────────────────────────────────────
interface TemplateCardProps {
  template: CaseTemplate;
  category: Category;
  index: number;
  onPreview: (t: CaseTemplate) => void;
}

function TemplateCard({
  template,
  category,
  index,
  onPreview,
}: TemplateCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group relative glass-premium cursor-pointer"
      style={{
        background: hovered
          ? "linear-gradient(135deg, oklch(var(--card)/0.95) 0%, oklch(var(--premium)/0.06) 100%)"
          : undefined,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onPreview(template)}
      data-ocid={`template-card-${template.templateId}`}
    >
      {/* Gold hover border glow */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        animate={{
          boxShadow: hovered
            ? "0 0 0 1.5px oklch(var(--premium)/0.6), 0 8px 32px oklch(var(--premium)/0.12)"
            : "0 0 0 0px oklch(var(--premium)/0)",
        }}
        transition={{ duration: 0.25 }}
      />

      <div className="p-6 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="feature-icon-premium shrink-0">
            {ICON_MAP[template.icon] ?? <FlaskConical className="w-6 h-6" />}
          </div>
          <Badge
            variant="outline"
            className="text-xs shrink-0 border-premium/30 text-premium bg-premium/5"
          >
            {category}
          </Badge>
        </div>

        {/* Title + description */}
        <div>
          <h3 className="font-display font-semibold text-base text-foreground leading-snug">
            {template.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 font-body">
            {template.condition}
          </p>
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2 font-body leading-relaxed">
            {template.description}
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 pt-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span>{template.keySymptoms.length} symptoms</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span>{template.commonRemedies.length} remedies</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-1.5 h-1.5 rounded-full bg-premium" />
            <span>{template.redFlags.length} red flags</span>
          </div>
        </div>

        {/* Preview overlay button */}
        <motion.div
          animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 6 }}
          transition={{ duration: 0.2 }}
          className="pt-1"
        >
          <Button
            size="sm"
            className="w-full bg-premium/10 hover:bg-premium/20 text-premium border border-premium/30 hover:border-premium/50 font-semibold"
            variant="ghost"
            tabIndex={hovered ? 0 : -1}
            onClick={(e) => {
              e.stopPropagation();
              onPreview(template);
            }}
            data-ocid={`preview-btn-${template.templateId}`}
          >
            <LayoutGrid className="w-3.5 h-3.5 mr-1.5" />
            Preview Template
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── "Use Template" secondary modal ──────────────────────────────────────────
interface UseTemplateModalProps {
  template: CaseTemplate;
  open: boolean;
  onClose: () => void;
}

function UseTemplateModal({ template, open, onClose }: UseTemplateModalProps) {
  const [patientInput, setPatientInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [date, setDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [checked, setChecked] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(template.keySymptoms.map((s) => [s.symptom, true])),
  );

  const suggestions = useMemo(
    () =>
      patientInput.length > 0
        ? MOCK_PATIENTS.filter((p) =>
            p.toLowerCase().includes(patientInput.toLowerCase()),
          )
        : [],
    [patientInput],
  );

  function handleCreate() {
    if (!patientInput.trim()) {
      toast.error("Please enter a patient name");
      return;
    }
    toast.success(
      `Case created from "${template.name}" template for ${patientInput}`,
      {
        description: `${Object.values(checked).filter(Boolean).length} symptoms pre-loaded · ${date}`,
        icon: <CheckCircle2 className="w-4 h-4 text-accent" />,
        duration: 5000,
      },
    );
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-lg glass border-white/20 dark:border-white/10"
        data-ocid="use-template-modal"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-lg flex items-center gap-2">
            <div className="feature-icon-premium w-8 h-8">
              {ICON_MAP[template.icon] ?? <FlaskConical className="w-4 h-4" />}
            </div>
            Select Patient & Create Case
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-1">
          {/* Patient autocomplete */}
          <div className="space-y-1.5 relative">
            <Label className="text-sm font-medium" htmlFor="patient-input">
              Patient Name
            </Label>
            <div className="relative">
              <Input
                id="patient-input"
                placeholder="Search patient..."
                value={patientInput}
                onChange={(e) => {
                  setPatientInput(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                autoComplete="off"
                data-ocid="patient-name-input"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.ul
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute z-50 mt-1 w-full glass rounded-xl border border-white/20 dark:border-white/10 shadow-xl overflow-hidden"
                >
                  {suggestions.map((name) => (
                    <li
                      key={name}
                      className="px-3 py-2 text-sm cursor-pointer hover:bg-primary/10 transition-colors"
                      onMouseDown={() => {
                        setPatientInput(name);
                        setShowSuggestions(false);
                      }}
                    >
                      {name}
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          {/* Date picker */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium" htmlFor="appt-date">
              Appointment Date
            </Label>
            <Input
              id="appt-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              data-ocid="appointment-date-input"
            />
          </div>

          {/* Pre-populated symptom checklist */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Pre-load Symptoms{" "}
              <span className="text-muted-foreground font-normal">
                ({Object.values(checked).filter(Boolean).length} selected)
              </span>
            </Label>
            <ScrollArea className="h-48 rounded-lg border border-border/50 p-3">
              <div className="space-y-2">
                {template.keySymptoms.map((s) => (
                  <div
                    key={s.symptom}
                    className="flex items-start gap-2.5 group/item"
                  >
                    <Checkbox
                      id={`sym-${s.symptom}`}
                      checked={!!checked[s.symptom]}
                      onCheckedChange={(v) =>
                        setChecked((prev) => ({ ...prev, [s.symptom]: !!v }))
                      }
                      className="mt-0.5 shrink-0"
                      data-ocid={`symptom-checkbox-${s.symptom.replace(/\s+/g, "-").toLowerCase()}`}
                    />
                    <label
                      htmlFor={`sym-${s.symptom}`}
                      className="text-sm cursor-pointer leading-snug flex-1 min-w-0"
                    >
                      <span className="text-foreground">{s.symptom}</span>
                      <span
                        className={`ml-2 inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full border ${CATEGORY_COLORS[s.category] ?? "bg-muted text-muted-foreground"}`}
                      >
                        {s.category}
                      </span>
                    </label>
                    <div
                      className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${INTENSITY_DOT[s.intensity]}`}
                      title={s.intensity}
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            data-ocid="modal-close-btn"
          >
            Cancel
          </Button>
          <Button
            className="bg-premium hover:bg-premium/90 text-premium-foreground font-semibold"
            onClick={handleCreate}
            data-ocid="create-case-btn"
          >
            <ClipboardCheck className="w-4 h-4 mr-1.5" />
            Create Case
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Template Preview Modal ───────────────────────────────────────────────────
interface PreviewModalProps {
  template: CaseTemplate | null;
  open: boolean;
  onClose: () => void;
  onUse: (t: CaseTemplate) => void;
}

function PreviewModal({ template, open, onClose, onUse }: PreviewModalProps) {
  if (!template) return null;
  const grouped = groupSymptoms(template.keySymptoms);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] flex flex-col glass border-white/20 dark:border-white/10 p-0 gap-0"
        data-ocid="template-preview-modal"
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border/40">
          <div className="flex items-center gap-3 min-w-0">
            <div className="feature-icon-premium shrink-0">
              {ICON_MAP[template.icon] ?? <FlaskConical className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-lg text-foreground truncate">
                  {template.name}
                </h2>
                <span className="pro-badge shrink-0">PRO</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {template.condition}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 rounded-full"
            onClick={onClose}
            aria-label="Close"
            data-ocid="preview-modal-close"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Tabs */}
        <Tabs
          defaultValue="overview"
          className="flex-1 overflow-hidden flex flex-col"
        >
          <TabsList className="mx-6 mt-4 shrink-0 justify-start bg-muted/50 w-fit gap-1">
            <TabsTrigger value="overview" data-ocid="tab-overview">
              Overview
            </TabsTrigger>
            <TabsTrigger value="symptoms" data-ocid="tab-symptoms">
              Key Symptoms
            </TabsTrigger>
            <TabsTrigger value="remedies" data-ocid="tab-remedies">
              Common Remedies
            </TabsTrigger>
            <TabsTrigger value="protocol" data-ocid="tab-protocol">
              Protocol
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 px-6 py-4">
            {/* ── Overview ─────────────────────────────────── */}
            <TabsContent value="overview" className="mt-0 space-y-5">
              <p className="text-sm text-muted-foreground leading-relaxed font-body">
                {template.description}
              </p>

              <div className="grid grid-cols-2 gap-4">
                {/* Better */}
                <div className="glass rounded-xl p-4 space-y-2 border-green-500/20">
                  <div className="flex items-center gap-2">
                    <ChevronUp className="w-4 h-4 text-accent" />
                    <span className="text-sm font-semibold text-foreground font-display">
                      Better From
                    </span>
                  </div>
                  <ul className="space-y-1.5">
                    {template.modalities.better.map((m) => (
                      <li
                        key={m}
                        className="flex items-center gap-1.5 text-sm text-muted-foreground"
                      >
                        <div className="w-1 h-1 rounded-full bg-accent shrink-0" />
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Worse */}
                <div className="glass rounded-xl p-4 space-y-2 border-red-500/20">
                  <div className="flex items-center gap-2">
                    <ChevronDown className="w-4 h-4 text-destructive" />
                    <span className="text-sm font-semibold text-foreground font-display">
                      Worse From
                    </span>
                  </div>
                  <ul className="space-y-1.5">
                    {template.modalities.worse.map((m) => (
                      <li
                        key={m}
                        className="flex items-center gap-1.5 text-sm text-muted-foreground"
                      >
                        <div className="w-1 h-1 rounded-full bg-destructive/60 shrink-0" />
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Red flags */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  <span className="text-sm font-semibold text-foreground font-display">
                    Red Flags — Refer Immediately
                  </span>
                </div>
                <div className="space-y-2">
                  {template.redFlags.map((flag) => (
                    <div
                      key={flag}
                      className="flex items-start gap-2.5 p-3 rounded-lg bg-destructive/5 border border-destructive/15"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />
                      <p className="text-sm text-foreground/80">{flag}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* ── Key Symptoms ──────────────────────────────── */}
            <TabsContent value="symptoms" className="mt-0 space-y-4">
              {Object.entries(grouped).map(([cat, syms]) => (
                <div key={cat} className="space-y-2">
                  <Badge
                    variant="outline"
                    className={`text-xs font-semibold border ${CATEGORY_COLORS[cat] ?? "bg-muted text-muted-foreground border-border"}`}
                  >
                    {cat}
                  </Badge>
                  <div className="grid grid-cols-1 gap-2">
                    {syms.map((s) => (
                      <div
                        key={s.symptom}
                        className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg glass border-0"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-2 h-2 rounded-full shrink-0 ${INTENSITY_DOT[s.intensity]}`}
                            title={`${s.intensity} intensity`}
                          />
                          <span className="text-sm text-foreground font-body truncate">
                            {s.symptom}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground capitalize shrink-0">
                          {s.intensity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>

            {/* ── Common Remedies ───────────────────────────── */}
            <TabsContent value="remedies" className="mt-0 space-y-4">
              {template.commonRemedies.map((remedy, i) => (
                <motion.div
                  key={remedy.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="glass rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-premium/10 text-premium flex items-center justify-center text-xs font-bold font-display shrink-0">
                        {i + 1}
                      </div>
                      <span className="font-display font-semibold text-sm text-foreground">
                        {remedy.name}
                      </span>
                      {i === 0 && (
                        <Star className="w-3.5 h-3.5 text-premium fill-premium" />
                      )}
                    </div>
                    <span className="text-sm font-bold text-premium shrink-0">
                      {remedy.matchScore}%
                    </span>
                  </div>
                  <Progress
                    value={remedy.matchScore}
                    className="h-1.5 bg-muted"
                  />
                  <p className="text-xs text-muted-foreground leading-relaxed font-body">
                    {remedy.rationale}
                  </p>
                </motion.div>
              ))}
            </TabsContent>

            {/* ── Protocol ─────────────────────────────────── */}
            <TabsContent value="protocol" className="mt-0 space-y-4">
              <div className="glass rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground font-display">
                    Dosage Guidance
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed font-body">
                  {template.dosageGuidance}
                </p>
              </div>

              <div className="glass rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4 text-accent" />
                  <span className="text-sm font-semibold text-foreground font-display">
                    Follow-Up Protocol
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed font-body">
                  {template.followUpProtocol}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  <span className="text-sm font-semibold text-foreground font-display">
                    Red Flags
                  </span>
                </div>
                {template.redFlags.map((flag) => (
                  <div
                    key={flag}
                    className="flex items-start gap-2.5 p-3 rounded-lg bg-destructive/5 border border-destructive/15"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground/80">{flag}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border/40">
          <Button
            variant="outline"
            onClick={onClose}
            data-ocid="preview-close-btn"
          >
            Close
          </Button>
          <Button
            className="bg-premium hover:bg-premium/90 text-premium-foreground font-semibold"
            onClick={() => {
              onClose();
              onUse(template);
            }}
            data-ocid="use-template-btn"
          >
            <ClipboardCheck className="w-4 h-4 mr-1.5" />
            Use This Template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
function CaseTemplatesPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [previewTemplate, setPreviewTemplate] = useState<CaseTemplate | null>(
    null,
  );
  const [useTemplate, setUseTemplate] = useState<CaseTemplate | null>(null);

  const filtered = useMemo(() => {
    return caseTemplates.filter((t) => {
      const cat = CATEGORY_MAP[t.templateId] ?? "General";
      const matchesCategory =
        activeCategory === "All" || cat === activeCategory;
      const matchesSearch =
        search === "" ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.condition.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  return (
    <div className="space-y-6 pb-10">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="min-w-0"
        >
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-2xl font-display font-bold text-foreground">
              Clinical Case Templates
            </h1>
            <span className="pro-badge" data-ocid="pro-badge">
              PRO
            </span>
          </div>
          <p className="text-sm text-muted-foreground font-body">
            Condition-specific case frameworks with pre-loaded symptoms, remedy
            profiles, and clinical protocols.
          </p>
        </motion.div>
      </div>

      {/* Search + filters */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3 items-start sm:items-center"
      >
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search templates…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
            data-ocid="template-search-input"
          />
        </div>

        {/* Category filter pills */}
        <div className="flex flex-wrap gap-1.5" data-ocid="category-filters">
          {CATEGORIES.map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-smooth border ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-muted/50 text-muted-foreground border-border/50 hover:border-primary/40 hover:text-foreground"
              }`}
              data-ocid={`filter-${cat.toLowerCase()}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex items-center gap-5 text-xs text-muted-foreground"
      >
        <span>
          <strong className="text-foreground">{filtered.length}</strong>{" "}
          templates
        </span>
        <span className="text-border/60">·</span>
        <span>
          <strong className="text-foreground">
            {filtered.reduce((s, t) => s + t.keySymptoms.length, 0)}
          </strong>{" "}
          total symptoms
        </span>
        <span className="text-border/60">·</span>
        <span>
          <strong className="text-foreground">
            {filtered.reduce((s, t) => s + t.commonRemedies.length, 0)}
          </strong>{" "}
          remedy profiles
        </span>
      </motion.div>

      {/* Template grid */}
      <AnimatePresence mode="wait">
        {filtered.length > 0 ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            data-ocid="templates-grid"
          >
            {filtered.map((template, i) => (
              <TemplateCard
                key={template.templateId}
                template={template}
                category={CATEGORY_MAP[template.templateId] ?? "General"}
                index={i}
                onPreview={setPreviewTemplate}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 gap-4 text-center glass-card"
            data-ocid="empty-state"
          >
            <div className="feature-icon-premium w-14 h-14">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <p className="font-display font-semibold text-foreground">
                No templates found
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Try a different search term or category
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("");
                setActiveCategory("All");
              }}
            >
              Clear filters
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview modal */}
      <PreviewModal
        template={previewTemplate}
        open={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        onUse={(t) => setUseTemplate(t)}
      />

      {/* Use template modal */}
      {useTemplate && (
        <UseTemplateModal
          template={useTemplate}
          open={!!useTemplate}
          onClose={() => setUseTemplate(null)}
        />
      )}
    </div>
  );
}
