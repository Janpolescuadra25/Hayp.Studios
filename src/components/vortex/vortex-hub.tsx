"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, ArrowUpRight, PackageSearch, Sparkles, Clock, ArrowDownAZ, LayoutGrid } from "lucide-react";
import { CATEGORIES, PRODUCTS, type Category, type Product } from "@/lib/vortex-data";
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

type SortKey = "featured" | "newest" | "az";
type Filter = Category | "All";

/* ------------------------------------------------------------------ */
/* Product card                                                        */
/* ------------------------------------------------------------------ */

function HubCard({ product, index }: { product: Product; index: number }) {
  const { toast } = useToast();
  const [h1, h2] = product.hue;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.25 } }}
      transition={{ duration: 0.6, delay: Math.min(index * 0.06, 0.4), ease: [0.22, 0.8, 0.28, 1] }}
      className="group relative flex flex-col overflow-hidden rounded-[1.6rem] glass-strong transition-shadow duration-500 hover:shadow-[0_28px_70px_-24px_rgba(13,148,136,0.5)]"
    >
      {/* thumbnail */}
      <div className="relative h-40 overflow-hidden sm:h-44" style={{ background: `linear-gradient(150deg, ${h1}1a, ${h2}2e)` }}>
        {/* vortex thumb art */}
        <div
          className="absolute -right-10 -top-14 h-44 w-44 rounded-full transition-transform duration-700 group-hover:rotate-90 group-hover:scale-125"
          style={{ background: `conic-gradient(from 0deg, ${h1}40, ${h2}2a, ${h1}55, ${h2}20, ${h1}40)` }}
        />
        <div className="absolute -bottom-8 -left-8 h-28 w-28 rounded-full border-[7px] border-white/25" />
        <div className="absolute left-4 top-4">
          <span
            className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm"
            style={{ background: `linear-gradient(90deg, ${h1}, ${h2})` }}
          >
            {product.category}
          </span>
        </div>
        {product.featured && (
          <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/75 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 backdrop-blur-sm">
            <Sparkles className="h-3 w-3" /> Featured
          </span>
        )}
        <div
          className="absolute bottom-4 right-4 grid h-12 w-12 place-items-center rounded-2xl text-white shadow-lg transition-all duration-500 group-hover:-rotate-12 group-hover:scale-110"
          style={{ background: `linear-gradient(135deg, ${h1}, ${h2})` }}
        >
          <product.icon className="h-5.5 w-5.5" />
        </div>
      </div>

      {/* body */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-bold leading-tight text-vortex-ink transition-colors group-hover:text-vortex-teal">
              {product.name}
            </h3>
            <p className="mt-0.5 font-display text-[13px] font-medium" style={{ color: h2 }}>{product.tagline}</p>
          </div>
          <span className="mt-1 shrink-0 font-mono text-[10px] text-vortex-navy/45">
            {new Date(product.releasedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
          </span>
        </div>

        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-vortex-navy/70">{product.description}</p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {product.tags.map((t) => (
            <span key={t} className="rounded-full border border-vortex-teal/15 bg-vortex-foam px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-vortex-teal/90">
              {t}
            </span>
          ))}
        </div>

        <button
          onClick={() =>
            toast({
              title: `${product.name} — demo link`,
              description: "This catalog is a live preview. External product links open from the public hub.",
            })
          }
          className="mt-5 inline-flex items-center justify-between gap-2 rounded-xl border border-vortex-teal/20 bg-white/50 px-4 py-2.5 font-display text-[13px] font-semibold text-vortex-teal transition-all duration-300 hover:border-vortex-teal/50 hover:bg-white focus-visible:outline-2 focus-visible:outline-vortex-teal"
        >
          Visit product
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>
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
  const [sort, setSort] = useState<SortKey>("featured");

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
        list.sort((a, b) => Number(b.featured) - Number(a.featured) || +new Date(b.releasedAt) - +new Date(a.releasedAt));
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
          <div className="inline-flex items-center gap-2.5 rounded-full glass px-4 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-500" />
            </span>
            <span className="font-display text-[11px] font-medium uppercase tracking-[0.22em] text-vortex-navy/80">
              The full catalog
            </span>
          </div>
          <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight text-vortex-ink sm:text-6xl">
            The <span className="text-vortex-gradient">Vortex Hub</span>
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-vortex-navy/70">
            Every product, one place. Search, filter and sort the complete founder-built catalog —
            ready to deploy the moment you find your match.
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
            <Sparkles className="h-4 w-4 text-vortex-teal" /> {PRODUCTS.filter((p) => p.featured).length} featured
          </span>
          <span className="inline-flex items-center gap-2">
            <Clock className="h-4 w-4 text-vortex-teal" /> updated weekly
          </span>
        </motion.div>
      </div>

      {/* controls */}
      <motion.div
        className="sticky top-[72px] z-30 mt-10 rounded-[1.6rem] glass-strong p-3 shadow-[0_16px_50px_-24px_rgba(13,148,136,0.45)] sm:p-4"
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
              <SelectItem value="featured" className="rounded-xl gap-2">
                <Sparkles className="h-3.5 w-3.5 text-vortex-teal" /> Featured first
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
                    ? "text-white"
                    : "text-vortex-navy/65 hover:bg-vortex-teal/10 hover:text-vortex-teal"
                )}
                aria-pressed={active}
              >
                {active && (
                  <motion.span
                    layoutId="hub-pill"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-600 to-cyan-500 shadow-[0_8px_20px_-6px_rgba(13,148,136,0.5)]"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative flex items-center gap-1.5">
                  {cat}
                  <span className={cn("font-mono text-[10px]", active ? "text-teal-100/90" : "text-vortex-navy/40")}>
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
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-vortex-navy/50" aria-live="polite">
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
            className="mt-2 rounded-full bg-gradient-to-r from-teal-600 to-cyan-500 px-6 py-3 font-display text-sm font-semibold text-white shadow-lg shadow-teal-500/25 transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-vortex-teal"
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
          The catalog grows every month. Head back to{" "}
          <button onClick={onGoHome} className="font-semibold text-vortex-teal underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-vortex-teal">
            the story
          </button>{" "}
          to see what&apos;s coming next.
        </p>
      </div>
    </main>
  );
}
