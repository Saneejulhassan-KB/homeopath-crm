import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: ReactNode;
  color?: "teal" | "green" | "amber" | "rose" | "purple";
  suffix?: string;
}

const colorMap = {
  teal: "bg-primary/15 text-primary border-primary/20",
  green: "bg-green-500/15 text-green-400 border-green-500/20",
  amber: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  rose: "bg-rose-500/15 text-rose-400 border-rose-500/20",
  purple: "bg-purple-500/15 text-purple-400 border-purple-500/20",
};

export function StatCard({
  title,
  value,
  change,
  icon,
  color = "teal",
  suffix,
}: StatCardProps) {
  const isPositive = (change ?? 0) >= 0;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="glass-card p-5 flex flex-col gap-4 cursor-default"
      data-ocid="stat-card"
    >
      <div className="flex items-start justify-between">
        <div className={cn("p-2.5 rounded-xl border", colorMap[color])}>
          {icon}
        </div>
        {change !== undefined && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
              isPositive
                ? "bg-green-500/10 text-green-400"
                : "bg-destructive/10 text-destructive",
            )}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>

      <div>
        <p className="text-2xl font-display font-bold text-foreground tabular-nums">
          {value}
          {suffix && (
            <span className="text-sm font-body font-normal text-muted-foreground ml-1">
              {suffix}
            </span>
          )}
        </p>
        <p className="text-sm text-muted-foreground mt-1 font-body">{title}</p>
      </div>
    </motion.div>
  );
}
