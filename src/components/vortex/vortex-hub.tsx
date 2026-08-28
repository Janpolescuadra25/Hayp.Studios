"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  ArrowUpRight,
  PackageSearch,
  Sparkles,
  Clock,
  ArrowDownAZ,
  LayoutGrid,
  Rocket,
} from "lucide-react";
import {
  CATEGORIES,
  PRODUCTS,
  STATUS_META,
  STATUS_ORDER,
  LIVE_COUNT,
  PIPELINE_COUNT,
  type Category,
  type Product,
} from "@/lib/vortex-data";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type SortKey = "status" | "newest" | "az";
type Filter = Category | "All";

/* ------------------------------------------------------------------ */
/* Product card                                                        */
/* ------------------------------------------------------------------ */

function HubCard({ product, index }: { product: Product; index: number }) {
  const { toast } = useToast();
  const [h1, h2] = product.hue;
  const isLive = product.status === "live";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.25 } }}
      transition={{ duration: 0.6, delay: Math.min(index * 0.06, 0.4), ease: [0.22, 0.8, 0.28, 1] }}
      className="group relative flex flex-col overflow-hidden rounded-[1.6rem] border hairline bg-white/85 backdrop-blur-sm transition-shadow duration-500 hover:shadow-editorial-lg"
    >
      {/* thumbnail */}
      <div className="relative h-40 overflow-hidden sm:h-44" style={{ background: `linear-gradient(150deg, ${h1}12, ${h2}1f)` }}>
        {/* quiet thumb art — drifting rings */}
        <div
          className="absolute -right-12 -top-16 h-44 w-44 rounded-full transition-transform duration-[1200ms] ease-out group-hover:rotate-45 group-hover:scale-110"
          style={{
            borderColor: `${h2}30`,
            border: `1px solid ${h2}2e`,
            background: `radial-gradient(closest-side, ${h2}14, transparent 70%)`,
          }}
        />
        <div
          className="absolute -bottom-20 -left-12 h-40 w-40 rounded-full opacity-60 transition-transform duration-[1200ms] ease-out group-hover:-rotate-30 group-hover:scale-105"
          style={{ border: `1px solid ${h1}26` }}
        />

        {/* category label */}
        <span className="label-editorial absolute left-5 top-5 text-[10px] text-vortex-ink/45">
          {product.category}
        </span>

        {/* status chip */}
        <span
          className={`label-editorial absolute right-5 top-5 rounded-full px-3 py-1.5 text-[9px] ${STATUS_META[product.status].chip}`}
        >
          {STATUS_META[product.status].label}
        </span>

        {/* icon */}
        <div
          className="absolute bottom-5 right-6 grid h-12 w-12 place-items-center rounded-full bg-white/80 text-vortex-ink shadow-editorial backdrop-blur transition-all duration-500 group-hover:bg-vortex-ink group-hover:text-white"
        >
          <product.icon className="h-5 w-5" strokeWidth={1.6} />
        </div>
      </div>

      {/* body */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-bold leading-tight tracking-tight text-vortex-ink transition-colors group-hover:text-vortex-teal">
              {product.name}
            </h3>
            <p className="mt-1 font-serif-accent text-base italic leading-snug text-vortex-navy/60">
              {product.tagline}
            </p>
          </div>
        </div>

        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-vortex-navy/70">{product.description}</p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {product.tags.map((t) => (
            <span key={t} className="rounded-full border border-vortex-teal/15 bg-vortex-foam px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-vortex-teal/90">
              {t}
            </span>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between border-t hairline pt-4">
          <span className="label-editorial text-[10px] text-vortex-ink/45">
            {product.eta ??
              new Date(product.releasedAt).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })}
          </span>
          <button
            onClick={() =>
              toast({
                title: isLive ? `${product.name} — demo link` : `${product.name} — in the pipeline`,
                description: isLive
                  ? "This hub is a live preview — public product links arrive at launch."
                  : `Target: ${product.eta}. Follow the changelog for launch news.`,
              })
            }
            className="inline-flex items-center gap-1.5 font-display text-[13px] font-semibold text-vortex-teal transition-colors hover:text-vortex-deep focus-visible:outline-2 focus-visible:outline-vortex-teal"
          >
            {isLive ? "Visit product" : "Follow progress"}
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}

/* ------------------------------------------------------------------ */
/* The Hub page                                                        */
/* ------------------------------------------------------------------ */

