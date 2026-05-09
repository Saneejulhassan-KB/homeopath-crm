import { AdminDashboard } from "@/components/dashboards/AdminDashboard";
import { BillingDashboard } from "@/components/dashboards/BillingDashboard";
import { DoctorDashboard } from "@/components/dashboards/DoctorDashboard";
import { NurseDashboard } from "@/components/dashboards/NurseDashboard";
import { PharmacistDashboard } from "@/components/dashboards/PharmacistDashboard";
import { ReceptionistDashboard } from "@/components/dashboards/ReceptionistDashboard";
import { useAppStore } from "@/store";
import { createRoute } from "@tanstack/react-router";
import { Route as rootRoute } from "./__root";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DashboardPage,
});

function DashboardPage() {
  const currentRole = useAppStore((s) => s.currentRole);

  if (currentRole === null) return null;

  if (currentRole === "main-admin") return <AdminDashboard />;
  if (currentRole === "doctor") return <DoctorDashboard />;
  if (currentRole === "receptionist") return <ReceptionistDashboard />;
  if (currentRole === "pharmacist") return <PharmacistDashboard />;
  if (currentRole === "nurse") return <NurseDashboard />;
  if (currentRole === "billing") return <BillingDashboard />;

  return <AdminDashboard />;
}
