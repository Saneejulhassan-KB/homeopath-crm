import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { voiceTranscriptions } from "@/data/proFeatures";
import type { VoiceTranscription } from "@/types/proTypes";
import { createRoute } from "@tanstack/react-router";
import {
  Activity,
  CheckCircle2,
  ChevronDown,
  Clock,
  Copy,
  Crown,
  Download,
  Eye,
  FileText,
  Loader2,
  Mic,
  MicOff,
  Pill,
  Play,
  Search,
  Square,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Route as proRoute } from "./pro";

export const Route = createRoute({
  getParentRoute: () => proRoute,
  path: "voice-recorder",
  component: VoiceRecorderPage,
});

// ─── Types ────────────────────────────────────────────────────────────────────

type RecordingState = "idle" | "recording" | "processing" | "complete";

// ─── Mock Patients ────────────────────────────────────────────────────────────

const MOCK_PATIENTS = [
  { id: "p001", name: "Arjun Sharma" },
  { id: "p002", name: "Priya Nair" },
  { id: "p003", name: "Mohammed Al-Rashid" },
  { id: "p004", name: "Sarah Thompson" },
  { id: "p005", name: "Anjali Mehta" },
  { id: "p006", name: "Rahul Sharma" },
  { id: "p007", name: "Deepa Krishnan" },
  { id: "p008", name: "Carlos Mendez" },
];

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "fr", label: "French" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getTranscriptForPatient(patientId: string): VoiceTranscription {
  const found = voiceTranscriptions.find((t) => t.patientId === patientId);
  return found ?? voiceTranscriptions[0];
}

// ─── Waveform SVG ─────────────────────────────────────────────────────────────

// Pre-computed static waveform heights — avoids non-deterministic re-renders
const WAVEFORM_HEIGHTS = [
  48, 36, 48, 28, 44, 36, 48, 32, 40, 36, 48, 24, 44, 36, 48, 28, 36, 48, 32,
  44, 36, 48, 28, 40, 36, 48, 32, 44, 36, 48, 28, 36,
];

function WaveformBars({ active }: { active: boolean }) {
  const bars = Array.from({ length: 32 }, (_, i) => i);
  return (
    <div
      className="flex items-center justify-center gap-[3px] h-14 w-full"
      aria-hidden
    >
      {bars.map((i) => (
        <span
          key={i}
          className="rounded-full w-[3px] inline-block"
          style={{
            height: active
              ? `${WAVEFORM_HEIGHTS[i % WAVEFORM_HEIGHTS.length]}px`
              : "6px",
            background: active
              ? i % 3 === 0
                ? "oklch(0.65 0.18 190)"
                : i % 3 === 1
                  ? "oklch(0.78 0.14 60)"
                  : "rgba(255,255,255,0.5)"
              : "rgba(255,255,255,0.15)",
            animation: active
              ? `waveBar ${0.4 + (i % 5) * 0.1}s ease-in-out ${(i * 0.04).toFixed(2)}s infinite alternate`
              : "none",
            transition: "background 0.4s ease",
          }}
        />
      ))}
    </div>
  );
}

// ─── Typewriter Hook ──────────────────────────────────────────────────────────

