import type { RoleId } from "@/types";
import { hasDashboardPermission } from "@/utils/roleAccess";
import { Lock } from "lucide-react";
import type { ReactNode } from "react";

export type DashboardPermissionKey =
  | "dashboard.view_all"
  | "dashboard.total_appointments"
  | "dashboard.total_visitors"
  | "dashboard.case_taken"
  | "dashboard.total_revenue"
  | "dashboard.new_registrations"
  | "dashboard.total_patients"
  | "dashboard.pending_cases"
  | "dashboard.doctor_performance";

interface PermissionLockProps {
  roleId: RoleId;
  permission: DashboardPermissionKey;
  fallbackMessage?: string;
  children: ReactNode;
}

export function PermissionLock({
  roleId,
  permission,
  fallbackMessage,
  children,
}: PermissionLockProps) {
  const allowed = hasDashboardPermission(roleId, permission);

  if (allowed) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="blur-sm grayscale opacity-50 pointer-events-none select-none">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10">
        <div className="p-3 rounded-full bg-muted/80 border border-border shadow-lg">
          <Lock className="w-6 h-6 text-muted-foreground" />
        </div>
        {fallbackMessage && (
          <span className="text-xs font-medium text-muted-foreground bg-background/80 px-2 py-1 rounded-md">
            {fallbackMessage}
          </span>
        )}
      </div>
    </div>
  );
}
