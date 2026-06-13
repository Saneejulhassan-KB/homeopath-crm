import { AdminDashboard } from "@/components/dashboards/AdminDashboard";
import { useAppStore } from "@/store";
import { Navigate, createRoute } from "@tanstack/react-router";
import { Route as rootRoute } from "./__root";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DashboardPage,
});

function DashboardPage() {
  const currentRole = useAppStore((s) => s.currentRole);

  if (currentRole === null) return <Navigate to="/landing" />;

  return <AdminDashboard roleId={currentRole} />;
}
