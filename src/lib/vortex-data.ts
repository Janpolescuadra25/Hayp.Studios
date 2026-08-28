import {
  BarChart3,
  ShoppingBag,
  Camera,
  Feather,
  Wallet,
  HeartPulse,
  LayoutDashboard,
  Store,
  Image,
  PenLine,
  Landmark,
  Activity,
  type LucideIcon,
} from "lucide-react";

export type Category =
  | "SaaS"
  | "E-Commerce"
  | "Portfolio"
  | "Blog"
  | "Fintech"
  | "Health";

export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: Category;
  featured: boolean;
  releasedAt: string; // ISO date
  icon: LucideIcon;
  /** two hex colors used to paint the CSS-art thumbnail */
  hue: [string, string];
  tags: string[];
}

export const CATEGORIES: { name: Category; icon: LucideIcon; blurb: string }[] = [
  { name: "SaaS", icon: LayoutDashboard, blurb: "Dashboards & platforms" },
  { name: "E-Commerce", icon: ShoppingBag, blurb: "Stores & checkouts" },
  { name: "Portfolio", icon: Camera, blurb: "Personal showcases" },
  { name: "Blog", icon: PenLine, blurb: "Editorial experiences" },
  { name: "Fintech", icon: Landmark, blurb: "Money & metrics" },
  { name: "Health", icon: HeartPulse, blurb: "Wellness & care" },
];

export const PRODUCTS: Product[] = [
  {
    id: "analytiq",
    name: "AnalytiQ Dashboard",
    tagline: "Analytics, minus the noise",
    description:
      "A real-time analytics platform with cohort tracking, funnel visualization and anomaly alerts. Ships with a full admin panel, auth flow and 14 pre-built chart modules.",
    category: "SaaS",
    featured: true,
    releasedAt: "2026-07-14",
    icon: BarChart3,
    hue: ["#0d9488", "#06b6d4"],
    tags: ["Dashboard", "Charts", "Auth"],
  },
  {
    id: "verdant",
    name: "Verdant Store",
    tagline: "Commerce that breathes",
    description:
      "A sustainable lifestyle brand shop with cart drawer, wishlist, product bundles and a carbon-neutral checkout badge. Conversion-tuned product pages included.",
    category: "E-Commerce",
    featured: true,
    releasedAt: "2026-06-28",
    icon: Store,
    hue: ["#10b981", "#0d9488"],
    tags: ["Store", "Cart", "Bundles"],
  },
  {
    id: "foliopro",
    name: "Folio Pro",
    tagline: "Your work, full-bleed",
    description:
      "A photographer portfolio with masonry galleries, EXIF overlays, lightbox stories and a print-shop module. Dark-room mode built in.",
    category: "Portfolio",
    featured: true,
    releasedAt: "2026-06-05",
    icon: Image,
    hue: ["#1e3a5f", "#0d9488"],
    tags: ["Gallery", "Lightbox", "Prints"],
  },
  {
    id: "emerald-journal",
    name: "The Emerald Journal",
    tagline: "Long-form, beautifully set",
    description:
      "An editorial platform with typographic article layouts, reading-time estimates, newsletter capture and a full CMS-ready content model.",
    category: "Blog",
    featured: true,
    releasedAt: "2026-05-19",
    icon: Feather,
    hue: ["#0d9488", "#10b981"],
    tags: ["Editorial", "CMS", "Newsletter"],
  },
  {
    id: "payflow",
    name: "PayFlow Finance",
    tagline: "Money, made legible",
    description:
      "Personal finance management with budget rings, subscription audit, savings goals and bank-grade encryption patterns. Import-ready CSV pipelines.",
    category: "Fintech",
    featured: true,
    releasedAt: "2026-04-30",
    icon: Wallet,
    hue: ["#1e3a5f", "#06b6d4"],
    tags: ["Budgets", "Goals", "Reports"],
  },
  {
    id: "vitawell",
    name: "VitaWell Health",
    tagline: "Care without the waiting room",
    description:
      "A wellness platform with telehealth scheduling, symptom intake flows, medication reminders and clinician messaging. HIPAA-minded data patterns.",
    category: "Health",
    featured: true,
    releasedAt: "2026-04-11",
    icon: HeartPulse,
    hue: ["#10b981", "#06b6d4"],
    tags: ["Telehealth", "Booking", "Reminders"],
  },
  {
    id: "pulseboard",
    name: "PulseBoard",
    tagline: "Status at a glance",
    description:
      "A uptime & incident status board with latency maps, subscriber notifications and a status embed widget for your own site.",
    category: "SaaS",
    featured: false,
    releasedAt: "2026-03-27",
    icon: Activity,
    hue: ["#0d9488", "#1e3a5f"],
    tags: ["Status", "Monitoring"],
  },
  {
    id: "atelier",
    name: "Atelier Cart",
    tagline: "Boutique-grade checkout",
    description:
      "A one-page storefront for makers with instant search, size guides, gift notes and Apple-pay-style express lanes.",
    category: "E-Commerce",
    featured: false,
    releasedAt: "2026-03-15",
    icon: ShoppingBag,
    hue: ["#10b981", "#1e3a5f"],
    tags: ["Storefront", "Express"],
  },
  {
    id: "lumenfolio",
    name: "Lumen Folio",
    tagline: "Motion-first portfolio",
    description:
      "A designer portfolio with scroll-linked case studies, cursor-reactive grids and a project timer that shows your process.",
    category: "Portfolio",
    featured: false,
    releasedAt: "2026-02-24",
    icon: Camera,
    hue: ["#06b6d4", "#10b981"],
    tags: ["Motion", "Case Study"],
  },
  {
    id: "quillpress",
    name: "QuillPress",
    tagline: "Publishing with taste",
    description:
      "A multi-author blog engine with series, footnotes, pull-quotes and an RSS-first distribution model.",
    category: "Blog",
    featured: false,
    releasedAt: "2026-02-08",
    icon: PenLine,
    hue: ["#0d9488", "#1e3a5f"],
    tags: ["Multi-author", "RSS"],
  },
  {
    id: "ledgerly",
    name: "Ledgerly",
    tagline: "Invoices that pay themselves",
    description:
      "Freelancer invoicing with recurring billing, late-fee automation, client portals and tax export bundles.",
    category: "Fintech",
    featured: false,
    releasedAt: "2026-01-21",
    icon: Landmark,
    hue: ["#1e3a5f", "#10b981"],
    tags: ["Invoicing", "Billing"],
  },
  {
    id: "mindtide",
    name: "MindTide",
    tagline: "Mental fitness, daily",
    description:
      "A guided journaling and meditation companion with streaks, mood rings and therapist-shareable summaries.",
    category: "Health",
    featured: false,
    releasedAt: "2026-01-07",
    icon: HeartPulse,
    hue: ["#06b6d4", "#0d9488"],
    tags: ["Journaling", "Streaks"],
  },
];

