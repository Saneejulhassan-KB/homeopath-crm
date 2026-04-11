import { Outlet, createRoute } from "@tanstack/react-router";
import { Route as rootRoute } from "./__root";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pro",
  component: ProLayout,
});

function ProLayout() {
  // This is the layout shell for all /pro/* routes.
  // Renders <Outlet /> so child routes (index, voice-recorder, etc.) can mount.
  return <Outlet />;
}
