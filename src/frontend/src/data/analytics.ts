import type { Analytics } from "../types";

export const analytics: Analytics = {
  patientGrowth: [
    { month: "May 2025", value: 48 },
    { month: "Jun 2025", value: 54 },
    { month: "Jul 2025", value: 61 },
    { month: "Aug 2025", value: 58 },
    { month: "Sep 2025", value: 67 },
    { month: "Oct 2025", value: 74 },
    { month: "Nov 2025", value: 81 },
    { month: "Dec 2025", value: 79 },
    { month: "Jan 2026", value: 88 },
    { month: "Feb 2026", value: 95 },
    { month: "Mar 2026", value: 102 },
    { month: "Apr 2026", value: 115 },
  ],
  revenue: [
    { month: "May 2025", value: 42000 },
    { month: "Jun 2025", value: 49500 },
    { month: "Jul 2025", value: 55800 },
    { month: "Aug 2025", value: 51200 },
    { month: "Sep 2025", value: 63400 },
    { month: "Oct 2025", value: 71000 },
    { month: "Nov 2025", value: 78500 },
    { month: "Dec 2025", value: 82000 },
    { month: "Jan 2026", value: 86500 },
    { month: "Feb 2026", value: 91000 },
    { month: "Mar 2026", value: 98400 },
    { month: "Apr 2026", value: 104200 },
  ],
  appointmentStats: {
    confirmed: 45,
    pending: 18,
    completed: 87,
    cancelled: 9,
  },
};

export const topRemedies = [
  { name: "Lycopodium", count: 23 },
  { name: "Sulphur", count: 19 },
  { name: "Natrum Mur", count: 17 },
  { name: "Pulsatilla", count: 15 },
  { name: "Sepia", count: 13 },
  { name: "Calc Carb", count: 11 },
];

export const patientsByCondition = [
  { condition: "Skin Disorders", count: 28 },
  { condition: "Respiratory", count: 22 },
  { condition: "Digestive", count: 19 },
  { condition: "Endocrine", count: 16 },
  { condition: "Musculoskeletal", count: 14 },
  { condition: "Neurological", count: 11 },
  { condition: "Psychological", count: 5 },
];
