import { useCallback, useEffect, useState } from "react";
import { patients as mockPatients } from "../data/patients";
import type { Patient } from "../types";

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPatients(mockPatients);
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const addPatient = useCallback((patient: Omit<Patient, "id">) => {
    const newPatient: Patient = {
      ...patient,
      id: `p${Date.now()}`,
    };
    setPatients((prev) => [newPatient, ...prev]);
  }, []);

  const updatePatient = useCallback((id: string, updates: Partial<Patient>) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    );
  }, []);

  const deletePatient = useCallback((id: string) => {
    setPatients((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const getPatientById = useCallback(
    (id: string) => patients.find((p) => p.id === id),
    [patients],
  );

  return {
    patients,
    isLoading,
    addPatient,
    updatePatient,
    deletePatient,
    getPatientById,
  };
}