function useTypewriter(text: string, active: boolean, speed = 18) {
  const [displayed, setDisplayed] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!active) {
      setDisplayed("");
      return;
    }
    let idx = 0;
    setDisplayed("");
    intervalRef.current = setInterval(() => {
      idx++;
      setDisplayed(text.slice(0, idx));
      if (idx >= text.length && intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }, speed);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text, active, speed]);

  return displayed;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function TranscriptStatusBadge({
  status,
}: { status: VoiceTranscription["status"] }) {
  const map = {
    completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    processing: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    draft: "bg-muted/50 text-muted-foreground border-border",
  };
  const labels = {
    completed: "Completed",
    processing: "Processing",
    draft: "Draft",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${map[status]}`}
    >
      {status === "completed" && <CheckCircle2 className="w-3 h-3" />}
      {status === "processing" && <Loader2 className="w-3 h-3 animate-spin" />}
      {status === "draft" && <FileText className="w-3 h-3" />}
      {labels[status]}
    </span>
  );
}

// ─── Transcript Detail Modal ───────────────────────────────────────────────────

function TranscriptModal({
  record,
  open,
  onClose,
}: {
  record: VoiceTranscription | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!record) return null;

  function handleCopy() {
    navigator.clipboard.writeText(record!.transcript);
    toast.success("Transcript copied to clipboard");
  }

  function handleDownload() {
    const blob = new Blob([record!.transcript], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transcript-${record!.patientName.replace(/ /g, "-")}-${record!.date}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Transcript downloaded");
  }

  function handleAddToPrescription(remedy: string) {
    toast.success(`"${remedy}" added to prescription draft`, {
      description: "Open Prescriptions to review and finalise.",
    });
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-2xl glass border-border/50 p-0 gap-0 overflow-hidden"
        data-ocid="transcript-modal"
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/30">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="font-display text-lg font-semibold text-foreground">
                {record.patientName}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDate(record.date)} · {formatDuration(record.duration)} ·{" "}
                {record.wordCount} words · {record.accuracy}% accuracy
              </p>
            </div>
            <TranscriptStatusBadge status={record.status} />
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="px-6 py-4 space-y-5">
            {/* Transcript */}
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Transcript
              </h4>
              <p className="text-sm text-foreground leading-relaxed bg-muted/20 rounded-xl p-4 border border-border/30">
                {record.transcript}
              </p>
            </div>

            {/* Symptoms */}
            {record.symptoms.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Extracted Symptoms
                </h4>
                <div className="flex flex-wrap gap-2">
                  {record.symptoms.map((s) => (
                    <span
                      key={s}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Remedies */}
            {record.suggestedRemedies.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Suggested Remedies
                </h4>
                <div className="flex flex-wrap gap-2">
                  {record.suggestedRemedies.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleAddToPrescription(r)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-premium/10 text-premium border border-premium/25 hover:bg-premium/20 transition-smooth cursor-pointer"
                      data-ocid={`add-remedy-${r.replace(/ /g, "-")}`}
                    >
                      <Pill className="w-3 h-3" />
                      {r}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground mt-2">
                  Click a remedy to add it to prescription draft
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-border/30 flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            className="gap-2"
            data-ocid="copy-transcript-btn"
          >
            <Copy className="w-3.5 h-3.5" />
            Copy
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownload}
            className="gap-2"
            data-ocid="download-transcript-btn"
          >
            <Download className="w-3.5 h-3.5" />
            Download .txt
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onClose}
            className="gap-2 ml-auto"
            data-ocid="close-modal-btn"
          >
            <X className="w-3.5 h-3.5" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function VoiceRecorderPage() {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [timer, setTimer] = useState(0);
  const [selectedPatientId, setSelectedPatientId] = useState(
    MOCK_PATIENTS[0].id,
  );
  const [selectedLang, setSelectedLang] = useState("en");
  const [activeTranscript, setActiveTranscript] =
    useState<VoiceTranscription | null>(null);
  const [typewriterActive, setTypewriterActive] = useState(false);
  const [search, setSearch] = useState("");
  const [filterPatient, setFilterPatient] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [modalRecord, setModalRecord] = useState<VoiceTranscription | null>(
    null,
  );
  const [transcriptions, setTranscriptions] =
    useState<VoiceTranscription[]>(voiceTranscriptions);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer logic
  useEffect(() => {
    if (recordingState === "recording") {
      setTimer(0);
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [recordingState]);

  const handleStartRecording = useCallback(() => {
    setRecordingState("recording");
    setActiveTranscript(null);
    setTypewriterActive(false);
  }, []);

  const handleStopRecording = useCallback(() => {
    setRecordingState("processing");
    setTimeout(() => {
      const result = getTranscriptForPatient(selectedPatientId);
      setActiveTranscript(result);
      setRecordingState("complete");
      setTypewriterActive(true);
    }, 2200);
  }, [selectedPatientId]);

  const handleReset = useCallback(() => {
    setRecordingState("idle");
    setTimer(0);
    setActiveTranscript(null);
    setTypewriterActive(false);
  }, []);

  const typewriterText = useTypewriter(
    activeTranscript?.transcript ?? "",
    typewriterActive,
    14,
  );

  // Table filter
  const filtered = transcriptions.filter((t) => {
    const matchSearch =
      !search ||
      t.transcript.toLowerCase().includes(search.toLowerCase()) ||
      t.patientName.toLowerCase().includes(search.toLowerCase());
    const matchPatient =
      filterPatient === "all" || t.patientId === filterPatient;
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    return matchSearch && matchPatient && matchStatus;
  });

  function handleDelete(id: string) {
    setTranscriptions((prev) => prev.filter((t) => t.id !== id));
    toast.success("Transcript removed");
  }

  function handleCopyNotes(record: VoiceTranscription) {
    const text = `Patient: ${record.patientName}\nDate: ${record.date}\n\nTranscript:\n${record.transcript}\n\nSymptoms:\n${record.symptoms.join(", ")}\n\nSuggested Remedies:\n${record.suggestedRemedies.join(", ")}`;
    navigator.clipboard.writeText(text);
    toast.success("Copied to case notes clipboard");
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      data-ocid="voice-recorder-page"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <PageHeader
          title="Voice Case Recorder"
          description="Record patient consultations and auto-transcribe to structured case notes."
          breadcrumb={[{ label: "Pro Features" }, { label: "Voice Recorder" }]}
        />
        <div className="flex items-center gap-2 mt-1">
          <span className="pro-badge flex items-center gap-1.5">
            <Crown className="w-3 h-3" />
            PRO
          </span>
          <span className="text-xs text-muted-foreground bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            AI-Powered
          </span>
        </div>
      </div>

      {/* ── Recording Interface ─────────────────────────────────────────────── */}
      <div
        className="glass-premium p-6 space-y-6"
        data-ocid="recording-interface"
      >
        {/* Controls row */}
        <div className="flex flex-wrap gap-4 items-end">
          {/* Patient selector */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="patient-select"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
            >
              Patient
            </label>
            <div className="relative">
              <select
                id="patient-select"
                className="appearance-none pl-3 pr-8 py-2 rounded-xl text-sm font-medium bg-card/60 border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer min-w-[180px]"
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                disabled={
                  recordingState === "recording" ||
                  recordingState === "processing"
                }
                data-ocid="patient-selector"
              >
                {MOCK_PATIENTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Language selector */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="language-select"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
            >
              Language
            </label>
            <div className="relative">
              <select
                id="language-select"
                className="appearance-none pl-3 pr-8 py-2 rounded-xl text-sm font-medium bg-card/60 border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                disabled={
                  recordingState === "recording" ||
                  recordingState === "processing"
                }
                data-ocid="language-selector"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Main recording area */}
        <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
          {/* Mic button + timer */}
          <div className="flex flex-col items-center gap-4 shrink-0">
            {/* Outer pulse rings */}
            <div className="relative flex items-center justify-center">
              {recordingState === "recording" && (
                <>
                  <span
                    className="absolute w-36 h-36 rounded-full border-2 border-red-500/30 animate-ping"
                    style={{ animationDuration: "1.4s" }}
                  />
                  <span
                    className="absolute w-28 h-28 rounded-full border-2 border-red-500/40 animate-ping"
                    style={{ animationDuration: "1s" }}
                  />
                </>
              )}
              {recordingState === "processing" && (
                <span
                  className="absolute w-32 h-32 rounded-full border-2 border-primary/40 animate-spin"
                  style={{ animationDuration: "2s" }}
                />
              )}

              {/* Core mic button */}
              <motion.button
                whileHover={{
                  scale:
                    recordingState === "idle" || recordingState === "complete"
                      ? 1.06
                      : 1,
                }}
                whileTap={{ scale: 0.96 }}
                onClick={
                  recordingState === "idle" || recordingState === "complete"
                    ? handleStartRecording
                    : recordingState === "recording"
                      ? handleStopRecording
                      : undefined
                }
                disabled={recordingState === "processing"}
                className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 ${
                  recordingState === "recording"
                    ? "bg-red-500 shadow-red-500/40"
                    : recordingState === "processing"
                      ? "bg-primary/20 cursor-wait"
                      : recordingState === "complete"
                        ? "bg-emerald-500/20 hover:bg-primary/20"
                        : "bg-primary/20 hover:bg-primary/30 border border-primary/30"
                }`}
                aria-label={
                  recordingState === "recording"
                    ? "Stop recording"
                    : "Start recording"
                }
                data-ocid="mic-button"
              >
                {recordingState === "processing" ? (
                  <Loader2 className="w-9 h-9 text-primary animate-spin" />
                ) : recordingState === "recording" ? (
                  <Square className="w-9 h-9 text-white fill-white" />
                ) : recordingState === "complete" ? (
                  <Play className="w-9 h-9 text-emerald-400 ml-1" />
                ) : (
                  <Mic className="w-9 h-9 text-primary" />
                )}
              </motion.button>
            </div>

            {/* Timer */}
            <div className="text-center" data-ocid="timer-display">
              <p
                className={`font-mono text-3xl font-bold tabular-nums tracking-widest ${
                  recordingState === "recording"
                    ? "text-red-400"
                    : "text-foreground"
                }`}
              >
                {formatDuration(timer)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {recordingState === "idle" && "Ready to record"}
                {recordingState === "recording" && "Recording..."}
                {recordingState === "processing" && "Processing audio..."}
                {recordingState === "complete" && "Transcription complete"}
              </p>
            </div>

            {/* Action button */}
            <div className="flex items-center gap-2">
              {recordingState === "idle" && (
                <Button
                  onClick={handleStartRecording}
                  className="gap-2 bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30"
                  variant="outline"
                  data-ocid="start-recording-btn"
                >
                  <Mic className="w-4 h-4" />
                  Start Recording
                </Button>
              )}
              {recordingState === "recording" && (
                <Button
                  onClick={handleStopRecording}
                  className="gap-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20"
                  variant="outline"
                  data-ocid="stop-recording-btn"
                >
                  <MicOff className="w-4 h-4" />
                  Stop & Transcribe
                </Button>
              )}
              {(recordingState === "processing" ||
                recordingState === "complete") && (
                <Button
                  onClick={handleReset}
                  variant="outline"
                  size="sm"
                  className="gap-2 text-muted-foreground"
                  data-ocid="new-recording-btn"
                >
                  New Recording
                </Button>
              )}
            </div>
          </div>

          {/* Waveform + Transcript area */}
          <div className="flex-1 min-w-0 w-full space-y-4">
            {/* Waveform */}
            <div
              className="glass rounded-2xl px-6 py-4 border border-white/10 min-h-[80px] flex items-center justify-center"
              data-ocid="waveform-display"
            >
              {recordingState === "processing" ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground font-medium animate-pulse">
                    Processing speech to text...
                  </p>
                </div>
              ) : (
                <WaveformBars active={recordingState === "recording"} />
              )}
            </div>

            {/* Transcript result */}
            <AnimatePresence mode="wait">
              {recordingState === "complete" && activeTranscript && (
                <motion.div
                  key="transcript-result"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-4"
                  data-ocid="transcript-result"
                >
                  {/* Typewriter transcript */}
                  <div className="glass rounded-2xl p-4 border border-primary/10 min-h-[100px]">
                    <div className="flex items-center gap-2 mb-3">
                      <Activity className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                        Transcript
                      </span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {activeTranscript.wordCount} words ·{" "}
                        {activeTranscript.accuracy}% accuracy
                      </span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">
                      {typewriterText}
                      {typewriterText.length <
                        (activeTranscript.transcript.length ?? 0) && (
                        <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse align-middle" />
                      )}
                    </p>
                  </div>

                  {/* Symptoms tags */}
                  {activeTranscript.symptoms.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      data-ocid="symptoms-tags"
                    >
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Extracted Symptoms
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {activeTranscript.symptoms.map((s, i) => (
                          <motion.span
                            key={s}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.7 + i * 0.08 }}
                            className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                          >
                            {s}
                          </motion.span>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Suggested remedies */}
                  {activeTranscript.suggestedRemedies.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.0 }}
                      data-ocid="suggested-remedies"
                    >
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Suggested Remedies
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {activeTranscript.suggestedRemedies.map((r, i) => (
                          <motion.button
                            key={r}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1.1 + i * 0.1 }}
                            onClick={() =>
                              toast.success(
                                `"${r}" added to prescription draft`,
                                {
                                  description:
                                    "Review in Prescriptions module.",
                                },
                              )
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-premium/10 text-premium border border-premium/25 hover:bg-premium/25 transition-smooth cursor-pointer"
                            data-ocid={`remedy-pill-${i}`}
                          >
                            <Pill className="w-3 h-3" />
                            {r}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Transcript History ──────────────────────────────────────────────── */}
      <div className="glass-card p-6 space-y-4" data-ocid="transcript-history">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="font-display font-semibold text-foreground">
              Transcript History
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {filtered.length} of {transcriptions.length} records
            </p>
          </div>
          {/* Search + Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                className="pl-8 h-8 text-xs w-[180px]"
                placeholder="Search transcripts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-ocid="search-input"
              />
            </div>

            <div className="relative">
              <select
                className="appearance-none pl-3 pr-8 h-8 rounded-lg text-xs font-medium bg-card/60 border border-border/50 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer"
                value={filterPatient}
                onChange={(e) => setFilterPatient(e.target.value)}
                data-ocid="filter-patient"
              >
                <option value="all">All Patients</option>
                {MOCK_PATIENTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
            </div>

            <div className="relative">
              <select
                className="appearance-none pl-3 pr-8 h-8 rounded-lg text-xs font-medium bg-card/60 border border-border/50 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                data-ocid="filter-status"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
                <option value="draft">Draft</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-border/30">
          <table className="w-full text-sm" data-ocid="transcripts-table">
            <thead>
              <tr className="border-b border-border/30 bg-muted/20">
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">
                  Patient
                </th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">
                  Date
                </th>
                <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">
                  Duration
                </th>
                <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">
                  Words
                </th>
                <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">
                  Accuracy
                </th>
                <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">
                  Symptoms
                </th>
                <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">
                  Status
                </th>
                <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-12 text-muted-foreground text-sm"
                    data-ocid="empty-state"
                  >
                    No transcripts found. Try adjusting your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((record, idx) => (
                  <motion.tr
                    key={record.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="hover:bg-white/[0.02] transition-smooth"
                    data-ocid={`transcript-row-${record.id}`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground text-xs">
                        {record.patientName}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatDate(record.date)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-mono text-xs text-foreground tabular-nums">
                        {formatDuration(record.duration)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-xs text-foreground tabular-nums">
                        {record.wordCount > 0
                          ? record.wordCount.toLocaleString()
                          : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {record.accuracy > 0 ? (
                        <span
                          className={`text-xs font-semibold tabular-nums ${
                            record.accuracy >= 95
                              ? "text-emerald-400"
                              : record.accuracy >= 90
                                ? "text-amber-400"
                                : "text-muted-foreground"
                          }`}
                        >
                          {record.accuracy}%
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-xs text-foreground tabular-nums">
                        {record.symptoms.length > 0
                          ? record.symptoms.length
                          : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <TranscriptStatusBadge status={record.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => setModalRecord(record)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-smooth"
                          title="View transcript"
                          aria-label="View transcript"
                          data-ocid={`view-btn-${record.id}`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyNotes(record)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-smooth"
                          title="Copy to case notes"
                          aria-label="Copy to case notes"
                          data-ocid={`copy-btn-${record.id}`}
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(record.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-smooth"
                          title="Delete transcript"
                          aria-label="Delete transcript"
                          data-ocid={`delete-btn-${record.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transcript Detail Modal */}
      <TranscriptModal
        record={modalRecord}
        open={!!modalRecord}
        onClose={() => setModalRecord(null)}
      />
    </motion.div>
  );
}
