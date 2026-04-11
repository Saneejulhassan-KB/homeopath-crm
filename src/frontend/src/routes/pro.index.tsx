import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { upgradePlans } from "@/data/proFeatures";
import { Link, createRoute } from "@tanstack/react-router";
import {
  Activity,
  Archive,
  ArrowRight,
  BookOpen,
  Building2,
  Check,
  ChevronRight,
  Crown,
  FileText,
  GitCompare,
  Lock,
  Mic2,
  Search,
  Sparkles,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";
import { type Variants, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Route as proRoute } from "./pro";

export const Route = createRoute({
  getParentRoute: () => proRoute,
  path: "/",
  component: ProFeaturesPage,
});

// ── Feature card data ─────────────────────────────────────────────────────────

const featureCards = [
  {
    id: "voice-recorder",
    icon: Mic2,
    name: "Voice Case Taking",
    description:
      "Record patient consultations and auto-convert speech to structured case notes with AI symptom extraction and remedy suggestions.",
    route: "/pro/voice-recorder",
    badge: "New",
    color: "from-red-500/20 to-rose-500/10",
    iconColor: "text-red-400",
    gradient:
      "bg-gradient-to-br from-red-500/10 via-transparent to-transparent",
  },
  {
    id: "remedy-finder",
    icon: Search,
    name: "Smart Remedy Finder",
    description:
      "Search across rubrics, symptoms, and modalities to instantly surface the best-matched remedies with confidence scoring.",
    route: "/pro/remedy-finder",
    color: "from-primary/20 to-accent/10",
    iconColor: "text-primary",
    gradient:
      "bg-gradient-to-br from-primary/10 via-transparent to-transparent",
  },
  {
    id: "case-templates",
    icon: FileText,
    name: "Clinical Case Templates",
    description:
      "Pre-built templates for 20+ conditions with repertorization guidance, red-flag alerts, and evidence-based dosage protocols.",
    route: "/pro/case-templates",
    color: "from-accent/20 to-primary/10",
    iconColor: "text-accent",
    gradient: "bg-gradient-to-br from-accent/10 via-transparent to-transparent",
  },
  {
    id: "patient-timeline",
    icon: Activity,
    name: "Patient Health Timeline",
    description:
      "Longitudinal symptom-score charts with remedy response tracking and milestone annotations for each patient journey.",
    route: "/pro/patient-timeline",
    badge: "Popular",
    color: "from-premium/20 to-amber-500/10",
    iconColor: "text-premium",
    gradient:
      "bg-gradient-to-br from-premium/10 via-transparent to-transparent",
  },
  {
    id: "remedy-comparison",
    icon: GitCompare,
    name: "Remedy Comparison",
    description:
      "Side-by-side differential analysis of up to 4 remedies across keynotes, modalities, miasms, and affinities.",
    route: "/pro/remedy-comparison",
    color: "from-purple-500/20 to-primary/10",
    iconColor: "text-purple-400",
    gradient:
      "bg-gradient-to-br from-purple-500/10 via-transparent to-transparent",
  },
  {
    id: "case-repository",
    icon: Archive,
    name: "Case Repository",
    description:
      "Searchable anonymized archive with outcome tracking filterable by condition, remedy, and clinical outcome for EBP.",
    route: "/pro/case-repository",
    color: "from-emerald-500/20 to-accent/10",
    iconColor: "text-emerald-400",
    gradient:
      "bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent",
  },
  {
    id: "materia-medica",
    icon: BookOpen,
    name: "Materia Medica Browser",
    description:
      "Comprehensive digital materia medica with 300+ remedy profiles, constitutional types, and an interactive periodic table.",
    route: "/pro/materia-medica",
    color: "from-amber-500/20 to-premium/10",
    iconColor: "text-amber-400",
    gradient:
      "bg-gradient-to-br from-amber-500/10 via-transparent to-transparent",
  },
] as const;

// ── Usage stats ───────────────────────────────────────────────────────────────

const usageStats = [
  {
    label: "Voice Sessions",
    value: 24,
    suffix: "",
    icon: Mic2,
    color: "text-premium",
    bgColor: "bg-premium/10",
    borderColor: "border-premium/20",
  },
  {
    label: "Repertorizations",
    value: 156,
    suffix: "",
    icon: Search,
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/20",
  },
  {
    label: "Templates Used",
    value: 43,
    suffix: "",
    icon: FileText,
    color: "text-accent",
    bgColor: "bg-accent/10",
    borderColor: "border-accent/20",
  },
  {
    label: "Cases Archived",
    value: 87,
    suffix: "",
    icon: Archive,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
  },
];

// ── Key benefits ──────────────────────────────────────────────────────────────

const keyBenefits = [
  {
    icon: TrendingUp,
    title: "3× Faster Case Taking",
    description:
      "Voice recording and auto-transcription cut consultation documentation time by 66%, letting you focus on the patient.",
    color: "text-primary",
    bg: "bg-primary/8",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Repertorization",
    description:
      "Match symptoms to remedies using Kent & Synthesis repertory algorithms with instant ranked results and confidence scores.",
    color: "text-premium",
    bg: "bg-premium/8",
  },
  {
    icon: Star,
    title: "Evidence-Based Practice",
    description:
      "Access case repositories with outcome tracking to make data-driven prescribing decisions grounded in real results.",
    color: "text-accent",
    bg: "bg-accent/8",
  },
];

// ── Plan icons ────────────────────────────────────────────────────────────────

const planIcons: Record<string, typeof Zap> = {
  free: Zap,
  pro: Crown,
  enterprise: Building2,
};

// ── Animation variants ────────────────────────────────────────────────────────

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] },
  },
};