export type ChangelogKind = "launch" | "update" | "announcement" | "milestone";

export interface ChangelogEntry {
  id: string;
  kind: ChangelogKind;
  title: string;
  date: string;
  body: string;
  version?: string;
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    id: "cl-01",
    kind: "milestone",
    title: "Vortex.studio is Founded",
    date: "2025-11-01",
    body: "One founder. One mission: ship complete, ready-to-use digital products with no outsourcing and no shortcuts. The studio opens its doors.",
  },
  {
    id: "cl-02",
    kind: "announcement",
    title: "Brand System v1.0",
    date: "2025-11-18",
    body: "The Vortex identity ships — teal-to-navy palette, the swirl mark and the glassmorphic design language that every product now inherits.",
  },
  {
    id: "cl-03",
    kind: "launch",
    title: "First Products Go Live",
    date: "2025-12-06",
    body: "Ledgerly and MindTide become the first two products in the catalog. Both sell within 72 hours of launch.",
    version: "v1.0",
  },
  {
    id: "cl-04",
    kind: "milestone",
    title: "6 Products and Counting",
    date: "2026-01-20",
    body: "The catalog crosses six live products across four categories. The Hub launches with search, filters and sorting.",
  },
  {
    id: "cl-05",
    kind: "launch",
    title: "PayFlow Finance Ships",
    date: "2026-04-30",
    body: "The most requested category arrives: Fintech. Budget rings, subscription audits and savings goals — all founder-built.",
    version: "v1.2",
  },
  {
    id: "cl-06",
    kind: "update",
    title: "Telehealth Module for VitaWell",
    date: "2026-06-12",
    body: "VitaWell gains clinician messaging and symptom intake flows after two months of user feedback.",
    version: "v1.4",
  },
  {
    id: "cl-07",
    kind: "milestone",
    title: "50+ Products Built",
    date: "2026-07-30",
    body: "Across client work and the public catalog, Vortex crosses fifty shipped products. The next fifty are already in the pipeline.",
  },
  {
    id: "cl-08",
    kind: "announcement",
    title: "The Hub Gets a Glow-Up",
    date: "2026-08-21",
    body: "Faster search, new category pages and instant previews land in the Vortex Hub. Less clicks, more results — as always.",
  },
];

export const STATS = [
  { value: 50, suffix: "+", label: "Products built" },
  { value: 100, suffix: "%", label: "Founder-built" },
  { value: 6, suffix: "+", label: "Categories" },
  { value: null, suffix: "∞", label: "Growing" },
] as const;
