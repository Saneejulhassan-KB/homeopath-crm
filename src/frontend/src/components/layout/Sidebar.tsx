import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store";
import { ROUTES } from "@/utils/constants";
import { getInitials } from "@/utils/formatters";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  Archive,
  BarChart3,
  BookOpen,
  Brain,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Crown,
  FileText,
  GitCompare,
  LayoutDashboard,
  Leaf,
  LogOut,
  Mic2,
  Pill,
  Search,
  Settings,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

interface NavItem {
  path: string;
  label: string;
  Icon: LucideIcon;
  badge?: number;
}

const navItems: NavItem[] = [
  { path: ROUTES.DASHBOARD, label: "Dashboard", Icon: LayoutDashboard },
  { path: ROUTES.PATIENTS, label: "Patients", Icon: Users, badge: 3 },
  {
    path: ROUTES.APPOINTMENTS,
    label: "Appointments",
    Icon: Calendar,
    badge: 5,
  },
  { path: ROUTES.PRESCRIPTIONS, label: "Prescriptions", Icon: Pill },
  { path: ROUTES.AI_ASSISTANT, label: "AI Assistant", Icon: Brain },
  { path: ROUTES.BILLING, label: "Billing", Icon: CreditCard, badge: 2 },
  { path: ROUTES.REPORTS, label: "Reports", Icon: BarChart3 },
  { path: ROUTES.SETTINGS, label: "Settings", Icon: Settings },
];

const proSubItems: NavItem[] = [
  { path: ROUTES.PRO_VOICE, label: "Voice Recorder", Icon: Mic2 },
  { path: ROUTES.PRO_REMEDY_FINDER, label: "Remedy Finder", Icon: Search },
  { path: ROUTES.PRO_TEMPLATES, label: "Case Templates", Icon: FileText },
  { path: ROUTES.PRO_TIMELINE, label: "Patient Timeline", Icon: Activity },
  {
    path: ROUTES.PRO_COMPARISON,
    label: "Remedy Comparison",
    Icon: GitCompare,
  },
  { path: ROUTES.PRO_REPOSITORY, label: "Case Repository", Icon: Archive },
  {
    path: ROUTES.PRO_MATERIA_MEDICA,
    label: "Materia Medica",
    Icon: BookOpen,
  },
];

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

