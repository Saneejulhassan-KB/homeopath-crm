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
import { getCurrentUser, getUserClinics } from "@/utils/auth";
import { createRoute } from "@tanstack/react-router";
import {
  Building2,
  Camera,
  Check,
  CreditCard,
  Globe,
  MessageSquareText,
  Moon,
  Palette,
  Save,
  Shield,
  Sun,
  Upload,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
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

// ─── Clinic Name Header ───────────────────────────────────────────
function ClinicNameHeader() {
  const [clinicName, setClinicName] = useState("My Clinic");

  useEffect(() => {
    const user = getCurrentUser();
    if (user && user.clinicIds.length > 0) {
      const clinics = getUserClinics(user.id);
      if (clinics.length > 0) {
        setClinicName(clinics[0].name);
      }
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card p-5 flex items-center gap-4 border-l-4 border-l-primary"
      data-ocid="settings.clinic_name_header"
    >
      <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0">
        <Building2 className="w-6 h-6 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Current Clinic
        </p>
        <h2 className="text-xl font-display font-bold text-foreground truncate">
          {clinicName}
        </h2>
      </div>
    </motion.div>
  );
}

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

// ─── Auto Messages ────────────────────────────────────────────────
interface MessageTemplate {
  id: string;
  label: string;
  description: string;
  placeholder: string;
}

const MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    id: "welcome",
    label: "Welcome Message",
    description: "Sent when a patient registers",
    placeholder:
      "Welcome to {clinic_name}, {patient_name}! We're delighted to have you. Your registration is complete and we look forward to serving you.",
  },
  {
    id: "thankyou",
    label: "Thank You for Visiting",
    description: "Sent after a visit is completed",
    placeholder:
      "Dear {patient_name}, thank you for visiting {clinic_name} today. We hope you feel better soon. If you have any questions, please don't hesitate to reach out.",
  },
  {
    id: "booking",
    label: "Booking Message",
    description: "Sent when an appointment is booked",
    placeholder:
      "Hi {patient_name}, your appointment at {clinic_name} has been booked for {date} with {doctor_name}. Please arrive 10 minutes early.",
  },
  {
    id: "case-taking-reminder",
    label: "Case Taking Reminder",
    description: "Reminder for case taking",
    placeholder:
      "Reminder: {patient_name}, please complete your case taking form before your visit on {date} at {clinic_name}.",
  },
  {
    id: "booking-reminder",
    label: "Booking Reminder Before Date",
    description: "Reminder sent before appointment date",
    placeholder:
      "Hi {patient_name}, this is a friendly reminder about your upcoming appointment at {clinic_name} on {date} with {doctor_name}. We look forward to seeing you!",
  },
  {
    id: "first-followup",
    label: "First Follow Up",
    description: "First followup after a missed/overdue visit",
    placeholder:
      "Dear {patient_name}, we noticed you missed your scheduled visit on {date} at {clinic_name}. Please contact us to reschedule at your earliest convenience.",
  },
  {
    id: "second-followup",
    label: "Second Follow Up",
    description: "Second followup for overdue visits",
    placeholder:
      "Hi {patient_name}, this is our second reminder regarding your missed appointment on {date} at {clinic_name}. Your health is important to us — please book a new slot.",
  },
  {
    id: "third-followup",
    label: "Third Follow Up",
    description: "Third followup for very overdue visits",
    placeholder:
      "Dear {patient_name}, we are concerned as we haven't seen you since {date}. Please visit {clinic_name} as soon as possible or call us to discuss your care plan.",
  },
  {
    id: "cancel-manual",
    label: "Cancel / Manual Message",
    description: "Manual cancellation message",
    placeholder:
      "Hi {patient_name}, your appointment at {clinic_name} scheduled for {date} with {doctor_name} has been cancelled. Please contact us to reschedule.",
  },
];

const PLACEHOLDER_VARIABLES = [
  "{patient_name}",
  "{clinic_name}",
  "{date}",
  "{doctor_name}",
  "{time}",
];

function AutoMessagesTab() {
  const [messages, setMessages] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const m of MESSAGE_TEMPLATES) {
      initial[m.id] = m.placeholder;
    }
    return initial;
  });

  const [saved, setSaved] = useState<Record<string, boolean>>({});

  const updateMessage = (id: string, text: string) => {
    setMessages((prev) => ({ ...prev, [id]: text }));
    setSaved((prev) => ({ ...prev, [id]: false }));
  };

  const saveAll = () => {
    const allSaved: Record<string, boolean> = {};
    for (const m of MESSAGE_TEMPLATES) {
      allSaved[m.id] = true;
    }
    setSaved(allSaved);
    toast.success("All message templates saved!");
  };

  const insertVariable = (id: string, variable: string) => {
    const textarea = document.getElementById(
      `msg-${id}`,
    ) as HTMLTextAreaElement | null;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = messages[id] || "";
    const newText =
      current.substring(0, start) + variable + current.substring(end);
    setMessages((prev) => ({ ...prev, [id]: newText }));
    setSaved((prev) => ({ ...prev, [id]: false }));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + variable.length,
        start + variable.length,
      );
    }, 0);
  };

  return (
    <motion.div {...fadeIn} className="space-y-6" data-ocid="auto-messages-tab">
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-display font-semibold text-foreground flex items-center gap-2">
            <MessageSquareText className="w-4 h-4 text-primary" /> Auto Message
            Templates
          </h3>
        </div>
        <p className="text-xs text-muted-foreground mb-5">
          Customize the messages sent automatically to patients. Use the
          placeholder variables below each field.
        </p>

        <div className="space-y-5">
          {MESSAGE_TEMPLATES.map((tmpl, i) => (
            <motion.div
              key={tmpl.id}
              {...stagger(i)}
              className="space-y-2"
              data-ocid={`auto-msg-${tmpl.id}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <Label
                    htmlFor={`msg-${tmpl.id}`}
                    className="text-sm font-medium text-foreground"
                  >
                    {tmpl.label}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {tmpl.description}
                  </p>
                </div>
                {saved[tmpl.id] && (
                  <span className="text-xs font-medium text-green-500 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Saved
                  </span>
                )}
              </div>
              <Textarea
                id={`msg-${tmpl.id}`}
                value={messages[tmpl.id] || ""}
                onChange={(e) => updateMessage(tmpl.id, e.target.value)}
                rows={3}
                className="resize-none bg-background/50 border-border/60 focus:border-primary/60 text-sm"
                data-ocid={`auto-msg-input-${tmpl.id}`}
              />
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide mr-1">
                  Variables:
                </span>
                {PLACEHOLDER_VARIABLES.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => insertVariable(tmpl.id, v)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-smooth font-mono"
                    data-ocid={`auto-msg-var-${tmpl.id}-${v.replace(/[{}]/g, "")}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <Separator className="my-5" />
        <div className="flex justify-end">
          <Button
            onClick={saveAll}
            className="gap-2"
            data-ocid="auto-messages-save-all-btn"
          >
            <Save className="w-4 h-4" /> Save All Messages
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Security (placeholder) ─────────────────────────────────────
function SecurityTab() {
  return (
    <motion.div {...fadeIn} className="space-y-6" data-ocid="security-tab">
      <div className="glass-card p-6">
        <h3 className="text-sm font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" /> Security Settings
        </h3>
        <p className="text-sm text-muted-foreground">
          Security settings will be available here soon.
        </p>
      </div>
    </motion.div>
  );
}

// ─── Billing (placeholder) ────────────────────────────────────────
function BillingTab() {
  return (
    <motion.div {...fadeIn} className="space-y-6" data-ocid="billing-tab">
      <div className="glass-card p-6">
        <h3 className="text-sm font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-primary" /> Billing Settings
        </h3>
        <p className="text-sm text-muted-foreground">
          Billing settings will be available here soon.
        </p>
      </div>
    </motion.div>
  );
}

// ─── About (placeholder) ──────────────────────────────────────────
function AboutTab() {
  return (
    <motion.div {...fadeIn} className="space-y-6" data-ocid="about-tab">
      <div className="glass-card p-6">
        <h3 className="text-sm font-display font-semibold text-foreground mb-4">
          About HomeoPath CRM
        </h3>
        <p className="text-sm text-muted-foreground">
          HomeoPath CRM — A professional clinic management solution for
          homeopathic practitioners worldwide.
        </p>
        <p className="text-xs text-muted-foreground mt-2">Version 1.0.0</p>
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

      <ClinicNameHeader />

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
            {
              value: "auto-messages",
              icon: MessageSquareText,
              label: "Auto Messages",
            },
            { value: "security", icon: Shield, label: "Security" },
            { value: "billing", icon: CreditCard, label: "Billing" },
            { value: "about", icon: Globe, label: "About" },
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
        <TabsContent value="auto-messages">
          <AutoMessagesTab />
        </TabsContent>
        <TabsContent value="security">
          <SecurityTab />
        </TabsContent>
        <TabsContent value="billing">
          <BillingTab />
        </TabsContent>
        <TabsContent value="about">
          <AboutTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
