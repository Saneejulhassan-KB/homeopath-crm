import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  variant?: "table" | "cards" | "chart" | "list";
  rows?: number;
  cols?: number;
  className?: string;
}

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

export function LoadingSkeleton({
  variant = "table",
  rows = 5,
  cols = 4,
  className,
}: LoadingSkeletonProps) {
  if (variant === "cards") {
    return (
      <div
        className={cn(
          "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
          className,
        )}
      >
        {range(rows).map((i) => (
          <div key={`card-${i}`} className="glass-card p-5 space-y-4">
            <div className="flex items-start justify-between">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <Skeleton className="w-16 h-5 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="w-24 h-7" />
              <Skeleton className="w-32 h-4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "chart") {
    return (
      <div className={cn("glass-card p-6 space-y-4", className)}>
        <div className="flex items-center justify-between">
          <Skeleton className="w-40 h-6" />
          <Skeleton className="w-20 h-8 rounded-lg" />
        </div>
        <Skeleton className="w-full h-64 rounded-lg" />
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div className={cn("space-y-3", className)}>
        {range(rows).map((i) => (
          <div
            key={`list-${i}`}
            className="flex items-center gap-3 p-3 glass-card"
          >
            <Skeleton className="w-10 h-10 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="w-1/3 h-4" />
              <Skeleton className="w-1/2 h-3" />
            </div>
            <Skeleton className="w-16 h-5 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  // Default: table skeleton
  const colStyle = { gridTemplateColumns: `repeat(${cols}, 1fr)` };
  return (
    <div className={cn("space-y-2", className)}>
      <div className="grid gap-3 px-4 py-3">
        <div className="grid gap-4" style={colStyle}>
          {range(cols).map((i) => (
            <Skeleton key={`thead-${i}`} className="h-4 w-3/4" />
          ))}
        </div>
      </div>
      {range(rows).map((i) => (
        <div key={`trow-${i}`} className="px-4 py-3 border-b border-border/50">
          <div className="grid gap-4" style={colStyle}>
            {range(cols).map((j) => (
              <Skeleton
                key={`tcell-${i}-${j}`}
                className="h-4"
                style={{ width: j === 0 ? "80%" : "60%" }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
