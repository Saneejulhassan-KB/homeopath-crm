import { cn } from "@/lib/utils";
import { STATUS_COLORS } from "@/utils/constants";

type StatusKey = keyof typeof STATUS_COLORS;

interface StatusBadgeProps {
  status: StatusKey;
  className?: string;
}

const statusLabels: Record<StatusKey, string> = {
  confirmed: "Confirmed",
  pending: "Pending",
  completed: "Completed",
  cancelled: "Cancelled",
  paid: "Paid",
  overdue: "Overdue",
  active: "Active",
  inactive: "Inactive",
  stopped: "Stopped",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        STATUS_COLORS[status],
        className,
      )}
      data-ocid={`status-badge-${status}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70" />
      {statusLabels[status]}
    </span>
  );
}
