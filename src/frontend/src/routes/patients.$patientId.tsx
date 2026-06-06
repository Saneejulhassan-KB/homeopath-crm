import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { appointments } from "@/data/appointments";
import { prescriptions } from "@/data/prescriptions";
import { usePatients } from "@/hooks/usePatients";
import type { Patient } from "@/types";
import {
  formatCurrency,
  formatDate,
  formatTime,
  getInitials,
  relativeTime,
} from "@/utils/formatters";
import { createRoute, useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Brain,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Edit3,
  FileText,
  Mail,
  MapPin,
  Mic,
  Paperclip,
  Phone,
  Pill,
  Plus,
  Save,
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

function CaseTakingTab({ patient }: { patient: Patient }) {
  const [symptoms, setSymptoms] = useState("");
  const [investigation, setInvestigation] = useState("");
  const [medicine, setMedicine] = useState("");
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
  const labInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const recordingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const handleSave = () => {
    if (!symptoms.trim() && !investigation.trim() && !medicine.trim()) {
      toast.error("Please fill in at least one field before saving.");
      return;
    }
    const newVisit: VisitEntry = {
      id: `visit-${Date.now()}`,
      date: new Date().toISOString(),
      symptoms,
      investigation,
      medicine,
      labFiles: labFiles.filter((f) => !f.isDemo),
      mediaFiles: mediaFiles.filter((f) => !f.isDemo),
    };
    setVisitHistory((prev) => [newVisit, ...prev]);
    setSymptoms("");
    setInvestigation("");
    setMedicine("");
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
    toast.success("Visit saved successfully!");
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Three text editor boxes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
            onChange={setMedicine}
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
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className="flex items-center gap-2 px-6"
          data-ocid="case-taking.save_button"
        >
          <Save className="w-4 h-4" />
          Save Visit
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
                      <button
                        type="button"
                        className="w-full flex items-start justify-between gap-3 p-4 text-left hover:bg-white/5 transition-colors duration-150"
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
                          </div>
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

const CASE_HISTORY: Record<
  string,
  { date: string; note: string; doctor: string }[]
> = {
  p001: [
    {
      date: "2026-04-05",
      note: "Follow-up: Natrum Muriaticum 1M prescribed. Patient reports reduced migraine frequency from 6x/month to 2x/month. Visual aura still present but less intense. Continue same remedy.",
      doctor: "Dr. Meera Joshi",
    },
    {
      date: "2026-02-10",
      note: "Initial consultation. Classic Nat-Mur constitutional picture confirmed. Grief suppressed after loss in 2024. Strong desire for salt, thirst for large quantities. Belladonna 30C for acute management.",
      doctor: "Dr. Meera Joshi",
    },
    {
      date: "2025-11-20",
      note: "Previous clinic records transferred. Patient had tried Allopathic treatment with partial relief. Decided to switch to homeopathy exclusively.",
      doctor: "Dr. Anand Verma",
    },
  ],
  p002: [
    {
      date: "2026-04-08",
      note: "Urticaria case — Apis Mellifica 30C prescribed. Burning-stinging wheals, better cold application, thirstless. Avoid heat triggers, dietary dairy restriction advised.",
      doctor: "Dr. Meera Joshi",
    },
    {
      date: "2026-03-01",
      note: "Seasonal allergic rhinitis flare. Allium Cepa 30C given for acute phase. Watery discharge, burning eyes, sneezing on waking.",
      doctor: "Dr. Meera Joshi",
    },
  ],
};

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

function StatPill({
  label,
  value,
  accent = false,
}: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div
      className={`glass-card px-4 py-3 text-center ${accent ? "border-primary/30" : ""}`}
    >
      <p
        className={`text-xl font-bold font-display ${accent ? "text-primary" : "text-foreground"}`}
      >
        {value}
      </p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

function OverviewTab({ patient }: { patient: Patient }) {
  const patientAppts = appointments.filter((a) => a.patientId === patient.id);
  const patientRx = prescriptions.filter((p) => p.patientId === patient.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatPill label="Total Visits" value={patient.totalVisits} accent />
        <StatPill label="Appointments" value={patientAppts.length} />
        <StatPill label="Prescriptions" value={patientRx.length} />
        <StatPill
          label="Consult Fee"
          value={formatCurrency(patient.consultationFee)}
        />
      </div>

      <div className="glass-card p-5 space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <Stethoscope className="w-4 h-4 text-primary" />
          <h3 className="font-semibold font-display text-foreground">
            Chief Complaint
          </h3>
        </div>
        <p className="text-sm text-foreground leading-relaxed">
          {patient.chiefComplaint}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="glass-card p-5 space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-4 h-4 text-primary" />
            <h3 className="font-semibold font-display text-foreground">
              Personal Info
            </h3>
          </div>
          <div className="space-y-3">
            <InfoChip
              icon={User}
              label="Blood Group"
              value={patient.bloodGroup}
            />
            <InfoChip icon={Mail} label="Email" value={patient.email} />
            <InfoChip icon={Phone} label="Phone" value={patient.phone} />
            <InfoChip
              icon={MapPin}
              label="Address"
              value={patient.address || "—"}
            />
          </div>
        </div>

        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-primary" />
            <h3 className="font-semibold font-display text-foreground">
              Recent Activity
            </h3>
          </div>
          {patientAppts.slice(0, 4).map((appt) => (
            <div key={appt.id} className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-foreground font-medium">
                  {formatDate(appt.date)}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {appt.notes}
                </p>
              </div>
              <StatusBadge
                status={appt.status}
                className="shrink-0 text-[10px]"
              />
            </div>
          ))}
          {patientAppts.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No appointments recorded.
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function CaseHistoryTab({ patient }: { patient: Patient }) {
  const history = CASE_HISTORY[patient.id] ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {history.length === 0 ? (
        <div
          className="glass-card p-12 flex flex-col items-center justify-center text-center gap-3"
          data-ocid="case-history-empty"
        >
          <FileText className="w-10 h-10 text-muted-foreground/50" />
          <p className="text-muted-foreground text-sm">
            No case history recorded yet.
          </p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
          <div className="space-y-5 pl-12">
            {history.map((entry, i) => (
              <motion.div
                key={`case-${entry.date}-${i}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1, duration: 0.3 }}
                className="relative"
              >
                <div className="absolute -left-[2.1rem] top-3 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                <div className="glass-card p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-primary font-mono">
                      {formatDate(entry.date)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {entry.doctor}
                    </span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">
                    {entry.note}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function PrescriptionsTab({ patient }: { patient: Patient }) {
  const patientRx = prescriptions.filter((p) => p.patientId === patient.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {patientRx.length === 0 ? (
        <div
          className="glass-card p-12 flex flex-col items-center justify-center text-center gap-3"
          data-ocid="prescriptions-empty"
        >
          <Pill className="w-10 h-10 text-muted-foreground/50" />
          <p className="text-muted-foreground text-sm">
            No prescriptions recorded yet.
          </p>
        </div>
      ) : (
        patientRx.map((rx, i) => (
          <motion.div
            key={rx.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
            className="glass-card p-5 space-y-3"
            data-ocid="prescription-card"
          >
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <p className="font-semibold text-foreground font-display">
                  {rx.remedy}
                </p>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  {rx.potency} · {rx.dosage} · {rx.frequency}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={rx.status} />
                <span className="text-xs text-muted-foreground">
                  {formatDate(rx.date)}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {rx.symptoms.map((sym) => (
                <span
                  key={sym}
                  className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-medium"
                >
                  {sym}
                </span>
              ))}
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed border-t border-white/10 pt-3">
              {rx.caseNotes}
            </p>

            <p className="text-xs text-muted-foreground">
              Duration:{" "}
              <span className="text-foreground font-medium">{rx.duration}</span>
            </p>
          </motion.div>
        ))
      )}
    </motion.div>
  );
}

function AppointmentsTab({ patient }: { patient: Patient }) {
  const patientAppts = appointments.filter((a) => a.patientId === patient.id);

  const typeIcon: Record<string, string> = {
    consultation: "🩺",
    "follow-up": "🔄",
    emergency: "🚨",
    online: "💻",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-3"
    >
      {patientAppts.length === 0 ? (
        <div
          className="glass-card p-12 flex flex-col items-center justify-center text-center gap-3"
          data-ocid="appointments-empty"
        >
          <Calendar className="w-10 h-10 text-muted-foreground/50" />
          <p className="text-muted-foreground text-sm">
            No appointments scheduled.
          </p>
        </div>
      ) : (
        patientAppts.map((appt, i) => (
          <motion.div
            key={appt.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07, duration: 0.3 }}
            className="glass-card p-4 flex items-start gap-4"
            data-ocid="appointment-card"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-lg shrink-0">
              {typeIcon[appt.type] ?? "📅"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="font-medium text-foreground capitalize">
                  {appt.type.replace("-", " ")}
                </p>
                <StatusBadge status={appt.status} />
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(appt.date)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTime(appt.time)}
                </span>
                <span>{appt.doctor}</span>
              </div>
              {appt.notes && (
                <p className="text-xs text-muted-foreground mt-1.5 truncate">
                  {appt.notes}
                </p>
              )}
            </div>
          </motion.div>
        ))
      )}
    </motion.div>
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

  const patient = patients.find((p) => p.id === patientId);

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
              value="overview"
              className="text-xs sm:text-sm"
              data-ocid="tab-overview"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="case-history"
              className="text-xs sm:text-sm"
              data-ocid="tab-case-history"
            >
              Case History
            </TabsTrigger>
            <TabsTrigger
              value="prescriptions"
              className="text-xs sm:text-sm"
              data-ocid="tab-prescriptions"
            >
              Prescriptions
            </TabsTrigger>
            <TabsTrigger
              value="appointments"
              className="text-xs sm:text-sm"
              data-ocid="tab-appointments"
            >
              Appointments
            </TabsTrigger>
            <TabsTrigger
              value="notes"
              className="text-xs sm:text-sm"
              data-ocid="tab-notes"
            >
              Notes
            </TabsTrigger>
          </TabsList>

          <div className="mt-5">
            <TabsContent value="case-taking">
              <CaseTakingTab patient={patient} />
            </TabsContent>
            <TabsContent value="overview">
              <OverviewTab patient={patient} />
            </TabsContent>
            <TabsContent value="case-history">
              <CaseHistoryTab patient={patient} />
            </TabsContent>
            <TabsContent value="prescriptions">
              <PrescriptionsTab patient={patient} />
            </TabsContent>
            <TabsContent value="appointments">
              <AppointmentsTab patient={patient} />
            </TabsContent>
            <TabsContent value="notes">
              <NotesTab patient={patient} />
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