const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] },
  },
};

// ── Animated Counter ──────────────────────────────────────────────────────────

function AnimatedCounter({
  target,
  suffix = "",
}: { target: number; suffix?: string }) {
  const [displayed, setDisplayed] = useState(0);
  const hasAnimated = useRef(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          let start = 0;
          const step = Math.max(1, Math.ceil(target / 40));
          const interval = setInterval(() => {
            start = Math.min(start + step, target);
            setDisplayed(start);
            if (start >= target) clearInterval(interval);
          }, 30);
        }
      },
      { threshold: 0.5 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref} className="tabular-nums">
      {displayed}
      {suffix}
    </span>
  );
}

// ── Page component ────────────────────────────────────────────────────────────

function ProFeaturesPage() {
  return (
    <motion.div
      className="space-y-12 pb-8"
      variants={container}
      initial="hidden"
      animate="visible"
      data-ocid="pro-features-page"
    >
      {/* ── Hero Header ─────────────────────────────────────────────────── */}
      <motion.div
        variants={fadeUp}
        className="relative overflow-hidden rounded-2xl border border-premium/20 bg-gradient-to-br from-card via-card to-premium/5 p-8 md:p-10"
        data-ocid="pro-hero-section"
      >
        {/* Decorative orbs */}
        <div
          className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, oklch(0.78 0.14 60), transparent 70%)",
          }}
          aria-hidden
        />
        <div
          className="absolute bottom-0 left-20 w-64 h-64 rounded-full opacity-8 blur-3xl pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, oklch(0.65 0.18 190), transparent 70%)",
          }}
          aria-hidden
        />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="min-w-0">
            {/* Breadcrumb */}
            <nav
              className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3"
              aria-label="Breadcrumb"
            >
              <span>HomeoPath CRM</span>
              <ChevronRight className="w-3 h-3 opacity-40" />
              <span className="text-foreground font-medium">Pro Features</span>
            </nav>

            {/* Title */}
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border"
                style={{
                  background: "oklch(var(--premium) / 0.12)",
                  borderColor: "oklch(var(--premium) / 0.35)",
                }}
              >
                <Crown
                  className="w-5 h-5"
                  style={{ color: "oklch(var(--premium))" }}
                />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground leading-tight">
                  Pro Features Hub
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5 font-body">
                  Advanced clinical tools for professional homeopathic practice
                </p>
              </div>
            </div>

            {/* Tagline */}
            <p className="text-base text-foreground/70 font-body max-w-xl leading-relaxed mt-2">
              Everything you need to run a world-class homeopathy clinic —
              AI-powered case taking, complete materia medica, and outcome
              analytics, all in one place.
            </p>
          </div>

          {/* Pro Plan Active badge */}
          <div className="shrink-0 flex flex-col items-center gap-2">
            <div
              className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold border shadow-lg"
              style={{
                background: "oklch(var(--premium) / 0.10)",
                borderColor: "oklch(var(--premium) / 0.40)",
                color: "oklch(var(--premium))",
              }}
              data-ocid="pro-plan-badge"
            >
              <Crown className="w-4 h-4" />
              <span>Pro Plan</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-semibold">Active</span>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              7 features unlocked
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Usage Stats ─────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} data-ocid="pro-usage-stats">
        <div className="flex items-center gap-2 mb-5">
          <Activity className="w-4 h-4 text-primary" />
          <h2 className="font-display font-semibold text-foreground text-base">
            Your Usage This Month
          </h2>
        </div>
        <motion.div
          variants={container}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {usageStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                variants={scaleIn}
                className={`relative overflow-hidden glass-card p-5 flex flex-col gap-3 border ${stat.borderColor}`}
                data-ocid={`stat-card-${stat.label.replace(/\s+/g, "-").toLowerCase()}`}
              >
                {/* Background glow */}
                <div
                  className={`absolute top-0 right-0 w-16 h-16 rounded-bl-full opacity-40 blur-xl pointer-events-none ${stat.bgColor}`}
                  aria-hidden
                />
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${stat.bgColor} ${stat.borderColor}`}
                >
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div className="min-w-0">
                  <p
                    className={`text-3xl font-display font-bold leading-none ${stat.color}`}
                  >
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="text-xs text-muted-foreground mt-1.5 truncate font-body">
                    {stat.label}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>

      {/* ── Feature Grid ────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} data-ocid="pro-feature-grid-section">
        <div className="flex items-center gap-2 mb-5">
          <Sparkles className="w-4 h-4 text-premium" />
          <h2 className="font-display font-semibold text-foreground text-base">
            Your Pro Tools
          </h2>
          <span className="ml-auto text-xs text-muted-foreground">
            7 features available
          </span>
        </div>

        <motion.div
          variants={container}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          data-ocid="pro-feature-grid"
        >
          {featureCards.map((feat, index) => {
            const Icon = feat.icon;
            const badge = (feat as { badge?: string }).badge;
            return (
              <motion.div
                key={feat.id}
                variants={fadeUp}
                custom={index}
                className="glass-premium group relative flex flex-col gap-4 p-5 cursor-pointer transition-all duration-300"
                whileHover={{
                  scale: 1.018,
                  boxShadow:
                    "0 0 32px oklch(0.78 0.14 60 / 0.15), 0 8px 40px rgba(0,0,0,0.22)",
                }}
                data-ocid={`pro-feature-card-${feat.id}`}
              >
                {/* Hover gradient overlay */}
                <div
                  className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${feat.gradient}`}
                  aria-hidden
                />

                {/* Badge */}
                {badge && (
                  <span
                    className="absolute top-4 right-4 pro-badge text-[10px] uppercase tracking-wide z-10"
                    data-ocid={`feature-badge-${feat.id}`}
                  >
                    {badge}
                  </span>
                )}

                {/* Icon */}
                <div
                  className="relative w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border border-premium/20 group-hover:scale-110 transition-transform duration-300"
                  style={{ background: "oklch(var(--premium) / 0.10)" }}
                >
                  <Icon className={`w-5 h-5 ${feat.iconColor}`} />
                </div>

                {/* Title + PRO badge */}
                <div className="relative flex items-start gap-2 flex-wrap">
                  <h3 className="font-display font-semibold text-foreground text-sm leading-snug flex-1 min-w-0">
                    {feat.name}
                  </h3>
                  <Badge
                    variant="outline"
                    className="shrink-0 text-[10px] px-2 py-0.5 border-premium/40 bg-premium/10"
                    style={{ color: "oklch(var(--premium))" }}
                  >
                    PRO
                  </Badge>
                </div>

                {/* Description */}
                <p className="relative text-xs text-muted-foreground leading-relaxed flex-1">
                  {feat.description}
                </p>

                {/* CTA */}
                <Link
                  to={feat.route}
                  className="relative mt-auto block"
                  data-ocid={`pro-feature-link-${feat.id}`}
                  aria-label={`Open ${feat.name}`}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between text-xs group-hover:bg-premium/10 group-hover:text-premium transition-colors duration-200"
                  >
                    Open Feature
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
                  </Button>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>

      {/* ── Key Benefits ────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} data-ocid="pro-benefits-section">
        <div className="flex items-center gap-2 mb-6">
          <Star className="w-4 h-4 text-premium" />
          <h2 className="font-display font-semibold text-foreground text-base">
            Why Upgrade to Pro
          </h2>
        </div>

        <motion.div
          variants={container}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {keyBenefits.map((benefit, i) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.title}
                variants={fadeLeft}
                custom={i}
                className="glass-card p-6 flex flex-col gap-4 group hover:border-primary/20 transition-smooth"
                data-ocid={`benefit-card-${i}`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center ${benefit.bg} group-hover:scale-105 transition-transform duration-300`}
                >
                  <Icon className={`w-5 h-5 ${benefit.color}`} />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground text-sm mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed font-body">
                    {benefit.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>

      {/* ── Pricing Plans ────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} data-ocid="pro-pricing-section">
        <div className="flex items-center gap-2 mb-2">
          <Crown className="w-4 h-4 text-premium" />
          <h2 className="font-display font-semibold text-foreground text-base">
            Plans &amp; Pricing
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mb-6 font-body">
          Choose the plan that fits your practice size and needs
        </p>

        <motion.div
          variants={container}
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {upgradePlans.map((plan, index) => {
            const PlanIcon = planIcons[plan.tier] ?? Zap;
            const isCurrent = plan.tier === "pro";
            const isFree = plan.tier === "free";

            return (
              <motion.div
                key={plan.id}
                variants={scaleIn}
                custom={index}
                className={[
                  "relative flex flex-col p-6 rounded-2xl border transition-all duration-300",
                  plan.highlighted
                    ? "border-premium/50 shadow-2xl"
                    : "glass border-white/10",
                ].join(" ")}
                style={
                  plan.highlighted
                    ? {
                        background:
                          "linear-gradient(135deg, oklch(var(--card)/0.95) 0%, oklch(var(--premium)/0.06) 100%)",
                      }
                    : undefined
                }
                whileHover={
                  !plan.highlighted
                    ? { scale: 1.01, boxShadow: "0 8px 40px rgba(0,0,0,0.15)" }
                    : undefined
                }
                data-ocid={`pricing-card-${plan.id}`}
              >
                {/* Top badge */}
                {plan.badge && (
                  <span
                    className={[
                      "absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-[11px] font-bold border shadow-lg",
                      plan.highlighted
                        ? "border-premium/60 text-foreground"
                        : "bg-card text-muted-foreground border-border",
                    ].join(" ")}
                    style={
                      plan.highlighted
                        ? {
                            background: "oklch(var(--premium) / 0.92)",
                            color: "oklch(var(--premium-foreground))",
                          }
                        : undefined
                    }
                  >
                    {plan.badge}
                  </span>
                )}

                {/* Decorative glow for highlighted */}
                {plan.highlighted && (
                  <div
                    className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-15 blur-2xl pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(circle, oklch(0.78 0.14 60), transparent 70%)",
                    }}
                    aria-hidden
                  />
                )}

                {/* Plan name */}
                <div className="flex items-center gap-3 mb-5 relative">
                  <div
                    className={[
                      "w-10 h-10 rounded-xl flex items-center justify-center border",
                      plan.highlighted
                        ? "border-premium/30"
                        : "bg-muted/40 border-border",
                    ].join(" ")}
                    style={
                      plan.highlighted
                        ? { background: "oklch(var(--premium) / 0.15)" }
                        : undefined
                    }
                  >
                    <PlanIcon
                      className={`w-4.5 h-4.5 ${plan.highlighted ? "" : "text-muted-foreground"}`}
                      style={
                        plan.highlighted
                          ? { color: "oklch(var(--premium))" }
                          : undefined
                      }
                    />
                  </div>
                  <div>
                    <p className="font-display font-bold text-foreground">
                      {plan.name}
                    </p>
                    {isCurrent && (
                      <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                        Current Plan
                      </p>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="mb-3 relative">
                  {plan.price === 0 ? (
                    <span className="text-4xl font-display font-bold text-foreground">
                      Free
                    </span>
                  ) : (
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-display font-bold text-foreground">
                        ${plan.annualPrice}
                      </span>
                      <span className="text-xs text-muted-foreground mb-2.5 font-body">
                        /mo billed annually
                      </span>
                    </div>
                  )}
                  {plan.price > 0 && plan.price !== plan.annualPrice && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      or ${plan.price}/mo billed monthly
                    </p>
                  )}
                </div>

                <p className="text-xs text-muted-foreground mb-5 leading-relaxed font-body relative">
                  {plan.description}
                </p>

                {/* Features */}
                <ul className="space-y-2.5 mb-6 flex-1 relative">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-xs">
                      {isFree && feat.includes("Up to") ? (
                        <Lock className="w-3.5 h-3.5 text-muted-foreground/40 mt-0.5 shrink-0" />
                      ) : (
                        <Check
                          className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${plan.highlighted ? "" : "text-primary"}`}
                          style={
                            plan.highlighted
                              ? { color: "oklch(var(--premium))" }
                              : undefined
                          }
                        />
                      )}
                      <span
                        className={`${isFree ? "text-muted-foreground" : "text-foreground/80"}`}
                      >
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  variant={plan.highlighted ? "default" : "outline"}
                  className={[
                    "w-full text-sm font-semibold relative",
                    plan.highlighted ? "shadow-lg" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={
                    plan.highlighted
                      ? {
                          background: "oklch(var(--premium) / 0.92)",
                          borderColor: "oklch(var(--premium) / 0.50)",
                          color: "oklch(var(--premium-foreground))",
                        }
                      : undefined
                  }
                  disabled={isCurrent}
                  data-ocid={`pricing-cta-${plan.id}`}
                >
                  {isCurrent && <Check className="w-3.5 h-3.5 mr-1.5" />}
                  {plan.ctaLabel}
                </Button>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>

      {/* ── Testimonial / Social Proof ───────────────────────────────────── */}
      <motion.div
        variants={fadeUp}
        className="glass-premium p-8 text-center relative overflow-hidden"
        data-ocid="pro-social-proof"
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, oklch(0.78 0.14 60 / 0.4), transparent 60%)",
          }}
          aria-hidden
        />
        <div className="relative space-y-4">
          <div className="flex items-center justify-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className="w-5 h-5 text-premium fill-premium"
                aria-hidden
              />
            ))}
          </div>
          <blockquote className="text-lg font-display font-medium text-foreground max-w-2xl mx-auto leading-relaxed">
            "HomeoPath CRM's Pro features have completely transformed how I run
            my clinic. Voice case taking alone saves me 2 hours a day."
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-sm font-bold text-primary font-display">
              DR
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground font-display">
                Dr. Rajesh Nambiar
              </p>
              <p className="text-xs text-muted-foreground font-body">
                Classical Homeopath · Kochi, India · 12 years practice
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
