import type { Notification } from "../types";

export const notifications: Notification[] = [
  {
    id: "n001",
    title: "Appointment in 30 minutes",
    message: "Arjun Sharma — Follow-up consultation at 09:00 AM",
    time: "8:30 AM",
    read: false,
    type: "appointment",
  },
  {
    id: "n002",
    title: "Payment overdue",
    message: "Elena Kozlov — Invoice #inv006 of ₹1,900 is overdue since Mar 15",
    time: "9:15 AM",
    read: false,
    type: "payment",
  },
  {
    id: "n003",
    title: "New patient registered",
    message: "Fatima Al-Zahra has been added to the system by Dr. Anand Verma",
    time: "Yesterday",
    read: false,
    type: "system",
  },
  {
    id: "n004",
    title: "Prescription renewal reminder",
    message:
      "Hans Mueller — Sabal Serrulata Q runs out in 7 days. Renew prescription.",
    time: "2 days ago",
    read: true,
    type: "reminder",
  },
  {
    id: "n005",
    title: "System maintenance scheduled",
    message:
      "System backup and maintenance on Apr 20, 2026 from 2:00–4:00 AM IST.",
    time: "3 days ago",
    read: true,
    type: "alert",
  },
];
