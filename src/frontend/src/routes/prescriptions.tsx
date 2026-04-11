import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { patients } from "@/data/patients";
import { prescriptions as initialPrescriptions } from "@/data/prescriptions";
import { remedies } from "@/data/remedies";
import type { Prescription, PrescriptionStatus, Remedy } from "@/types";
import { formatDate, getInitials, truncate } from "@/utils/formatters";
import { createRoute } from "@tanstack/react-router";
import {
  BookOpen,
  ChevronRight,
  ClipboardList,
  Edit,
  Eye,
  FlaskConical,
  Plus,
  Search,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Route as rootRoute } from "./__root";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/prescriptions",
  component: PrescriptionsPage,
});

const POTENCIES = [
  "6C",
  "12C",
  "30C",
  "200C",
  "1M",
  "10M",
  "LM1",
  "LM2",
  "LM3",
  "LM6",
  "LM12",
  "LM18",
  "LM30",
  "Q (Mother Tincture)",
  "3X",
  "6X",
  "12X",
];

const DOSAGE_FORMS = ["Pellets", "Drops", "Liquid", "Tablets", "Globules"];

const FREQUENCIES = [
  "Once daily (OD)",
  "Twice daily (BD)",
  "Thrice daily (TDS)",
  "Four times daily (QDS)",
  "Weekly",
  "Every 3 days",
  "Monthly",
  "Single dose",
  "As needed (SOS)",
];

const THERMAL = ["Hot", "Cold", "Mixed / Neutral"];
const ONSET = ["Sudden", "Gradual", "Insidious"];

interface FormState {
  patientId: string;
  chiefComplaint: string;
  duration: string;
  onset: string;
  previousTreatments: string;
  physicalSymptoms: string;
  mentalSymptoms: string;
  sleepPatterns: string;
  appetiteThirst: string;
  thermalSensitivity: string;
  perspiration: string;
  betterFrom: string;
  worseFrom: string;
  timeModalities: string;
  energyLevel: number[];
  mood: string;
  fears: string;
  remedyId: string;
  potency: string;
  dosageForm: string;
  frequency: string;
  prescriptionDuration: string;
  caseNotes: string;
}

const emptyForm: FormState = {
  patientId: "",
  chiefComplaint: "",
  duration: "",
  onset: "",
  previousTreatments: "",
  physicalSymptoms: "",
  mentalSymptoms: "",
  sleepPatterns: "",
  appetiteThirst: "",
  thermalSensitivity: "",
  perspiration: "",
  betterFrom: "",
  worseFrom: "",
  timeModalities: "",
  energyLevel: [5],
  mood: "",
  fears: "",
  remedyId: "",
  potency: "",
  dosageForm: "",
  frequency: "",
  prescriptionDuration: "",
  caseNotes: "",
};

