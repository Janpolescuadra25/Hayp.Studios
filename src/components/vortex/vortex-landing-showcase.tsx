"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, ArrowUpRight, Zap, MousePointerClick, Rocket } from "lucide-react";
import { PRODUCTS, type Product } from "@/lib/vortex-data";
import { FadeUp, SectionTag, MagneticWrap } from "./vortex-landing-hero";
import { VortexMark } from "./vortex-logo";
import { cn } from "@/lib/utils";

/* ================================================================== */
/* FEATURED TEASER — 3D tilt cards (full catalog lives in the Hub)     */
/* ================================================================== */

function TiltCard({ product, index }: { product: Product; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [8, -8]), { stiffness: 220, damping: 22 });
  const ry = useSpring(useTransform(mx, [0, 1], [-10, 10]), { stiffness: 220, damping: 22 });
  const [h1, h2] = product.hue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.8, delay: index * 0.14, ease: [0.22, 0.8, 0.28, 1] }}
      style={{ perspective: 1000 }}
    >
      <motion.div
        ref={ref}
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        onMouseMove={(e) => {
          const r = ref.current?.getBoundingClientRect();
          if (!r) return;
          mx.set((e.clientX - r.left) / r.width);
          my.set((e.clientY - r.top) / r.height);
        }}
        onMouseLeave={() => {
          mx.set(0.5);
          my.set(0.5);
        }}
        className="group relative overflow-hidden rounded-[1.8rem] glass-strong vortex-glow transition-shadow duration-500 hover:shadow-[0_30px_70px_-22px_rgba(13,148,136,0.5)]"
      >
        {/* CSS-art thumbnail */}
        <div className="relative h-44 overflow-hidden sm:h-48" style={{ background: `linear-gradient(150deg, ${h1}17, ${h2}26)` }}>
          <div
            className="absolute -right-12 -top-12 h-44 w-44 rounded-full opacity-70 transition-transform duration-700 group-hover:rotate-90 group-hover:scale-125"
            style={{ background: `conic-gradient(from 0deg, ${h1}33, ${h2}22, ${h1}44, ${h2}18, ${h1}33)` }}
          />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />
          <div className="absolute left-5 top-5 flex gap-2" style={{ transform: "translateZ(35px)" }}>
            {product.tags.slice(0, 3).map((t) => (
              <span key={t} className="rounded-full bg-white/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-vortex-navy/70 backdrop-blur-sm">
                {t}
              </span>
            ))}
          </div>
          <div
            className="absolute bottom-4 right-5 grid h-12 w-12 place-items-center rounded-2xl text-white shadow-lg transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110"
            style={{ background: `linear-gradient(135deg, ${h1}, ${h2})`, transform: "translateZ(50px)" }}
          >
            <product.icon className="h-5.5 w-5.5" />
          </div>
          {/* mini sparkline deco */}
          <svg className="absolute bottom-4 left-5 opacity-50" width="86" height="26" viewBox="0 0 86 26" fill="none">
            <path d="M2 20 L14 14 L26 17 L38 8 L50 12 L62 5 L74 9 L84 3" stroke={h1} strokeWidth="2" strokeLinecap="round" />
            <circle cx="84" cy="3" r="2.5" fill={h2} />
          </svg>
        </div>

        <div className="p-6" style={{ transform: "translateZ(22px)" }}>
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-xl font-bold text-vortex-ink">{product.name}</h3>
            <span className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: h1, background: `${h1}14` }}>
              {product.category}
            </span>
          </div>
          <p className="mt-1 font-display text-sm font-medium" style={{ color: h2 }}>{product.tagline}</p>
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-vortex-navy/70">{product.description}</p>
          <div className="mt-5 flex items-center gap-2 text-[13px] font-semibold text-vortex-teal">
            <span className="transition-transform duration-300 group-hover:translate-x-1">In the Hub</span>
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function FeaturedTeaser({ onEnterHub }: { onEnterHub: () => void }) {
  const featured = PRODUCTS.filter((p) => p.featured).slice(0, 3);
  return (
    <section className="relative mx-auto max-w-7xl px-6 py-24 sm:py-28">
      <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
        <div>
          <SectionTag index="05" label="A Glimpse Inside" />
          <h2 className="mt-6 font-display text-4xl font-bold tracking-tight text-vortex-ink sm:text-5xl">
            Featured from <span className="text-vortex-gradient">the Vortex.</span>
          </h2>
          <p className="mt-4 max-w-lg text-vortex-navy/70">
            Three drops from the catalog. The full showcase — searchable, filterable, sortable — lives in the Vortex Hub.
          </p>
        </div>
        <FadeUp delay={0.15}>
          <button
            onClick={onEnterHub}
            className="group inline-flex items-center gap-2.5 rounded-full border border-vortex-teal/30 bg-white/60 px-6 py-3 font-display text-sm font-semibold text-vortex-teal backdrop-blur transition-all duration-300 hover:border-vortex-teal/60 hover:bg-white focus-visible:outline-2 focus-visible:outline-vortex-teal"
          >
            Open the full Hub
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </FadeUp>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((p, i) => (
          <TiltCard key={p.id} product={p} index={i} />
        ))}
      </div>
    </section>
  );
}

/* ================================================================== */
/* MOTTO — letter flip reveal                                          */
/* ================================================================== */

