import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumb?: { label: string; href?: string }[];
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
    variant?: "default" | "outline" | "ghost" | "secondary" | "destructive";
  };
  actions?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
    variant?: "default" | "outline" | "ghost" | "secondary" | "destructive";
  }[];
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumb,
  action,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("flex items-start justify-between gap-4 mb-6", className)}
      data-ocid="page-header"
    >
      <div className="min-w-0">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
            {breadcrumb.map((item, i) => (
              <span key={item.label} className="flex items-center gap-1.5">
                {i > 0 && <span className="opacity-40">/</span>}
                <span
                  className={
                    i === breadcrumb.length - 1 ? "text-foreground" : ""
                  }
                >
                  {item.label}
                </span>
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-2xl font-display font-bold text-foreground truncate">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-0.5 font-body">
            {description}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {actions?.map((a) => (
          <Button
            key={a.label}
            variant={a.variant ?? "default"}
            onClick={a.onClick}
            className="flex items-center gap-2"
            data-ocid={`page-header-action-${a.label}`}
          >
            {a.icon}
            {a.label}
          </Button>
        ))}
        {action && (
          <Button
            onClick={action.onClick}
            className="flex items-center gap-2"
            data-ocid="page-header-action"
          >
            {action.icon}
            {action.label}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
