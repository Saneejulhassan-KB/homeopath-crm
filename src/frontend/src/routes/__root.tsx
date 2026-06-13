import { Layout } from "@/components/layout/Layout";
import {
  Outlet,
  createRootRoute,
  useRouterState,
} from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const location = useRouterState({ select: (s) => s.location });
  const isStandalonePage =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/landing";

  if (isStandalonePage) {
    return <Outlet />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
