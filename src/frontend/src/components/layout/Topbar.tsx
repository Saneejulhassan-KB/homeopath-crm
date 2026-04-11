import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store";
import type { Language, Role } from "@/types";
import { LANGUAGES, ROLES } from "@/utils/constants";
import { getInitials } from "@/utils/formatters";
import { useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Check,
  ChevronDown,
  Globe,
  Menu,
  Moon,
  Search,
  Sun,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/patients": "Patient Management",
  "/appointments": "Appointments",
  "/prescriptions": "Prescriptions",
  "/ai-assistant": "AI Assistant",
  "/billing": "Billing & Payments",
  "/reports": "Reports & Analytics",
  "/settings": "Clinic Settings",
};

export function Topbar({
  onMobileMenuClick,
}: { onMobileMenuClick?: () => void }) {
  const {
    toggleSidebar,
    toggleTheme,
    theme,
    language,
    setLanguage,
    currentRole,
    setRole,
    searchQuery,
    setSearchQuery,
    notifications,
    markAllNotificationsRead,
    markNotificationRead,
  } = useAppStore();

  const isMobile = useIsMobile();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const pageTitle = PAGE_TITLES[currentPath] ?? "HomeoPath CRM";
  const unreadCount = notifications.filter((n) => !n.read).length;

  const [notifOpen, setNotifOpen] = useState(false);

  const userInfo = {
    Admin: { name: "Dr. Meera Joshi", color: "bg-primary" },
    Doctor: { name: "Dr. Anand Verma", color: "bg-accent" },
    Receptionist: { name: "Priya Sharma", color: "bg-purple-500" },
  };
  const user = userInfo[currentRole];
  const initials = getInitials(user.name);

  const notifTypeColors = {
    appointment: "text-primary",
    payment: "text-amber-400",
    reminder: "text-blue-400",
    system: "text-muted-foreground",
    alert: "text-destructive",
  };

  return (
    <header
      className="sticky top-0 z-40 h-16 flex items-center gap-3 px-4 glass border-b border-white/8 backdrop-blur-xl"
      data-ocid="topbar"
    >
      {/* Hamburger */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          if (isMobile) {
            onMobileMenuClick?.();
          } else {
            toggleSidebar();
          }
        }}
        className="shrink-0"
        aria-label="Toggle sidebar"
        data-ocid="topbar-menu"
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* Page title */}
      <h2 className="font-display font-semibold text-foreground hidden sm:block shrink-0 min-w-0 mr-2">
        {pageTitle}
      </h2>

      {/* Global search */}
      <div
        className="flex-1 max-w-sm relative hidden md:block"
        data-ocid="topbar-search"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search patients, appointments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-9 glass border-white/10 bg-white/5 text-sm"
        />
      </div>

      <div className="ml-auto flex items-center gap-1">
        {/* Notifications */}
        <div className="relative" data-ocid="topbar-notifications">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setNotifOpen((v) => !v)}
            className="relative"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
            )}
          </Button>
          <AnimatePresence>
            {notifOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setNotifOpen(false)}
                  onKeyDown={() => setNotifOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-80 z-50 glass-card overflow-hidden"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-semibold text-sm">
                        Notifications
                      </span>
                      {unreadCount > 0 && (
                        <Badge className="h-5 px-1.5 text-[10px] bg-primary/20 text-primary border-primary/30">
                          {unreadCount}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={markAllNotificationsRead}
                          className="text-xs text-primary hover:text-primary/80 transition-colors"
                        >
                          Mark all read
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setNotifOpen(false)}
                        className="p-1 rounded hover:bg-white/10 text-muted-foreground"
                        aria-label="Close notifications"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
                    {notifications.map((notif) => (
                      <button
                        type="button"
                        key={notif.id}
                        onClick={() => markNotificationRead(notif.id)}
                        className={cn(
                          "w-full text-left px-4 py-3 hover:bg-white/5 transition-colors",
                          !notif.read && "bg-primary/5",
                        )}
                        data-ocid={`notification-${notif.id}`}
                      >
                        <div className="flex items-start gap-2.5">
                          <span
                            className={cn(
                              "w-1.5 h-1.5 rounded-full mt-1.5 shrink-0",
                              notif.read
                                ? "bg-muted-foreground/30"
                                : notifTypeColors[notif.type].replace(
                                    "text-",
                                    "bg-",
                                  ),
                            )}
                          />
                          <div className="min-w-0 flex-1">
                            <p
                              className={cn(
                                "text-xs font-medium",
                                notif.read
                                  ? "text-muted-foreground"
                                  : "text-foreground",
                              )}
                            >
                              {notif.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                              {notif.message}
                            </p>
                            <p className="text-[10px] text-muted-foreground/60 mt-1">
                              {notif.time}
                            </p>
                          </div>
                          {!notif.read && (
                            <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          data-ocid="topbar-theme-toggle"
        >
          <motion.div
            key={theme}
            initial={{ rotate: -30, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </motion.div>
        </Button>

        {/* Language selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 hidden sm:flex"
              data-ocid="topbar-language"
            >
              <Globe className="w-4 h-4" />
              <span className="text-xs uppercase">{language}</span>
              <ChevronDown className="w-3 h-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="glass border-white/10 bg-card/90 backdrop-blur-xl"
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Language
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/10" />
            {LANGUAGES.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => setLanguage(lang.code as Language)}
                className="gap-2 cursor-pointer"
                data-ocid={`lang-${lang.code}`}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
                {language === lang.code && (
                  <Check className="w-3.5 h-3.5 ml-auto text-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User avatar + role switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/10 transition-colors"
              data-ocid="topbar-user-menu"
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground",
                  user.color,
                )}
              >
                {initials}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-medium text-foreground leading-tight">
                  {user.name}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {currentRole}
                </p>
              </div>
              <ChevronDown className="w-3 h-3 text-muted-foreground hidden md:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 glass border-white/10 bg-card/90 backdrop-blur-xl"
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Switch Role
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/10" />
            {ROLES.map((role) => (
              <DropdownMenuItem
                key={role}
                onClick={() => setRole(role as Role)}
                className="gap-2 cursor-pointer"
                data-ocid={`role-${role.toLowerCase()}`}
              >
                {role}
                {currentRole === role && (
                  <Check className="w-3.5 h-3.5 ml-auto text-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