function PrescriptionsPage() {
  const [activeTab, setActiveTab] = useState("new");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [historyFilter, setHistoryFilter] = useState("all");
  const [remedySearch, setRemedySearch] = useState("");
  const [selectedPrescription, setSelectedPrescription] =
    useState<Prescription | null>(null);
  const [selectedRemedy, setSelectedRemedy] = useState<Remedy | null>(null);
  const [rxList, setRxList] = useState<Prescription[]>(initialPrescriptions);

  const filteredHistory = useMemo(() => {
    if (historyFilter === "all") return rxList;
    return rxList.filter((p) => p.patientId === historyFilter);
  }, [rxList, historyFilter]);

  const filteredRemedies = useMemo(() => {
    const q = remedySearch.toLowerCase();
    if (!q) return remedies;
    return remedies.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.commonName.toLowerCase().includes(q) ||
        r.keynotes.some((k) => k.toLowerCase().includes(q)),
    );
  }, [remedySearch]);

  const selectedRemedyData = useMemo(
    () => remedies.find((r) => r.id === form.remedyId),
    [form.remedyId],
  );

  function updateForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    if (!form.patientId || !form.remedyId || !form.potency) {
      toast.error("Please fill required fields: Patient, Remedy, and Potency.");
      return;
    }
    const patient = patients.find((p) => p.id === form.patientId);
    const remedy = remedies.find((r) => r.id === form.remedyId);
    if (!patient || !remedy) return;

    const newRx: Prescription = {
      id: `rx${Date.now()}`,
      patientId: form.patientId,
      patientName: patient.name,
      date: new Date().toISOString().split("T")[0],
      remedy: remedy.name,
      potency: form.potency,
      dosage: form.dosageForm || "4 pills",
      frequency: form.frequency || "As needed",
      duration: form.prescriptionDuration || "—",
      caseNotes:
        form.caseNotes ||
        `${form.chiefComplaint}. Better: ${form.betterFrom}. Worse: ${form.worseFrom}.`,
      symptoms: form.physicalSymptoms
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      status: "active" as PrescriptionStatus,
    };

    setRxList((prev) => [newRx, ...prev]);
    setForm(emptyForm);
    toast.success("Prescription saved successfully!", {
      description: `${remedy.name} ${form.potency} for ${patient.name}`,
    });
    setActiveTab("history");
  }

  return (
    <div className="space-y-6" data-ocid="prescriptions-page">
      <PageHeader
        title="Prescription System"
        description="Detailed case-taking, remedy selection with potency, and full prescription history."
        breadcrumb={[
          { label: "Dashboard", href: "/" },
          { label: "Prescriptions" },
        ]}
        action={{
          label: "New Prescription",
          onClick: () => setActiveTab("new"),
          icon: <Plus className="w-4 h-4" />,
        }}
      />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        data-ocid="prescriptions-tabs"
      >
        <TabsList className="glass-card p-1 gap-1 h-auto">
          <TabsTrigger
            value="new"
            className="flex items-center gap-2 text-sm"
            data-ocid="tab-new"
          >
            <FlaskConical className="w-4 h-4" />
            New Prescription
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="flex items-center gap-2 text-sm"
            data-ocid="tab-history"
          >
            <ClipboardList className="w-4 h-4" />
            History
            <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
              {rxList.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="remedies"
            className="flex items-center gap-2 text-sm"
            data-ocid="tab-remedies"
          >
            <BookOpen className="w-4 h-4" />
            Remedies Database
            <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
              {remedies.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* ── TAB 1: NEW PRESCRIPTION ── */}
        <TabsContent value="new" className="mt-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Patient Selection */}
            <div className="glass-card p-5">
              <h3 className="text-sm font-display font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-bold">
                  1
                </span>
                Patient Selection <span className="text-destructive">*</span>
              </h3>
              <div className="max-w-md">
                <Label className="text-xs text-muted-foreground mb-1.5 block">
                  Select Patient
                </Label>
                <Select
                  value={form.patientId}
                  onValueChange={(v) => updateForm("patientId", v)}
                >
                  <SelectTrigger data-ocid="select-patient">
                    <SelectValue placeholder="Search and select a patient…" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        <span className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                            {getInitials(p.name)}
                          </span>
                          <span>{p.name}</span>
                          <span className="text-muted-foreground text-xs">
                            ({p.age}y, {p.gender})
                          </span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.patientId &&
                  (() => {
                    const pt = patients.find((p) => p.id === form.patientId);
                    return pt ? (
                      <div className="mt-2 p-3 rounded-lg surface-muted text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {pt.name}
                        </span>{" "}
                        · {pt.chiefComplaint}
                      </div>
                    ) : null;
                  })()}
              </div>
            </div>

            {/* Case Taking Accordion */}
            <div className="glass-card p-5">
              <h3 className="text-sm font-display font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-bold">
                  2
                </span>
                Case Taking
              </h3>
              <Accordion
                type="multiple"
                defaultValue={["chief", "symptoms"]}
                className="space-y-2"
              >
                {/* Chief Complaint */}
                <AccordionItem
                  value="chief"
                  className="glass rounded-lg border-0 px-4"
                >
                  <AccordionTrigger className="text-sm font-medium hover:no-underline py-3">
                    Chief Complaint &amp; History
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Label className="text-xs text-muted-foreground mb-1.5 block">
                          Chief Complaint
                        </Label>
                        <Textarea
                          placeholder="Describe the main presenting complaint in detail…"
                          rows={3}
                          value={form.chiefComplaint}
                          onChange={(e) =>
                            updateForm("chiefComplaint", e.target.value)
                          }
                          data-ocid="input-chief-complaint"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1.5 block">
                          Duration
                        </Label>
                        <Input
                          placeholder="e.g. 3 months, 2 years"
                          value={form.duration}
                          onChange={(e) =>
                            updateForm("duration", e.target.value)
                          }
                          data-ocid="input-duration"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1.5 block">
                          Onset
                        </Label>
                        <Select
                          value={form.onset}
                          onValueChange={(v) => updateForm("onset", v)}
                        >
                          <SelectTrigger data-ocid="select-onset">
                            <SelectValue placeholder="Select onset type…" />
                          </SelectTrigger>
                          <SelectContent>
                            {ONSET.map((o) => (
                              <SelectItem key={o} value={o}>
                                {o}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-xs text-muted-foreground mb-1.5 block">
                          Previous Treatments
                        </Label>
                        <Textarea
                          placeholder="Allopathic, Ayurvedic, previous homeopathic treatment…"
                          rows={2}
                          value={form.previousTreatments}
                          onChange={(e) =>
                            updateForm("previousTreatments", e.target.value)
                          }
                          data-ocid="input-prev-treatments"
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Symptoms Analysis */}
                <AccordionItem
                  value="symptoms"
                  className="glass rounded-lg border-0 px-4"
                >
                  <AccordionTrigger className="text-sm font-medium hover:no-underline py-3">
                    Symptoms Analysis
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Label className="text-xs text-muted-foreground mb-1.5 block">
                          Physical Symptoms{" "}
                          <span className="text-xs">
                            (comma-separated for best results)
                          </span>
                        </Label>
                        <Textarea
                          placeholder="Headache, joint pain, skin eruptions…"
                          rows={2}
                          value={form.physicalSymptoms}
                          onChange={(e) =>
                            updateForm("physicalSymptoms", e.target.value)
                          }
                          data-ocid="input-physical-symptoms"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-xs text-muted-foreground mb-1.5 block">
                          Mental / Emotional Symptoms
                        </Label>
                        <Textarea
                          placeholder="Anxiety, fear, grief, irritability, depression…"
                          rows={2}
                          value={form.mentalSymptoms}
                          onChange={(e) =>
                            updateForm("mentalSymptoms", e.target.value)
                          }
                          data-ocid="input-mental-symptoms"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1.5 block">
                          Sleep Patterns
                        </Label>
                        <Textarea
                          placeholder="Insomnia, position, dreams, waking time…"
                          rows={2}
                          value={form.sleepPatterns}
                          onChange={(e) =>
                            updateForm("sleepPatterns", e.target.value)
                          }
                          data-ocid="input-sleep"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1.5 block">
                          Appetite &amp; Thirst
                        </Label>
                        <Input
                          placeholder="e.g. Increased thirst, craves sweets, aversion to meat"
                          value={form.appetiteThirst}
                          onChange={(e) =>
                            updateForm("appetiteThirst", e.target.value)
                          }
                          data-ocid="input-appetite"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1.5 block">
                          Thermal Sensitivity
                        </Label>
                        <Select
                          value={form.thermalSensitivity}
                          onValueChange={(v) =>
                            updateForm("thermalSensitivity", v)
                          }
                        >
                          <SelectTrigger data-ocid="select-thermal">
                            <SelectValue placeholder="Hot / Cold / Mixed" />
                          </SelectTrigger>
                          <SelectContent>
                            {THERMAL.map((t) => (
                              <SelectItem key={t} value={t}>
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1.5 block">
                          Perspiration Characteristics
                        </Label>
                        <Textarea
                          placeholder="Offensive, profuse, location, time…"
                          rows={2}
                          value={form.perspiration}
                          onChange={(e) =>
                            updateForm("perspiration", e.target.value)
                          }
                          data-ocid="input-perspiration"
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Modalities */}
                <AccordionItem
                  value="modalities"
                  className="glass rounded-lg border-0 px-4"
                >
                  <AccordionTrigger className="text-sm font-medium hover:no-underline py-3">
                    Modalities
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1.5 block">
                          Better From
                        </Label>
                        <Textarea
                          placeholder="Cold, rest, open air, pressure…"
                          rows={3}
                          value={form.betterFrom}
                          onChange={(e) =>
                            updateForm("betterFrom", e.target.value)
                          }
                          data-ocid="input-better-from"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1.5 block">
                          Worse From
                        </Label>
                        <Textarea
                          placeholder="Heat, motion, noise, light…"
                          rows={3}
                          value={form.worseFrom}
                          onChange={(e) =>
                            updateForm("worseFrom", e.target.value)
                          }
                          data-ocid="input-worse-from"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1.5 block">
                          Time Modalities
                        </Label>
                        <Textarea
                          placeholder="Worse 2-4am, 4-8pm aggravation…"
                          rows={3}
                          value={form.timeModalities}
                          onChange={(e) =>
                            updateForm("timeModalities", e.target.value)
                          }
                          data-ocid="input-time-modalities"
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* General Symptoms */}
                <AccordionItem
                  value="general"
                  className="glass rounded-lg border-0 px-4"
                >
                  <AccordionTrigger className="text-sm font-medium hover:no-underline py-3">
                    General Symptoms
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1.5 block">
                          Energy Level:{" "}
                          <span className="text-primary font-semibold">
                            {form.energyLevel[0]} / 10
                          </span>
                        </Label>
                        <Slider
                          min={1}
                          max={10}
                          step={1}
                          value={form.energyLevel}
                          onValueChange={(v) => updateForm("energyLevel", v)}
                          className="mt-3"
                          data-ocid="slider-energy"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>Very Low</span>
                          <span>Very High</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1.5 block">
                          Current Mood
                        </Label>
                        <Input
                          placeholder="e.g. Irritable, sad, anxious, cheerful"
                          value={form.mood}
                          onChange={(e) => updateForm("mood", e.target.value)}
                          data-ocid="input-mood"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-xs text-muted-foreground mb-1.5 block">
                          Fears / Anxieties
                        </Label>
                        <Textarea
                          placeholder="Fear of death, darkness, disease, being alone…"
                          rows={2}
                          value={form.fears}
                          onChange={(e) => updateForm("fears", e.target.value)}
                          data-ocid="input-fears"
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Remedy Prescription */}
            <div className="glass-card p-5">
              <h3 className="text-sm font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-bold">
                  3
                </span>
                Remedy Prescription
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="md:col-span-2 lg:col-span-1">
                  <Label className="text-xs text-muted-foreground mb-1.5 block">
                    Remedy Name <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={form.remedyId}
                    onValueChange={(v) => updateForm("remedyId", v)}
                  >
                    <SelectTrigger data-ocid="select-remedy">
                      <SelectValue placeholder="Search and select remedy…" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {remedies.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          <span>
                            <span className="font-medium">{r.name}</span>
                            <span className="text-muted-foreground text-xs ml-1">
                              ({r.commonName})
                            </span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedRemedyData && (
                    <div className="mt-2 p-2 rounded-lg surface-muted">
                      <div className="flex flex-wrap gap-1">
                        {selectedRemedyData.keynotes.slice(0, 3).map((k) => (
                          <Badge
                            key={k}
                            variant="secondary"
                            className="text-xs px-1.5 py-0"
                          >
                            {k}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">
                    Potency <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={form.potency}
                    onValueChange={(v) => updateForm("potency", v)}
                  >
                    <SelectTrigger data-ocid="select-potency">
                      <SelectValue placeholder="Select potency…" />
                    </SelectTrigger>
                    <SelectContent>
                      {(selectedRemedyData
                        ? selectedRemedyData.potencies
                        : POTENCIES
                      ).map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                      {selectedRemedyData && (
                        <>
                          <Separator />
                          {POTENCIES.filter(
                            (p) => !selectedRemedyData.potencies.includes(p),
                          ).map((p) => (
                            <SelectItem
                              key={p}
                              value={p}
                              className="text-muted-foreground"
                            >
                              {p}
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">
                    Dosage Form
                  </Label>
                  <Select
                    value={form.dosageForm}
                    onValueChange={(v) => updateForm("dosageForm", v)}
                  >
                    <SelectTrigger data-ocid="select-dosage-form">
                      <SelectValue placeholder="Pellets / Drops…" />
                    </SelectTrigger>
                    <SelectContent>
                      {DOSAGE_FORMS.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">
                    Frequency
                  </Label>
                  <Select
                    value={form.frequency}
                    onValueChange={(v) => updateForm("frequency", v)}
                  >
                    <SelectTrigger data-ocid="select-frequency">
                      <SelectValue placeholder="How often?" />
                    </SelectTrigger>
                    <SelectContent>
                      {FREQUENCIES.map((f) => (
                        <SelectItem key={f} value={f}>
                          {f}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">
                    Duration
                  </Label>
                  <Input
                    placeholder="e.g. 4 weeks, 2 months"
                    value={form.prescriptionDuration}
                    onChange={(e) =>
                      updateForm("prescriptionDuration", e.target.value)
                    }
                    data-ocid="input-rx-duration"
                  />
                </div>

                <div className="md:col-span-2 lg:col-span-3">
                  <Label className="text-xs text-muted-foreground mb-1.5 block">
                    Case Notes for Prescription
                  </Label>
                  <Textarea
                    placeholder="Clinical reasoning, miasm analysis, follow-up instructions, complementary remedies…"
                    rows={4}
                    value={form.caseNotes}
                    onChange={(e) => updateForm("caseNotes", e.target.value)}
                    data-ocid="input-case-notes"
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setForm(emptyForm)}
                  data-ocid="btn-clear-form"
                >
                  Clear Form
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="gap-2"
                  data-ocid="btn-save-prescription"
                >
                  <FlaskConical className="w-4 h-4" />
                  Save Prescription
                </Button>
              </div>
            </div>
          </motion.div>
        </TabsContent>

        {/* ── TAB 2: PRESCRIPTION HISTORY ── */}
        <TabsContent value="history" className="mt-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="glass-card p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium shrink-0">
                <ClipboardList className="w-4 h-4" />
                Filter by Patient:
              </div>
              <Select value={historyFilter} onValueChange={setHistoryFilter}>
                <SelectTrigger className="max-w-xs" data-ocid="filter-patient">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Patients</SelectItem>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground ml-auto">
                {filteredHistory.length} prescription
                {filteredHistory.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50">
                      <TableHead className="text-xs font-semibold text-muted-foreground">
                        Date
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground">
                        Patient
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground">
                        Remedy + Potency
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground">
                        Dosage
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground">
                        Duration
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground">
                        Status
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {filteredHistory.map((rx, i) => (
                        <motion.tr
                          key={rx.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 8 }}
                          transition={{ delay: i * 0.03 }}
                          className="border-border/30 hover:bg-muted/20 transition-smooth cursor-pointer"
                          onClick={() => setSelectedPrescription(rx)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ")
                              setSelectedPrescription(rx);
                          }}
                          tabIndex={0}
                          data-ocid={`rx-row-${rx.id}`}
                        >
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {formatDate(rx.date)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                                {getInitials(rx.patientName)}
                              </span>
                              <span className="text-sm font-medium text-foreground">
                                {rx.patientName}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium text-foreground">
                              {truncate(rx.remedy, 24)}
                            </div>
                            <div className="text-xs text-primary font-semibold">
                              {rx.potency}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {rx.dosage}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {rx.duration}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={rx.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedPrescription(rx);
                                }}
                                data-ocid={`btn-view-${rx.id}`}
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={(e) => e.stopPropagation()}
                                data-ocid={`btn-edit-${rx.id}`}
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                    {filteredHistory.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-12 text-muted-foreground"
                        >
                          No prescriptions found for this patient.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </motion.div>
        </TabsContent>

        {/* ── TAB 3: REMEDIES DATABASE ── */}
        <TabsContent value="remedies" className="mt-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="glass-card p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search remedies by name, common name, or indication…"
                  className="pl-9"
                  value={remedySearch}
                  onChange={(e) => setRemedySearch(e.target.value)}
                  data-ocid="search-remedies"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Showing {filteredRemedies.length} of {remedies.length} remedies
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredRemedies.map((remedy, i) => (
                <motion.button
                  key={remedy.id}
                  type="button"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.02 }}
                  whileHover={{ y: -2 }}
                  className="glass-card p-4 text-left cursor-pointer hover:border-primary/30 transition-smooth group w-full"
                  onClick={() => setSelectedRemedy(remedy)}
                  data-ocid={`remedy-card-${remedy.id}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <h4 className="text-sm font-display font-semibold text-foreground leading-tight">
                        {remedy.name}
                      </h4>
                      <p className="text-xs text-primary mt-0.5">
                        {remedy.commonName}
                      </p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-0.5" />
                  </div>
                  <Separator className="my-2 opacity-50" />
                  <ul className="space-y-1">
                    {remedy.keynotes.slice(0, 3).map((k) => (
                      <li
                        key={k}
                        className="text-xs text-muted-foreground flex items-start gap-1.5"
                      >
                        <span className="w-1 h-1 rounded-full bg-primary/60 mt-1.5 shrink-0" />
                        {k}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {remedy.potencies.slice(0, 4).map((p) => (
                      <Badge
                        key={p}
                        variant="outline"
                        className="text-xs px-1.5 py-0 font-mono"
                      >
                        {p}
                      </Badge>
                    ))}
                    {remedy.potencies.length > 4 && (
                      <Badge
                        variant="outline"
                        className="text-xs px-1.5 py-0 text-muted-foreground"
                      >
                        +{remedy.potencies.length - 4}
                      </Badge>
                    )}
                  </div>
                </motion.button>
              ))}
              {filteredRemedies.length === 0 && (
                <div className="col-span-full glass-card p-12 text-center text-muted-foreground">
                  No remedies found matching your search.
                </div>
              )}
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Prescription Detail Modal */}
      <Dialog
        open={!!selectedPrescription}
        onOpenChange={(open) => !open && setSelectedPrescription(null)}
      >
        <DialogContent
          className="max-w-lg glass"
          data-ocid="modal-prescription-detail"
        >
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-primary" />
              Prescription Details
            </DialogTitle>
          </DialogHeader>
          {selectedPrescription && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <DetailField
                  label="Patient"
                  value={selectedPrescription.patientName}
                />
                <DetailField
                  label="Date"
                  value={formatDate(selectedPrescription.date)}
                />
                <DetailField
                  label="Remedy"
                  value={selectedPrescription.remedy}
                  highlight
                />
                <DetailField
                  label="Potency"
                  value={selectedPrescription.potency}
                  highlight
                />
                <DetailField
                  label="Dosage"
                  value={selectedPrescription.dosage}
                />
                <DetailField
                  label="Frequency"
                  value={selectedPrescription.frequency}
                />
                <DetailField
                  label="Duration"
                  value={selectedPrescription.duration}
                />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <StatusBadge status={selectedPrescription.status} />
                </div>
              </div>

              {selectedPrescription.symptoms.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Symptoms</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPrescription.symptoms.map((s) => (
                      <Badge key={s} variant="secondary" className="text-xs">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs text-muted-foreground mb-1">Case Notes</p>
                <p className="text-sm text-foreground leading-relaxed surface-muted rounded-lg p-3">
                  {selectedPrescription.caseNotes}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Remedy Profile Modal */}
      <Dialog
        open={!!selectedRemedy}
        onOpenChange={(open) => !open && setSelectedRemedy(null)}
      >
        <DialogContent
          className="max-w-md glass"
          data-ocid="modal-remedy-profile"
        >
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Remedy Profile
            </DialogTitle>
          </DialogHeader>
          {selectedRemedy && (
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="text-xl font-display font-bold text-foreground">
                  {selectedRemedy.name}
                </h3>
                <p className="text-primary text-sm mt-0.5">
                  {selectedRemedy.commonName}
                </p>
              </div>

              <Separator className="opacity-50" />

              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">
                  Key Indications
                </p>
                <ul className="space-y-2">
                  {selectedRemedy.keynotes.map((k) => (
                    <li
                      key={k}
                      className="flex items-start gap-2 text-foreground"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      {k}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">
                  Available Potencies
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedRemedy.potencies.map((p) => (
                    <Badge
                      key={p}
                      variant="outline"
                      className="font-mono text-xs"
                    >
                      {p}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button
                className="w-full gap-2"
                onClick={() => {
                  updateForm("remedyId", selectedRemedy.id);
                  setSelectedRemedy(null);
                  setActiveTab("new");
                  toast.success(
                    `${selectedRemedy.name} added to new prescription`,
                  );
                }}
                data-ocid="btn-use-remedy"
              >
                <Plus className="w-4 h-4" />
                Use in New Prescription
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface DetailFieldProps {
  label: string;
  value: string;
  highlight?: boolean;
}

function DetailField({ label, value, highlight }: DetailFieldProps) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p
        className={highlight ? "font-semibold text-primary" : "text-foreground"}
      >
        {value}
      </p>
    </div>
  );
}
