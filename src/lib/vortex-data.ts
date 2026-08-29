import {
  BookOpenCheck,
  Zap,
  Link2,
  Globe,
  ShoppingBag,
  Swords,
  Castle,
  Car,
  Compass,
  type LucideIcon,
} from "lucide-react";

export type Category =
  | "Accounting"
  | "Automation"
  | "Social"
  | "E-Commerce"
  | "Games";

export type ProductStatus = "live" | "development" | "planned" | "concept";

export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: Category;
  status: ProductStatus;
  /** announcement / release date (used for sorting) */
  releasedAt: string; // ISO date
  /** for unreleased products — shown instead of the date */
  eta?: string;
  icon: LucideIcon;
  /** two hex colors used to paint the CSS-art thumbnail */
  hue: [string, string];
  tags: string[];
}

export const CATEGORIES: { name: Category; icon: LucideIcon; blurb: string }[] = [
  { name: "Accounting", icon: BookOpenCheck, blurb: "Bookkeeping, set in motion." },
  { name: "Automation", icon: Zap, blurb: "Data that posts itself." },
  { name: "Social", icon: Globe, blurb: "Feeds with real gravity." },
  { name: "E-Commerce", icon: ShoppingBag, blurb: "Storefronts built to sell." },
  { name: "Games", icon: Swords, blurb: "Worlds worth playing." },
];

export const STATUS_META: Record<
  ProductStatus,
  { label: string; chip: string }
> = {
  live: {
    label: "Live",
    chip: "bg-vortex-teal text-white",
  },
  development: {
    label: "In development",
    chip: "bg-cyan-500/15 text-cyan-700 border border-cyan-500/30",
  },
  planned: {
    label: "Planned",
    chip: "bg-emerald-500/12 text-emerald-700 border border-emerald-500/30",
  },
  concept: {
    label: "Concept",
    chip: "bg-vortex-ink/[0.05] text-vortex-ink/60 border border-vortex-ink/10",
  },
};

export const STATUS_ORDER: Record<ProductStatus, number> = {
  live: 0,
  development: 1,
  planned: 2,
  concept: 3,
};

export const PRODUCTS: Product[] = [
  {
    id: "haypbooks",
    name: "Haypbooks",
    tagline: "The accounting system that speaks human",
    description:
      "A complete accounting suite — ledgers, invoicing, expenses and financial reports — built to make bookkeeping feel less like paperwork and more like second nature.",
    category: "Accounting",
    status: "live",
    releasedAt: "2025-12-10",
    icon: BookOpenCheck,
    hue: ["#0d9488", "#10b981"],
    tags: ["Ledgers", "Invoicing", "Reports"],
  },
  {
    id: "qyra",
    name: "Qyra",
    tagline: "Your data, auto-posted to QuickBooks",
    description:
      "An automation pipeline that takes your transaction data and posts it straight into QuickBooks — mapped, validated and reconciled without a single manual entry.",
    category: "Automation",
    status: "live",
    releasedAt: "2026-02-18",
    icon: Zap,
    hue: ["#06b6d4", "#0d9488"],
    tags: ["QuickBooks", "Auto-posting", "Sync"],
  },
  {
    id: "zypra",
    name: "Zypra",
    tagline: "The same magic, wired to Xero",
    description:
      "The Vortex automation engine, retooled for Xero — auto-posting, account mapping and sync pipelines for teams that run their books on Xero. In active development.",
    category: "Automation",
    status: "development",
    releasedAt: "2026-06-15",
    eta: "Late 2026",
    icon: Link2,
    hue: ["#10b981", "#06b6d4"],
    tags: ["Xero", "Auto-posting", "Pipeline"],
  },
  {
    id: "cirqa",
    name: "Cirqa",
    tagline: "A social network, built circle-first",
    description:
      "The studio's take on social — feeds, communities and messaging reimagined around your real-world circles. Planned as Vortex's next major platform.",
    category: "Social",
    status: "planned",
    releasedAt: "2026-07-20",
    eta: "2027",
    icon: Globe,
    hue: ["#1e3a5f", "#06b6d4"],
    tags: ["Feeds", "Communities", "Messaging"],
  },
  {
    id: "lumora",
    name: "Lumora",
    tagline: "A marketplace with a glow",
    description:
      "An e-commerce platform in the spirit of the great marketplaces — stores, discovery and checkout tuned for conversion. On the roadmap after Cirqa.",
    category: "E-Commerce",
    status: "planned",
    releasedAt: "2026-07-20",
    eta: "2027",
    icon: ShoppingBag,
    hue: ["#10b981", "#1e3a5f"],
    tags: ["Marketplace", "Stores", "Checkout"],
  },
  {
    id: "project-arena",
    name: "Project: Arena",
    tagline: "A MOBA, forged in the vortex",
    description:
      "A multiplayer online battle arena built on fast, readable combat and true team play. First playable targeted after the automation wave.",
    category: "Games",
    status: "concept",
    releasedAt: "2026-08-10",
    eta: "Concept",
    icon: Swords,
    hue: ["#1e3a5f", "#0d9488"],
    tags: ["MOBA", "Multiplayer"],
  },
  {
    id: "project-bastion",
    name: "Project: Bastion",
    tagline: "Build. Defend. Conquer.",
    description:
      "A base-building strategy game in the Clash tradition — raise a stronghold, raid rivals and climb the ladder, one raid at a time.",
    category: "Games",
    status: "concept",
    releasedAt: "2026-08-10",
    eta: "Concept",
    icon: Castle,
    hue: ["#0f766e", "#1e3a5f"],
    tags: ["Strategy", "Base-building"],
  },
  {
    id: "project-overdrive",
    name: "Project: Overdrive",
    tagline: "An open world you can feel",
    description:
      "An ambitious open-world action experience — cities, vehicles and the freedom to carve your own path. Early concept; the long game.",
    category: "Games",
    status: "concept",
    releasedAt: "2026-08-10",
    eta: "Concept",
    icon: Car,
    hue: ["#06b6d4", "#1e3a5f"],
    tags: ["Open World", "Action"],
  },
  {
    id: "project-emberfall",
    name: "Project: Emberfall",
    tagline: "An RPG worth the journey",
    description:
      "A story-driven role-playing game with a world that remembers your choices. Early concept — being shaped slowly, deliberately.",
    category: "Games",
    status: "concept",
    releasedAt: "2026-08-10",
    eta: "Concept",
    icon: Compass,
    hue: ["#10b981", "#06b6d4"],
    tags: ["RPG", "Story-driven"],
  },
];

