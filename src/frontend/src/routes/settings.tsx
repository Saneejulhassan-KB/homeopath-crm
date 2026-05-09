import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store";
import { ACCENT_COLORS, ACCENT_COLOR_MAP } from "@/utils/accentColors";
import { LANGUAGES } from "@/utils/constants";
import { createRoute } from "@tanstack/react-router";
import {
  Bell,
  Building2,
  Camera,
  Check,
  Globe,
  Moon,
  Palette,
  Save,
  Sun,
  Upload,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Route as rootRoute } from "./__root";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsPage,
});

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

const stagger = (i: number) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, delay: i * 0.06 },
});

// ─── Clinic Profile ───────────────────────────────────────────────
function ClinicProfileTab() {
  const [form, setForm] = useState({
    name: "HomeoPath Wellness Clinic",
    regNumber: "REG-2012-HOM-04891",
    address: "42 Green Valley Road, Sector 18",
    city: "Pune",
    state: "Maharashtra",
    country: "India",
    phone: "+91 98765 43210",
    email: "info@homeopathwellness.com",
    website: "www.homeopathwellness.com",
    workingHours: "Mon–Sat  9:00 AM – 7:00 PM",
  });

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  const save = () => toast.success("Clinic profile updated!");

  const fields: {
    key: keyof typeof form;
    label: string;
    span?: boolean;
    type?: "textarea";
  }[] = [
    { key: "name", label: "Clinic Name", span: true },
    { key: "regNumber", label: "Registration Number" },
    { key: "workingHours", label: "Working Hours" },
    { key: "address", label: "Address", span: true, type: "textarea" },
    { key: "city", label: "City" },
    { key: "state", label: "State" },
    { key: "country", label: "Country" },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email" },
    { key: "website", label: "Website", span: true },
  ];

  return (
    <motion.div
      {...fadeIn}
      className="space-y-6"
      data-ocid="clinic-profile-tab"
    >
      {/* Logo upload */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-primary" /> Clinic Logo
        </h3>
        <div
          className="border-2 border-dashed border-primary/30 rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-smooth"
          data-ocid="logo-upload-zone"
        >
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload className="w-6 h-6 text-primary" />
          </div>
          <p className="text-sm font-medium text-foreground">
            Drop your logo here
          </p>
          <p className="text-xs text-muted-foreground">
            PNG, JPG, SVG — max 2MB · 200×200px recommended
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-1"
            data-ocid="logo-browse-btn"
          >
            Browse File
          </Button>
        </div>
      </div>

      {/* Form fields */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-display font-semibold text-foreground mb-4">
          Clinic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((f, i) => (
            <motion.div
              key={f.key}
              {...stagger(i)}
              className={cn("space-y-1.5", f.span ? "md:col-span-2" : "")}
            >
              <Label
                htmlFor={`clinic-${f.key}`}
                className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
              >
                {f.label}
              </Label>
              {f.type === "textarea" ? (
                <Textarea
                  id={`clinic-${f.key}`}
                  value={form[f.key]}
                  onChange={set(f.key)}
                  rows={2}
                  className="resize-none bg-background/50 border-border/60 focus:border-primary/60"
                  data-ocid={`clinic-field-${f.key}`}
                />
              ) : (
                <Input
                  id={`clinic-${f.key}`}
                  value={form[f.key]}
                  onChange={set(f.key)}
                  className="bg-background/50 border-border/60 focus:border-primary/60"
                  data-ocid={`clinic-field-${f.key}`}
                />
              )}
            </motion.div>
          ))}
        </div>
        <Separator className="my-5" />
        <div className="flex justify-end">
          <Button onClick={save} className="gap-2" data-ocid="clinic-save-btn">
            <Save className="w-4 h-4" /> Save Clinic Profile
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Doctor Profile ───────────────────────────────────────────────
function DoctorProfileTab() {
  const [form, setForm] = useState({
    fullName: "Dr. Rahul Sharma",
    qualifications: "BHMS, MD (Homeopathy)",
    specialization: "Classical Homeopathy, Pediatric Cases",
    experience: "12 years",
    licenseNumber: "MH-HOM-20140892",
    consultationFee: "800",
    bio: "Dr. Rahul Sharma is a dedicated classical homeopath with over 12 years of clinical experience. He specialises in chronic disease management, pediatric cases, and constitutional prescribing.",
  });

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  const save = () => toast.success("Doctor profile updated!");

  return (
    <motion.div
      {...fadeIn}
      className="space-y-6"
      data-ocid="doctor-profile-tab"
    >
      {/* Avatar */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-primary" /> Profile Picture
        </h3>
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 border-2 border-primary/40 flex items-center justify-center shadow-elevated">
              <span className="text-xl font-display font-bold text-primary">
                Dr. RS
              </span>
            </div>
            <button
              type="button"
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-md hover:bg-primary/80 transition-smooth"
              aria-label="Edit profile picture"
              data-ocid="doctor-avatar-edit"
            >
              <Camera className="w-3.5 h-3.5 text-primary-foreground" />
            </button>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {form.fullName}
            </p>
            <p className="text-xs text-muted-foreground">
              {form.qualifications}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 text-xs"
              data-ocid="doctor-upload-btn"
            >
              Upload Photo
            </Button>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-display font-semibold text-foreground mb-4">
          Doctor Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(
            [
              { key: "fullName", label: "Full Name", span: true },
              { key: "qualifications", label: "Qualifications" },
              { key: "specialization", label: "Specialization" },
              { key: "experience", label: "Experience" },
              { key: "licenseNumber", label: "License Number" },
              { key: "consultationFee", label: "Consultation Fee (₹)" },
              { key: "bio", label: "Bio", span: true, type: "textarea" },
            ] as {
              key: keyof typeof form;
              label: string;
              span?: boolean;
              type?: string;
            }[]
          ).map((f, i) => (
            <motion.div
              key={f.key}
              {...stagger(i)}
              className={cn("space-y-1.5", f.span ? "md:col-span-2" : "")}
            >
              <Label
                htmlFor={`doctor-${f.key}`}
                className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
              >
                {f.label}
              </Label>
              {f.type === "textarea" ? (
                <Textarea
                  id={`doctor-${f.key}`}
                  value={form[f.key]}
                  onChange={set(f.key)}
                  rows={3}
                  className="resize-none bg-background/50 border-border/60 focus:border-primary/60"
                  data-ocid={`doctor-field-${f.key}`}
                />
              ) : (
                <Input
                  id={`doctor-${f.key}`}
                  value={form[f.key]}
                  onChange={set(f.key)}
                  className="bg-background/50 border-border/60 focus:border-primary/60"
                  data-ocid={`doctor-field-${f.key}`}
                />
              )}
            </motion.div>
          ))}
        </div>
        <Separator className="my-5" />
        <div className="flex justify-end">
          <Button onClick={save} className="gap-2" data-ocid="doctor-save-btn">
            <Save className="w-4 h-4" /> Save Doctor Profile
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Appearance ───────────────────────────────────────────────────
function AppearanceTab() {
  const { theme, toggleTheme, accentColor, setAccentColor } = useAppStore();
  const [fontSize, setFontSize] = useState("medium");

  const handleAccentChange = (id: string) => {
    const palette = ACCENT_COLOR_MAP[id];
    if (palette) {
      const isDark = document.documentElement.classList.contains("dark");
      const primary = isDark ? palette.primaryDark : palette.primary;
      const primaryFg = isDark
        ? palette.primaryForegroundDark
        : palette.primaryForeground;

      const root = document.documentElement;
      root.style.setProperty("--accent", palette.light);
      root.style.setProperty("--accent-dark", palette.dark);
      root.style.setProperty("--primary", primary);
      root.style.setProperty("--primary-foreground", primaryFg);
      root.style.setProperty("--sidebar-primary", primary);
      root.style.setProperty("--sidebar-primary-foreground", primaryFg);
      root.style.setProperty("--ring", primary);
      root.style.setProperty("--chart-1", primary);
    }
    setAccentColor(id);
    toast.success(
      `Theme colour changed to ${ACCENT_COLORS.find((c) => c.id === id)?.label ?? id}`,
    );
  };

  const apply = () => toast.success("Appearance settings saved!");

  return (
    <motion.div {...fadeIn} className="space-y-6" data-ocid="appearance-tab">
      {/* Theme */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <Palette className="w-4 h-4 text-primary" /> Theme
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Light Mode Card */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => theme === "dark" && toggleTheme()}
            className={cn(
              "relative rounded-xl border-2 p-4 text-left transition-smooth cursor-pointer",
              theme === "light"
                ? "border-primary shadow-elevated bg-primary/5"
                : "border-border/40 bg-background/40 hover:border-border",
            )}
            data-ocid="theme-light-card"
          >
            {theme === "light" && (
              <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-3 h-3 text-primary-foreground" />
              </span>
            )}
            {/* Mini mockup */}
            <div className="w-full h-16 rounded-lg bg-background border border-border/40 mb-3 overflow-hidden flex">
              <div className="w-10 h-full bg-muted border-r border-card flex flex-col gap-1 p-1">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-1.5 bg-border rounded-full" />
                ))}
              </div>
              <div className="flex-1 p-1.5 flex flex-col gap-1">
                <div className="h-2 bg-card rounded w-3/4" />
                <div className="h-2 bg-muted rounded w-1/2" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-foreground">
                Light Mode
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Clean, bright interface
            </p>
          </motion.button>

          {/* Dark Mode Card */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => theme === "light" && toggleTheme()}
            className={cn(
              "relative rounded-xl border-2 p-4 text-left transition-smooth cursor-pointer",
              theme === "dark"
                ? "border-primary shadow-elevated bg-primary/5"
                : "border-border/40 bg-background/40 hover:border-border",
            )}
            data-ocid="theme-dark-card"
          >
            {theme === "dark" && (
              <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-3 h-3 text-primary-foreground" />
              </span>
            )}
            {/* Mini mockup */}
            <div className="w-full h-16 rounded-lg bg-background border border-border mb-3 overflow-hidden flex">
              <div className="w-10 h-full bg-card border-r border-muted flex flex-col gap-1 p-1">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-1.5 bg-muted rounded-full" />
                ))}
              </div>
              <div className="flex-1 p-1.5 flex flex-col gap-1">
                <div className="h-2 bg-muted rounded w-3/4" />
                <div className="h-2 bg-card rounded w-1/2" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                Dark Mode
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Easy on the eyes
            </p>
          </motion.button>
        </div>
      </div>

      {/* Accent colors */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-display font-semibold text-foreground mb-1">
          Accent Color
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          Applies instantly across the entire app.
        </p>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-3">
          {ACCENT_COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => handleAccentChange(c.id)}
              aria-label={`Select ${c.label} accent`}
              title={c.label}
              className="group flex flex-col items-center gap-1.5 focus:outline-none"
              data-ocid={`accent-${c.id}`}
            >
              <span
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ring-2 ring-offset-2 ring-offset-background",
                  accentColor === c.id
                    ? "ring-foreground scale-110 shadow-elevated"
                    : "ring-transparent hover:scale-105 hover:ring-border",
                )}
                style={{ backgroundColor: c.hex }}
              >
                {accentColor === c.id && (
                  <Check className="w-4 h-4 text-white drop-shadow" />
                )}
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight text-center">
                {c.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Font size */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-display font-semibold text-foreground mb-4">
          Font Size
        </h3>
        <div className="flex gap-3 flex-wrap">
          {(["small", "medium", "large"] as const).map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setFontSize(size)}
              className={cn(
                "px-5 py-2 rounded-lg border text-sm font-medium capitalize transition-smooth",
                fontSize === size
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/40 text-muted-foreground hover:border-border",
              )}
              data-ocid={`font-size-${size}`}
            >
              {size === "small"
                ? "Small"
                : size === "medium"
                  ? "Medium"
                  : "Large"}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Affects body text across the application.
        </p>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={apply}
          className="gap-2"
          data-ocid="appearance-save-btn"
        >
          <Save className="w-4 h-4" /> Apply Changes
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Notifications ────────────────────────────────────────────────
interface NotifPref {
  id: string;
  label: string;
  description: string;
  defaultOn: boolean;
}

const NOTIF_PREFS: NotifPref[] = [
  {
    id: "appointment-reminders",
    label: "Appointment Reminders",
    description: "Get notified 1 hour before appointments",
    defaultOn: true,
  },
  {
    id: "billing-alerts",
    label: "Billing Alerts",
    description: "Notify on payment received or overdue invoices",
    defaultOn: true,
  },
  {
    id: "system-updates",
    label: "System Updates",
    description: "Product announcements and feature releases",
    defaultOn: true,
  },
  {
    id: "new-patient",
    label: "New Patient Registration",
    description: "Alert when a new patient profile is created",
    defaultOn: false,
  },
  {
    id: "daily-summary",
    label: "Daily Summary Email",
    description: "Morning digest of the day's schedule and stats",
    defaultOn: false,
  },
];

function NotificationsTab() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIF_PREFS.map((p) => [p.id, p.defaultOn])),
  );

  const save = () => toast.success("Notification preferences saved!");

  return (
    <motion.div {...fadeIn} className="space-y-6" data-ocid="notifications-tab">
      <div className="glass-card p-6 space-y-1">
        <h3 className="text-sm font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" /> Notification Preferences
        </h3>
        <div className="divide-y divide-border/40">
          {NOTIF_PREFS.map((pref, i) => (
            <motion.div
              key={pref.id}
              {...stagger(i)}
              className="flex items-center justify-between py-4 gap-4"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {pref.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {pref.description}
                </p>
              </div>
              <Switch
                checked={prefs[pref.id]}
                onCheckedChange={(v) =>
                  setPrefs((p) => ({ ...p, [pref.id]: v }))
                }
                className="data-[state=checked]:bg-primary shrink-0"
                data-ocid={`notif-switch-${pref.id}`}
              />
            </motion.div>
          ))}
        </div>
      </div>
      <div className="flex justify-end">
        <Button
          onClick={save}
          className="gap-2"
          data-ocid="notifications-save-btn"
        >
          <Save className="w-4 h-4" /> Save Preferences
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Language & Region ────────────────────────────────────────────
function LanguageTab() {
  const { language, setLanguage } = useAppStore();
  const [currency, setCurrency] = useState("INR");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [timezone, setTimezone] = useState("Asia/Kolkata");

  const handleLanguage = (code: string) => {
    setLanguage(code as "en" | "hi" | "es" | "fr");
    const found = LANGUAGES.find((l) => l.code === code);
    toast.success(`Language changed to ${found?.label ?? code}`);
  };

  const save = () => toast.success("Regional settings saved!");

  return (
    <motion.div {...fadeIn} className="space-y-6" data-ocid="language-tab">
      {/* Language selector */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" /> Language
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {LANGUAGES.map((lang, i) => (
            <motion.button
              key={lang.code}
              type="button"
              {...stagger(i)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleLanguage(lang.code)}
              className={cn(
                "relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-center transition-smooth",
                language === lang.code
                  ? "border-primary bg-primary/10 shadow-elevated"
                  : "border-border/40 bg-background/40 hover:border-border",
              )}
              data-ocid={`lang-${lang.code}`}
            >
              {language === lang.code && (
                <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-primary-foreground" />
                </span>
              )}
              <span className="text-2xl">{lang.flag}</span>
              <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
                {lang.code}
              </span>
              <span className="text-xs text-muted-foreground">
                {lang.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Currency, Date format, Timezone */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-display font-semibold text-foreground mb-4">
          Regional Preferences
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Currency */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Currency
            </Label>
            <div className="flex flex-col gap-2">
              {[
                { code: "INR", symbol: "₹", label: "Indian Rupee" },
                { code: "USD", symbol: "$", label: "US Dollar" },
                { code: "EUR", symbol: "€", label: "Euro" },
              ].map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setCurrency(c.code)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-smooth text-left",
                    currency === c.code
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/40 text-muted-foreground hover:border-border",
                  )}
                  data-ocid={`currency-${c.code.toLowerCase()}`}
                >
                  <span className="font-bold">{c.symbol}</span>
                  <span>
                    {c.code} — {c.label}
                  </span>
                  {currency === c.code && <Check className="w-3 h-3 ml-auto" />}
                </button>
              ))}
            </div>
          </div>

          {/* Date Format */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Date Format
            </Label>
            <div className="flex flex-col gap-2">
              {["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"].map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setDateFormat(fmt)}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-lg border text-sm font-mono transition-smooth",
                    dateFormat === fmt
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/40 text-muted-foreground hover:border-border",
                  )}
                  data-ocid={`date-fmt-${fmt.replace(/\//g, "-")}`}
                >
                  {fmt}
                  {dateFormat === fmt && <Check className="w-3 h-3" />}
                </button>
              ))}
            </div>
          </div>

          {/* Timezone */}
          <div className="space-y-2">
            <Label
              htmlFor="timezone"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
            >
              Timezone
            </Label>
            <select
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border/60 bg-background/50 text-sm text-foreground focus:outline-none focus:border-primary/60 transition-smooth"
              data-ocid="timezone-select"
            >
              {[
                ["Asia/Kolkata", "IST — India (UTC+5:30)"],
                ["America/New_York", "EST — New York (UTC-5)"],
                ["America/Los_Angeles", "PST — Los Angeles (UTC-8)"],
                ["Europe/London", "GMT — London (UTC+0)"],
                ["Europe/Paris", "CET — Paris (UTC+1)"],
                ["Asia/Dubai", "GST — Dubai (UTC+4)"],
                ["Asia/Singapore", "SGT — Singapore (UTC+8)"],
                ["Australia/Sydney", "AEDT — Sydney (UTC+11)"],
              ].map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={save} className="gap-2" data-ocid="language-save-btn">
          <Save className="w-4 h-4" /> Save Regional Settings
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────
function SettingsPage() {
  return (
    <div className="space-y-6" data-ocid="settings-page">
      <PageHeader
        title="Clinic Settings"
        description="Manage clinic profile, doctor details, appearance, and preferences."
        breadcrumb={[{ label: "Dashboard", href: "/" }, { label: "Settings" }]}
      />

      <Tabs
        defaultValue="clinic"
        className="space-y-6"
        data-ocid="settings-tabs"
      >
        <TabsList className="glass border-border/40 h-auto p-1 flex flex-wrap gap-1 w-full justify-start">
          {[
            { value: "clinic", icon: Building2, label: "Clinic Profile" },
            { value: "doctor", icon: User, label: "Doctor Profile" },
            { value: "appearance", icon: Palette, label: "Appearance" },
            { value: "notifications", icon: Bell, label: "Notifications" },
            { value: "language", icon: Globe, label: "Language & Region" },
          ].map(({ value, icon: Icon, label }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-smooth"
              data-ocid={`tab-${value}`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{label.split(" ")[0]}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="clinic">
          <ClinicProfileTab />
        </TabsContent>
        <TabsContent value="doctor">
          <DoctorProfileTab />
        </TabsContent>
        <TabsContent value="appearance">
          <AppearanceTab />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationsTab />
        </TabsContent>
        <TabsContent value="language">
          <LanguageTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
