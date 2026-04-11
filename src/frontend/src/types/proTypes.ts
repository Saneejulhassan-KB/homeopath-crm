// ─── Voice Transcription ────────────────────────────────────────────────────
export type TranscriptionStatus = "completed" | "processing" | "draft";

export interface VoiceTranscription {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  duration: number; // seconds
  accuracy: number; // percentage
  wordCount: number;
  transcript: string;
  symptoms: string[];
  suggestedRemedies: string[];
  status: TranscriptionStatus;
}

// ─── Pro Feature ─────────────────────────────────────────────────────────────
export interface ProFeature {
  id: string;
  name: string;
  description: string;
  icon: string;
  isEnabled: boolean;
  route: string;
  highlights: string[];
  badge?: string;
}

// ─── Upgrade / Pricing Plans ─────────────────────────────────────────────────
export type PlanTier = "free" | "pro" | "enterprise";

export interface PricingPlan {
  id: string;
  tier: PlanTier;
  name: string;
  price: number; // USD per month
  annualPrice: number;
  currency: string;
  description: string;
  features: string[];
  highlighted: boolean;
  badge?: string;
  ctaLabel: string;
}

// ─── Case Archive ─────────────────────────────────────────────────────────────
export type CaseOutcome = "cured" | "improved" | "unchanged" | "referred";

export interface CaseArchiveRecord {
  caseId: string;
  patientRef: string;
  chiefComplaint: string;
  symptoms: string[];
  prescribedRemedies: string[];
  outcome: CaseOutcome;
  dateOpened: string;
  dateClosed: string;
  duration: number; // days
  followUps: number;
  clinicianNotes: string;
  tags: string[];
}

// ─── Case Template ─────────────────────────────────────────────────────────────
export type SymptomCategory =
  | "Mind"
  | "Head"
  | "Chest"
  | "Abdomen"
  | "Skin"
  | "General"
  | "Extremities"
  | "Urinary"
  | "Female"
  | "Male";

export interface TemplateSymptom {
  symptom: string;
  category: SymptomCategory;
  intensity: "mild" | "moderate" | "severe";
}

export interface TemplateRemedy {
  name: string;
  matchScore: number; // 0-100
  rationale: string;
}

export interface CaseTemplate {
  templateId: string;
  name: string;
  condition: string;
  description: string;
  icon: string;
  keySymptoms: TemplateSymptom[];
  modalities: {
    better: string[];
    worse: string[];
  };
  commonRemedies: TemplateRemedy[];
  dosageGuidance: string;
  followUpProtocol: string;
  redFlags: string[];
}

// ─── Materia Medica ────────────────────────────────────────────────────────────
export type RemedySource = "plant" | "mineral" | "animal" | "nosode";

export interface MateriaMedicaEntry {
  id: string;
  name: string;
  commonName: string;
  source: RemedySource;
  family?: string;
  element?: string;
  keynotes: string[];
  mentalSymptoms: string[];
  physicalSymptoms: string[];
  modalities: {
    better: string[];
    worse: string[];
  };
  dosages: string[];
  potencies: string[];
  affinities: string[];
  clinicalPearls: string[];
  constitutionalType: string;
  isFavorite: boolean;
}

export interface PeriodicTableRemedy {
  id: string;
  name: string;
  commonName: string;
  atomicNumber: number;
  symbol: string;
  elementName: string;
  group?: number;
  period?: number;
  keynotes: string[];
  potencies: string[];
}

// ─── Patient Timeline ──────────────────────────────────────────────────────────
export type TimelineEventType =
  | "appointment"
  | "prescription"
  | "note"
  | "milestone";

export interface SymptomScore {
  symptomName: string;
  score: number; // 1-10
}

export interface TimelineEvent {
  id: string;
  date: string;
  type: TimelineEventType;
  title: string;
  description: string;
  remedy?: string;
  potency?: string;
  followUpDate?: string;
  doctor?: string;
  symptomScores: SymptomScore[];
}

export interface SymptomDataPoint {
  date: string;
  score: number; // 1-10
}

export interface SymptomProgression {
  symptomName: string;
  data: SymptomDataPoint[];
}

export interface HealthMetrics {
  totalVisits: number;
  avgFollowUpDays: number;
  improvementRate: number; // percentage
  activeRemedies: number;
  lastVisit: string;
}

export interface PatientTimelineData {
  patientId: string;
  patientName: string;
  daysOnTreatment?: number;
  timelineEvents: TimelineEvent[];
  symptomProgressions: SymptomProgression[];
  healthMetrics: HealthMetrics;
}

// ─── Repertorization ──────────────────────────────────────────────────────────
export interface RepertorationResult {
  remedy: string;
  totalScore: number;
  rubricsCovered: number;
  rank: number;
  confidence: number; // 0-100
}

export interface RemedyComparison {
  remedy: string;
  symptoms: {
    symptom: string;
    degree: 1 | 2 | 3;
  }[];
  totalDegree: number;
}