function FlipWords({ words }: { words: { text: string; gradient?: boolean }[] }) {
  return (
    <span className="inline-flex flex-wrap justify-center gap-x-[0.32em] gap-y-2">
      {words.map((w, wi) => (
        <span key={wi} className="inline-flex overflow-visible">
          {w.text.split("").map((ch, ci) => (
            <motion.span
              key={ci}
              className={cn(
                "inline-block font-display font-bold leading-[0.95] tracking-tight",
                w.gradient ? "text-vortex-gradient" : "text-vortex-ink"
              )}
              initial={{ opacity: 0, rotateX: 90, y: "0.5em" }}
              whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
              viewport={{ once: true, amount: 0.8 }}
              transition={{
                duration: 0.65,
                delay: wi * 0.14 + ci * 0.035,
                ease: [0.2, 0.8, 0.25, 1],
              }}
            >
              {ch}
            </motion.span>
          ))}
        </span>
      ))}
    </span>
  );
}

export function MottoSection() {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <section ref={ref} className="relative overflow-hidden py-32 sm:py-40">
      {/* rotating swirl halo */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 -z-[5] h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2"
        initial={{ opacity: 0, scale: 0.6, rotate: -40 }}
        whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 1.6, ease: [0.2, 0.8, 0.25, 1] }}
      >
        <div className="absolute inset-0 rounded-full border-[1.5px] border-dashed border-vortex-teal/25" style={{ animation: "vortex-rotate-cw 40s linear infinite" }} />
        <div className="absolute inset-[12%] rounded-full border border-vortex-emerald/20" style={{ animation: "vortex-rotate-ccw 30s linear infinite" }} />
        <div className="absolute inset-[26%] rounded-full border-[1.5px] border-dashed border-vortex-cyan/25" style={{ animation: "vortex-rotate-cw 22s linear infinite" }} />
        <div className="absolute inset-[38%] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.1),transparent_70%)]" />
      </motion.div>

      <div className="relative mx-auto max-w-5xl px-6 text-center" style={{ perspective: 900 }}>
        <FadeUp>
          <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-vortex-teal">the vortex motto</p>
        </FadeUp>
        <h2 className="mt-8 text-[13vw] leading-[1.02] sm:text-7xl lg:text-[5.6rem]">
          <FlipWords words={[{ text: "Less" }, { text: "Clicks." }, { text: "More" }, { text: "Results.", gradient: true }]} />
        </h2>
        <FadeUp delay={0.5} className="mx-auto mt-8 max-w-md">
          <p className="text-lg leading-relaxed text-vortex-navy/70">
            Everything at Vortex is engineered to remove friction — from browsing the catalog to shipping your product.
          </p>
        </FadeUp>
      </div>
    </section>
  );
}

/* ================================================================== */
/* FINAL CTA — portal panel                                            */
/* ================================================================== */

export function FinalCta({ onEnterHub }: { onEnterHub: () => void }) {
  return (
    <section className="relative mx-auto max-w-7xl px-6 pb-28 pt-8 sm:pb-32">
      <motion.div
        initial={{ opacity: 0, y: 70, scale: 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.9, ease: [0.2, 0.8, 0.25, 1] }}
        className="vortex-conic-border relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-teal-700 via-teal-600 to-cyan-600 px-6 py-20 text-center shadow-[0_40px_100px_-30px_rgba(13,148,136,0.6)] sm:px-12"
      >
        {/* decorative rings */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full border-[14px] border-white/10" />
        <div className="pointer-events-none absolute -bottom-28 -right-20 h-80 w-80 rounded-full border-[18px] border-white/10" />
        <div className="pointer-events-none absolute -bottom-16 -right-8 h-48 w-48 rounded-full border-dashed border-[8px] border-white/15" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.22),transparent_55%)]" />

        <div className="relative flex flex-col items-center">
          <motion.div
            initial={{ scale: 0, rotate: -80 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.25, type: "spring", bounce: 0.4 }}
          >
            <div className="rounded-full bg-white/12 p-5 backdrop-blur-sm">
              <VortexMark size={88} animated idPrefix="cta" />
            </div>
          </motion.div>

          <h2 className="mt-8 max-w-2xl font-display text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl">
            Step into the Vortex.
          </h2>
          <p className="mt-4 max-w-xl text-balance text-base leading-relaxed text-teal-50/90 sm:text-lg">
            Twelve+ products across six categories — every one designed, built, and shipped by a solo founder. Your next website is already waiting.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <MagneticWrap>
              <button
                onClick={onEnterHub}
                className="group inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 font-display text-sm font-bold tracking-wide text-teal-700 shadow-[0_20px_50px_-14px_rgba(0,0,0,0.4)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_26px_60px_-12px_rgba(0,0,0,0.45)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                <Rocket className="h-4 w-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                Enter the Vortex Hub
              </button>
            </MagneticWrap>
            <div className="flex items-center gap-2 text-sm font-medium text-teal-50/80">
              <Zap className="h-4 w-4" />
              Instant access — nothing to install
            </div>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-teal-50/70">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest">
              <MousePointerClick className="h-3.5 w-3.5" /> 3 steps to launch
            </span>
            <span className="hidden h-1 w-1 rounded-full bg-teal-200/50 sm:inline-block" />
            <span className="text-xs font-semibold uppercase tracking-widest">Solo-built since day one</span>
            <span className="hidden h-1 w-1 rounded-full bg-teal-200/50 sm:inline-block" />
            <span className="text-xs font-semibold uppercase tracking-widest">Catalog always growing</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
