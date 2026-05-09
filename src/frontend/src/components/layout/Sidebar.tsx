import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store";
import { NAV_ITEMS, ROUTES } from "@/utils/constants";
import { ROLE_CONFIGS, getRoleConfig } from "@/utils/roleAccess";
const COLOR_HEX: Record<string, string> = {
  violet: "#7C3AED",
  sky: "#0EA5E9",
  emerald: "#10B981",
  amber: "#F59E0B",
  pink: "#EC4899",
  cyan: "#06B6D4",
};
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  Archive,
  BarChart3,
  BookOpen,
  Brain,
  Calendar,
  CalendarCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Crown,
  FileText,
  FlaskConical,
  GitCompare,
  HeartPulse,
  LayoutDashboard,
  Leaf,
  LogOut,
  Mic2,
  Pill,
  Receipt,
  Search,
  Settings,
  Shield,
  Stethoscope,
  UserCog,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

// Maps icon name string → LucideIcon component
const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  UserCog,
  Calendar,
  Pill,
  Brain,
  CreditCard,
  BarChart3,
  Settings,
  Crown,
  Mic2,
  Search,
  FileText,
  Activity,
  GitCompare,
  Archive,
  BookOpen,
};

const ROLE_ICON_MAP: Record<string, LucideIcon> = {
  Shield,
  Stethoscope,
  CalendarCheck,
  FlaskConical,
  HeartPulse,
  Receipt,
};

const navBadges: Record<string, number> = {
  "/patients": 3,
  "/appointments": 5,
  "/billing": 2,
};

interface NavItem {
  path: string;
  label: string;
  Icon: LucideIcon;
  badge?: number;
}

const proSubItems: NavItem[] = [
  { path: ROUTES.PRO_VOICE, label: "Voice Recorder", Icon: Mic2 },
  { path: ROUTES.PRO_REMEDY_FINDER, label: "Remedy Finder", Icon: Search },
  { path: ROUTES.PRO_TEMPLATES, label: "Case Templates", Icon: FileText },
  { path: ROUTES.PRO_TIMELINE, label: "Patient Timeline", Icon: Activity },
  { path: ROUTES.PRO_COMPARISON, label: "Remedy Comparison", Icon: GitCompare },
  { path: ROUTES.PRO_REPOSITORY, label: "Case Repository", Icon: Archive },
  { path: ROUTES.PRO_MATERIA_MEDICA, label: "Materia Medica", Icon: BookOpen },
];

// Silence unused-import warnings for ROLE_CONFIGS (used via ROLE_ICON_MAP indirectly)
void ROLE_CONFIGS;

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

export function Sidebar({ mobile = false, onClose }: SidebarProps) {
  const { sidebarOpen, toggleSidebar, currentRole, currentUser } =
    useAppStore();
  const routerState = useRouterState();
  const navigate = useNavigate();
  const currentPath = routerState.location.pathname;
  const collapsed = !mobile && !sidebarOpen;

  const isProActive =
    currentPath === ROUTES.PRO || currentPath.startsWith("/pro/");

  const [proExpanded, setProExpanded] = useState(isProActive);

  const roleConfig = currentRole ? getRoleConfig(currentRole) : null;
  const RoleIcon = roleConfig
    ? (ROLE_ICON_MAP[roleConfig.icon] ?? Shield)
    : Shield;

  // Filter nav to only items the current role can access (exclude Pro hub — shown separately)
  const visibleNavItems: NavItem[] = currentRole
    ? (
        NAV_ITEMS as unknown as {
          path: string;
          label: string;
          icon: string;
          roles: readonly string[];
        }[]
      )
        .filter(
          (item) =>
            item.label !== "Pro Features" && item.roles.includes(currentRole),
        )
        .map((item) => ({
          path: item.path,
          label: item.label,
          Icon: ICON_MAP[item.icon] ?? LayoutDashboard,
          badge: navBadges[item.path],
        }))
    : [];

  const showPro = currentRole === "main-admin" || currentRole === "doctor";

  function handleLogout() {
    const { logout } = useAppStore.getState();
    logout();
    navigate({ to: "/login" });
  }

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
          {visibleNavItems.map(({ path, label, Icon, badge }) => {
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

          {/* Pro Features separator — only admin/doctor */}
          {showPro && !collapsed && (
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
          {showPro && collapsed && (
            <div className="pt-3 pb-1 px-0 border-t border-white/8 mx-2" />
          )}

          {/* Pro Features hub link with expandable sub-items — only admin/doctor */}
          {showPro &&
            (() => {
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
                      <Crown className="w-5 h-5 shrink-0 text-[var(--premium,hsl(60_80%_60%))]" />
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

                    {/* Expand/collapse chevron */}
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

                  {/* Sub-items */}
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
          {roleConfig ? (
            collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center cursor-default"
                    style={{
                      background: `${COLOR_HEX[roleConfig.color] ?? roleConfig.color}22`,
                      border: `1px solid ${COLOR_HEX[roleConfig.color] ?? roleConfig.color}44`,
                    }}
                  >
                    <RoleIcon
                      className="w-4 h-4"
                      style={{
                        color: COLOR_HEX[roleConfig.color] ?? roleConfig.color,
                      }}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  <p className="font-medium">{roleConfig.displayName}</p>
                  <p className="text-muted-foreground capitalize">
                    {currentRole}
                  </p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: `${roleConfig.color}22`,
                    border: `1px solid ${roleConfig.color}44`,
                  }}
                >
                  <RoleIcon
                    className="w-4 h-4"
                    style={{
                      color: COLOR_HEX[roleConfig.color] ?? roleConfig.color,
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">
                    {currentUser?.name ?? roleConfig.displayName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate capitalize">
                    {roleConfig.displayName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  aria-label="Logout"
                  data-ocid="sidebar-logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )
          ) : null}
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}
