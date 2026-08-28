"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { ArrowRight, Sparkles, MousePointer2 } from "lucide-react";
import { VortexWordmark } from "./vortex-logo";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Shared scroll-reveal helpers                                        */
/* ------------------------------------------------------------------ */

export function FadeUp({
  children,
  delay = 0,
  className,
  amount = 0.4,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  amount?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.7, delay, ease: [0.22, 0.8, 0.28, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Word-by-word text scrub — words illuminate as the user scrolls through */
export function ScrollScrubText({
  text,
  className,
  accentWords = [],
}: {
  text: string;
  className?: string;
  accentWords?: string[];
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.5"],
  });
  const words = text.split(" ");
  return (
    <p ref={ref} className={cn("relative", className)}>
      {words.map((word, i) => {
        const start = i / words.length;
        const end = start + 1 / words.length;
        return (
          <ScrubWord
            key={i}
            progress={scrollYProgress}
            range={[start, end]}
            accent={accentWords.some((a) => word.toLowerCase().includes(a.toLowerCase()))}
          >
            {word}
          </ScrubWord>
        );
      })}
    </p>
  );
}

function ScrubWord({
  progress,
  range,
  children,
  accent,
}: {
  progress: MotionValue<number>;
  range: [number, number];
  children: string;
  accent?: boolean;
}) {
  const opacity = useTransform(progress, range, [0.13, 1]);
  const y = useTransform(progress, range, [7, 0]);
  return (
    <motion.span
      style={{ opacity, y }}
      className={cn("inline-block", accent && "text-vortex-gradient-static font-semibold")}
    >
      {children}&nbsp;
    </motion.span>
  );
}

/** Section eyebrow chip */
export function SectionTag({ index, label }: { index: string; label: string }) {
  return (
    <FadeUp>
      <div className="inline-flex items-center gap-2.5 rounded-full glass px-4 py-1.5">
        <span className="font-mono text-[11px] font-semibold text-vortex-teal">{index}</span>
        <span className="h-3 w-px bg-vortex-teal/30" />
        <span className="font-display text-[11px] font-medium uppercase tracking-[0.22em] text-vortex-navy/80">
          {label}
        </span>
      </div>
    </FadeUp>
  );
}

/* ------------------------------------------------------------------ */
/* Magnetic button — gently pulled toward the cursor                   */
/* ------------------------------------------------------------------ */
export function MagneticWrap({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useRef(0);
  const y = useRef(0);

  return (
    <motion.div
      ref={ref}
      className={cn("inline-block", className)}
      animate={{ x, y }}
      transition={{ type: "spring", stiffness: 180, damping: 15, mass: 0.4 }}
      onMouseMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        x.current = (e.clientX - (r.left + r.width / 2)) * 0.28;
        y.current = (e.clientY - (r.top + r.height / 2)) * 0.28;
      }}
      onMouseLeave={() => {
        x.current = 0;
        y.current = 0;
      }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* HERO                                                                */
/* ------------------------------------------------------------------ */

export function VortexHero({
  onEnterHub,
  onWhatsNew,
}: {
  onEnterHub: () => void;
  onWhatsNew: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const glowScale = useTransform(scrollYProgress, [0, 1], [1, 1.5]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 pt-24 pb-16"
    >
      {/* central soft vortex glow */}
      <motion.div
        style={{ scale: glowScale }}
        className="pointer-events-none absolute left-1/2 top-1/2 -z-[5] h-[46rem] w-[46rem] -translate-x-1/2 -translate-y-1/2 rounded-full"
      >
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(13,148,136,0.16),rgba(6,182,212,0.07)_45%,transparent_70%)]" />
        <div className="absolute inset-[18%] rounded-full border border-vortex-teal/10" />
        <div className="absolute inset-[32%] rounded-full border border-dashed border-vortex-cyan/15" />
      </motion.div>

      <motion.div style={{ y: contentY, opacity: contentOpacity }} className="relative flex flex-col items-center text-center">
        {/* wordmark entrance */}
        <motion.div
          initial={{ opacity: 0, scale: 0.72, filter: "blur(14px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.05, ease: [0.2, 0.75, 0.25, 1] }}
        >
          <VortexWordmark size="hero" />
        </motion.div>

        {/* tagline */}
        <motion.h1
          className="mt-8 font-display text-[2.6rem] font-bold leading-[1.04] tracking-tight text-vortex-ink sm:text-6xl lg:text-[4.6rem]"
          initial={{ opacity: 0, y: 44 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.35, ease: [0.22, 0.8, 0.28, 1] }}
        >
          Websites &amp;
          <br />
          <span className="text-vortex-gradient">Digital Tools.</span>
        </motion.h1>

        <motion.p
          className="mt-6 max-w-xl text-balance text-base leading-relaxed text-vortex-navy/70 sm:text-lg"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55, ease: [0.22, 0.8, 0.28, 1] }}
        >
          Ready-made websites and digital tools — all designed and built
          exclusively by the founder.{" "}
          <span className="font-semibold text-vortex-teal">No outsourcing, no shortcuts.</span>
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.72, ease: [0.22, 0.8, 0.28, 1] }}
        >
          <MagneticWrap>
            <button
              onClick={onEnterHub}
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-teal-600 via-emerald-500 to-cyan-500 bg-[length:200%_100%] bg-left px-8 py-4 font-display text-sm font-semibold tracking-wide text-white shadow-[0_18px_45px_-12px_rgba(13,148,136,0.55)] transition-all duration-500 hover:bg-right hover:shadow-[0_22px_60px_-10px_rgba(6,182,212,0.6)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-vortex-teal"
            >
              <Sparkles className="h-4 w-4 transition-transform duration-500 group-hover:rotate-90" />
              Enter the Vortex Hub
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
            </button>
          </MagneticWrap>
          <MagneticWrap>
            <button
              onClick={onWhatsNew}
              className="inline-flex items-center gap-2.5 rounded-full glass px-7 py-4 font-display text-sm font-semibold tracking-wide text-vortex-navy transition-all duration-300 hover:border-vortex-teal/40 hover:bg-white/85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-vortex-teal"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              What&apos;s New
            </button>
          </MagneticWrap>
        </motion.div>

        {/* floating proof chips */}
        <motion.div
          className="mt-12 flex flex-wrap items-center justify-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
        >
          {[
            { k: "50+", v: "products built" },
            { k: "100%", v: "founder-built" },
            { k: "6+", v: "categories" },
          ].map((chip, i) => (
            <div
              key={chip.v}
              className={cn(
                "glass flex items-baseline gap-2 rounded-full px-4 py-2",
                i % 2 === 0 ? "animate-vortex-float" : "animate-vortex-float-delayed"
              )}
              style={{ animationDuration: `${5 + i}s` }}
            >
              <span className="font-display text-sm font-bold text-vortex-gradient-static">{chip.k}</span>
              <span className="text-[11px] font-medium uppercase tracking-wider text-vortex-navy/60">{chip.v}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* scroll indicator */}
      <motion.button
        onClick={() => document.getElementById("vortex-story")?.scrollIntoView({ behavior: "smooth" })}
        className="absolute bottom-7 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-vortex-navy/50 transition-colors hover:text-vortex-teal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        aria-label="Scroll to the story"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.3em]">scroll</span>
        <span className="relative flex h-9 w-[22px] justify-center rounded-full border border-current">
          <span className="absolute top-1.5 h-1.5 w-1.5 rounded-full bg-current" style={{ animation: "vortex-scroll-dot 1.8s ease-in-out infinite" }} />
        </span>
        <MousePointer2 className="h-3 w-3 opacity-0" />
      </motion.button>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* MARQUEE strip                                                       */
/* ------------------------------------------------------------------ */

export function VortexMarquee() {
  const items = [
    "No outsourcing",
    "No shortcuts",
    "Founder-built",
    "Ready to ship",
    "One-person studio",
    "Always expanding",
    "Less clicks, more results",
  ];
  const row = [...items, ...items];
  return (
    <div className="relative z-10 overflow-hidden py-1">
      <div className="-mx-4 -rotate-[0.6deg] overflow-hidden border-y border-vortex-teal/15 bg-gradient-to-r from-teal-600 via-emerald-500 to-cyan-600 py-3.5 shadow-[0_10px_40px_-18px_rgba(13,148,136,0.5)]">
      <div className="flex w-max animate-vortex-marquee items-center gap-10 whitespace-nowrap pr-10">
        {row.map((item, i) => (
          <span key={i} className="flex items-center gap-10 font-display text-sm font-semibold uppercase tracking-[0.22em] text-white">
            {item}
            <span className="inline-block h-1.5 w-1.5 rotate-45 rounded-[2px] bg-white/70" />
          </span>
        ))}
        </div>
      </div>
    </div>
  );
}
