import { Outlet, createRoute } from "@tanstack/react-router";
import { Route as rootRoute } from "./__root";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/patients",
  component: PatientsLayout,
});

function PatientsLayout() {
  return <Outlet />;
}
