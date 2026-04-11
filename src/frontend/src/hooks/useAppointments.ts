import { useCallback, useEffect, useState } from "react";
import { appointments as mockAppointments } from "../data/appointments";
import type { Appointment } from "../types";

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAppointments(mockAppointments);
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const addAppointment = useCallback((appointment: Omit<Appointment, "id">) => {
    const newAppointment: Appointment = {
      ...appointment,
      id: `a${Date.now()}`,
    };
    setAppointments((prev) => [newAppointment, ...prev]);
  }, []);

  const updateAppointment = useCallback(
    (id: string, updates: Partial<Appointment>) => {
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...updates } : a)),
      );
    },
    [],
  );

  const deleteAppointment = useCallback((id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const getTodaysAppointments = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    return appointments.filter((a) => a.date === today);
  }, [appointments]);

  return {
    appointments,
    isLoading,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    getTodaysAppointments,
  };
}
