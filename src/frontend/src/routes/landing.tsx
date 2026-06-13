import { createRoute } from "@tanstack/react-router";
import {
  BarChart3,
  Calendar,
  Check,
  ChevronRight,
  ClipboardList,
  Globe,
  Leaf,
  Menu,
  Pill,
  Shield,
  Star,
  UserCircle,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { Route as rootRoute } from "./__root";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/landing",
  component: LandingPage,
});

function useCounter(target: number, duration = 2000, started = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!started) return;
    let startTime: number | null = null;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target, duration, started]);
  return count;
}

function AnimatedStatValue({
  value,
  suffix,
  started,
}: { value: number; suffix: string; started: boolean }) {
  const count = useCounter(value, 2000, started);
  return (
    <span>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

function FadeInSection({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right" | "none";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const yOffset = direction === "up" ? 40 : 0;
  const xOffset = direction === "left" ? -40 : direction === "right" ? 40 : 0;
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: yOffset, x: xOffset }}
      animate={isInView ? { opacity: 1, y: 0, x: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const features = [
  {
    icon: UserCircle,
    title: "Patient Management",
    desc: "Complete patient profiles, visit history, and case records in one place.",
    color: "text-teal-600",
    bg: "bg-teal-50",
  },
  {
    icon: Calendar,
    title: "Smart Appointments",
    desc: "Book, track, and manage appointments with real-time status updates.",
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    icon: ClipboardList,
    title: "Case Taking",
    desc: "Voice-to-text case notes, symptom tracking, and diagnosis assistance.",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Pill,
    title: "Pharmacy & Billing",
    desc: "Prescription fulfillment, fee management, and payment tracking.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: Shield,
    title: "Role-Based Access",
    desc: "Admin, Doctor, Receptionist, Pharmacist — each with tailored dashboards.",
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    desc: "Real-time insights on appointments, revenue, and patient trends.",
    color: "text-pink-600",
    bg: "bg-pink-50",
  },
];

const steps = [
  {
    num: "01",
    title: "Register Your Clinic",
    desc: "Set up your clinic profile, add your specializations, and configure your workflow preferences in minutes.",
    icon: Globe,
  },
  {
    num: "02",
    title: "Add Your Team",
    desc: "Invite doctors, receptionists, and pharmacists. Each role gets a personalized dashboard with the right access.",
    icon: UserCircle,
  },
  {
    num: "03",
    title: "Start Managing",
    desc: "Begin booking appointments, taking cases, managing prescriptions, and tracking revenue — all from day one.",
    icon: Zap,
  },
];

const testimonials = [
  {
    name: "Dr. Anjali Sharma",
    location: "Mumbai",
    text: "HomeoPath CRM has transformed how I manage my clinic. The case-taking feature is exceptional — it understands homeopathic workflows like no other system.",
    initials: "AS",
    color: "bg-teal-500",
    stars: 5,
  },
  {
    name: "Dr. Rajesh Patel",
    location: "Delhi",
    text: "The role-based access means my receptionist and pharmacist each have exactly what they need. No confusion, no clutter. It's incredibly well thought out.",
    initials: "RP",
    color: "bg-violet-500",
    stars: 5,
  },
  {
    name: "Dr. Priya Nair",
    location: "Bangalore",
    text: "Finally a CRM that understands homeopathy. The remedy tracking, patient timeline, and auto-message features are invaluable for my practice.",
    initials: "PN",
    color: "bg-emerald-500",
    stars: 5,
  },
];

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    features: [
      "1 Doctor account",
      "Up to 100 patients",
      "Basic appointment booking",
      "Patient profiles & case notes",
      "Email support",
    ],
    cta: "Get Started Free",
    href: "/register",
    popular: false,
  },
  {
    name: "Professional",
    price: "\u20b92,999",
    period: "/mo",
    features: [
      "Up to 5 Doctors",
      "Unlimited patients",
      "All features included",
      "Role-based access control",
      "Pharmacy & billing module",
      "WhatsApp auto-messages",
      "Priority support",
    ],
    cta: "Start Free Trial",
    href: "/register",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    features: [
      "Unlimited doctors & staff",
      "Multi-clinic management",
      "Custom integrations",
      "Dedicated account manager",
      "SLA guarantee",
      "On-premise option",
    ],
    cta: "Contact Us",
    href: "/register",
    popular: false,
  },
];

const statItems = [
  { value: 10000, suffix: "+", label: "Clinics Worldwide" },
  { value: 500000, suffix: "+", label: "Patients Managed" },
  { value: 98, suffix: "%", label: "Satisfaction Rate" },
  { value: 24, suffix: "/7", label: "Support Available" },
];

const navLinks = ["features", "about", "pricing", "contact"];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true, margin: "-100px" });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 text-foreground font-body"
      data-ocid="landing.page"
    >
      {/* NAVBAR */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/85 backdrop-blur-xl border-b border-border/60 shadow-sm"
            : "bg-transparent"
        }`}
        data-ocid="landing.navbar"
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a
              href="/landing"
              className="flex items-center gap-2.5 group"
              data-ocid="landing.logo_link"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-violet-600 flex items-center justify-center shadow-lg shadow-teal-500/25 group-hover:shadow-teal-500/40 transition-shadow">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold font-display text-foreground tracking-tight">
                HomeoPath <span className="text-teal-600">CRM</span>
              </span>
            </a>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => scrollTo(item)}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground capitalize rounded-lg hover:bg-black/5 transition-all duration-200"
                  data-ocid={`landing.nav_${item}`}
                >
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </button>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <a
                href="/login"
                className="px-4 py-2 text-sm font-semibold text-foreground border border-border rounded-lg hover:bg-black/5 transition-all duration-200"
                data-ocid="landing.signin_button"
              >
                Sign In
              </a>
              <a
                href="/register"
                className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-violet-600 rounded-lg hover:opacity-90 shadow-md shadow-teal-500/20 transition-all duration-200 hover:-translate-y-px"
                data-ocid="landing.get_started_button"
              >
                Get Started
              </a>
            </div>

            <button
              type="button"
              className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/5 transition-colors"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
              data-ocid="landing.mobile_menu_button"
            >
              {menuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden bg-white/95 backdrop-blur-xl border-b border-border overflow-hidden"
              data-ocid="landing.mobile_menu"
            >
              <div className="px-4 py-4 space-y-1">
                {navLinks.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => scrollTo(item)}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-foreground capitalize rounded-lg hover:bg-black/5 transition-colors"
                  >
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </button>
                ))}
                <div className="pt-3 flex flex-col gap-2 border-t border-border">
                  <a
                    href="/login"
                    className="w-full text-center px-4 py-2.5 text-sm font-semibold border border-border rounded-lg hover:bg-black/5 transition-colors"
                  >
                    Sign In
                  </a>
                  <a
                    href="/register"
                    className="w-full text-center px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-violet-600 rounded-lg"
                  >
                    Get Started Free
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-8%] left-[10%] w-[700px] h-[700px] rounded-full bg-teal-400/10 blur-[140px]" />
          <div className="absolute bottom-[0%] right-[5%] w-[500px] h-[500px] rounded-full bg-violet-400/12 blur-[120px]" />
          <div className="absolute top-[45%] left-[-5%] w-80 h-80 rounded-full bg-indigo-300/10 blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-sm font-semibold mb-6">
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                  Trusted by 10,000+ Clinics Worldwide
                </span>
              </motion.div>

              <motion.h1
                className="text-5xl md:text-6xl lg:text-7xl font-extrabold font-display leading-[1.05] tracking-tight mb-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                The Complete{" "}
                <span
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.62 0.15 180), oklch(0.65 0.18 290))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  CRM
                </span>{" "}
                for Homeopathy Clinics
              </motion.h1>

              <motion.p
                className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
              >
                Streamline patient management, appointments, prescriptions, and
                billing — built specifically for the unique workflows of
                homeopathic practice.
              </motion.p>

              <motion.div
                className="flex flex-wrap gap-4 mb-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.45 }}
              >
                <a
                  href="/register"
                  className="inline-flex items-center gap-2 px-7 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-teal-500 to-violet-600 rounded-xl shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 hover:-translate-y-0.5 transition-all duration-200"
                  data-ocid="landing.hero_cta_primary"
                >
                  Start Free Trial <ChevronRight className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => scrollTo("features")}
                  className="inline-flex items-center gap-2 px-7 py-3.5 text-base font-semibold text-foreground border border-border bg-white/80 rounded-xl hover:bg-white hover:border-teal-300 transition-all duration-200"
                  data-ocid="landing.hero_cta_secondary"
                >
                  Explore Features
                </button>
              </motion.div>

              <motion.div
                className="flex flex-wrap items-center gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                {["10,000+ Clinics", "99.9% Uptime", "HIPAA Compliant"].map(
                  (badge) => (
                    <div
                      key={badge}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center">
                        <Check className="w-3 h-3 text-teal-600" />
                      </div>
                      <span className="font-medium">{badge}</span>
                    </div>
                  ),
                )}
              </motion.div>
            </div>

            {/* Right: dashboard mockup */}
            <motion.div
              className="relative hidden lg:block"
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.3,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-teal-400/20 to-violet-400/20 rounded-3xl blur-3xl scale-105" />
              <div className="relative bg-white/90 backdrop-blur-xl border border-white/80 rounded-3xl shadow-2xl shadow-slate-200/80 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100/80 bg-gradient-to-r from-slate-50 to-white">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-violet-600 flex items-center justify-center">
                      <Leaf className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-bold font-display text-foreground">
                      HomeoPath CRM
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {["bg-red-400", "bg-yellow-400", "bg-green-400"].map(
                      (c) => (
                        <div
                          key={c}
                          className={`w-2.5 h-2.5 rounded-full ${c}`}
                        />
                      ),
                    )}
                  </div>
                </div>

                <div className="p-6 grid grid-cols-2 gap-4">
                  {[
                    {
                      label: "Total Patients",
                      value: "1,284",
                      change: "+12%",
                      color: "text-teal-600",
                      bg: "bg-teal-50",
                      border: "border-teal-100",
                    },
                    {
                      label: "Appointments Today",
                      value: "47",
                      change: "+8%",
                      color: "text-violet-600",
                      bg: "bg-violet-50",
                      border: "border-violet-100",
                    },
                    {
                      label: "Revenue (\u20b9)",
                      value: "84,200",
                      change: "+23%",
                      color: "text-emerald-600",
                      bg: "bg-emerald-50",
                      border: "border-emerald-100",
                    },
                    {
                      label: "Cases Taken",
                      value: "23",
                      change: "+5%",
                      color: "text-blue-600",
                      bg: "bg-blue-50",
                      border: "border-blue-100",
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className={`${stat.bg} border ${stat.border} rounded-2xl p-4`}
                    >
                      <p className="text-xs text-muted-foreground font-medium mb-1.5">
                        {stat.label}
                      </p>
                      <p
                        className={`text-2xl font-bold font-display ${stat.color}`}
                      >
                        {stat.value}
                      </p>
                      <span className="inline-block mt-1 text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full font-semibold">
                        {stat.change} this month
                      </span>
                    </div>
                  ))}
                </div>

                <div className="px-6 pb-6">
                  <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-foreground">
                        Appointment Trend
                      </span>
                      <span className="text-xs text-teal-600 font-semibold">
                        This Week
                      </span>
                    </div>
                    <div className="flex items-end gap-1.5 h-12">
                      {[
                        { d: "Mon", h: 40, idx: 0 },
                        { d: "Tue", h: 65, idx: 1 },
                        { d: "Wed", h: 50, idx: 2 },
                        { d: "Thu", h: 80, idx: 3 },
                        { d: "Fri", h: 70, idx: 4 },
                        { d: "Sat", h: 90, idx: 5 },
                        { d: "Sun", h: 75, idx: 6 },
                      ].map((bar) => (
                        <div
                          key={bar.d}
                          className="flex-1 rounded-sm"
                          style={{
                            height: `${bar.h}%`,
                            background:
                              "linear-gradient(to top, oklch(0.62 0.15 180), oklch(0.70 0.14 165))",
                            opacity: 0.5 + bar.idx * 0.08,
                          }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between mt-1.5">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                        (d) => (
                          <span
                            key={d}
                            className="flex-1 text-center text-[10px] text-muted-foreground"
                          >
                            {d}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <motion.div
                className="absolute -bottom-4 -left-6 bg-white border border-emerald-200 rounded-2xl px-4 py-3 shadow-lg flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9, duration: 0.5 }}
              >
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <UserCircle className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">
                    New Patient
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Registered · just now
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="absolute -top-4 -right-4 bg-white border border-violet-200 rounded-2xl px-4 py-3 shadow-lg"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0, duration: 0.5 }}
              >
                <p className="text-xs font-bold text-foreground">
                  \u20b984,200
                </p>
                <p className="text-[11px] text-violet-600 font-semibold">
                  \u2191 23% revenue
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 bg-white/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-sm font-semibold mb-4">
              Powerful Features
            </span>
            <h2 className="text-4xl md:text-5xl font-bold font-display tracking-tight text-foreground mb-4">
              Everything Your Clinic Needs
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A complete suite of tools designed for the modern homeopathy
              practice — from patient intake to prescription management.
            </p>
          </FadeInSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => (
              <FadeInSection key={feat.title} delay={i * 0.08}>
                <motion.div
                  className="group bg-white/80 backdrop-blur-md border border-border rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-default"
                  whileHover={{ scale: 1.01 }}
                >
                  <div
                    className={`w-12 h-12 rounded-xl ${feat.bg} flex items-center justify-center mb-4`}
                  >
                    <feat.icon className={`w-6 h-6 ${feat.color}`} />
                  </div>
                  <h3 className="text-lg font-bold font-display text-foreground mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feat.desc}
                  </p>
                </motion.div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="about" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-sm font-semibold mb-4">
              How It Works
            </span>
            <h2 className="text-4xl md:text-5xl font-bold font-display tracking-tight text-foreground mb-4">
              Built for Homeopathy Clinics
            </h2>
          </FadeInSection>

          <div className="relative grid md:grid-cols-3 gap-8 mb-16">
            <div className="hidden md:block absolute top-12 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px bg-gradient-to-r from-teal-300 via-violet-300 to-emerald-300 z-0" />
            {steps.map((step, i) => (
              <FadeInSection key={step.title} delay={i * 0.15}>
                <div className="relative flex flex-col items-center text-center">
                  <div className="relative z-10 mb-6">
                    <div className="w-24 h-24 rounded-2xl bg-white border border-border shadow-md flex flex-col items-center justify-center gap-1">
                      <step.icon className="w-7 h-7 text-teal-600" />
                      <span className="text-xs font-bold text-muted-foreground">
                        {step.num}
                      </span>
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-teal-500 to-violet-600 flex items-center justify-center shadow-sm">
                      <span className="text-xs font-bold text-white">
                        {i + 1}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold font-display text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </FadeInSection>
            ))}
          </div>

          <FadeInSection>
            <div className="relative bg-gradient-to-r from-teal-500/5 via-violet-500/5 to-indigo-500/5 border border-teal-200/60 rounded-3xl px-8 py-10 text-center backdrop-blur-md">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-violet-600 flex items-center justify-center mx-auto mb-5 shadow-md">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <p className="text-xl md:text-2xl font-medium font-display text-foreground leading-relaxed max-w-3xl mx-auto">
                &ldquo;Designed specifically for the unique workflows of
                homeopathic practice &mdash; from constitutional case taking to{" "}
                <span
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.62 0.15 180), oklch(0.65 0.18 290))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  multi-potency prescriptions.
                </span>
                &rdquo;
              </p>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* STATS BANNER */}
      <section className="py-20 bg-gradient-to-r from-teal-600 via-violet-600 to-indigo-600 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div
          ref={statsRef}
          className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {statItems.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                animate={statsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold font-display text-white mb-2">
                  <AnimatedStatValue
                    value={stat.value}
                    suffix={stat.suffix}
                    started={statsInView}
                  />
                </div>
                <div className="text-sm text-white/70 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold mb-4">
              Testimonials
            </span>
            <h2 className="text-4xl md:text-5xl font-bold font-display tracking-tight text-foreground mb-4">
              Trusted by Homeopaths Worldwide
            </h2>
          </FadeInSection>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <FadeInSection key={t.name} delay={i * 0.1}>
                <div className="bg-white/90 backdrop-blur-md border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                  <div className="flex mb-3">
                    {[1, 2, 3, 4, 5].slice(0, t.stars).map((n) => (
                      <Star
                        key={n}
                        className="w-4 h-4 text-amber-400 fill-amber-400"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}
                    >
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        {t.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t.location}
                      </p>
                    </div>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm font-semibold mb-4">
              Pricing
            </span>
            <h2 className="text-4xl md:text-5xl font-bold font-display tracking-tight text-foreground mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-muted-foreground">
              Start free. Scale as your clinic grows.
            </p>
          </FadeInSection>

          <div className="grid md:grid-cols-3 gap-6 items-start">
            {plans.map((plan, i) => (
              <FadeInSection key={plan.name} delay={i * 0.1}>
                <div
                  className={`relative rounded-2xl p-7 border transition-all duration-300 ${
                    plan.popular
                      ? "bg-gradient-to-br from-teal-600 via-violet-600 to-indigo-600 border-transparent shadow-2xl shadow-violet-300/30 scale-105"
                      : "bg-white/80 backdrop-blur-md border-border shadow-sm hover:shadow-md"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="px-4 py-1.5 bg-amber-400 text-amber-900 text-xs font-bold rounded-full shadow-lg">
                        \u2b50 Most Popular
                      </span>
                    </div>
                  )}
                  <div className="mb-6">
                    <h3
                      className={`text-lg font-bold font-display mb-2 ${plan.popular ? "text-white" : "text-foreground"}`}
                    >
                      {plan.name}
                    </h3>
                    <div
                      className={`flex items-baseline gap-1 ${plan.popular ? "text-white" : "text-foreground"}`}
                    >
                      <span className="text-4xl font-extrabold font-display">
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-sm opacity-70">
                          {plan.period}
                        </span>
                      )}
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center mt-px flex-shrink-0 ${plan.popular ? "bg-white/20" : "bg-teal-50"}`}
                        >
                          <Check
                            className={`w-3 h-3 ${plan.popular ? "text-white" : "text-teal-600"}`}
                          />
                        </div>
                        <span
                          className={`text-sm ${plan.popular ? "text-white/90" : "text-muted-foreground"}`}
                        >
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href={plan.href}
                    className={`block w-full text-center py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                      plan.popular
                        ? "bg-white text-violet-700 hover:bg-white/90 shadow-lg"
                        : "border border-teal-500 text-teal-700 hover:bg-teal-50"
                    }`}
                    data-ocid={`landing.pricing_cta.${i + 1}`}
                  >
                    {plan.cta}
                  </a>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <div className="relative bg-gradient-to-br from-teal-50 via-violet-50 to-indigo-50 border border-teal-200/60 rounded-3xl px-8 py-16 md:py-20 text-center overflow-hidden">
              <div className="absolute top-0 left-0 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-violet-400/10 rounded-full blur-3xl" />
              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-extrabold font-display text-foreground mb-4">
                  Ready to Transform
                  <br />
                  <span
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.62 0.15 180), oklch(0.65 0.18 290))",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    Your Clinic?
                  </span>
                </h2>
                <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
                  Join thousands of homeopaths who trust HomeoPath CRM to run
                  their practice efficiently.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <a
                    href="/register"
                    className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-teal-500 to-violet-600 rounded-xl shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200"
                    data-ocid="landing.cta_banner_primary"
                  >
                    Get Started Free <ChevronRight className="w-4 h-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => scrollTo("pricing")}
                    className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-foreground border border-border bg-white rounded-xl hover:border-teal-300 transition-all duration-200"
                    data-ocid="landing.cta_banner_secondary"
                  >
                    See Pricing
                  </button>
                </div>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        id="contact"
        className="bg-white/80 backdrop-blur-md border-t border-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-5 gap-10 mb-12">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-violet-600 flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-white" />
                </div>
                <span className="text-base font-bold font-display">
                  HomeoPath <span className="text-teal-600">CRM</span>
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Professional clinic management for homeopathy practitioners
                worldwide.
              </p>
            </div>

            {[
              {
                title: "Product",
                links: ["Features", "Pricing", "Updates", "Roadmap"],
              },
              {
                title: "Company",
                links: ["About", "Blog", "Careers", "Press"],
              },
              {
                title: "Support",
                links: ["Help Center", "Documentation", "Community", "Contact"],
              },
              {
                title: "Legal",
                links: ["Privacy", "Terms", "Cookies", "Compliance"],
              },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-sm font-bold text-foreground mb-4">
                  {col.title}
                </h4>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="/contact"
                        className="text-sm text-muted-foreground hover:text-teal-600 transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} HomeoPath CRM. All rights
              reserved.
            </p>
            <p className="text-sm text-muted-foreground">
              Built with love using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
                className="text-teal-600 hover:text-teal-700 font-medium transition-colors"
                target="_blank"
                rel="noreferrer"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