export function Sidebar({ mobile = false, onClose }: SidebarProps) {
  const { sidebarOpen, toggleSidebar, currentRole } = useAppStore();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const collapsed = !mobile && !sidebarOpen;

  const isProActive =
    currentPath === ROUTES.PRO || currentPath.startsWith("/pro/");

  // Auto-expand when on a pro sub-page
  const [proExpanded, setProExpanded] = useState(isProActive);

  const userInfo = {
    Admin: {
      name: "Dr. Meera Joshi",
      email: "meera@homeopath.clinic",
      color: "bg-primary",
    },
    Doctor: {
      name: "Dr. Anand Verma",
      email: "anand@homeopath.clinic",
      color: "bg-accent",
    },
    Receptionist: {
      name: "Priya Sharma",
      email: "priya@homeopath.clinic",
      color: "bg-purple-500",
    },
  };

  const user = userInfo[currentRole];
  const initials = getInitials(user.name);

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "flex flex-col h-full overflow-hidden",
          mobile
            ? "w-60 bg-card/95 backdrop-blur-xl"
            : "bg-sidebar/80 backdrop-blur-xl border-r border-white/8",
        )}
        data-ocid="sidebar"
      >
        {/* Logo */}
        <div
          className={cn(
            "flex items-center gap-3 p-4 border-b border-white/8 shrink-0",
            collapsed && "justify-center",
          )}
        >
          <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
            <Leaf className="w-5 h-5 text-primary" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <p className="font-display font-bold text-foreground text-sm leading-tight whitespace-nowrap">
                  HomeoPath
                </p>
                <p className="text-xs text-muted-foreground whitespace-nowrap">
                  CRM
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          {!mobile && (
            <button
              type="button"
              onClick={toggleSidebar}
              className={cn(
                "ml-auto p-1 rounded-md hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors shrink-0",
                collapsed && "hidden",
              )}
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              data-ocid="sidebar-toggle"
            >
              {sidebarOpen ? (
                <ChevronLeft className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-0.5">
          {navItems.map(({ path, label, Icon, badge }) => {
            const isActive =
              currentPath === path ||
              (path !== "/" && currentPath.startsWith(path));
            const item = (
              <Link
                key={path}
                to={path}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                  isActive
                    ? "bg-primary/20 text-primary border border-primary/25 shadow-sm"
                    : "text-sidebar-foreground hover:bg-white/8 hover:text-foreground",
                  collapsed && "justify-center px-0",
                )}
                data-ocid={`nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 shrink-0",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground",
                  )}
                />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 truncate"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {!collapsed && badge && (
                  <Badge className="ml-auto h-5 min-w-[1.25rem] px-1.5 text-[10px] bg-primary/20 text-primary border-primary/30">
                    {badge}
                  </Badge>
                )}
                {collapsed && badge && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
                )}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={path}>
                  <TooltipTrigger asChild>{item}</TooltipTrigger>
                  <TooltipContent side="right" className="text-xs">
                    {label}
                  </TooltipContent>
                </Tooltip>
              );
            }
            return item;
          })}

          {/* Pro Features separator */}
          {!collapsed && (
            <div className="pt-3 pb-1 px-1">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-white/8" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--premium,hsl(60_80%_60%))] opacity-80">
                  Pro
                </span>
                <div className="h-px flex-1 bg-white/8" />
              </div>
            </div>
          )}
          {collapsed && (
            <div className="pt-3 pb-1 px-0 border-t border-white/8 mx-2" />
          )}

          {/* Pro Features hub link with expandable sub-items */}
          {(() => {
            const proItem = (
              <div key="pro-section">
                {/* Pro Hub link + expand toggle */}
                <div className="flex items-center">
                  <Link
                    to={ROUTES.PRO}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative border flex-1 min-w-0",
                      isProActive
                        ? "bg-[hsl(60_70%_55%/15%)] text-[var(--premium,hsl(60_80%_60%))] border-[hsl(60_70%_55%/35%)] shadow-sm"
                        : "text-[var(--premium,hsl(60_80%_60%))] border-transparent hover:bg-[hsl(60_70%_55%/10%)]",
                      collapsed && "justify-center px-0",
                    )}
                    data-ocid="nav-pro-features"
                  >
                    <Crown
                      className={cn(
                        "w-5 h-5 shrink-0 text-[var(--premium,hsl(60_80%_60%))]",
                      )}
                    />
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex-1 truncate font-semibold"
                        >
                          Pro Features
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {!collapsed && (
                      <span className="ml-auto text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-[hsl(60_70%_55%/20%)] text-[var(--premium,hsl(60_80%_60%))] border border-[hsl(60_70%_55%/30%)] shrink-0">
                        Pro
                      </span>
                    )}
                    {collapsed && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--premium,hsl(60_80%_60%))]" />
                    )}
                  </Link>

                  {/* Expand/collapse chevron (only when sidebar is open) */}
                  {!collapsed && (
                    <button
                      type="button"
                      onClick={() => setProExpanded((v) => !v)}
                      className="ml-1 p-1.5 rounded-md text-[var(--premium,hsl(60_80%_60%))] hover:bg-[hsl(60_70%_55%/10%)] transition-colors shrink-0"
                      aria-label={
                        proExpanded ? "Collapse pro menu" : "Expand pro menu"
                      }
                      data-ocid="pro-expand-toggle"
                    >
                      <motion.div
                        animate={{ rotate: proExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </motion.div>
                    </button>
                  )}
                </div>

                {/* Sub-items (expanded state) */}
                <AnimatePresence>
                  {!collapsed && proExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="pl-4 mt-1 space-y-0.5 border-l border-[hsl(60_70%_55%/20%)] ml-4">
                        {proSubItems.map(({ path, label, Icon }) => {
                          const isSubActive = currentPath === path;
                          return (
                            <Link
                              key={path}
                              to={path}
                              onClick={onClose}
                              className={cn(
                                "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 group",
                                isSubActive
                                  ? "bg-[hsl(60_70%_55%/15%)] text-[var(--premium,hsl(60_80%_60%))]"
                                  : "text-muted-foreground hover:text-[var(--premium,hsl(60_80%_60%))] hover:bg-[hsl(60_70%_55%/8%)]",
                              )}
                              data-ocid={`nav-pro-${label.toLowerCase().replace(/\s+/g, "-")}`}
                            >
                              <Icon className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{label}</span>
                              {isSubActive && (
                                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--premium,hsl(60_80%_60%))] shrink-0" />
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );

            if (collapsed) {
              return (
                <Tooltip key={ROUTES.PRO}>
                  <TooltipTrigger asChild>
                    <Link
                      to={ROUTES.PRO}
                      onClick={onClose}
                      className={cn(
                        "flex items-center justify-center gap-3 px-0 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative border",
                        isProActive
                          ? "bg-[hsl(60_70%_55%/15%)] text-[var(--premium,hsl(60_80%_60%))] border-[hsl(60_70%_55%/35%)] shadow-sm"
                          : "text-[var(--premium,hsl(60_80%_60%))] border-transparent hover:bg-[hsl(60_70%_55%/10%)]",
                      )}
                      data-ocid="nav-pro-features-collapsed"
                    >
                      <Crown className="w-5 h-5 shrink-0 text-[var(--premium,hsl(60_80%_60%))]" />
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--premium,hsl(60_80%_60%))]" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="text-xs">
                    Pro Features
                  </TooltipContent>
                </Tooltip>
              );
            }
            return proItem;
          })()}
        </nav>

        {/* User section */}
        <div
          className={cn(
            "border-t border-white/8 p-3 shrink-0",
            collapsed ? "flex justify-center" : "",
          )}
        >
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground cursor-default",
                    user.color,
                  )}
                >
                  {initials}
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                <p className="font-medium">{user.name}</p>
                <p className="text-muted-foreground">{currentRole}</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0",
                  user.color,
                )}
              >
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">
                  {user.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {currentRole}
                </p>
              </div>
              <button
                type="button"
                className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                aria-label="Logout"
                data-ocid="sidebar-logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}
