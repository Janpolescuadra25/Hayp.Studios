"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { VortexMark } from "./vortex-logo";
import { EASE, FadeUp, Magnetic } from "./vortex-shared";
import { CATEGORIES, LIVE_COUNT, PIPELINE_COUNT } from "@/lib/vortex-data";

/* plays once per browser session */
let introPlayed = false;

/* ------------------------------------------------------------------ */
/* Intro — a quiet opening title: the mark, the name, the curtain lift */
/* ------------------------------------------------------------------ */
function IntroCurtain({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1750);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      className="fixed inset-0 z-[70] grid place-items-center bg-[#fbfdfd]"
      initial={{ y: 0 }}
      exit={{ y: "-102%" }}
      transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
      style={{ borderRadius: "0 0 46% 46% / 0 0 5% 5%" }}
      aria-hidden="true"
    >
      <div className="flex flex-col items-center gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.82 }}
          animate={{ opacity: [0, 1, 1, 0], scale: [0.82, 1, 1, 0.94] }}
          transition={{ duration: 1.5, times: [0, 0.3, 0.75, 1], ease: "easeInOut" }}
        >
          <VortexMark size={92} animated idPrefix="intro" showOrbit={false} />
        </motion.div>
        <motion.div
          className="flex items-center gap-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: [0, 1, 1, 0], y: [8, 0, 0, -6] }}
          transition={{ duration: 1.5, delay: 0.15, times: [0, 0.32, 0.78, 1], ease: "easeInOut" }}
        >
          <span className="h-px w-10 bg-vortex-ink/20" />
          <span className="label-editorial text-vortex-ink/70">Vortex . studio</span>
          <span className="h-px w-10 bg-vortex-ink/20" />
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Rotating badge — circular text orbiting the mark (fashion-brand     */
/* flourish, top-right of the hero)                                    */
/* ------------------------------------------------------------------ */
function OrbitBadge({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <div className="relative h-36 w-36">
        <svg viewBox="0 0 160 160" className="animate-spin-slow absolute inset-0 h-full w-full">
          <defs>
            <path
              id="badge-circle"
              d="M 80,80 m -62,0 a 62,62 0 1,1 124,0 a 62,62 0 1,1 -124,0"
              fill="none"
            />
          </defs>
          <text className="fill-vortex-ink/55 font-mono text-[10.5px] uppercase" style={{ letterSpacing: "0.34em" }}>
            <textPath href="#badge-circle">
              precision-built · ready-made · vortex.studio ·
            </textPath>
          </text>
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <VortexMark size={58} animated idPrefix="badge" showOrbit={false} />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero — the opening shot                                             */
/* ------------------------------------------------------------------ */
export function VortexHero({
  onEnterHub,
  onWhatsNew,
}: {
  onEnterHub: () => void;
  onWhatsNew: () => void;
}) {
  const [showIntro, setShowIntro] = useState(() => !introPlayed);

  useEffect(() => {
    if (showIntro) introPlayed = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShowIntro(false);
    }
  }, [showIntro]);

  const closeIntro = () => setShowIntro(false);
  const introDelay = showIntro ? 1.35 : 0.15;

  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -110]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.62], [1, 0]);
  const badgeY = useTransform(scrollYProgress, [0, 1], [0, 60]);

  const line = (inner: React.ReactNode, delay: number) => (
    <span className="block overflow-hidden pb-[0.09em] -mb-[0.09em]">
      <motion.span
        className="block will-change-transform"
        initial={{ y: "112%" }}
        animate={{ y: "0%" }}
        transition={{ duration: 1.15, delay, ease: EASE }}
      >
        {inner}
      </motion.span>
    </span>
  );

  return (
    <section ref={ref} className="relative flex min-h-[100svh] flex-col">
      <AnimatePresence>
        {showIntro && <IntroCurtain onDone={closeIntro} />}
      </AnimatePresence>

      {/* headline block */}
      <motion.div
        className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-6 pb-24 pt-36 sm:pt-40"
        style={{ y: contentY, opacity: contentOpacity }}
      >
        {/* overline */}
        <motion.div
          className="mb-8 flex items-center gap-4 sm:mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: introDelay }}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-vortex-teal opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-vortex-teal" />
          </span>
          <span className="label-editorial text-vortex-ink/60">
            A digital product studio — est. 2025
          </span>
        </motion.div>

        <h1 className="font-display text-[clamp(2.9rem,8.6vw,7.6rem)] font-bold leading-[0.98] tracking-[-0.035em] text-vortex-ink">
          {line("Ready-made", introDelay + 0.05)}
          {line("software,", introDelay + 0.17)}
          {line(
            <>
              built to{" "}
              <span className="font-serif-accent italic font-normal text-vortex-gradient tracking-[-0.01em]">
                move.
              </span>
            </>,
            introDelay + 0.29
          )}
        </h1>

        {/* copy + ctas */}
        <div className="mt-10 flex flex-col gap-8 sm:mt-12 md:flex-row md:items-end md:justify-between">
          <motion.p
            className="max-w-md text-[15px] leading-relaxed text-vortex-navy/70 sm:text-base"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: introDelay + 0.5, ease: EASE }}
          >
            Vortex.studio is an independent digital studio built on momentum
            — strategy, design, engineering and motion spinning as one
            force. We obsess over the details others skip, and{" "}
            <span className="font-medium text-vortex-ink">
              nothing ships until it feels effortless.
            </span>
          </motion.p>

          <motion.div
            className="flex flex-wrap items-center gap-4"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: introDelay + 0.62, ease: EASE }}
          >
            <Magnetic>
              <button
                onClick={onEnterHub}
                className="group inline-flex items-center gap-3 rounded-full bg-vortex-ink px-7 py-4 font-display text-sm font-semibold text-white transition-colors duration-500 hover:bg-vortex-teal focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-vortex-teal"
              >
                Explore the products
                <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
              </button>
            </Magnetic>
            <Magnetic strength={5}>
              <button
                onClick={onWhatsNew}
                className="group inline-flex items-center gap-2 rounded-full border border-vortex-ink/15 bg-white/50 px-6 py-4 font-display text-sm font-semibold text-vortex-ink backdrop-blur transition-all duration-500 hover:border-vortex-teal/50 hover:text-vortex-teal focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-vortex-teal"
              >
                What&apos;s new
                <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </button>
            </Magnetic>
          </motion.div>
        </div>
      </motion.div>

      {/* rotating badge */}
      <motion.div
        className="absolute right-10 top-32 hidden lg:block xl:right-20"
        style={{ y: badgeY }}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: introDelay + 0.7, ease: EASE }}
      >
        <OrbitBadge />
      </motion.div>

      {/* scroll cue */}
      <motion.div
        className="absolute bottom-28 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 sm:flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: introDelay + 1 }}
        aria-hidden="true"
      >
        <span className="label-editorial text-[10px] text-vortex-ink/45">scroll</span>
        <span className="relative h-10 w-px overflow-hidden bg-vortex-ink/10">
          <motion.span
            className="absolute left-0 top-0 h-4 w-px bg-vortex-teal"
            animate={{ y: [-16, 44] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: [0.65, 0, 0.35, 1] }}
          />
        </span>
      </motion.div>

      {/* spec strip — the fine print at the bottom of the ad.
          counts derive from the data layer, so the strip updates itself
          as products go live and new lanes open. */}
      <motion.div
        className="relative border-t hairline bg-white/40 backdrop-blur-sm"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: introDelay + 0.8, ease: EASE }}
      >
        <div className="mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-4">
          {[
            { k: String(LIVE_COUNT).padStart(2, "0"), v: "Live products" },
            { k: String(PIPELINE_COUNT).padStart(2, "0"), v: "In the pipeline" },
            { k: String(CATEGORIES.length).padStart(2, "0"), v: "Categories" },
            { k: "∞", v: "Growing — est. 2025" },
          ].map((s, i) => (
            <div
              key={s.v}
              className={`flex items-baseline gap-3 px-6 py-5 ${
                i > 0 ? "border-l hairline" : ""
              } ${i >= 2 ? "border-t hairline md:border-t-0" : ""}`}
            >
              <span className="font-display text-2xl font-semibold tracking-tight text-vortex-ink">
                {s.k}
              </span>
              <span className="label-editorial text-[10px] text-vortex-ink/50">{s.v}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Marquee — a slow editorial ticker between hero and the story        */
/* ------------------------------------------------------------------ */
const TICKER = [
  "Haypbooks — Accounting",
  "Qyra — QuickBooks Automation",
  "Zypra — Xero Automation",
  "Cirqa — Social",
  "Lumora — Marketplace",
  "Vortex Games",
  "Independent Studio",
  "Less friction. More momentum.",
];

function Star() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0 text-vortex-teal/60" aria-hidden="true">
      <path
        d="M12 2 L13.8 10.2 L22 12 L13.8 13.8 L12 22 L10.2 13.8 L2 12 L10.2 10.2 Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function VortexMarquee() {
  const items = [...TICKER, ...TICKER];
  return (
    <div
      className="relative overflow-hidden border-y hairline bg-white/50 py-5"
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
      }}
      aria-hidden="true"
    >
      <div className="animate-vortex-marquee flex w-max items-center gap-10">
        {items.map((t, i) => (
          <span key={i} className="flex items-center gap-10">
            <span className="whitespace-nowrap font-display text-[13px] font-medium uppercase tracking-[0.26em] text-vortex-ink/45">
              {t}
            </span>
            <Star />
          </span>
        ))}
      </div>
    </div>
  );
}
