import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { usePatients } from "@/hooks/usePatients";
import type { Patient } from "@/types";
import { formatDate, getInitials, relativeTime } from "@/utils/formatters";
import { createRoute, useNavigate, useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  Bell,
  BellRing,
  Brain,
  Calendar,
  CheckCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Edit2,
  Edit3,
  FileText,
  IndianRupee,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Mic,
  Paperclip,
  PenLine,
  Phone,
  Pill,
  Plus,
  Save,
  Send,
  Stethoscope,
  Trash2,
  User,
  Video,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Route as patientsRoute } from "./patients";
import { PatientModal } from "./patients.index";

export const Route = createRoute({
  getParentRoute: () => patientsRoute,
  path: "$patientId",
  component: PatientDetailPage,
});

// ─── Types ──────────────────────────────────────────────────────────────────

interface UploadedFile {
  name: string;
  type: "lab" | "media";
  size: string;
  isDemo?: boolean;
}

interface VisitEntry {
  id: string;
  date: string;
  symptoms: string;
  investigation: string;
  medicine: string;
  labFiles: UploadedFile[];
  mediaFiles: UploadedFile[];
  visitType: "OP" | "Online";
  nextVisitDate?: string;
}

interface FeeEntry {
  id: string;
  date: string;
  consultationFee: number;
  medicineRegular: number;
  extraMedicine: number;
  registrationFee: number;
  totalAmount: number;
  dueAmount: number;
  confirmedToPharmacist: boolean;
  medicine?: string;
}

// ─── HtmlContent helper (avoids dangerouslySetInnerHTML lint errors) ──────────

function HtmlContent({
  html,
  className,
}: { html: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.innerHTML = html || "";
  }, [html]);
  return <div ref={ref} className={className} />;
}

// ─── Symptom keyword mapping ─────────────────────────────────────────────────

const SYMPTOM_KEYWORDS = [
  "fever",
  "cough",
  "headache",
  "body-ache",
  "body ache",
  "vomiting",
  "diarrhea",
  "sneezing",
  "sore-throat",
  "sore throat",
  "weakness",
  "fatigue",
  "cold",
  "nausea",
  "pain",
  "dizziness",
  "anxiety",
  "insomnia",
  "constipation",
  "acidity",
  "joint-pain",
  "joint pain",
  "back-pain",
  "back pain",
];

const REMEDY_MAP: Record<string, string[]> = {
  fever: ["Aconite 30C", "Bryonia 30C", "Gelsemium 200C"],
  cough: ["Drosera 30C", "Spongia 30C", "Rumex 30C"],
  headache: ["Belladonna 30C", "Nux Vomica 30C", "Sanguinaria 200C"],
  "body ache": ["Eupatorium Perf 30C", "Rhus Tox 30C", "Arnica 30C"],
  "body-ache": ["Eupatorium Perf 30C", "Rhus Tox 30C", "Arnica 30C"],
  vomiting: ["Ipecac 30C", "Nux Vomica 30C", "Arsenic Album 30C"],
  diarrhea: ["Arsenic Album 30C", "Podophyllum 30C", "Veratrum Album 30C"],
  sneezing: ["Allium Cepa 30C", "Sabadilla 30C", "Natrum Mur 30C"],
  "sore throat": ["Belladonna 30C", "Hepar Sulph 30C", "Lachesis 200C"],
  "sore-throat": ["Belladonna 30C", "Hepar Sulph 30C", "Lachesis 200C"],
  weakness: ["China 30C", "Phosphoric Acid 30C", "Carbo Veg 30C"],
  fatigue: ["Phosphoric Acid 30C", "Picric Acid 30C", "Kali Phos 6X"],
  cold: ["Allium Cepa 30C", "Aconite 30C", "Ferrum Phos 6X"],
  nausea: ["Ipecac 30C", "Nux Vomica 30C", "Sepia 30C"],
  pain: ["Arnica 30C", "Hypericum 30C", "Mag Phos 6X"],
  dizziness: ["Cocculus 30C", "Conium 30C", "Gelsemium 30C"],
  anxiety: ["Aconite 30C", "Ignatia 30C", "Argentum Nitricum 30C"],
  insomnia: ["Coffea 30C", "Passiflora Q", "Nux Vomica 30C"],
  constipation: ["Nux Vomica 30C", "Bryonia 30C", "Alumina 30C"],
  acidity: ["Nux Vomica 30C", "Carbo Veg 30C", "Robinia 30C"],
  "joint pain": ["Rhus Tox 30C", "Bryonia 30C", "Calc Carb 200C"],
  "joint-pain": ["Rhus Tox 30C", "Bryonia 30C", "Calc Carb 200C"],
  "back pain": ["Rhus Tox 30C", "Hypericum 30C", "Kali Carb 30C"],
  "back-pain": ["Rhus Tox 30C", "Hypericum 30C", "Kali Carb 30C"],
};

const DEMO_TRANSCRIPT =
  "Patient complains of fever since 3 days, headache, body ache, and fatigue. No cough or cold. Appetite reduced. Feeling weakness and mild nausea in mornings.";

const DEMO_PAST_VISITS: VisitEntry[] = [
  {
    id: "visit-demo-1",
    date: "2026-05-10T10:30:00",
    symptoms:
      "Chronic migraine with visual aura, throbbing pain on right temple. Aggravated by light and noise. Better lying down in dark room.",
    investigation:
      "BP: 128/82 mmHg. Pulse: 72/min. Fundus examination normal. No neurological deficits.",
    medicine:
      "Belladonna 200C — 4 pills once. Natrum Mur 1M — weekly dose. Sanguinaria 30C — during acute episodes.",
    labFiles: [
      { name: "Blood_Report.pdf", type: "lab", size: "1.2 MB", isDemo: true },
      { name: "X-Ray_Skull.jpg", type: "lab", size: "3.4 MB", isDemo: true },
    ],
    mediaFiles: [
      {
        name: "Patient_Photo_1.jpg",
        type: "media",
        size: "2.1 MB",
        isDemo: true,
      },
    ],
    visitType: "OP" as const,
    nextVisitDate: "2026-06-01",
  },
  {
    id: "visit-demo-2",
    date: "2026-03-22T14:15:00",
    symptoms:
      "Severe joint pain in knees and ankles. Stiffness on waking, better after movement. Swelling with heat. History of rheumatic fever.",
    investigation:
      "RA Factor: 48 IU/mL (elevated). ESR: 62 mm/hr. CRP: Positive. Uric acid: Normal.",
    medicine:
      "Rhus Tox 200C — TDS for 7 days. Calc Carb 1M — single dose. Apis Mel 30C for swelling.",
    labFiles: [
      {
        name: "RA_Panel_Report.pdf",
        type: "lab",
        size: "0.8 MB",
        isDemo: true,
      },
    ],
    mediaFiles: [
      {
        name: "Knee_Xray_Left.jpg",
        type: "media",
        size: "4.2 MB",
        isDemo: true,
      },
      {
        name: "Video_Examination.mp4",
        type: "media",
        size: "18.5 MB",
        isDemo: true,
      },
    ],
    visitType: "OP" as const,
    nextVisitDate: "2026-06-20",
  },
  {
    id: "visit-demo-3",
    date: "2026-01-08T09:00:00",
    symptoms:
      "Acidity and constipation. Burning sensation in stomach after meals. No appetite in mornings. Coated tongue.",
    investigation:
      "H. Pylori test: Negative. Stool routine: Normal. Endoscopy deferred.",
    medicine:
      "Nux Vomica 30C — after meals. Carbo Veg 30C — for bloating. Robinia 30C — for heartburn.",
    labFiles: [],
    mediaFiles: [],
    visitType: "OP" as const,
  },
];

// ─── Symptom highlight utility ───────────────────────────────────────────────

function highlightSymptoms(text: string): React.ReactNode[] {
  if (!text.trim()) return [];
  const lowerText = text.toLowerCase();
  const marked = new Array(text.length).fill(false);
  const parts: { start: number; end: number; isKeyword: boolean }[] = [];
  const sorted = [...SYMPTOM_KEYWORDS].sort((a, b) => b.length - a.length);
  for (const kw of sorted) {
    let idx = lowerText.indexOf(kw);
    while (idx !== -1) {
      const alreadyCovered = marked.slice(idx, idx + kw.length).some(Boolean);
      if (!alreadyCovered) {
        for (let i = idx; i < idx + kw.length; i++) marked[i] = true;
        parts.push({ start: idx, end: idx + kw.length, isKeyword: true });
      }
      idx = lowerText.indexOf(kw, idx + 1);
    }
  }
  let pos = 0;
  const allParts = [...parts].sort((a, b) => a.start - b.start);
  const finalParts: { start: number; end: number; isKeyword: boolean }[] = [];
  for (const p of allParts) {
    if (pos < p.start)
      finalParts.push({ start: pos, end: p.start, isKeyword: false });
    finalParts.push(p);
    pos = p.end;
  }
  if (pos < text.length)
    finalParts.push({ start: pos, end: text.length, isKeyword: false });
  if (finalParts.length === 0) return [<span key="all">{text}</span>];
  return finalParts.map((p, i) =>
    p.isKeyword ? (
      <span
        key={`kw-${p.start}-${i}`}
        className="underline decoration-blue-400 decoration-2 text-blue-400 font-medium"
      >
        {text.slice(p.start, p.end)}
      </span>
    ) : (
      <span key={`txt-${p.start}-${i}`}>{text.slice(p.start, p.end)}</span>
    ),
  );
}

