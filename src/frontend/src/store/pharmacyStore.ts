import { create } from "zustand";

export interface PharmacyQueueEntry {
  id: string;
  patientId: string;
  patientName: string;
  patientRegId: string;
  doctorName: string;
  date: string;
  medicines: string; // raw HTML or text from medicine editor
  consultationFee: number;
  medicineFee: number;
  extraMedicineFee: number;
  registrationFee: number;
  totalAmount: number;
  dueAmount: number;
  status: "pending" | "confirmed";
  nextVisit?: string;
}

const STORAGE_KEY = "hcrm_pharmacy_queue";

const DEMO_ENTRIES: PharmacyQueueEntry[] = [
  {
    id: "pq-demo-1",
    patientId: "p-001",
    patientName: "Arjun Mehta",
    patientRegId: "HOM-0001",
    doctorName: "Dr. Priya Sharma",
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    medicines:
      "<p><strong>Nux Vomica 30C</strong> — 3 doses daily after meals<br/><strong>Sulphur 200C</strong> — 1 dose weekly</p>",
    consultationFee: 500,
    medicineFee: 350,
    extraMedicineFee: 100,
    registrationFee: 200,
    totalAmount: 1150,
    dueAmount: 300,
    status: "pending",
  },
  {
    id: "pq-demo-2",
    patientId: "p-002",
    patientName: "Kavya Nair",
    patientRegId: "HOM-0002",
    doctorName: "Dr. Rajan Pillai",
    date: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    medicines:
      "<p><strong>Arsenicum Album 30C</strong> — 2 doses daily<br/><strong>Pulsatilla 200C</strong> — 1 dose at night</p>",
    consultationFee: 500,
    medicineFee: 280,
    extraMedicineFee: 0,
    registrationFee: 0,
    totalAmount: 780,
    dueAmount: 0,
    status: "pending",
  },
];

function loadQueue(): PharmacyQueueEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as PharmacyQueueEntry[];
  } catch {
    // ignore parse errors
  }
  // Seed demo data on first load
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_ENTRIES));
  return DEMO_ENTRIES;
}

function persistQueue(queue: PharmacyQueueEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

interface PharmacyState {
  queue: PharmacyQueueEntry[];
  addToQueue: (entry: Omit<PharmacyQueueEntry, "id" | "status">) => void;
  confirmEntry: (id: string, dueAmount: number, nextVisit?: string) => void;
  removeEntry: (id: string) => void;
  getPendingCount: () => number;
}

export const usePharmacyStore = create<PharmacyState>((set, get) => ({
  queue: loadQueue(),

  addToQueue: (entry) => {
    const newEntry: PharmacyQueueEntry = {
      ...entry,
      id: `pq-${Date.now()}`,
      status: "pending",
    };
    set((state) => {
      const updated = [newEntry, ...state.queue];
      persistQueue(updated);
      return { queue: updated };
    });
  },

  confirmEntry: (id, dueAmount, nextVisit) => {
    set((state) => {
      const updated = state.queue.map((e) =>
        e.id === id
          ? { ...e, status: "confirmed" as const, dueAmount, nextVisit }
          : e,
      );
      persistQueue(updated);
      return { queue: updated };
    });
  },

  removeEntry: (id) => {
    set((state) => {
      const updated = state.queue.filter((e) => e.id !== id);
      persistQueue(updated);
      return { queue: updated };
    });
  },

  getPendingCount: () => {
    return get().queue.filter((e) => e.status === "pending").length;
  },
}));