export const LIVE_COUNT = PRODUCTS.filter((p) => p.status === "live").length;
export const PIPELINE_COUNT = PRODUCTS.length - LIVE_COUNT;

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
    body: "Day one: Vortex opens its doors with a single mission — ship complete, ready-to-use software with no templates and no shortcuts.",
  },
  {
    id: "cl-02",
    kind: "launch",
    title: "Haypbooks Ships",
    date: "2025-12-10",
    body: "The studio's first product goes live — a full accounting suite with ledgers, invoicing, expenses and reports. Bookkeeping, finally fluent.",
    version: "v1.0",
  },
  {
    id: "cl-03",
    kind: "launch",
    title: "Qyra Goes Live",
    date: "2026-02-18",
    body: "Auto-posting to QuickBooks arrives. Transaction data flows in, gets mapped and validated, and lands in the books with zero manual entry.",
    version: "v1.0",
  },
  {
    id: "cl-04",
    kind: "update",
    title: "Qyra Learns Faster Sync",
    date: "2026-04-02",
    body: "Reconciliation speed triples and account mapping gets smarter after two months of real-world feedback from the first users.",
    version: "v1.2",
  },
  {
    id: "cl-05",
    kind: "announcement",
    title: "Zypra Announced",
    date: "2026-06-15",
    body: "The automation engine gets retooled for Xero. Zypra — auto-posting for Xero books — enters active development.",
  },
  {
    id: "cl-06",
    kind: "announcement",
    title: "Cirqa & Lumora Revealed",
    date: "2026-07-20",
    body: "The roadmap grows: Cirqa, a social network built circle-first, and Lumora, a marketplace with a glow — both slated after the automation wave.",
  },
  {
    id: "cl-07",
    kind: "announcement",
    title: "Vortex Games Division",
    date: "2026-08-10",
    body: "Four game concepts enter the pipeline: a MOBA, a base-building strategy, an open-world action title and a story-driven RPG.",
  },
  {
    id: "cl-08",
    kind: "milestone",
    title: "2 Live, 7 Spinning",
    date: "2026-08-25",
    body: "Haypbooks and Qyra serve users daily while seven more products spin up across five categories. The vortex is just getting started.",
  },
];

/* derived from the data — counts update automatically as the studio grows */
export const STATS = [
  { value: LIVE_COUNT, suffix: "", label: "Live products" },
  { value: PIPELINE_COUNT, suffix: "", label: "In the pipeline" },
  { value: CATEGORIES.length, suffix: "", label: "Categories" },
  { value: null, suffix: "∞", label: "Growing" },
] as const;