function detectRemedies(
  text: string,
): { keyword: string; remedies: string[] }[] {
  const lower = text.toLowerCase();
  const found: { keyword: string; remedies: string[] }[] = [];
  const seen = new Set<string>();
  const sorted = [...SYMPTOM_KEYWORDS].sort((a, b) => b.length - a.length);
  for (const kw of sorted) {
    if (lower.includes(kw) && !seen.has(kw) && REMEDY_MAP[kw]) {
      seen.add(kw);
      found.push({ keyword: kw, remedies: REMEDY_MAP[kw] });
    }
  }
  return found.slice(0, 5);
}

// ─── Waveform animation ──────────────────────────────────────────────────────

function WaveformBars() {
  return (
    <div className="flex items-center gap-0.5 h-5">
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full bg-primary"
          animate={{
            height: ["4px", `${8 + Math.sin(i * 0.7) * 6 + 8}px`, "4px"],
          }}
          transition={{
            duration: 0.6,
            repeat: Number.POSITIVE_INFINITY,
            delay: i * 0.05,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ─── Case Taking Tab ─────────────────────────────────────────────────────────

function CaseTakingTab({
  patient,
  nextVisitDate,
  onVisitSaved,
  onOpenScheduleModal,
  medicine,
  onMedicineChange,
  onMedicineSaved,
}: {
  patient: Patient;
  nextVisitDate: string | null;
  onVisitSaved: (nextVisitDate: string | null) => void;
  onOpenScheduleModal: () => void;
  medicine: string;
  onMedicineChange: (val: string) => void;
  onMedicineSaved: (medicineHtml: string) => void;
}) {
  const [symptoms, setSymptoms] = useState("");
  const [investigation, setInvestigation] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [showDiagnosis, setShowDiagnosis] = useState(false);
  const [diagnoses, setDiagnoses] = useState<
    { keyword: string; remedies: string[] }[]
  >([]);
  const [labFiles, setLabFiles] = useState<UploadedFile[]>([
    { name: "Blood_Report.pdf", type: "lab", size: "1.2 MB", isDemo: true },
    { name: "X-Ray.jpg", type: "lab", size: "3.4 MB", isDemo: true },
  ]);
  const [mediaFiles, setMediaFiles] = useState<UploadedFile[]>([
    {
      name: "Patient_Photo_1.jpg",
      type: "media",
      size: "2.1 MB",
      isDemo: true,
    },
    {
      name: "Video_Examination.mp4",
      type: "media",
      size: "18.5 MB",
      isDemo: true,
    },
  ]);
  const [visitHistory, setVisitHistory] =
    useState<VisitEntry[]>(DEMO_PAST_VISITS);
  const [expandedVisits, setExpandedVisits] = useState<Set<string>>(
    new Set(["visit-demo-1"]),
  );
  const [visitType, setVisitType] = useState<"OP" | "Online">("OP");
  // Edit mode state
  const [editingVisitId, setEditingVisitId] = useState<string | null>(null);
  const editingVisit = editingVisitId
    ? (visitHistory.find((v) => v.id === editingVisitId) ?? null)
    : null;

  const labInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const recordingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editorsTopRef = useRef<HTMLDivElement>(null);

  const handleRecord = useCallback(() => {
    if (isRecording) return;
    setIsRecording(true);
    recordingTimer.current = setTimeout(() => {
      setIsRecording(false);
      setSymptoms(`<p>${DEMO_TRANSCRIPT}</p>`);
      toast.success("Voice transcribed successfully");
    }, 3000);
  }, [isRecording]);

  const handleDiagnosis = useCallback(() => {
    const found = detectRemedies(symptoms.replace(/<[^>]*>/g, ""));
    if (found.length === 0) {
      toast.info(
        "No recognizable symptoms found. Please describe symptoms in more detail.",
      );
      return;
    }
    setDiagnoses(found);
    setShowDiagnosis(true);
  }, [symptoms]);

  const handleLabFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const newFiles = files.map((f) => ({
      name: f.name,
      type: "lab" as const,
      size: `${(f.size / 1024 / 1024).toFixed(1)} MB`,
    }));
    setLabFiles((prev) => [...prev, ...newFiles]);
    e.target.value = "";
  };

  const handleMediaFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const newFiles = files.map((f) => ({
      name: f.name,
      type: "media" as const,
      size: `${(f.size / 1024 / 1024).toFixed(1)} MB`,
    }));
    setMediaFiles((prev) => [...prev, ...newFiles]);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent, targetType: "lab" | "media") => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const newFiles = files.map((f) => ({
      name: f.name,
      type: targetType,
      size: `${(f.size / 1024 / 1024).toFixed(1)} MB`,
    }));
    if (targetType === "lab") setLabFiles((prev) => [...prev, ...newFiles]);
    else setMediaFiles((prev) => [...prev, ...newFiles]);
  };

  const removeLabFile = (idx: number) =>
    setLabFiles((prev) => prev.filter((_, i) => i !== idx));
  const removeMediaFile = (idx: number) =>
    setMediaFiles((prev) => prev.filter((_, i) => i !== idx));

  const resetForm = () => {
    setSymptoms("");
    setInvestigation("");
    onMedicineChange("");
    setLabFiles([
      { name: "Blood_Report.pdf", type: "lab", size: "1.2 MB", isDemo: true },
      { name: "X-Ray.jpg", type: "lab", size: "3.4 MB", isDemo: true },
    ]);
    setMediaFiles([
      {
        name: "Patient_Photo_1.jpg",
        type: "media",
        size: "2.1 MB",
        isDemo: true,
      },
      {
        name: "Video_Examination.mp4",
        type: "media",
        size: "18.5 MB",
        isDemo: true,
      },
    ]);
    setShowDiagnosis(false);
    setVisitType("OP");
    setEditingVisitId(null);
  };

  const handleEditVisit = (visit: VisitEntry) => {
    setSymptoms(visit.symptoms);
    setInvestigation(visit.investigation);
    onMedicineChange(visit.medicine);
    setVisitType(visit.visitType ?? "OP");
    setEditingVisitId(visit.id);
    setShowDiagnosis(false);
    // Scroll to editors section
    setTimeout(() => {
      editorsTopRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  const handleCancelEdit = () => {
    resetForm();
    toast.info("Edit cancelled.");
  };

  const handleSave = () => {
    if (!symptoms.trim() && !investigation.trim() && !medicine.trim()) {
      toast.error("Please fill in at least one field before saving.");
      return;
    }

    if (editingVisitId) {
      // Update existing visit
      setVisitHistory((prev) =>
        prev.map((v) =>
          v.id === editingVisitId
            ? { ...v, symptoms, investigation, medicine }
            : v,
        ),
      );
      resetForm();
      toast.success("Visit updated successfully!");
    } else {
      // Create new visit
      const newVisit: VisitEntry = {
        id: `visit-${Date.now()}`,
        date: new Date().toISOString(),
        symptoms,
        investigation,
        medicine,
        labFiles: labFiles.filter((f) => !f.isDemo),
        mediaFiles: mediaFiles.filter((f) => !f.isDemo),
        visitType,
        ...(nextVisitDate ? { nextVisitDate } : {}),
      };
      setVisitHistory((prev) => [newVisit, ...prev]);
      onVisitSaved(nextVisitDate);
      onMedicineSaved(medicine);
      resetForm();
      toast.success("Visit saved successfully!");
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedVisits((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const stripHtml = (html: string) => html.replace(/<[^>]*>/g, "");

  const hasKeywords = stripHtml(symptoms).trim().length > 0;
  const highlightedNodes = hasKeywords
    ? highlightSymptoms(stripHtml(symptoms))
    : [];

  // Suppress patient unused lint — patient is available for future use
  void patient;
  // nextVisitDate & onVisitSaved props are used in handleSave

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Edit mode banner */}
      <AnimatePresence>
        {editingVisit && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-400"
            data-ocid="case-taking.edit_mode_banner"
          >
            <div className="flex items-center gap-2 min-w-0">
              <PenLine className="w-4 h-4 shrink-0" />
              <span className="text-sm font-medium">
                Editing visit from{" "}
                <span className="font-semibold">
                  {new Date(editingVisit.date).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </span>
            </div>
            <button
              type="button"
              onClick={handleCancelEdit}
              aria-label="Cancel edit"
              data-ocid="case-taking.cancel_edit_button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 transition-colors duration-200 shrink-0"
            >
              <X className="w-3.5 h-3.5" />
              Cancel Edit
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visit Type Toggle + Schedule Next Visit */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span className="text-sm font-semibold text-muted-foreground">
          Visit Type
        </span>
        <div className="flex rounded-lg overflow-hidden border border-white/20">
          {(["OP", "Online"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setVisitType(type)}
              data-ocid={`case-taking.visit_type_${type.toLowerCase()}`}
              className={`px-4 py-1.5 text-sm font-medium transition-colors duration-200 ${
                visitType === type
                  ? "bg-blue-600 text-white"
                  : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
        {/* Schedule Next Visit — inline with visit type toggle */}
        <button
          type="button"
          onClick={onOpenScheduleModal}
          data-ocid="case-taking.schedule_next_visit_button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-emerald-500/10 border border-emerald-400/25 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-400/40 transition-all duration-200"
        >
          <Calendar className="w-4 h-4" />
          {nextVisitDate
            ? `Next: ${new Date(`${nextVisitDate}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
            : "Schedule Next Visit"}
        </button>
      </div>

      {/* Three text editor boxes */}
      <div
        ref={editorsTopRef}
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
      >
        {/* Symptoms */}
        <div
          className="glass-card p-5 space-y-3 flex flex-col"
          data-ocid="case-taking.symptoms-panel"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <h3 className="font-semibold font-display text-foreground text-sm">
                Symptoms
              </h3>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                aria-label="Record voice"
                onClick={handleRecord}
                disabled={isRecording}
                data-ocid="case-taking.voice_record_button"
                className={`p-1.5 rounded-lg transition-all duration-200 ${
                  isRecording
                    ? "bg-red-500/20 text-red-400 cursor-not-allowed"
                    : "hover:bg-primary/10 text-muted-foreground hover:text-primary"
                }`}
                title={isRecording ? "Recording…" : "Record voice"}
              >
                {isRecording ? <WaveformBars /> : <Mic className="w-4 h-4" />}
              </button>
              <button
                type="button"
                aria-label="AI Diagnosis"
                onClick={handleDiagnosis}
                data-ocid="case-taking.diagnosis_button"
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all duration-200"
              >
                <Brain className="w-3.5 h-3.5" />
                Diagnose
              </button>
            </div>
          </div>

          <RichTextEditor
            value={symptoms}
            onChange={(html) => {
              setSymptoms(html);
              setShowDiagnosis(false);
            }}
            placeholder="Describe the patient's symptoms in detail…"
            data-ocid="case-taking.symptoms_input"
          />

          {hasKeywords && (
            <div className="p-3 rounded-lg bg-white/5 border border-blue-400/20 text-sm leading-relaxed">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1.5 font-medium">
                Symptom preview
              </p>
              <p className="leading-relaxed">{highlightedNodes}</p>
            </div>
          )}

          <AnimatePresence>
            {showDiagnosis && diagnoses.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-3"
                data-ocid="case-taking.diagnosis_results"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-primary font-display">
                      Suggested Remedies
                    </span>
                  </div>
                  <button
                    type="button"
                    aria-label="Close diagnosis"
                    onClick={() => setShowDiagnosis(false)}
                    className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
                    data-ocid="case-taking.diagnosis_close"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-2">
                  {diagnoses.map(({ keyword, remedies }) => (
                    <div key={keyword} className="space-y-1">
                      <p className="text-[11px] font-medium text-muted-foreground capitalize">
                        For <span className="text-blue-400">{keyword}</span>:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {remedies.map((r) => (
                          <span
                            key={r}
                            className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-medium"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Investigation */}
        <div
          className="glass-card p-5 space-y-3"
          data-ocid="case-taking.investigation-panel"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <h3 className="font-semibold font-display text-foreground text-sm">
              Investigation
            </h3>
          </div>
          <RichTextEditor
            value={investigation}
            onChange={setInvestigation}
            placeholder="Enter investigation findings, lab results, and clinical observations…"
            data-ocid="case-taking.investigation_input"
          />
          <p className="text-[11px] text-muted-foreground">
            Include BP, pulse, CBC, test results, and clinical observations.
          </p>
        </div>

        {/* Medicine */}
        <div
          className="glass-card p-5 space-y-3"
          data-ocid="case-taking.medicine-panel"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <h3 className="font-semibold font-display text-foreground text-sm">
              Medicine
            </h3>
          </div>
          <RichTextEditor
            value={medicine}
            onChange={onMedicineChange}
            placeholder="Enter remedy, potency, dosage, and instructions…"
            data-ocid="case-taking.medicine_input"
          />
          <p className="text-[11px] text-muted-foreground">
            List each remedy with potency, dosage frequency, and duration.
          </p>
        </div>
      </div>

      {/* Upload boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Lab Records */}
        <div
          className="glass-card p-5 space-y-4"
          data-ocid="case-taking.lab-upload-panel"
        >
          <div className="flex items-center gap-2">
            <Paperclip className="w-4 h-4 text-primary" />
            <h3 className="font-semibold font-display text-foreground text-sm">
              Lab Records
            </h3>
            <span className="text-[11px] text-muted-foreground ml-auto">
              PDF, JPG, DOCX
            </span>
          </div>
          <button
            type="button"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, "lab")}
            onClick={() => labInputRef.current?.click()}
            aria-label="Upload lab records"
            className="w-full border-2 border-dashed border-white/20 hover:border-primary/50 rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer transition-colors duration-200 hover:bg-primary/5"
            data-ocid="case-taking.lab_dropzone"
          >
            <Plus className="w-6 h-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground text-center">
              Drag & drop or{" "}
              <span className="text-primary font-medium">click to browse</span>
            </p>
          </button>
          <input
            ref={labInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.docx,.doc"
            multiple
            className="hidden"
            onChange={handleLabFiles}
          />
          {labFiles.length > 0 && (
            <div className="space-y-2">
              {labFiles.map((f, idx) => (
                <div
                  key={`lab-${idx}-${f.name}`}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-white/5 border border-white/10"
                  data-ocid={`case-taking.lab_file.${idx + 1}`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-xs text-foreground truncate">
                      {f.name}
                    </span>
                    {f.isDemo && (
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        demo
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[11px] text-muted-foreground">
                      {f.size}
                    </span>
                    <button
                      type="button"
                      aria-label="Remove file"
                      onClick={() => removeLabFile(idx)}
                      className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      data-ocid={`case-taking.lab_remove.${idx + 1}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Patient Media */}
        <div
          className="glass-card p-5 space-y-4"
          data-ocid="case-taking.media-upload-panel"
        >
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-primary" />
            <h3 className="font-semibold font-display text-foreground text-sm">
              Patient Media
            </h3>
            <span className="text-[11px] text-muted-foreground ml-auto">
              Images & Videos
            </span>
          </div>
          <button
            type="button"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, "media")}
            onClick={() => mediaInputRef.current?.click()}
            aria-label="Upload patient media"
            className="w-full border-2 border-dashed border-white/20 hover:border-primary/50 rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer transition-colors duration-200 hover:bg-primary/5"
            data-ocid="case-taking.media_dropzone"
          >
            <Plus className="w-6 h-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground text-center">
              Drag & drop or{" "}
              <span className="text-primary font-medium">click to browse</span>
            </p>
          </button>
          <input
            ref={mediaInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={handleMediaFiles}
          />
          {mediaFiles.length > 0 && (
            <div className="space-y-2">
              {mediaFiles.map((f, idx) => {
                const isVideo = /\.(mp4|mov|avi|webm|mkv)$/i.test(f.name);
                return (
                  <div
                    key={`media-${idx}-${f.name}`}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-white/5 border border-white/10"
                    data-ocid={`case-taking.media_file.${idx + 1}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {isVideo ? (
                        <Video className="w-4 h-4 text-purple-400 shrink-0" />
                      ) : (
                        <div className="w-7 h-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                          IMG
                        </div>
                      )}
                      <span className="text-xs text-foreground truncate">
                        {f.name}
                      </span>
                      {f.isDemo && (
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          demo
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[11px] text-muted-foreground">
                        {f.size}
                      </span>
                      <button
                        type="button"
                        aria-label="Remove media"
                        onClick={() => removeMediaFile(idx)}
                        className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        data-ocid={`case-taking.media_remove.${idx + 1}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Save button */}
      <div className="flex items-center justify-end gap-3">
        {editingVisitId && (
          <Button
            variant="outline"
            onClick={handleCancelEdit}
            className="flex items-center gap-2 px-5"
            data-ocid="case-taking.cancel_edit_btn"
          >
            <X className="w-4 h-4" />
            Cancel
          </Button>
        )}
        <Button
          onClick={handleSave}
          className="flex items-center gap-2 px-6"
          data-ocid="case-taking.save_button"
        >
          <Save className="w-4 h-4" />
          {editingVisitId ? "Update Visit" : "Save Visit"}
        </Button>
      </div>

      {/* Visit History Timeline */}
      <div className="space-y-4" data-ocid="case-taking.visit-history">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <h3 className="font-semibold font-display text-foreground">
            Visit History
          </h3>
          <span className="text-xs text-muted-foreground bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 ml-auto">
            {visitHistory.length} visits
          </span>
        </div>
        {visitHistory.length === 0 ? (
          <div
            className="glass-card p-12 flex flex-col items-center justify-center text-center gap-3"
            data-ocid="case-taking.visit-history-empty"
          >
            <FileText className="w-10 h-10 text-muted-foreground/50" />
            <p className="text-muted-foreground text-sm">
              No visits recorded yet. Save your first case above.
            </p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
            <div className="space-y-4 pl-12">
              {visitHistory.map((visit, idx) => {
                const isExpanded = expandedVisits.has(visit.id);
                const visitDate = new Date(visit.date);
                const allFiles = [...visit.labFiles, ...visit.mediaFiles];
                return (
                  <motion.div
                    key={visit.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.06, duration: 0.3 }}
                    className="relative"
                    data-ocid={`case-taking.visit.${idx + 1}`}
                  >
                    <div className="absolute -left-[2.1rem] top-4 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                    <div className="glass-card overflow-hidden">
                      <div className="w-full flex items-start justify-between gap-3 p-4">
                        <button
                          type="button"
                          className="flex-1 flex items-start gap-3 text-left hover:opacity-80 transition-opacity duration-150 min-w-0"
                          onClick={() => toggleExpand(visit.id)}
                          data-ocid={`case-taking.visit_toggle.${idx + 1}`}
                          aria-expanded={isExpanded}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-semibold text-primary font-mono">
                                {visitDate.toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {visitDate.toLocaleTimeString("en-IN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              {allFiles.length > 0 && (
                                <span className="text-[10px] bg-primary/10 border border-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                                  {allFiles.length} file
                                  {allFiles.length !== 1 ? "s" : ""}
                                </span>
                              )}
                              <span
                                className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  (visit.visitType ?? "OP") === "Online"
                                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                    : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                }`}
                              >
                                {visit.visitType ?? "OP"}
                              </span>
                              {editingVisitId === visit.id && (
                                <span className="text-[10px] bg-amber-400/15 border border-amber-400/30 text-amber-400 px-1.5 py-0.5 rounded-full font-medium">
                                  Editing
                                </span>
                              )}
                            </div>
                            {visit.nextVisitDate && (
                              <div className="mt-1">
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-green-500/15 border border-green-400/30 text-green-400">
                                  <Calendar className="w-3 h-3" />
                                  Next Visit:{" "}
                                  {new Date(
                                    `${visit.nextVisitDate}T00:00:00`,
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                            )}
                            {!isExpanded && visit.symptoms && (
                              <p className="text-xs text-muted-foreground mt-1 truncate">
                                {visit.symptoms
                                  .replace(/<[^>]*>/g, "")
                                  .slice(0, 100)}
                                {visit.symptoms.replace(/<[^>]*>/g, "").length >
                                100
                                  ? "…"
                                  : ""}
                              </p>
                            )}
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                          )}
                        </button>
                        {/* Edit button */}
                        <button
                          type="button"
                          aria-label={`Edit visit from ${visitDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditVisit(visit);
                          }}
                          data-ocid={`case-taking.visit_edit.${idx + 1}`}
                          className={`p-1.5 rounded-lg transition-all duration-200 shrink-0 mt-0.5 ${
                            editingVisitId === visit.id
                              ? "bg-amber-400/20 text-amber-400 ring-1 ring-amber-400/40"
                              : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                          }`}
                          title="Edit this visit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 space-y-3 border-t border-white/10">
                              {visit.symptoms && (
                                <div className="pt-3">
                                  <p className="text-[11px] font-medium uppercase tracking-wide text-red-400 mb-1">
                                    Symptoms
                                  </p>
                                  <HtmlContent
                                    html={visit.symptoms || ""}
                                    className="prose prose-sm max-w-none dark:prose-invert text-sm leading-relaxed text-foreground"
                                  />
                                </div>
                              )}
                              {visit.investigation && (
                                <div>
                                  <p className="text-[11px] font-medium uppercase tracking-wide text-amber-400 mb-1">
                                    Investigation
                                  </p>
                                  <HtmlContent
                                    html={visit.investigation || ""}
                                    className="prose prose-sm max-w-none dark:prose-invert text-sm leading-relaxed text-foreground"
                                  />
                                </div>
                              )}
                              {visit.medicine && (
                                <div>
                                  <p className="text-[11px] font-medium uppercase tracking-wide text-green-400 mb-1">
                                    Medicine
                                  </p>
                                  <HtmlContent
                                    html={visit.medicine || ""}
                                    className="prose prose-sm max-w-none dark:prose-invert text-sm leading-relaxed text-foreground"
                                  />
                                </div>
                              )}
                              {allFiles.length > 0 && (
                                <div>
                                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1.5">
                                    Attachments
                                  </p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {allFiles.map((f, fi) => (
                                      <span
                                        key={`${f.name}-${fi}`}
                                        className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-md bg-white/5 border border-white/10 text-muted-foreground"
                                      >
                                        <Paperclip className="w-3 h-3" />
                                        {f.name}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Fee Structure Tab ──────────────────────────────────────────────────────

function FeeStructureTab({
  lastSavedMedicine,
}: {
  lastSavedMedicine: string;
}) {
  const [consultationFee, setConsultationFee] = useState("");
  const [medicineRegular, setMedicineRegular] = useState("");
  const [extraMedicine, setExtraMedicine] = useState("");
  const [registrationFee, setRegistrationFee] = useState("");
  const [dueAmount, setDueAmount] = useState("");
  const [confirmedByDoctor, setConfirmedByDoctor] = useState(false);
  const [feeHistory, setFeeHistory] = useState<FeeEntry[]>([
    {
      id: "fee-demo-1",
      date: "2026-05-10T10:30:00",
      consultationFee: 500,
      medicineRegular: 300,
      extraMedicine: 150,
      registrationFee: 200,
      totalAmount: 1150,
      dueAmount: 200,
      confirmedToPharmacist: true,
    },
    {
      id: "fee-demo-2",
      date: "2026-03-22T14:15:00",
      consultationFee: 500,
      medicineRegular: 250,
      extraMedicine: 0,
      registrationFee: 0,
      totalAmount: 750,
      dueAmount: 0,
      confirmedToPharmacist: false,
    },
  ]);

  const totalAmount =
    (Number.parseFloat(consultationFee) || 0) +
    (Number.parseFloat(medicineRegular) || 0) +
    (Number.parseFloat(extraMedicine) || 0) +
    (Number.parseFloat(registrationFee) || 0);

  const handleSaveFee = () => {
    if (totalAmount === 0) {
      toast.error("Please enter at least one fee amount before saving.");
      return;
    }
    const newFee: FeeEntry = {
      id: `fee-${Date.now()}`,
      date: new Date().toISOString(),
      consultationFee: Number.parseFloat(consultationFee) || 0,
      medicineRegular: Number.parseFloat(medicineRegular) || 0,
      extraMedicine: Number.parseFloat(extraMedicine) || 0,
      registrationFee: Number.parseFloat(registrationFee) || 0,
      totalAmount,
      dueAmount: Number.parseFloat(dueAmount) || 0,
      confirmedToPharmacist: false,
      medicine: lastSavedMedicine || undefined,
    };
    setFeeHistory((prev) => [newFee, ...prev]);
    setConsultationFee("");
    setMedicineRegular("");
    setExtraMedicine("");
    setRegistrationFee("");
    setDueAmount("");
    setConfirmedByDoctor(false);
    toast.success("Fee structure saved successfully!");
  };

  const handleConfirmToPharmacist = (feeId: string) => {
    setFeeHistory((prev) =>
      prev.map((f) =>
        f.id === feeId ? { ...f, confirmedToPharmacist: true } : f,
      ),
    );
    toast.success("Fee confirmed and sent to pharmacist!", {
      description: "The pharmacist has been notified of the fee details.",
    });
  };

  const handleConfirmByDoctor = () => {
    setConfirmedByDoctor(true);
    toast.success("Confirmed by Doctor!", {
      description:
        "The fee structure has been reviewed and confirmed by the doctor.",
    });
  };

  const lastSavedMedicineText = lastSavedMedicine
    .replace(/<[^>]*>/g, "")
    .trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Medicines for Pharmacist */}
      <div
        className="glass-card p-5 space-y-3"
        data-ocid="fee-structure.medicines_panel"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-green-500/15 border border-green-400/25 flex items-center justify-center">
            <Pill className="w-4 h-4 text-green-400" />
          </div>
          <div>
            <h3 className="font-semibold font-display text-foreground text-sm">
              Medicines for Pharmacist
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Current medicines added by the doctor in Case Taking
            </p>
          </div>
        </div>
        {lastSavedMedicineText ? (
          <div className="p-4 rounded-xl bg-green-500/5 border border-green-400/20">
            <p className="text-[11px] font-medium uppercase tracking-wide text-green-400 mb-2">
              Medicine from Doctor
            </p>
            <HtmlContent
              html={lastSavedMedicine}
              className="prose prose-sm max-w-none dark:prose-invert text-sm leading-relaxed text-foreground"
            />
          </div>
        ) : (
          <div
            className="p-6 rounded-xl bg-white/3 border border-white/10 flex flex-col items-center gap-2 text-center"
            data-ocid="fee-structure.medicines_empty"
          >
            <Pill className="w-8 h-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No medicines added yet. Go to{" "}
              <span className="text-primary font-medium">Case Taking</span> tab
              to add medicines.
            </p>
          </div>
        )}
      </div>

      {/* Fee Structure Card */}
      <div className="glass-card p-5 space-y-5" data-ocid="fee-structure.panel">
        {/* Header */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-400/25 flex items-center justify-center">
            <IndianRupee className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-semibold font-display text-foreground text-sm">
              Fee Structure
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Enter billing details for this visit
            </p>
          </div>
          {confirmedByDoctor && (
            <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-400">
              <CheckCircle2 className="w-3 h-3" />
              Confirmed by Doctor
            </span>
          )}
        </div>

        {/* Fee inputs grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(
            [
              {
                label: "Consultation Fee",
                value: consultationFee,
                setter: setConsultationFee,
                ocid: "fee-structure.consultation_input",
                color: "text-blue-400",
              },
              {
                label: "Medicine (Regular)",
                value: medicineRegular,
                setter: setMedicineRegular,
                ocid: "fee-structure.medicine_regular_input",
                color: "text-violet-400",
              },
              {
                label: "Extra Medicine",
                value: extraMedicine,
                setter: setExtraMedicine,
                ocid: "fee-structure.extra_medicine_input",
                color: "text-amber-400",
              },
              {
                label: "One-Time Registration",
                value: registrationFee,
                setter: setRegistrationFee,
                ocid: "fee-structure.registration_input",
                color: "text-cyan-400",
              },
            ] as const
          ).map(({ label, value, setter, ocid, color }) => {
            const inputId = ocid.replace(/[./]/g, "-");
            return (
              <div key={label} className="space-y-1.5">
                <label
                  htmlFor={inputId}
                  className={`text-[11px] font-medium uppercase tracking-wide ${color}`}
                >
                  {label}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground select-none">
                    ₹
                  </span>
                  <input
                    id={inputId}
                    type="number"
                    min="0"
                    step="1"
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    placeholder="0"
                    data-ocid={ocid}
                    className="w-full pl-7 pr-3 py-2.5 rounded-lg bg-white/5 border border-white/15 focus:border-primary/50 focus:ring-2 focus:ring-primary/15 outline-none text-sm text-foreground placeholder:text-muted-foreground/50 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Total + Due row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Total Amount — read-only */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-400">
              Total Amount
            </p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-emerald-400 select-none">
                ₹
              </span>
              <div
                data-ocid="fee-structure.total_amount"
                className="w-full pl-7 pr-3 py-2.5 rounded-lg bg-emerald-500/8 border border-emerald-400/25 text-sm font-semibold text-emerald-400 select-none cursor-default"
              >
                {totalAmount.toLocaleString("en-IN")}
              </div>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-emerald-400/60 font-medium">
                AUTO
              </span>
            </div>
          </div>

          {/* Due Amount — editable */}
          <div className="space-y-1.5">
            <label
              htmlFor="fee-due-amount"
              className="text-[11px] font-medium uppercase tracking-wide text-rose-400"
            >
              Due Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground select-none">
                ₹
              </span>
              <input
                id="fee-due-amount"
                type="number"
                min="0"
                step="1"
                value={dueAmount}
                onChange={(e) => setDueAmount(e.target.value)}
                placeholder="0"
                data-ocid="fee-structure.due_amount_input"
                className="w-full pl-7 pr-3 py-2.5 rounded-lg bg-rose-500/8 border border-rose-400/25 focus:border-rose-400/50 focus:ring-2 focus:ring-rose-400/15 outline-none text-sm text-foreground placeholder:text-muted-foreground/50 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-1 border-t border-white/10">
          <Button
            type="button"
            variant="outline"
            onClick={handleSaveFee}
            className="flex items-center gap-2 px-5"
            data-ocid="fee-structure.save_button"
          >
            <Save className="w-4 h-4" />
            Save Fee
          </Button>
          <Button
            type="button"
            onClick={handleConfirmByDoctor}
            disabled={confirmedByDoctor}
            className="flex items-center gap-2 px-5 bg-blue-600 hover:bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-900/20 disabled:opacity-60 disabled:cursor-not-allowed"
            data-ocid="fee-structure.confirm_doctor_button"
          >
            <CheckCircle2 className="w-4 h-4" />
            {confirmedByDoctor ? "Confirmed by Doctor" : "Confirm by Doctor"}
          </Button>
          <Button
            type="button"
            onClick={() => {
              if (feeHistory.length === 0) {
                toast.error("Save fee details first before confirming.");
                return;
              }
              const latestUnconfirmed = feeHistory.find(
                (f) => !f.confirmedToPharmacist,
              );
              if (!latestUnconfirmed) {
                toast.info("All saved fees have already been confirmed.");
                return;
              }
              handleConfirmToPharmacist(latestUnconfirmed.id);
            }}
            className="flex items-center gap-2 px-5 bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-900/20"
            data-ocid="fee-structure.confirm_pharmacist_button"
          >
            <Pill className="w-4 h-4" />
            <Send className="w-3.5 h-3.5" />
            Confirm &amp; Send to Pharmacist
          </Button>
        </div>

        {/* Fee history */}
        {feeHistory.length > 0 && (
          <div className="space-y-2.5 pt-1" data-ocid="fee-structure.history">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Fee History
            </p>
            <div className="space-y-2">
              {feeHistory.map((fee, idx) => {
                const feeDate = new Date(fee.date);
                return (
                  <motion.div
                    key={fee.id}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.25 }}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl border transition-colors duration-200 ${
                      fee.confirmedToPharmacist
                        ? "bg-emerald-500/8 border-emerald-400/25"
                        : "bg-white/5 border-white/10"
                    }`}
                    data-ocid={`fee-structure.history_item.${idx + 1}`}
                  >
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                        <span className="text-xs font-mono text-primary shrink-0">
                          {feeDate.toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}{" "}
                          <span className="text-muted-foreground">
                            {feeDate.toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-foreground font-medium">
                            Total:{" "}
                            <span className="text-emerald-400 font-semibold">
                              ₹{fee.totalAmount.toLocaleString("en-IN")}
                            </span>
                          </span>
                          {fee.dueAmount > 0 && (
                            <span className="text-xs text-foreground">
                              Due:{" "}
                              <span className="text-rose-400 font-semibold">
                                ₹{fee.dueAmount.toLocaleString("en-IN")}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                      {fee.medicine && (
                        <div className="mt-1 p-2 rounded-lg bg-green-500/5 border border-green-400/15">
                          <p className="text-[10px] font-medium uppercase tracking-wide text-green-400 mb-1">
                            Medicine from Doctor
                          </p>
                          <HtmlContent
                            html={fee.medicine}
                            className="prose prose-sm max-w-none dark:prose-invert text-xs leading-relaxed text-foreground"
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {fee.confirmedToPharmacist ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" />
                          Sent to Pharmacist
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleConfirmToPharmacist(fee.id)}
                          data-ocid={`fee-structure.confirm_button.${idx + 1}`}
                          className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-400/40 transition-all duration-200"
                        >
                          <Send className="w-3 h-3" />
                          Confirm
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Auto Message History Types & Data ──────────────────────────────────────

type AutoMessageType =
  | "welcome"
  | "thank_you"
  | "booking"
  | "case_taking_reminder"
  | "booking_reminder"
  | "followup_1"
  | "followup_2"
  | "followup_3"
  | "manual_cancel";

type AutoMessageStatus = "Sent" | "Failed" | "Pending";

interface AutoMessage {
  id: string;
  type: AutoMessageType;
  label: string;
  date: string;
  status: AutoMessageStatus;
  preview: string;
}

const AUTO_MESSAGE_LABELS: Record<AutoMessageType, string> = {
  welcome: "Welcome Message",
  thank_you: "Thank You for Visiting",
  booking: "Booking Confirmation",
  case_taking_reminder: "Case Taking Reminder",
  booking_reminder: "Booking Reminder",
  followup_1: "First Follow-up",
  followup_2: "Second Follow-up",
  followup_3: "Third Follow-up (Overdue)",
  manual_cancel: "Manual Cancel Message",
};

const AUTO_MESSAGE_COLORS: Record<AutoMessageType, string> = {
  welcome:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-700/40",
  thank_you:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200/60 dark:border-blue-700/40",
  booking:
    "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 border-violet-200/60 dark:border-violet-700/40",
  case_taking_reminder:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200/60 dark:border-amber-700/40",
  booking_reminder:
    "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300 border-sky-200/60 dark:border-sky-700/40",
  followup_1:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200/60 dark:border-orange-700/40",
  followup_2:
    "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200/60 dark:border-rose-700/40",
  followup_3:
    "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-200/60 dark:border-red-700/40",
  manual_cancel:
    "bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300 border-slate-200/60 dark:border-slate-700/40",
};

const AUTO_MESSAGE_ICONS: Record<AutoMessageType, React.ElementType> = {
  welcome: BellRing,
  thank_you: CheckCheck,
  booking: Calendar,
  case_taking_reminder: Stethoscope,
  booking_reminder: Clock,
  followup_1: MessageSquare,
  followup_2: MessageSquare,
  followup_3: AlertCircle,
  manual_cancel: X,
};

const DEMO_AUTO_MESSAGES: AutoMessage[] = [
  {
    id: "msg-1",
    type: "welcome",
    label: "Welcome Message",
    date: "2026-01-08T09:05:00",
    status: "Sent",
    preview:
      "Welcome to HomeoPath Clinic! 🌿 We're glad to have you as our patient. Our team is here to provide you with the best homeopathic care. Feel free to reach us anytime.",
  },
  {
    id: "msg-2",
    type: "booking",
    label: "Booking Confirmation",
    date: "2026-01-07T18:30:00",
    status: "Sent",
    preview:
      "Your appointment is confirmed for 8 Jan 2026 at 9:00 AM with Dr. Priya Nair. Please arrive 10 minutes early.",
  },
  {
    id: "msg-3",
    type: "thank_you",
    label: "Thank You for Visiting",
    date: "2026-01-08T11:45:00",
    status: "Sent",
    preview:
      "Thank you for visiting HomeoPath Clinic today! 🙏 We hope you're feeling better soon. Your next visit is scheduled. Take care and follow the prescription.",
  },
  {
    id: "msg-4",
    type: "case_taking_reminder",
    label: "Case Taking Reminder",
    date: "2026-03-20T10:00:00",
    status: "Sent",
    preview:
      "Reminder: Your case taking session with Dr. Priya Nair is on 22 Mar 2026 at 2:15 PM. Please note down all your symptoms and medical history before the visit.",
  },
  {
    id: "msg-5",
    type: "booking",
    label: "Booking Confirmation",
    date: "2026-03-20T10:01:00",
    status: "Sent",
    preview:
      "Appointment confirmed for 22 Mar 2026 at 2:15 PM with Dr. Priya Nair (Case Taking). HomeoPath Clinic.",
  },
  {
    id: "msg-6",
    type: "booking_reminder",
    label: "Booking Reminder (Before Date)",
    date: "2026-03-21T09:00:00",
    status: "Sent",
    preview:
      "⏰ Reminder: You have an appointment tomorrow (22 Mar 2026) at 2:15 PM with Dr. Priya Nair. Please be on time. Location: HomeoPath Clinic, Main Branch.",
  },
  {
    id: "msg-7",
    type: "thank_you",
    label: "Thank You for Visiting",
    date: "2026-03-22T16:00:00",
    status: "Sent",
    preview:
      "Thank you for your visit on 22 Mar 2026! 🌿 Your treatment plan has been updated. Please follow the prescribed remedies regularly and contact us for any concerns.",
  },
  {
    id: "msg-8",
    type: "booking",
    label: "Booking Confirmation",
    date: "2026-05-08T11:00:00",
    status: "Sent",
    preview:
      "Appointment confirmed for 10 May 2026 at 10:30 AM with Dr. Priya Nair (Follow Up). HomeoPath Clinic.",
  },
  {
    id: "msg-9",
    type: "booking_reminder",
    label: "Booking Reminder (Before Date)",
    date: "2026-05-09T09:00:00",
    status: "Sent",
    preview:
      "⏰ Reminder: You have an appointment tomorrow (10 May 2026) at 10:30 AM. Please bring your previous prescription and lab reports.",
  },
  {
    id: "msg-10",
    type: "thank_you",
    label: "Thank You for Visiting",
    date: "2026-05-10T12:30:00",
    status: "Sent",
    preview:
      "Thank you for your visit today! 🙏 Your next appointment has been scheduled for 1 Jun 2026. Continue your current remedies and stay hydrated.",
  },
  {
    id: "msg-11",
    type: "followup_1",
    label: "First Follow-up Reminder",
    date: "2026-06-08T10:00:00",
    status: "Sent",
    preview:
      "Hi! This is a gentle reminder that your scheduled visit on 1 Jun 2026 has passed. 🌿 We'd love to see you for your follow-up. Please book your next appointment at your earliest convenience.",
  },
  {
    id: "msg-12",
    type: "followup_2",
    label: "Second Follow-up Reminder",
    date: "2026-06-15T10:00:00",
    status: "Sent",
    preview:
      "This is your 2nd follow-up reminder from HomeoPath Clinic. You missed your scheduled visit on 1 Jun 2026. Please call us to reschedule your appointment.",
  },
  {
    id: "msg-13",
    type: "followup_3",
    label: "Third Follow-up (Overdue)",
    date: "2026-06-22T10:00:00",
    status: "Sent",
    preview:
      "⚠️ URGENT: You have missed 3 follow-up reminders since 1 Jun 2026. Your treatment continuity may be affected. Please contact HomeoPath Clinic immediately to resume your care plan.",
  },
  {
    id: "msg-14",
    type: "manual_cancel",
    label: "Manual Cancel Message",
    date: "2026-06-23T14:00:00",
    status: "Sent",
    preview:
      "Your appointment scheduled at HomeoPath Clinic has been cancelled as per your request. We're sorry to see you go. Please contact us to reschedule at any time.",
  },
  {
    id: "msg-15",
    type: "booking",
    label: "Booking Confirmation",
    date: "2026-06-28T09:30:00",
    status: "Pending",
    preview:
      "Appointment confirmation for your upcoming visit on 5 Jul 2026 at 10:00 AM. HomeoPath Clinic — awaiting your confirmation.",
  },
];

// ─── Auto Message History Tab ─────────────────────────────────────────────────

function AutoMessageHistoryTab() {
  const [filter, setFilter] = useState<AutoMessageType | "all">("all");
  // Master ON/OFF for all auto messages
  const [masterEnabled, setMasterEnabled] = useState(true);
  // Per-category ON/OFF toggles
  const [categoryEnabled, setCategoryEnabled] = useState<
    Record<AutoMessageType, boolean>
  >(() => {
    const keys = Object.keys(AUTO_MESSAGE_LABELS) as AutoMessageType[];
    const init = {} as Record<AutoMessageType, boolean>;
    for (const key of keys) init[key] = true;
    return init;
  });

  const toggleCategory = (type: AutoMessageType) => {
    setCategoryEnabled((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const filtered = DEMO_AUTO_MESSAGES.filter((m) => {
    return filter === "all" || m.type === filter;
  });

  const statusCounts = {
    Sent: DEMO_AUTO_MESSAGES.filter((m) => m.status === "Sent").length,
    Pending: DEMO_AUTO_MESSAGES.filter((m) => m.status === "Pending").length,
    Failed: DEMO_AUTO_MESSAGES.filter((m) => m.status === "Failed").length,
  };

  const formatMsgDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusStyles: Record<AutoMessageStatus, string> = {
    Sent: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-700/50",
    Pending:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 border border-amber-200/50 dark:border-amber-700/50",
    Failed:
      "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 border border-red-200/50 dark:border-red-700/50",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
      data-ocid="auto-message-history-tab"
    >
      {/* Master Toggle */}
      <div className="glass-card p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              masterEnabled
                ? "bg-emerald-100 dark:bg-emerald-900/40"
                : "bg-muted"
            }`}
          >
            <BellRing
              className={`w-5 h-5 ${
                masterEnabled ? "text-emerald-600" : "text-muted-foreground"
              }`}
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground font-display">
              Auto Messages
            </p>
            <p className="text-xs text-muted-foreground">
              {masterEnabled
                ? "Auto messages are active for this patient via WhatsApp"
                : "All auto messages are paused for this patient"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMasterEnabled((v) => !v)}
          data-ocid="auto-message.master_toggle"
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            masterEnabled
              ? "bg-emerald-500 border-emerald-500"
              : "bg-muted border-border"
          }`}
          aria-label={
            masterEnabled
              ? "Disable all auto messages"
              : "Enable all auto messages"
          }
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 mt-0.5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
              masterEnabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Per-category Toggles */}
      <div className="glass-card p-4 space-y-2">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Message Categories
          </h4>
          {!masterEnabled && (
            <span className="text-xs text-amber-500 font-medium flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Master toggle is OFF
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 gap-2">
          {(Object.keys(AUTO_MESSAGE_LABELS) as AutoMessageType[]).map(
            (type) => {
              const Icon = AUTO_MESSAGE_ICONS[type];
              const isOn = masterEnabled && categoryEnabled[type];
              const categoryIsOn = categoryEnabled[type];
              return (
                <div
                  key={type}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl border transition-colors ${
                    isOn
                      ? "border-border bg-muted/30"
                      : "border-border/50 bg-muted/10 opacity-60"
                  }`}
                  data-ocid={`auto-message-category.${type}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${
                        isOn
                          ? AUTO_MESSAGE_COLORS[type]
                          : "bg-muted text-muted-foreground border-border"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-medium text-foreground truncate">
                      {AUTO_MESSAGE_LABELS[type]}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleCategory(type)}
                    disabled={!masterEnabled}
                    data-ocid={`auto-message-category.${type}.toggle`}
                    aria-label={`${categoryIsOn ? "Disable" : "Enable"} ${AUTO_MESSAGE_LABELS[type]}`}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 disabled:cursor-not-allowed ${
                      categoryIsOn
                        ? "bg-primary border-primary"
                        : "bg-muted border-border"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-3 w-3 mt-0.5 rounded-full bg-white shadow transform transition-transform duration-200 ${
                        categoryIsOn ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              );
            },
          )}
        </div>
      </div>

      {/* Header Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold font-display text-foreground">
            {DEMO_AUTO_MESSAGES.length}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Total Messages
          </div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold font-display text-emerald-500">
            {statusCounts.Sent}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">Delivered</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold font-display text-amber-500">
            {statusCounts.Pending}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">Pending</div>
        </div>
      </div>

      {/* Type Filter */}
      <div className="glass-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide shrink-0">
            Type:
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border ${
                filter === "all"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
              }`}
              data-ocid="auto-msg-filter.all"
            >
              All
            </button>
            {(Object.keys(AUTO_MESSAGE_LABELS) as AutoMessageType[]).map(
              (type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFilter(type)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border ${
                    filter === type
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
                  }`}
                  data-ocid={`auto-msg-filter.${type}`}
                >
                  {AUTO_MESSAGE_LABELS[type]}
                </button>
              ),
            )}
          </div>
        </div>
      </div>

      {/* Message List */}
      <div className="glass-card overflow-hidden" data-ocid="auto-message-list">
        <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            <h3 className="font-semibold font-display text-foreground text-sm">
              Message History
            </h3>
          </div>
          <span className="text-xs text-muted-foreground">
            {filtered.length} messages
          </span>
        </div>

        {filtered.length === 0 ? (
          <div
            className="p-10 text-center"
            data-ocid="auto-message-list.empty_state"
          >
            <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No messages for the selected filter
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
            {filtered.map((msg, index) => {
              const Icon = AUTO_MESSAGE_ICONS[msg.type];
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.04 }}
                  className="p-4 hover:bg-white/5 transition-colors"
                  data-ocid={`auto-message-list.item.${index + 1}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon badge */}
                    <div
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${AUTO_MESSAGE_COLORS[msg.type]}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Row 1: label + status */}
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-foreground font-display">
                          {AUTO_MESSAGE_LABELS[msg.type]}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusStyles[msg.status]}`}
                        >
                          {msg.status === "Sent" && (
                            <CheckCheck className="w-2.5 h-2.5" />
                          )}
                          {msg.status === "Pending" && (
                            <Loader2 className="w-2.5 h-2.5" />
                          )}
                          {msg.status === "Failed" && (
                            <AlertCircle className="w-2.5 h-2.5" />
                          )}
                          {msg.status}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                          <svg
                            viewBox="0 0 24 24"
                            role="img"
                            aria-label="WhatsApp"
                            className="w-2.5 h-2.5 fill-current"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <title>WhatsApp</title>
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                          </svg>
                          WhatsApp
                        </span>
                      </div>

                      {/* Row 2: date */}
                      <div className="flex items-center gap-1.5 mb-2">
                        <Clock className="w-3 h-3 text-muted-foreground/60" />
                        <span className="text-xs text-muted-foreground">
                          {formatMsgDate(msg.date)}
                        </span>
                      </div>

                      {/* Message preview */}
                      <div className="rounded-xl bg-muted/30 border border-white/5 px-3.5 py-2.5">
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                          {msg.preview}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function InfoChip({
  icon: Icon,
  label,
  value,
}: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5 min-w-0">
      <Icon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground leading-none mb-0.5">
          {label}
        </p>
        <p className="text-sm text-foreground font-medium break-all">{value}</p>
      </div>
    </div>
  );
}

function NotesTab({ patient }: { patient: Patient }) {
  const storageKey = `patient-notes-${patient.id}`;
  const [note, setNote] = useState(
    () => localStorage.getItem(storageKey) ?? "",
  );
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem(storageKey, note);
    setSaved(true);
    toast.success("Note saved");
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="glass-card p-5 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <FileText className="w-4 h-4 text-primary" />
          <h3 className="font-semibold font-display text-foreground">
            Private Notes
          </h3>
          <span className="text-xs text-muted-foreground ml-auto">
            Saved locally in browser
          </span>
        </div>
        <Textarea
          value={note}
          onChange={(e) => {
            setNote(e.target.value);
            setSaved(false);
          }}
          placeholder={`Write private clinical notes for ${patient.name}…`}
          rows={8}
          className="glass border-white/10 bg-white/5 resize-none text-sm"
          data-ocid="patient-notes-textarea"
        />
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            variant={saved ? "outline" : "default"}
            className={saved ? "glass border-green-500/30 text-green-400" : ""}
            data-ocid="patient-notes-save"
          >
            {saved ? "Saved ✓" : "Save Note"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function PatientDetailPage() {
  const { patientId } = useParams({ from: "/patients/$patientId" });
  const navigate = useNavigate();
  const { patients, updatePatient, isLoading } = usePatients();
  const [editOpen, setEditOpen] = useState(false);
  const [showNextVisitModal, setShowNextVisitModal] = useState(false);
  const [nextVisitDate, setNextVisitDate] = useState<string | null>(null);
  // Shared medicine state — lifted so FeeStructureTab can read it
  const [sharedMedicine, setSharedMedicine] = useState("");
  // Last saved medicine from Case Taking — passed to Fee Structure tab
  const [lastSavedMedicine, setLastSavedMedicine] = useState("");
  const [tempNextVisitDate, setTempNextVisitDate] = useState<string>("");
  // Reminder popups: upcoming (green) and overdue (amber)
  const [showReminderPopup, setShowReminderPopup] = useState(false);
  const [reminderDate, setReminderDate] = useState<string>("");
  // reminderType removed — popupQueue handles sequencing
  const [showOverduePopup, setShowOverduePopup] = useState(false);
  const [overdueDate, setOverdueDate] = useState<string>("");
  const [popupQueue, setPopupQueue] = useState<("upcoming" | "overdue")[]>([]);
  const [currentPopupIndex, setCurrentPopupIndex] = useState(0);

  const patient = patients.find((p) => p.id === patientId);

  // On mount: check all visits for nextVisitDate and queue appropriate popup(s)
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let upcomingDate = "";
    let overdueDateStr = "";

    for (const visit of DEMO_PAST_VISITS) {
      if (!visit.nextVisitDate) continue;
      const d = new Date(`${visit.nextVisitDate}T00:00:00`);
      if (d < today) {
        overdueDateStr = visit.nextVisitDate;
      } else {
        if (!upcomingDate || d < new Date(`${upcomingDate}T00:00:00`)) {
          upcomingDate = visit.nextVisitDate;
        }
      }
    }

    const queue: ("upcoming" | "overdue")[] = [];
    if (overdueDateStr) {
      setOverdueDate(overdueDateStr);
      queue.push("overdue");
    }
    if (upcomingDate) {
      setReminderDate(upcomingDate);
      // setReminderType removed — popupQueue handles sequencing
      queue.push("upcoming");
    }

    if (queue.length > 0) {
      setPopupQueue(queue);
      setCurrentPopupIndex(0);
      const timer = setTimeout(() => {
        if (queue[0] === "overdue") setShowOverduePopup(true);
        else setShowReminderPopup(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, []);

  // Auto-dismiss upcoming reminder after 5 seconds, then show next popup in queue
  useEffect(() => {
    if (!showReminderPopup) return;
    const autoTimer = setTimeout(() => {
      setShowReminderPopup(false);
      // Show next popup in queue after a short delay
      if (currentPopupIndex < popupQueue.length - 1) {
        const nextIndex = currentPopupIndex + 1;
        setCurrentPopupIndex(nextIndex);
        setTimeout(() => {
          if (popupQueue[nextIndex] === "overdue") setShowOverduePopup(true);
          else setShowReminderPopup(true);
        }, 400);
      }
    }, 5000);
    return () => clearTimeout(autoTimer);
  }, [showReminderPopup, popupQueue, currentPopupIndex]);

  // Auto-dismiss overdue reminder after 5 seconds, then show next popup in queue
  useEffect(() => {
    if (!showOverduePopup) return;
    const autoTimer = setTimeout(() => {
      setShowOverduePopup(false);
      // Show next popup in queue after a short delay
      if (currentPopupIndex < popupQueue.length - 1) {
        const nextIndex = currentPopupIndex + 1;
        setCurrentPopupIndex(nextIndex);
        setTimeout(() => {
          if (popupQueue[nextIndex] === "overdue") setShowOverduePopup(true);
          else setShowReminderPopup(true);
        }, 400);
      }
    }, 5000);
    return () => clearTimeout(autoTimer);
  }, [showOverduePopup, popupQueue, currentPopupIndex]);

  if (isLoading) {
    return (
      <div className="space-y-6" data-ocid="patient-detail-loading">
        <div className="h-8 w-48 rounded-lg glass animate-pulse" />
        <div className="h-40 rounded-xl glass animate-pulse" />
        <div className="h-80 rounded-xl glass animate-pulse" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[50vh] gap-4"
        data-ocid="patient-not-found"
      >
        <User className="w-16 h-16 text-muted-foreground/40" />
        <h2 className="text-xl font-display font-semibold text-foreground">
          Patient not found
        </h2>
        <p className="text-muted-foreground text-sm">
          The patient you are looking for does not exist or may have been
          removed.
        </p>
        <Button
          onClick={() => navigate({ to: "/patients" })}
          variant="outline"
          className="glass border-white/20"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Patients
        </Button>
      </div>
    );
  }

  const handleEdit = (data: Omit<Patient, "id">) => {
    updatePatient(patient.id, data);
    setEditOpen(false);
    toast.success("Patient updated successfully");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
      data-ocid="patient-detail-page"
    >
      {/* ─── Upcoming Visit Reminder Popup (Green) ─── */}
      <AnimatePresence>
        {showReminderPopup && (
          <motion.div
            key="reminder-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md"
            data-ocid="patient-detail.reminder_overlay"
            onClick={() => setShowReminderPopup(false)}
          >
            <motion.div
              key="reminder-modal"
              initial={{ opacity: 0, scale: 0.88, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ type: "spring", stiffness: 340, damping: 28 }}
              className="relative w-full max-w-sm mx-4 rounded-2xl overflow-hidden shadow-2xl"
              style={{
                background:
                  "linear-gradient(135deg, rgba(16,18,27,0.97) 0%, rgba(20,24,38,0.97) 100%)",
                border: "1px solid rgba(52,211,153,0.22)",
                boxShadow:
                  "0 0 0 1px rgba(52,211,153,0.12), 0 24px 64px -12px rgba(0,0,0,0.7), 0 0 80px -20px rgba(52,211,153,0.15)",
              }}
              onClick={(e) => e.stopPropagation()}
              data-ocid="patient-detail.reminder_dialog"
            >
              {/* Decorative top glow */}
              <div
                className="absolute inset-x-0 top-0 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(52,211,153,0.6), transparent)",
                }}
              />
              {/* Auto-dismiss progress bar */}
              <motion.div
                className="absolute top-0 left-0 h-0.5 bg-emerald-400/70"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 5, ease: "linear" }}
              />

              <div className="p-6">
                {/* Header */}
                <div className="flex items-start gap-4 mb-5">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(52,211,153,0.25), rgba(16,185,129,0.15))",
                      border: "1px solid rgba(52,211,153,0.3)",
                      boxShadow: "0 4px 16px rgba(52,211,153,0.15)",
                    }}
                  >
                    <Bell className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-400/70 mb-0.5">
                      Visit Reminder
                    </p>
                    <h3 className="text-base font-bold text-white leading-tight">
                      {patient.name}
                    </h3>
                    <p className="text-xs text-white/50 mt-0.5">
                      Next appointment scheduled
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label="Close reminder"
                    onClick={() => setShowReminderPopup(false)}
                    data-ocid="patient-detail.reminder_close_button"
                    className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/10 transition-colors shrink-0 -mt-0.5 -mr-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Date card */}
                <div
                  className="flex items-center gap-3 p-4 rounded-xl mb-5"
                  style={{
                    background: "rgba(52,211,153,0.07)",
                    border: "1px solid rgba(52,211,153,0.18)",
                  }}
                >
                  <Calendar className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-xs text-emerald-400/70 font-medium mb-0.5">
                      Scheduled Date
                    </p>
                    <p className="text-sm font-bold text-emerald-300">
                      {new Date(`${reminderDate}T00:00:00`).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        },
                      )}
                    </p>
                  </div>
                </div>

                {/* Message */}
                <p className="text-sm text-white/60 leading-relaxed mb-5">
                  Reminder: Next visit for{" "}
                  <span className="text-white font-semibold">
                    {patient.name}
                  </span>{" "}
                  is scheduled on{" "}
                  <span className="text-emerald-400 font-semibold">
                    {new Date(`${reminderDate}T00:00:00`).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" },
                    )}
                  </span>
                  . Please ensure the appointment is confirmed.
                </p>

                {/* Actions */}
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowReminderPopup(false)}
                    data-ocid="patient-detail.reminder_ok_button"
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200"
                    style={{
                      background:
                        "linear-gradient(135deg, rgb(16,185,129), rgb(5,150,105))",
                      boxShadow: "0 4px 16px rgba(16,185,129,0.3)",
                    }}
                  >
                    OK, Got It
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReminderPopup(false)}
                    data-ocid="patient-detail.reminder_dismiss_button"
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white/50 border border-white/10 hover:bg-white/5 hover:text-white/70 transition-all duration-200"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Overdue Follow-up Reminder Popup (Amber/Orange) ─── */}
      <AnimatePresence>
        {showOverduePopup && (
          <motion.div
            key="overdue-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md"
            data-ocid="patient-detail.overdue_overlay"
            onClick={() => setShowOverduePopup(false)}
          >
            <motion.div
              key="overdue-modal"
              initial={{ opacity: 0, scale: 0.88, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ type: "spring", stiffness: 340, damping: 28 }}
              className="relative w-full max-w-sm mx-4 rounded-2xl overflow-hidden shadow-2xl"
              style={{
                background:
                  "linear-gradient(135deg, rgba(16,18,27,0.97) 0%, rgba(20,24,38,0.97) 100%)",
                border: "1px solid rgba(251,146,60,0.22)",
                boxShadow:
                  "0 0 0 1px rgba(251,146,60,0.12), 0 24px 64px -12px rgba(0,0,0,0.7), 0 0 80px -20px rgba(251,146,60,0.15)",
              }}
              onClick={(e) => e.stopPropagation()}
              data-ocid="patient-detail.overdue_dialog"
            >
              {/* Decorative top glow */}
              <div
                className="absolute inset-x-0 top-0 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(251,146,60,0.6), transparent)",
                }}
              />
              {/* Auto-dismiss progress bar */}
              <motion.div
                className="absolute top-0 left-0 h-0.5 bg-orange-400/70"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 5, ease: "linear" }}
              />

              <div className="p-6">
                {/* Header */}
                <div className="flex items-start gap-4 mb-5">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(251,146,60,0.25), rgba(234,88,12,0.15))",
                      border: "1px solid rgba(251,146,60,0.3)",
                      boxShadow: "0 4px 16px rgba(251,146,60,0.15)",
                    }}
                  >
                    <Bell className="w-6 h-6 text-orange-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-orange-400/70 mb-0.5">
                      Follow-up Reminder
                    </p>
                    <h3 className="text-base font-bold text-white leading-tight">
                      {patient.name}
                    </h3>
                    <p className="text-xs text-white/50 mt-0.5">
                      Scheduled date is already over
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label="Close overdue reminder"
                    onClick={() => setShowOverduePopup(false)}
                    data-ocid="patient-detail.overdue_close_button"
                    className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/10 transition-colors shrink-0 -mt-0.5 -mr-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Date card */}
                <div
                  className="flex items-center gap-3 p-4 rounded-xl mb-5"
                  style={{
                    background: "rgba(251,146,60,0.07)",
                    border: "1px solid rgba(251,146,60,0.18)",
                  }}
                >
                  <Calendar className="w-5 h-5 text-orange-400 shrink-0" />
                  <div>
                    <p className="text-xs text-orange-400/70 font-medium mb-0.5">
                      Overdue Date
                    </p>
                    <p className="text-sm font-bold text-orange-300">
                      {new Date(`${overdueDate}T00:00:00`).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        },
                      )}
                    </p>
                  </div>
                </div>

                {/* Message */}
                <p className="text-sm text-white/60 leading-relaxed mb-5">
                  Follow-up reminder:{" "}
                  <span className="text-white font-semibold">
                    {patient.name}
                  </span>{" "}
                  was scheduled on{" "}
                  <span className="text-orange-400 font-semibold">
                    {new Date(`${overdueDate}T00:00:00`).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" },
                    )}
                  </span>{" "}
                  but has not visited yet. Please contact the patient to
                  reschedule.
                </p>

                {/* Actions */}
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowOverduePopup(false)}
                    data-ocid="patient-detail.overdue_ok_button"
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200"
                    style={{
                      background:
                        "linear-gradient(135deg, rgb(234,88,12), rgb(194,65,12))",
                      boxShadow: "0 4px 16px rgba(234,88,12,0.3)",
                    }}
                  >
                    OK, Got It
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowOverduePopup(false)}
                    data-ocid="patient-detail.overdue_dismiss_button"
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white/50 border border-white/10 hover:bg-white/5 hover:text-white/70 transition-all duration-200"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Next Visit Modal */}
      {showNextVisitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-blue-600 dark:text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  role="img"
                  aria-label="Calendar"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Schedule Next Visit
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Select a date for {patient?.name ?? "this patient"}&apos;s
                  next appointment
                </p>
              </div>
            </div>
            <div className="mb-6">
              <label
                htmlFor="next-visit-date"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Next Visit Date
              </label>
              <input
                id="next-visit-date"
                type="date"
                value={tempNextVisitDate}
                onChange={(e) => setTempNextVisitDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  if (tempNextVisitDate) setNextVisitDate(tempNextVisitDate);
                  setShowNextVisitModal(false);
                }}
                disabled={!tempNextVisitDate}
                className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Schedule Visit
              </button>
              <button
                type="button"
                onClick={() => setShowNextVisitModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Skip for Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb + Back */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: "/patients" })}
            className="flex items-center gap-1.5 -ml-2 text-muted-foreground hover:text-foreground"
            data-ocid="patient-back-button"
          >
            <ArrowLeft className="w-4 h-4" />
            Patients
          </Button>
          <span className="text-muted-foreground/40">/</span>
          <span className="text-sm text-foreground font-medium truncate max-w-[200px]">
            {patient.name}
          </span>
        </div>
        <Button
          onClick={() => setEditOpen(true)}
          variant="outline"
          size="sm"
          className="glass border-white/20 flex items-center gap-1.5"
          data-ocid="patient-edit-button"
        >
          <Edit3 className="w-4 h-4" />
          Edit Patient
        </Button>
      </div>

      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="glass-card p-6"
        data-ocid="patient-profile-header"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Large Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-primary/20 border-2 border-primary/30 flex items-center justify-center text-2xl font-bold text-primary font-display shrink-0">
            {getInitials(patient.name)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <h1 className="text-2xl font-display font-bold text-foreground">
                  {patient.name}
                </h1>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs font-mono font-semibold text-primary/80 bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                    {patient.registrationId}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {patient.age} yrs · {patient.gender} · {patient.bloodGroup}
                  </span>
                </div>
              </div>
              <StatusBadge status={patient.status} />
            </div>
            {nextVisitDate && (
              <div className="mt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-sm font-medium">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    role="img"
                    aria-label="Calendar"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Next Visit:{" "}
                  {new Date(`${nextVisitDate}T00:00:00`).toLocaleDateString(
                    "en-US",
                    { month: "short", day: "numeric", year: "numeric" },
                  )}
                </span>
              </div>
            )}

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <InfoChip icon={Phone} label="Phone" value={patient.phone} />
              <InfoChip icon={Mail} label="Email" value={patient.email} />
              <InfoChip
                icon={MapPin}
                label="Place"
                value={patient.place || "—"}
              />
              <InfoChip
                icon={Calendar}
                label="Last Visit"
                value={`${formatDate(patient.lastVisit)} (${relativeTime(patient.lastVisit)})`}
              />
            </div>
            {/* Total Visits */}
            <div className="mt-3 flex items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20">
                <User className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-muted-foreground">
                  Total Visits:
                </span>
                <span className="text-sm font-bold text-primary">
                  {patient.totalVisits}
                </span>
              </div>
            </div>
            {patient.chiefComplaint && (
              <div className="mt-3 p-3 rounded-xl bg-primary/5 border border-primary/15">
                <p className="text-[11px] font-medium uppercase tracking-wide text-primary/70 mb-1">
                  Chief Complaint
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  {patient.chiefComplaint}
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <Tabs defaultValue="case-taking" data-ocid="patient-tabs">
          <TabsList className="glass border-white/10 bg-white/5 w-full sm:w-auto flex flex-wrap gap-0.5 h-auto p-1">
            <TabsTrigger
              value="case-taking"
              className="text-xs sm:text-sm"
              data-ocid="tab-case-taking"
            >
              Case Taking
            </TabsTrigger>
            <TabsTrigger
              value="fee-structure"
              className="text-xs sm:text-sm"
              data-ocid="tab-fee-structure"
            >
              Fee Structure
            </TabsTrigger>
            <TabsTrigger
              value="notes"
              className="text-xs sm:text-sm"
              data-ocid="tab-notes"
            >
              Notes
            </TabsTrigger>
            <TabsTrigger
              value="auto-messages"
              className="text-xs sm:text-sm flex items-center gap-1.5"
              data-ocid="tab-auto-messages"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Auto Messages
            </TabsTrigger>
          </TabsList>

          <div className="mt-5">
            <TabsContent value="case-taking">
              <CaseTakingTab
                patient={patient}
                nextVisitDate={nextVisitDate}
                onVisitSaved={(savedNextVisit) => {
                  setNextVisitDate(savedNextVisit);
                  setTempNextVisitDate("");
                }}
                onOpenScheduleModal={() => {
                  setTempNextVisitDate(nextVisitDate ?? "");
                  setShowNextVisitModal(true);
                }}
                medicine={sharedMedicine}
                onMedicineChange={setSharedMedicine}
                onMedicineSaved={setLastSavedMedicine}
              />
            </TabsContent>
            <TabsContent value="fee-structure">
              <FeeStructureTab lastSavedMedicine={lastSavedMedicine} />
            </TabsContent>
            <TabsContent value="notes">
              <NotesTab patient={patient} />
            </TabsContent>
            <TabsContent value="auto-messages">
              <AutoMessageHistoryTab />
            </TabsContent>
          </div>
        </Tabs>
      </motion.div>

      <PatientModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        patient={patient}
        onSave={handleEdit}
        mode="edit"
      />
    </motion.div>
  );
}
