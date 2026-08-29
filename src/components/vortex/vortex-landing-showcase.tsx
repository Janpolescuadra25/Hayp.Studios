"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { PRODUCTS, STATUS_META } from "@/lib/vortex-data";
import { VortexMark } from "./vortex-logo";
import { EASE, FadeUp, MaskedLine, SectionTag, Magnetic } from "./vortex-shared";

/* ================================================================== */
/* FEATURED — a magazine spread of the flagship drops                  */
/* ================================================================== */
export function FeaturedTeaser({ onEnterHub }: { onEnterHub: () => void }) {
  const featured = PRODUCTS.filter(
    (p) => p.status === "live" || p.status === "development"
  ).slice(0, 3);

  return (
    <section className="relative mx-auto max-w-7xl px-6 py-28 sm:py-36">
      {/* heading row */}
      <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
        <div>
          <SectionTag index="04" label="The Lineup" className="mb-7" />
          <h2 className="font-display text-[clamp(2rem,4.6vw,3.9rem)] font-bold leading-[1.02] tracking-[-0.03em] text-vortex-ink">
            <MaskedLine>Fresh from</MaskedLine>
            <MaskedLine delay={0.12}>
              <span className="font-serif-accent font-normal italic text-vortex-gradient">
                the vortex.
              </span>
            </MaskedLine>
          </h2>
        </div>
        <FadeUp delay={0.2}>
          <button
            onClick={onEnterHub}
            className="group inline-flex items-center gap-2.5 border-b border-vortex-ink/20 pb-1.5 font-display text-sm font-semibold text-vortex-ink transition-colors duration-500 hover:border-vortex-teal hover:text-vortex-teal focus-visible:outline-2 focus-visible:outline-vortex-teal"
          >
            View the full pipeline
            <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
          </button>
        </FadeUp>
      </div>

      {/* cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {featured.map((p, i) => (
          <motion.article
            key={p.id}
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 1, delay: i * 0.12, ease: EASE }}
            className="group flex flex-col overflow-hidden rounded-[1.75rem] border hairline bg-white/85 backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-editorial-lg"
          >
            {/* thumb — quiet CSS art: pale wash + drifting ring + mark */}
            <div
              className="relative h-52 overflow-hidden"
              style={{
                background: `linear-gradient(150deg, ${p.hue[0]}12, ${p.hue[1]}1f)`,
              }}
            >
              <div
                className="absolute -right-16 -top-20 h-56 w-56 rounded-full border hairline opacity-60 transition-transform duration-[1200ms] ease-out group-hover:rotate-45 group-hover:scale-110"
                style={{
                  borderColor: `${p.hue[1]}30`,
                  background: `radial-gradient(closest-side, ${p.hue[1]}14, transparent 70%)`,
                }}
              />
              <div
                className="absolute -bottom-24 -left-14 h-48 w-48 rounded-full border hairline opacity-50 transition-transform duration-[1200ms] ease-out group-hover:-rotate-30 group-hover:scale-105"
                style={{ borderColor: `${p.hue[0]}28` }}
              />
              <span className="label-editorial absolute left-6 top-6 text-[10px] text-vortex-ink/45">
                {String(i + 1).padStart(2, "0")} — {p.category}
              </span>
              <span
                className={`label-editorial absolute right-5 top-5 rounded-full px-3 py-1.5 text-[9px] ${STATUS_META[p.status].chip}`}
              >
                {STATUS_META[p.status].label}
              </span>
              <div className="absolute bottom-5 right-6 grid h-12 w-12 place-items-center rounded-full bg-white/80 text-vortex-ink shadow-editorial backdrop-blur transition-all duration-500 group-hover:bg-vortex-ink group-hover:text-white">
                <p.icon className="h-5 w-5" strokeWidth={1.6} />
              </div>
            </div>

            {/* body */}
            <div className="flex flex-1 flex-col p-7">
              <h3 className="font-display text-2xl font-semibold tracking-tight text-vortex-ink transition-colors duration-500 group-hover:text-vortex-teal">
                {p.name}
              </h3>
              <p className="mt-1.5 font-serif-accent text-lg italic leading-snug text-vortex-navy/60">
                {p.tagline}
              </p>
              <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-vortex-navy/70">
                {p.description}
              </p>
              <div className="mt-auto flex items-center justify-between border-t hairline pt-5">
                <span className="label-editorial text-[10px] text-vortex-ink/45">
                  {p.eta ??
                    new Date(p.releasedAt).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                </span>
                <span className="inline-flex items-center gap-1.5 font-display text-[13px] font-semibold text-vortex-teal">
                  {p.status === "live" ? "In the Hub" : "On the roadmap"}
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

/* ================================================================== */
/* MOTTO — the tagline card of the film. Pinned, scrubbed, massive.    */
/* ================================================================== */
export function MottoSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const line1Opacity = useTransform(scrollYProgress, [0.08, 0.26, 0.62, 0.78], [0, 1, 1, 0.16]);
  const line1Y = useTransform(scrollYProgress, [0.08, 0.26], [60, 0]);
  const line2Opacity = useTransform(scrollYProgress, [0.34, 0.54, 0.86, 0.98], [0, 1, 1, 0.2]);
  const line2Y = useTransform(scrollYProgress, [0.34, 0.54], [60, 0]);
  const ruleScale = useTransform(scrollYProgress, [0.3, 0.5], [0, 1]);
  const markScale = useTransform(scrollYProgress, [0.05, 0.5, 1], [0.7, 1, 1.12]);
  const markOpacity = useTransform(scrollYProgress, [0.05, 0.25, 0.85, 1], [0, 0.14, 0.14, 0.05]);

  return (
    <section ref={ref} className="relative h-[260vh]">
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden px-6">
        {/* watermark mark breathing behind */}
        <motion.div
          className="pointer-events-none absolute inset-0 grid place-items-center"
          style={{ opacity: markOpacity, scale: markScale }}
          aria-hidden="true"
        >
          <VortexMark size={560} animated={false} showOrbit={false} idPrefix="motto-wm" />
        </motion.div>

        <SectionTag index="05" label="The Motto" className="absolute left-1/2 top-24 -translate-x-1/2 md:left-6 md:translate-x-0" />

        <div className="relative text-center">
          <motion.h2
            className="font-display text-[clamp(3rem,9vw,8.5rem)] font-bold leading-[1.02] tracking-[-0.035em] text-vortex-ink"
            style={{ opacity: line1Opacity, y: line1Y }}
          >
            Less friction.
          </motion.h2>

          {/* hairline that draws itself between the lines */}
          <motion.div
            className="mx-auto my-6 h-px w-40 origin-center bg-gradient-to-r from-transparent via-vortex-teal to-transparent sm:my-8 sm:w-64"
            style={{ scaleX: ruleScale }}
            aria-hidden="true"
          />

          <motion.h2
            className="font-display text-[clamp(3rem,9vw,8.5rem)] font-bold leading-[1.02] tracking-[-0.035em]"
            style={{ opacity: line2Opacity, y: line2Y }}
          >
            <span className="text-vortex-gradient">More momentum.</span>
          </motion.h2>
        </div>

        <motion.p
          className="absolute bottom-24 label-editorial text-[10px] text-vortex-ink/45"
          style={{ opacity: line2Opacity }}
        >
          the vortex way — since day one
        </motion.p>
      </div>
    </section>
  );
}

/* ================================================================== */
/* FINAL CTA — the closing frame                                       */
/* ================================================================== */
export function FinalCta({ onEnterHub }: { onEnterHub: () => void }) {
  return (
    <section className="relative mx-auto max-w-7xl px-6 pb-32 pt-8 sm:pb-40">
      <FadeUp amount={0.3}>
        <div className="relative overflow-hidden rounded-[2.25rem] border hairline bg-white/70 px-6 py-20 text-center backdrop-blur-sm sm:px-12 sm:py-28">
          {/* soft interior aurora */}
          <div
            className="pointer-events-none absolute -left-24 -top-32 h-96 w-96 rounded-full opacity-70"
            style={{
              background:
                "radial-gradient(closest-side, rgba(13,148,136,0.12), transparent 70%)",
              filter: "blur(30px)",
            }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full opacity-70"
            style={{
              background:
                "radial-gradient(closest-side, rgba(6,182,212,0.1), transparent 70%)",
              filter: "blur(30px)",
            }}
            aria-hidden="true"
          />

          <p className="label-editorial text-vortex-teal">Take one for a spin</p>
          <h2 className="mx-auto mt-6 max-w-2xl font-display text-[clamp(2.2rem,5.2vw,4.4rem)] font-bold leading-[1.04] tracking-[-0.03em] text-vortex-ink">
            Find your next{" "}
            <span className="font-serif-accent font-normal italic text-vortex-gradient">
              product.
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-md text-[15px] leading-relaxed text-vortex-navy/70">
            From Haypbooks and Qyra today to Zypra, Cirqa, Lumora and game
            worlds tomorrow — browse the full pipeline, live to concept.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Magnetic>
              <button
                onClick={onEnterHub}
                className="group inline-flex items-center gap-3 rounded-full bg-vortex-ink px-8 py-4.5 font-display text-sm font-semibold text-white transition-colors duration-500 hover:bg-vortex-teal focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-vortex-teal"
              >
                Enter the Vortex Hub
                <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
              </button>
            </Magnetic>
          </div>

          <p className="mt-8 font-serif-accent text-base italic text-vortex-navy/55">
            Designed, engineered and shipped with momentum — one lane at
            a time.
          </p>
        </div>
      </FadeUp>
    </section>
  );
}
