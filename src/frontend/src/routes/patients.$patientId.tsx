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
  Calendar,
  Clock,
  Edit3,
  FileText,
  Mail,
  MapPin,
  Phone,
  Pill,
  Stethoscope,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Route as patientsRoute } from "./patients";
import { PatientModal } from "./patients";

export const Route = createRoute({
  getParentRoute: () => patientsRoute,
  path: "$patientId",
  component: PatientDetailPage,
});

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
                <p className="text-sm text-muted-foreground mt-0.5">
                  {patient.age} years · {patient.gender} · {patient.bloodGroup}
                </p>
              </div>
              <StatusBadge status={patient.status} />
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <InfoChip icon={Mail} label="Email" value={patient.email} />
              <InfoChip icon={Phone} label="Phone" value={patient.phone} />
              <InfoChip
                icon={Calendar}
                label="Last Visit"
                value={`${formatDate(patient.lastVisit)} (${relativeTime(patient.lastVisit)})`}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <Tabs defaultValue="overview" data-ocid="patient-tabs">
          <TabsList className="glass border-white/10 bg-white/5 w-full sm:w-auto flex flex-wrap gap-0.5 h-auto p-1">
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
