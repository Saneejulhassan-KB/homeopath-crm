# Design Brief

**Purpose & Tone:** Premium healthcare SaaS CRM for homeopathy clinics. Calming, professional, trustworthy. Minimal visual clutter, intentional depth. Pro tier emphasizes exclusivity with warm gold accents and crown indicators.

**Palette:**
| Token | Light | Dark |
|-------|-------|------|
| Background | `0.98 0.005 0` | `0.12 0.008 0` |
| Card | `0.99 0.008 0` | `0.16 0.01 0` |
| Primary (teal) | `0.62 0.15 190` | `0.65 0.18 190` |
| Secondary | `0.95 0.01 0` | `0.2 0.01 0` |
| Accent (teal-green) | `0.68 0.12 165` | `0.7 0.14 165` |
| Premium (gold) | `0.74 0.12 60` | `0.78 0.14 60` |
| Foreground | `0.15 0 0` | `0.92 0.01 0` |
| Muted | `0.92 0 0` | `0.2 0.01 0` |
| Border | `0.88 0.01 0` | `0.25 0.01 0` |

**Typography:** Space Grotesk (display—geometric, bold, modern), DM Sans (body—refined, accessible), JetBrains Mono (code).

**Elevation & Depth:**
- Cards: `backdrop-blur-md`, `bg-white/10` (light), `bg-white/5` (dark), `border-white/20` (light), `border-white/10` (dark)
- Pro cards: Enhanced glass with gold-tinted border-top/left, `shadow-elevated` + `shadow-premium-glow` for prominence
- Soft shadows: `shadow-soft` for subtle elevation
- Elevated shadows: `shadow-elevated` for modals, popovers
- Pro shadows: `shadow-pro-card` (light), `shadow-pro-card-dark` for premium features
- Premium glow: `shadow-premium-glow` on hover, `shadow-premium-hover` on active
- No flat surfaces—every layer has intentional depth

**Structural Zones:**
| Zone | Treatment | Example |
|------|-----------|---------|
| Sidebar | Dark opaque, teal accents | Navigation, logo, user menu |
| Header | Glass card with border | Logo, search, notifications, theme toggle |
| Content | Light/muted background | Main content area with cards |
| Standard Cards | Glassmorphism | Patient list, stats, appointments |
| Pro Cards | Enhanced glass + gold accent + glow | Premium feature showcase |
| Pro Badges | Gold accent with crown icon | Feature status indicators with `animate-glow-pulse` |
| Pro Feature Grid | Responsive 3-col layout | Voice recorder, remedy finder, templates, timeline |
| Empty States | Centered icon + text | Pro-styled empty placeholder with gold accent |
| Modals | Elevated glass with backdrop | Forms, details, confirmations |
| Footer | Muted surface | Copyright, links |

**Spacing & Rhythm:** 4px grid. Cards use `p-6` (24px), sections use `space-y-4` (16px gaps), header `h-16` (64px), pro grid gap `gap-4`.

**Component Patterns:**
- Reusable glass cards with smooth transitions
- Icon + label combinations (teal for standard, gold for premium)
- Pro badges with crown icon, animated gold pulse glow
- Feature cards with hover scale (1.05x), enhanced shadow on hover
- Lock icons on exclusive features visible on hover
- Floating action buttons with premium color and scale animation
- Timeline dots (teal standard, gold premium)
- Remedy matrix grid with hover border highlight
- Voice visualizer bars with pulse animation

**Motion:**
- Framer Motion: fade-in (0.4s), slide-in (0.3s), staggered children
- Tailwind animations: `pulse-subtle` (2s), `glow-pulse` (3s gold), `slide-up` (0.5s), `float` (3s), `crown-bounce` (2s)
- Pro tier: stagger cards on load, bounce crown badges, glow-pulse on premium badges

**Pro Tier Differentiation:**
- Gold accent: `--premium: 0.74–0.78 0.12–0.14 60` with enhanced chroma in dark mode
- `.pro-badge`, `.pro-badge-premium` utilities with crown icon indicators
- `.glass-premium` with gold border glow on hover
- `.pro-feature-card` with scale transform and double shadow (base + premium glow)
- `.pro-crown` icon with pulse animation
- Crown bounce animation for badges
- `.pro-grid` 3-column responsive layout
- Floating action area with premium color
- Timeline premium dots with gold color
- Premium glow shadows activate on `.pro-feature-card` hover

**Constraints:**
- Chart colors: 5 core (teal-primary, accent, complementary), 1 premium gold for pro tier
- No rainbow palettes, no scattered gradients
- Sidebar always visible desktop (fullscreen on mobile)
- Pro badges have 2px border for definition
- Feature cards scale on hover, shadow follows
- Animations use cubic-bezier(0.4, 0, 0.2, 1) for smoothness
- Glass blur strength: `backdrop-blur-md` (12px)

**Signature Detail:** 
Glassmorphism with layered depth—card borders glow with gold on pro tier, creating visual hierarchy. Crown icons pulse subtly. Voice-to-text visualizer animates with premium bars. Timeline mixes teal and gold dots. Empty states use centered gold-accented icons. Remedy matrix cells highlight teal on hover. All pro interactions cascade with smooth easing and staggered timing—exclusivity without excess.

