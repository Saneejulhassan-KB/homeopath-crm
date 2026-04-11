import type { PatientTimelineData } from "../types/proTypes";

export const patientTimelines: PatientTimelineData[] = [
  {
    patientId: "p001",
    patientName: "Anjali Mehta",
    daysOnTreatment: 186,
    timelineEvents: [
      {
        id: "te001",
        date: "2025-01-15",
        type: "appointment",
        title: "Initial Case Taking",
        description:
          "Comprehensive case taking session. Chief complaint: left-sided migraine with visual aura since divorce 2 years ago. Natrum Muriaticum constitutional picture confirmed — grief held inward, worse consolation, craving salt.",
        doctor: "Dr. Priya Nair",
        symptomScores: [
          { symptomName: "Migraine frequency", score: 9 },
          { symptomName: "Emotional state", score: 8 },
          { symptomName: "Sleep quality", score: 6 },
        ],
      },
      {
        id: "te002",
        date: "2025-01-15",
        type: "prescription",
        title: "Natrum Muriaticum 200C",
        description:
          "Single dose of Nat Mur 200C prescribed. Wait and watch for 6 weeks. Dietary advice: reduce salt intake paradoxically.",
        remedy: "Natrum Muriaticum",
        potency: "200C",
        doctor: "Dr. Priya Nair",
        followUpDate: "2025-02-26",
        symptomScores: [],
      },
      {
        id: "te003",
        date: "2025-02-26",
        type: "appointment",
        title: "First Follow-Up",
        description:
          "Significant improvement reported. Migraine frequency reduced from 3/week to 1/week. Emotional state better — patient cried in session for the first time. Sleep quality improved.",
        doctor: "Dr. Priya Nair",
        symptomScores: [
          { symptomName: "Migraine frequency", score: 5 },
          { symptomName: "Emotional state", score: 5 },
          { symptomName: "Sleep quality", score: 7 },
        ],
      },
      {
        id: "te004",
        date: "2025-04-10",
        type: "prescription",
        title: "Natrum Muriaticum 200C — Second Dose",
        description:
          "Plateau in improvement noted. Second dose of 200C to deepen action. Advised to continue journaling for emotional release.",
        remedy: "Natrum Muriaticum",
        potency: "200C",
        doctor: "Dr. Priya Nair",
        followUpDate: "2025-05-22",
        symptomScores: [],
      },
      {
        id: "te005",
        date: "2025-05-22",
        type: "appointment",
        title: "Second Follow-Up",
        description:
          "Continued improvement. Migraines now occurring only premenstrually. Emotional health markedly improved — reconnected with family.",
        doctor: "Dr. Priya Nair",
        symptomScores: [
          { symptomName: "Migraine frequency", score: 3 },
          { symptomName: "Emotional state", score: 3 },
          { symptomName: "Sleep quality", score: 8 },
        ],
      },
      {
        id: "te006",
        date: "2025-07-20",
        type: "milestone",
        title: "Case Closed — Cured",
        description:
          "Final follow-up: no migraines for 6 weeks. Full emotional resolution. Patient off all prophylactic medications. Case formally closed.",
        doctor: "Dr. Priya Nair",
        symptomScores: [
          { symptomName: "Migraine frequency", score: 1 },
          { symptomName: "Emotional state", score: 1 },
          { symptomName: "Sleep quality", score: 9 },
        ],
      },
    ],
    symptomProgressions: [
      {
        symptomName: "Migraine frequency",
        data: [
          { date: "2025-01-15", score: 9 },
          { date: "2025-02-26", score: 5 },
          { date: "2025-04-10", score: 4 },
          { date: "2025-05-22", score: 3 },
          { date: "2025-07-20", score: 1 },
        ],
      },
      {
        symptomName: "Emotional state",
        data: [
          { date: "2025-01-15", score: 8 },
          { date: "2025-02-26", score: 5 },
          { date: "2025-04-10", score: 4 },
          { date: "2025-05-22", score: 3 },
          { date: "2025-07-20", score: 1 },
        ],
      },
      {
        symptomName: "Sleep quality",
        data: [
          { date: "2025-01-15", score: 6 },
          { date: "2025-02-26", score: 7 },
          { date: "2025-05-22", score: 8 },
          { date: "2025-07-20", score: 9 },
        ],
      },
    ],
    healthMetrics: {
      totalVisits: 4,
      avgFollowUpDays: 42,
      improvementRate: 92,
      activeRemedies: 0,
      lastVisit: "2025-07-20",
    },
  },
  {
    patientId: "p002",
    patientName: "Rahul Sharma",
    daysOnTreatment: 228,
    timelineEvents: [
      {
        id: "te101",
        date: "2025-03-01",
        type: "appointment",
        title: "Initial Consultation",
        description:
          "Chronic atopic eczema since childhood. Oozing sticky honey-like discharge in elbow folds and behind knees. Severe constipation, overweight, cold aggravation. Fear of failure, indecisive. Classic Graphites presentation.",
        doctor: "Dr. Arvind Kapoor",
        symptomScores: [
          { symptomName: "Eczema severity", score: 8 },
          { symptomName: "Constipation", score: 7 },
          { symptomName: "Energy levels", score: 5 },
        ],
      },
      {
        id: "te102",
        date: "2025-03-01",
        type: "prescription",
        title: "Graphites 30C",
        description:
          "Graphites 30C once weekly for 4 weeks. Anticipated healing crisis — patient counselled. Dietary modification: reduce dairy and wheat.",
        remedy: "Graphites",
        potency: "30C",
        doctor: "Dr. Arvind Kapoor",
        followUpDate: "2025-04-12",
        symptomScores: [],
      },
      {
        id: "te103",
        date: "2025-04-12",
        type: "appointment",
        title: "Follow-Up — Healing Crisis",
        description:
          "Initial aggravation occurred at week 3 — increased discharge and itching. Now resolving. Patient reassured. Constipation improved significantly. 20% overall improvement.",
        doctor: "Dr. Arvind Kapoor",
        symptomScores: [
          { symptomName: "Eczema severity", score: 7 },
          { symptomName: "Constipation", score: 4 },
          { symptomName: "Energy levels", score: 6 },
        ],
      },
      {
        id: "te104",
        date: "2025-05-28",
        type: "prescription",
        title: "Graphites 200C",
        description:
          "Escalated to 200C fortnightly. Healing crisis fully resolved. Significant reduction in discharge quantity. Weight loss of 3kg noted.",
        remedy: "Graphites",
        potency: "200C",
        doctor: "Dr. Arvind Kapoor",
        followUpDate: "2025-07-10",
        symptomScores: [],
      },
      {
        id: "te105",
        date: "2025-07-10",
        type: "appointment",
        title: "Mid-Treatment Review",
        description:
          "70% improvement in eczema. Folds largely clear. Constipation resolved. Energy markedly improved. Emotional state better — more decisive.",
        doctor: "Dr. Arvind Kapoor",
        symptomScores: [
          { symptomName: "Eczema severity", score: 3 },
          { symptomName: "Constipation", score: 2 },
          { symptomName: "Energy levels", score: 8 },
        ],
      },
      {
        id: "te106",
        date: "2025-10-14",
        type: "note",
        title: "Progress Note — Ongoing Maintenance",
        description:
          "Patient on monthly 200C maintenance. 80% sustained improvement. No winter flare this year — first time in 10 years. Continuing under annual review.",
        doctor: "Dr. Arvind Kapoor",
        symptomScores: [
          { symptomName: "Eczema severity", score: 2 },
          { symptomName: "Constipation", score: 1 },
          { symptomName: "Energy levels", score: 9 },
        ],
      },
    ],
    symptomProgressions: [
      {
        symptomName: "Eczema severity",
        data: [
          { date: "2025-03-01", score: 8 },
          { date: "2025-04-12", score: 7 },
          { date: "2025-05-28", score: 5 },
          { date: "2025-07-10", score: 3 },
          { date: "2025-10-14", score: 2 },
        ],
      },
      {
        symptomName: "Constipation",
        data: [
          { date: "2025-03-01", score: 7 },
          { date: "2025-04-12", score: 4 },
          { date: "2025-07-10", score: 2 },
          { date: "2025-10-14", score: 1 },
        ],
      },
      {
        symptomName: "Energy levels",
        data: [
          { date: "2025-03-01", score: 5 },
          { date: "2025-04-12", score: 6 },
          { date: "2025-07-10", score: 8 },
          { date: "2025-10-14", score: 9 },
        ],
      },
    ],
    healthMetrics: {
      totalVisits: 4,
      avgFollowUpDays: 45,
      improvementRate: 80,
      activeRemedies: 1,
      lastVisit: "2025-10-14",
    },
  },
  {
    patientId: "p004",
    patientName: "Mohammed Al-Hassan",
    daysOnTreatment: 300,
    timelineEvents: [
      {
        id: "te201",
        date: "2025-04-20",
        type: "appointment",
        title: "Initial Consultation — Rheumatoid Arthritis",
        description:
          "45-year-old male with RA since 2021. Morning stiffness lasting 2+ hours, bilateral small joints of hands and feet. Restlessness — cannot lie still. Worse cold damp. Suppressed eczema history in childhood. RF and Anti-CCP positive.",
        doctor: "Dr. Sneha Joshi",
        symptomScores: [
          { symptomName: "Joint pain", score: 9 },
          { symptomName: "Morning stiffness", score: 8 },
          { symptomName: "Restlessness", score: 7 },
          { symptomName: "Functional capacity", score: 4 },
        ],
      },
      {
        id: "te202",
        date: "2025-04-20",
        type: "prescription",
        title: "Rhus Toxicodendron 200C",
        description:
          "Rhus Tox 200C fortnightly. Coordinating with rheumatologist — not replacing DMARDs. Patient advised: hot bath in morning before mobilization.",
        remedy: "Rhus Toxicodendron",
        potency: "200C",
        doctor: "Dr. Sneha Joshi",
        followUpDate: "2025-06-01",
        symptomScores: [],
      },
      {
        id: "te203",
        date: "2025-06-01",
        type: "appointment",
        title: "First Follow-Up",
        description:
          "Morning stiffness duration reduced from 2 hours to 45 minutes. Pain scores improving. Restlessness still present. Off NSAIDs for 2 weeks. Rheumatologist pleased with progress.",
        doctor: "Dr. Sneha Joshi",
        symptomScores: [
          { symptomName: "Joint pain", score: 7 },
          { symptomName: "Morning stiffness", score: 6 },
          { symptomName: "Restlessness", score: 6 },
          { symptomName: "Functional capacity", score: 6 },
        ],
      },
      {
        id: "te204",
        date: "2025-08-15",
        type: "prescription",
        title: "Rhus Toxicodendron 1M",
        description:
          "Plateau at 6 weeks — escalated to 1M once. Patient reports skin on arms occasionally erupting — welcome sign suggesting reversal of suppression.",
        remedy: "Rhus Toxicodendron",
        potency: "1M",
        doctor: "Dr. Sneha Joshi",
        followUpDate: "2025-10-01",
        symptomScores: [],
      },
      {
        id: "te205",
        date: "2025-10-01",
        type: "appointment",
        title: "Mid-Treatment Assessment",
        description:
          "DAS-28 score dropped from 5.8 to 3.1. Off NSAIDs completely. Morning stiffness under 15 minutes. Skin eruption appears and heals spontaneously — good prognostic sign.",
        doctor: "Dr. Sneha Joshi",
        symptomScores: [
          { symptomName: "Joint pain", score: 4 },
          { symptomName: "Morning stiffness", score: 3 },
          { symptomName: "Restlessness", score: 3 },
          { symptomName: "Functional capacity", score: 8 },
        ],
      },
      {
        id: "te206",
        date: "2025-12-01",
        type: "note",
        title: "Ongoing Management Note",
        description:
          "Patient in significant remission. Maintaining on 1M every 8 weeks. CRP normalizing. Rheumatologist reducing DMARD dose. Excellent quality of life improvement reported.",
        doctor: "Dr. Sneha Joshi",
        symptomScores: [
          { symptomName: "Joint pain", score: 2 },
          { symptomName: "Morning stiffness", score: 2 },
          { symptomName: "Restlessness", score: 2 },
          { symptomName: "Functional capacity", score: 9 },
        ],
      },
      {
        id: "te207",
        date: "2026-02-14",
        type: "milestone",
        title: "Milestone — DMARD Reduction",
        description:
          "Rheumatologist has halved the Methotrexate dose. First time in 4 years. CRP 3.1 (normal range). Patient reports best quality of life in recent memory.",
        doctor: "Dr. Sneha Joshi",
        symptomScores: [
          { symptomName: "Joint pain", score: 2 },
          { symptomName: "Morning stiffness", score: 1 },
          { symptomName: "Restlessness", score: 1 },
          { symptomName: "Functional capacity", score: 9 },
        ],
      },
    ],
    symptomProgressions: [
      {
        symptomName: "Joint pain",
        data: [
          { date: "2025-04-20", score: 9 },
          { date: "2025-06-01", score: 7 },
          { date: "2025-08-15", score: 6 },
          { date: "2025-10-01", score: 4 },
          { date: "2025-12-01", score: 2 },
          { date: "2026-02-14", score: 2 },
        ],
      },
      {
        symptomName: "Morning stiffness",
        data: [
          { date: "2025-04-20", score: 8 },
          { date: "2025-06-01", score: 6 },
          { date: "2025-08-15", score: 5 },
          { date: "2025-10-01", score: 3 },
          { date: "2025-12-01", score: 2 },
          { date: "2026-02-14", score: 1 },
        ],
      },
      {
        symptomName: "Functional capacity",
        data: [
          { date: "2025-04-20", score: 4 },
          { date: "2025-06-01", score: 6 },
          { date: "2025-10-01", score: 8 },
          { date: "2025-12-01", score: 9 },
          { date: "2026-02-14", score: 9 },
        ],
      },
    ],
    healthMetrics: {
      totalVisits: 5,
      avgFollowUpDays: 56,
      improvementRate: 78,
      activeRemedies: 1,
      lastVisit: "2026-02-14",
    },
  },
];
