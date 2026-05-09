import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/store";
import type { RegisterAdminInput } from "@/utils/auth";
import { registerAdmin, seedDemoDataIfEmpty } from "@/utils/auth";
import { createRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Eye,
  EyeOff,
  Leaf,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Route as rootRoute } from "./__root";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: RegisterPage,
});

const STEPS = [
  { id: 1, label: "Personal Details", icon: User },
  { id: 2, label: "Clinic Details", icon: Building2 },
  { id: 3, label: "Review & Submit", icon: Check },
];

function passwordStrength(p: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (p.length >= 8) score++;
  if (/[A-Z]/.test(p)) score++;
  if (/[0-9]/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = [
    "",
    "text-red-400",
    "text-amber-400",
    "text-yellow-400",
    "text-green-400",
  ];
  return { score, label: labels[score] ?? "", color: colors[score] ?? "" };
}

type FormData = Omit<RegisterAdminInput, ""> & { confirmPassword: string };

const EMPTY: FormData = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone: "",
  clinicName: "",
  clinicRegistration: "",
  clinicAddress: "",
  clinicCity: "",
  clinicState: "",
  clinicCountry: "",
  clinicPhone: "",
  clinicEmail: "",
};

function RegisterPage() {
  const navigate = useNavigate();
  const { setCurrentUser, setRole } = useAppStore();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {},
  );
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = passwordStrength(form.password);

  function update(field: keyof FormData, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validateStep1(): boolean {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Invalid email";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    if (!form.password) e.password = "Password is required";
    else if (strength.score < 3)
      e.password = "Password too weak (need uppercase & number)";
    if (form.confirmPassword !== form.password)
      e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateStep2(): boolean {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.clinicName.trim()) e.clinicName = "Clinic name is required";
    if (!form.clinicAddress.trim()) e.clinicAddress = "Address is required";
    if (!form.clinicCity.trim()) e.clinicCity = "City is required";
    if (!form.clinicCountry.trim()) e.clinicCountry = "Country is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function nextStep() {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep((s) => Math.min(3, s + 1));
  }

  async function handleSubmit() {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    seedDemoDataIfEmpty();
    const result = registerAdmin(form);
    setLoading(false);
    if (!result.success || !result.user) {
      toast.error(result.error ?? "Registration failed");
      return;
    }
    setCurrentUser(result.user);
    setRole(result.user.role);
    toast.success("Account created! Welcome to HomeoPath CRM.");
    navigate({ to: "/" });
  }

  return (
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900"
      data-ocid="register.page"
    >
      {/* Ambient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute bottom-[-5%] right-[15%] w-96 h-96 rounded-full bg-emerald-500/10 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 border border-white/20 shadow-xl mb-4 backdrop-blur-md">
            <Leaf className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
            Create your account
          </h1>
          <p className="text-sm text-white/50">
            Set up HomeoPath CRM for your clinic
          </p>
        </motion.div>

        {/* Step progress */}
        <div
          className="flex items-center gap-0 mb-8 w-full max-w-lg"
          data-ocid="register.steps"
        >
          {STEPS.map((s, idx) => {
            const StepIcon = s.icon;
            const done = step > s.id;
            const active = step === s.id;
            return (
              <div
                key={s.id}
                className="flex items-center flex-1 last:flex-none"
              >
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={[
                      "w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                      done
                        ? "bg-primary border-primary"
                        : active
                          ? "bg-white/15 border-primary"
                          : "bg-white/5 border-white/20",
                    ].join(" ")}
                  >
                    {done ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : (
                      <StepIcon
                        className={`w-4 h-4 ${active ? "text-primary" : "text-white/40"}`}
                      />
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-medium whitespace-nowrap ${active ? "text-white" : "text-white/40"}`}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-px mx-2 mb-4 transition-all ${step > s.id ? "bg-primary" : "bg-white/15"}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Form card */}
        <motion.div
          className="w-full max-w-lg bg-white/8 backdrop-blur-xl border border-white/12 rounded-2xl p-6 shadow-2xl"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <h2 className="text-lg font-semibold text-white mb-4">
                  Personal Details
                </h2>
                <Field label="Full Name" error={errors.name}>
                  <Input
                    placeholder="Dr. Arjun Mehta"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    className="glass-input"
                    data-ocid="register.name_input"
                  />
                </Field>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Email Address" error={errors.email}>
                    <Input
                      type="email"
                      placeholder="admin@clinic.com"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      className="glass-input"
                      data-ocid="register.email_input"
                    />
                  </Field>
                  <Field label="Phone Number" error={errors.phone}>
                    <Input
                      placeholder="+91-98765-43210"
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      className="glass-input"
                      data-ocid="register.phone_input"
                    />
                  </Field>
                </div>
                <Field label="Password" error={errors.password}>
                  <div className="relative">
                    <Input
                      type={showPass ? "text" : "password"}
                      placeholder="Min. 8 chars, uppercase & number"
                      value={form.password}
                      onChange={(e) => update("password", e.target.value)}
                      className="glass-input pr-10"
                      data-ocid="register.password_input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                    >
                      {showPass ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {form.password && (
                    <div className="flex gap-1 mt-1.5">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            strength.score >= i ? "bg-primary" : "bg-white/15"
                          }`}
                        />
                      ))}
                      <span className={`text-xs ml-1 ${strength.color}`}>
                        {strength.label}
                      </span>
                    </div>
                  )}
                </Field>
                <Field label="Confirm Password" error={errors.confirmPassword}>
                  <Input
                    type="password"
                    placeholder="Repeat your password"
                    value={form.confirmPassword}
                    onChange={(e) => update("confirmPassword", e.target.value)}
                    className="glass-input"
                    data-ocid="register.confirm_password_input"
                  />
                </Field>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <h2 className="text-lg font-semibold text-white mb-4">
                  Clinic Details
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="Clinic Name"
                    error={errors.clinicName}
                    className="sm:col-span-2"
                  >
                    <Input
                      placeholder="HomeoPath Wellness Clinic"
                      value={form.clinicName}
                      onChange={(e) => update("clinicName", e.target.value)}
                      className="glass-input"
                      data-ocid="register.clinic_name_input"
                    />
                  </Field>
                  <Field
                    label="Registration No."
                    error={errors.clinicRegistration}
                  >
                    <Input
                      placeholder="REG-2024-001"
                      value={form.clinicRegistration}
                      onChange={(e) =>
                        update("clinicRegistration", e.target.value)
                      }
                      className="glass-input"
                      data-ocid="register.clinic_reg_input"
                    />
                  </Field>
                  <Field label="Clinic Phone" error={errors.clinicPhone}>
                    <Input
                      placeholder="+91-80-1234-5678"
                      value={form.clinicPhone}
                      onChange={(e) => update("clinicPhone", e.target.value)}
                      className="glass-input"
                      data-ocid="register.clinic_phone_input"
                    />
                  </Field>
                  <Field
                    label="Clinic Email"
                    error={errors.clinicEmail}
                    className="sm:col-span-2"
                  >
                    <Input
                      type="email"
                      placeholder="clinic@example.com"
                      value={form.clinicEmail}
                      onChange={(e) => update("clinicEmail", e.target.value)}
                      className="glass-input"
                      data-ocid="register.clinic_email_input"
                    />
                  </Field>
                  <Field
                    label="Address"
                    error={errors.clinicAddress}
                    className="sm:col-span-2"
                  >
                    <Input
                      placeholder="Street address"
                      value={form.clinicAddress}
                      onChange={(e) => update("clinicAddress", e.target.value)}
                      className="glass-input"
                      data-ocid="register.clinic_address_input"
                    />
                  </Field>
                  <Field label="City" error={errors.clinicCity}>
                    <Input
                      placeholder="Bangalore"
                      value={form.clinicCity}
                      onChange={(e) => update("clinicCity", e.target.value)}
                      className="glass-input"
                      data-ocid="register.clinic_city_input"
                    />
                  </Field>
                  <Field label="State" error={errors.clinicState}>
                    <Input
                      placeholder="Karnataka"
                      value={form.clinicState}
                      onChange={(e) => update("clinicState", e.target.value)}
                      className="glass-input"
                      data-ocid="register.clinic_state_input"
                    />
                  </Field>
                  <Field label="Country" error={errors.clinicCountry}>
                    <Input
                      placeholder="India"
                      value={form.clinicCountry}
                      onChange={(e) => update("clinicCountry", e.target.value)}
                      className="glass-input"
                      data-ocid="register.clinic_country_input"
                    />
                  </Field>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <h2 className="text-lg font-semibold text-white mb-4">
                  Review & Submit
                </h2>
                <ReviewSection title="Personal Details">
                  <ReviewRow label="Name" value={form.name} />
                  <ReviewRow label="Email" value={form.email} />
                  <ReviewRow label="Phone" value={form.phone} />
                </ReviewSection>
                <ReviewSection title="Clinic Details">
                  <ReviewRow label="Clinic" value={form.clinicName} />
                  <ReviewRow
                    label="Reg No."
                    value={form.clinicRegistration || "—"}
                  />
                  <ReviewRow
                    label="Address"
                    value={`${form.clinicAddress}, ${form.clinicCity}`}
                  />
                  <ReviewRow label="Country" value={form.clinicCountry} />
                  <ReviewRow
                    label="Clinic Email"
                    value={form.clinicEmail || "—"}
                  />
                </ReviewSection>
                <p className="text-xs text-white/40 pt-2">
                  By submitting, you agree to HomeoPath CRM terms of service.
                  Your data is stored locally on this device.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
            {step > 1 ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep((s) => s - 1)}
                className="text-white/60 hover:text-white gap-2"
                data-ocid="register.back_button"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
            ) : (
              <div />
            )}
            {step < 3 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="bg-primary hover:bg-primary/90 text-white gap-2"
                data-ocid="register.next_button"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="bg-primary hover:bg-primary/90 text-white gap-2 min-w-[130px]"
                data-ocid="register.submit_button"
              >
                {loading ? (
                  "Creating..."
                ) : (
                  <>
                    <Check className="w-4 h-4" /> Create Account
                  </>
                )}
              </Button>
            )}
          </div>
        </motion.div>

        <p className="mt-6 text-sm text-white/40">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-primary hover:text-primary/80 transition-colors font-medium"
            data-ocid="register.signin_link"
          >
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="text-xs font-medium text-white/70 mb-1.5 block">
        {label}
      </Label>
      {children}
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}

function ReviewSection({
  title,
  children,
}: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-3">
        {title}
      </p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-white/50">{label}</span>
      <span className="text-xs font-medium text-white truncate max-w-[60%] text-right">
        {value}
      </span>
    </div>
  );
}