export function VortexHub({ onGoHome }: { onGoHome: () => void }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [sort, setSort] = useState<SortKey>("status");

  const results = useMemo(() => {
    let list = [...PRODUCTS];
    if (filter !== "All") list = list.filter((p) => p.category === filter);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    switch (sort) {
      case "newest":
        list.sort((a, b) => +new Date(b.releasedAt) - +new Date(a.releasedAt));
        break;
      case "az":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        list.sort(
          (a, b) =>
            STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
            +new Date(b.releasedAt) - +new Date(a.releasedAt)
        );
    }
    return list;
  }, [query, filter, sort]);

  return (
    <main className="relative mx-auto max-w-7xl px-6 pb-28 pt-32 sm:pt-36">
      {/* header */}
      <div className="max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 0.8, 0.28, 1] }}
        >
          <div className="inline-flex items-center gap-2.5 rounded-full border hairline bg-white/60 px-4 py-1.5 backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-500" />
            </span>
            <span className="label-editorial text-vortex-ink/80">
              The full pipeline
            </span>
          </div>
          <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight text-vortex-ink sm:text-6xl">
            The <span className="text-vortex-gradient">Vortex Hub</span>
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-vortex-navy/70">
            {LIVE_COUNT} products live, {PIPELINE_COUNT} more spinning — accounting,
            automation, social, e-commerce and games. Every one of them built by{" "}
            <span className="font-medium text-vortex-ink">Vortex Studios</span>.
          </p>
        </motion.div>

        <motion.div
          className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-vortex-navy/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.7 }}
        >
          <span className="inline-flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 text-vortex-teal" /> {PRODUCTS.length} products
          </span>
          <span className="inline-flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-vortex-teal" /> {LIVE_COUNT} live
          </span>
          <span className="inline-flex items-center gap-2">
            <Rocket className="h-4 w-4 text-vortex-teal" /> {PIPELINE_COUNT} in the pipeline
          </span>
        </motion.div>
      </div>

      {/* controls */}
      <motion.div
        className="sticky top-[76px] z-30 mt-10 rounded-[1.6rem] border hairline bg-white/80 p-3 shadow-editorial backdrop-blur-md sm:p-4"
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.7, ease: [0.22, 0.8, 0.28, 1] }}
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-vortex-teal/70" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, tags, categories…"
              className="h-12 rounded-2xl border-vortex-teal/20 bg-white/70 pl-11 text-[15px] shadow-none placeholder:text-vortex-navy/40 focus-visible:ring-vortex-teal/40"
              aria-label="Search products"
            />
          </div>
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger
              className="h-12 w-full rounded-2xl border-vortex-teal/20 bg-white/70 font-display text-sm font-medium text-vortex-navy shadow-none focus-visible:ring-vortex-teal/40 lg:w-[190px]"
              aria-label="Sort products"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-vortex-teal/20">
              <SelectItem value="status" className="rounded-xl gap-2">
                <Sparkles className="h-3.5 w-3.5 text-vortex-teal" /> Live first
              </SelectItem>
              <SelectItem value="newest" className="rounded-xl gap-2">
                <Clock className="h-3.5 w-3.5 text-vortex-teal" /> Newest
              </SelectItem>
              <SelectItem value="az" className="rounded-xl gap-2">
                <ArrowDownAZ className="h-3.5 w-3.5 text-vortex-teal" /> A → Z
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* category pills */}
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
          {(["All", ...CATEGORIES.map((c) => c.name)] as Filter[]).map((cat) => {
            const active = filter === cat;
            const count = cat === "All" ? PRODUCTS.length : PRODUCTS.filter((p) => p.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={cn(
                  "relative shrink-0 rounded-full px-4 py-2 font-display text-[13px] font-semibold transition-all duration-300 focus-visible:outline-2 focus-visible:outline-vortex-teal",
                  active
                    ? "bg-vortex-ink text-white"
                    : "text-vortex-navy/65 hover:bg-vortex-teal/10 hover:text-vortex-teal"
                )}
                aria-pressed={active}
              >
                <span className="relative flex items-center gap-1.5">
                  {cat}
                  <span className={cn("font-mono text-[10px]", active ? "text-teal-200/90" : "text-vortex-navy/40")}>
                    {count}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* result count */}
      <div className="mt-8 flex items-center justify-between">
        <p className="label-editorial text-[10px] text-vortex-ink/50" aria-live="polite">
          {results.length} {results.length === 1 ? "product" : "products"} · {filter === "All" ? "all categories" : filter}
        </p>
        {(query || filter !== "All") && (
          <button
            onClick={() => {
              setQuery("");
              setFilter("All");
            }}
            className="rounded-full border border-vortex-teal/25 px-4 py-1.5 text-xs font-semibold text-vortex-teal transition-colors hover:bg-vortex-teal/10 focus-visible:outline-2 focus-visible:outline-vortex-teal"
          >
            Reset filters
          </button>
        )}
      </div>

      {/* grid */}
      <motion.div layout className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {results.map((p, i) => (
            <HubCard key={p.id} product={p} index={i} />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* empty state */}
      {results.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 flex flex-col items-center gap-4 rounded-[2rem] border-2 border-dashed border-vortex-teal/25 bg-white/40 px-8 py-20 text-center"
        >
          <div className="grid h-16 w-16 place-items-center rounded-3xl bg-vortex-foam">
            <PackageSearch className="h-7 w-7 text-vortex-teal" />
          </div>
          <h3 className="font-display text-xl font-bold text-vortex-ink">Nothing spun into view</h3>
          <p className="max-w-sm text-sm leading-relaxed text-vortex-navy/65">
            No products match <span className="font-semibold text-vortex-teal">“{query}”</span>
            {filter !== "All" && <> in <span className="font-semibold text-vortex-teal">{filter}</span></>}. Try a different term or category.
          </p>
          <button
            onClick={() => {
              setQuery("");
              setFilter("All");
            }}
            className="mt-2 rounded-full bg-vortex-teal px-6 py-3 font-display text-sm font-semibold text-white transition-colors duration-500 hover:bg-vortex-deep focus-visible:outline-2 focus-visible:outline-vortex-teal"
          >
            Clear search
          </button>
        </motion.div>
      )}

      {/* hub footer note */}
      <div className="mt-20 text-center">
        <p className="font-display text-lg font-semibold text-vortex-navy/70">
          Can&apos;t find what you need?
        </p>
        <p className="mt-2 text-sm text-vortex-navy/55">
          The pipeline grows every month. Head back to{" "}
          <button onClick={onGoHome} className="font-semibold text-vortex-teal underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-vortex-teal">
            the story
          </button>{" "}
          to see where the momentum comes from.
        </p>
      </div>
    </main>
  );
}
