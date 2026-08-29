"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  animate,
  type MotionValue,
} from "framer-motion";
import { ArrowRight } from "lucide-react";
import { CATEGORIES, PRODUCTS, STATS, LIVE_COUNT, PIPELINE_COUNT } from "@/lib/vortex-data";
import { EASE, FadeUp, MaskedLine, SectionTag, WordIlluminate } from "./vortex-shared";

/* ================================================================== */
/* CHAPTER 01 — THE STUDIO                                             */
/* A pinned statement whose words light up word by word as you scroll. */
/* The quiet centerpiece of the whole page.                            */
/* ================================================================== */
export function ChapterOne() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const watermarkY = useTransform(scrollYProgress, [0, 1], ["6%", "-10%"]);
  const captionOpacity = useTransform(scrollYProgress, [0.74, 0.86], [0, 1]);
  const captionY = useTransform(scrollYProgress, [0.74, 0.86], [16, 0]);
  const railScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section ref={ref} className="relative h-[290vh]">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        {/* giant watermark V drifting behind */}
        <motion.span
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none font-display text-[46vw] font-bold leading-none text-vortex-ink/[0.032]"
          style={{ y: watermarkY }}
          aria-hidden="true"
        >
          V
        </motion.span>

        {/* progress rail — left edge */}
        <div className="absolute left-6 top-1/2 hidden h-40 -translate-y-1/2 sm:block" aria-hidden="true">
          <div className="h-full w-px bg-vortex-ink/10">
            <motion.div
              className="h-full w-full origin-top bg-gradient-to-b from-vortex-teal to-vortex-cyan"
              style={{ scaleY: railScale }}
            />
          </div>
        </div>

        <div className="mx-auto w-full max-w-6xl px-6">
          <SectionTag index="01" label="The Studio" className="mb-10" />

          <h2 className="font-display text-[clamp(2rem,5.6vw,4.9rem)] font-semibold leading-[1.08] tracking-[-0.025em] text-vortex-ink">
            <WordIlluminate
              text="Every product. Built by Vortex Studios. No exceptions."
              progress={scrollYProgress}
              start={0.1}
              end={0.72}
              accentWords={["vortex", "studios"]}
            />
          </h2>

          <motion.p
            className="mt-10 max-w-md border-l-2 border-vortex-teal/50 pl-5 text-[15px] leading-relaxed text-vortex-navy/75"
            style={{ opacity: captionOpacity, y: captionY }}
          >
            Vortex is momentum made visible — an independent studio built on
            a single obsession: software that feels effortless.
            Strategy, design, engineering and motion spin here as one force.
            No templates, no shortcuts, no settling. What leaves the vortex
            lands ahead of expectation.
          </motion.p>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/* CHAPTER 02 — THE CRAFT                                              */
/* Editorial split: sticky intro left, numbered craft rows right.      */
/* ================================================================== */
const CRAFT_ROWS = [
  {
    title: "Ships whole, always",
    body: "Every product leaves the vortex complete — screens, flows, states, edge cases and docs included. Not a starter kit, not a promising beta. A finished thing, running live.",
  },
  {
    title: "One system, one voice",
    body: "Identity, interface, motion and copy are crafted as one system, under one roof. Nothing gets lost between disciplines — so the product speaks with a single voice, end to end.",
  },
  {
    title: "Effortless is the bar",
    body: "Every screen — from the first open to the deepest setting — is tuned around one question: does it feel effortless? Less friction, more momentum isn't a slogan on a wall here; it's the acceptance test.",
  },
  {
    title: "Dependable by default",
    body: "Clean code, honest docs and support that answers. From what's live to what's loading, everything in the pipeline carries the same promise: it has to work — and keep working.",
  },
];

export function ChapterTwo() {
  return (
    <section className="relative mx-auto max-w-7xl px-6 py-28 sm:py-36">
      <div className="grid gap-14 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
        {/* sticky editorial column */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionTag index="02" label="The Craft" className="mb-8" />
          <h2 className="font-display text-[clamp(2.2rem,4.4vw,3.8rem)] font-bold leading-[1.02] tracking-[-0.03em] text-vortex-ink">
            <MaskedLine>Ready.</MaskedLine>
            <MaskedLine delay={0.1}>Set.</MaskedLine>
            <MaskedLine delay={0.2}>
              <span className="font-serif-accent font-normal italic text-vortex-gradient">
                Ship.
              </span>
            </MaskedLine>
          </h2>
          <FadeUp delay={0.25} className="mt-7 max-w-sm">
            <p className="text-[15px] leading-relaxed text-vortex-navy/70">
              The studio runs on a simple loop: pick the product, obsess over
              every detail, ship it whole. Then spin up the next one — from
              the practical to the playful.
            </p>
          </FadeUp>
          <FadeUp delay={0.35} className="mt-9">
            <p className="font-serif-accent text-2xl italic leading-snug text-vortex-ink/80">
              &ldquo;No templates.
              <br />
              No shortcuts.&rdquo;
            </p>
          </FadeUp>
        </div>

        {/* craft rows */}
        <div>
          {CRAFT_ROWS.map((row, i) => (
            <motion.div
              key={row.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.9, delay: i * 0.08, ease: EASE }}
              className="group border-t hairline py-9 last:border-b"
            >
              <div className="flex items-start gap-6 sm:gap-10">
                <span className="label-editorial mt-2 shrink-0 text-vortex-teal/80 transition-colors duration-500 group-hover:text-vortex-teal">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-display text-xl font-semibold tracking-tight text-vortex-ink transition-transform duration-500 group-hover:translate-x-1.5 sm:text-2xl">
                    {row.title}
                  </h3>
                  <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-vortex-navy/70">
                    {row.body}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/* CHAPTER 03 — THE CIRCUIT                                            */
/* A pinned horizontal gallery — today's lanes, one lap. The count is   */
/* open by design: new lanes open as the studio grows.                  */
/* ================================================================== */
function GalleryCard({
  index,
  total,
  progress,
  children,
}: {
  index: number;
  total: number;
  progress: MotionValue<number>;
  children: React.ReactNode;
}) {
  // each card breathes slightly as it travels across the viewport
  const win: [number, number] = [
    Math.max(0, (index - 1) / total),
    Math.min(1, (index + 1.2) / total),
  ];
  const y = useTransform(progress, win, [36, -36]);
  return (
    <motion.div style={{ y }} className="shrink-0">
      {children}
    </motion.div>
  );
}

export function ChapterThree({ onEnterHub }: { onEnterHub: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const [shift, setShift] = useState(0);

  // measure exact horizontal travel: strip width - viewport + breathing room
  useEffect(() => {
    const measure = () => {
      if (!stripRef.current) return;
      setShift(
        Math.max(0, stripRef.current.scrollWidth - window.innerWidth + 64)
      );
    };
    measure();
    window.addEventListener("resize", measure);
    const t = setTimeout(measure, 600); // re-measure after fonts settle
    return () => {
      window.removeEventListener("resize", measure);
      clearTimeout(t);
    };
  }, []);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const stripX = useTransform(scrollYProgress, [0.04, 0.96], [0, -shift]);
  const railScale = useTransform(scrollYProgress, [0.04, 0.96], [0, 1]);
  const total = CATEGORIES.length + 1;

  return (
    <section ref={ref} className="relative h-[380vh]">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        {/* header */}
        <div className="mx-auto mb-12 w-full max-w-7xl px-6">
          <SectionTag index="03" label="The Circuit" className="mb-7" />
          <h2 className="font-display text-[clamp(2rem,4.6vw,3.9rem)] font-bold leading-[1.02] tracking-[-0.03em] text-vortex-ink">
            New lanes.{" "}
            <span className="font-serif-accent font-normal italic text-vortex-gradient">
              Same standard.
            </span>
          </h2>
        </div>

        {/* horizontal strip */}
        <motion.div ref={stripRef} style={{ x: stripX }} className="flex items-stretch gap-6 pl-6 pr-6 sm:gap-8">
          {/* intro card */}
          <GalleryCard index={0} total={total} progress={scrollYProgress}>
            <div className="flex h-[340px] w-[min(78vw,300px)] flex-col justify-between rounded-[1.75rem] bg-vortex-ink p-8 text-white sm:h-[380px]">
              <span className="label-editorial text-teal-200/80">The pipeline</span>
              <div>
                <p className="font-display text-3xl font-semibold leading-tight">
                  {LIVE_COUNT} live today.
                  <br />
                  {PIPELINE_COUNT} more spinning.
                </p>
                <p className="mt-4 text-sm leading-relaxed text-white/60">
                  Every lane runs the same standard — strategy, design,
                  engineering and motion as one force. New lanes open as the
                  studio grows. Live today or spinning up next, it all lives
                  in the Hub.
                </p>
              </div>
              <button
                onClick={onEnterHub}
                className="group inline-flex w-fit items-center gap-2.5 rounded-full border border-white/25 px-5 py-3 font-display text-[13px] font-semibold transition-colors duration-500 hover:border-teal-300 hover:text-teal-200 focus-visible:outline-2 focus-visible:outline-teal-300"
              >
                Open the Hub
                <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
              </button>
            </div>
          </GalleryCard>

          {/* category cards */}
          {CATEGORIES.map((cat, i) => {
            const inCat = PRODUCTS.filter((p) => p.category === cat.name);
            const live = inCat.filter((p) => p.status === "live").length;
            const meta =
              live > 0
                ? `${inCat.length} ${inCat.length === 1 ? "product" : "products"} · ${live} live`
                : `${inCat.length} in the pipeline`;
            return (
              <GalleryCard key={cat.name} index={i + 1} total={total} progress={scrollYProgress}>
                <div className="group flex h-[340px] w-[min(78vw,340px)] flex-col justify-between rounded-[1.75rem] border hairline bg-white/85 p-8 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-vortex-teal/40 hover:shadow-editorial sm:h-[380px] sm:w-[360px]">
                  <div className="flex items-start justify-between">
                    <span className="font-display text-5xl font-semibold tracking-tight text-vortex-ink/12">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="grid h-11 w-11 place-items-center rounded-full border hairline text-vortex-teal transition-colors duration-500 group-hover:border-vortex-teal/50 group-hover:bg-vortex-foam">
                      <cat.icon className="h-5 w-5" strokeWidth={1.6} />
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display text-[1.7rem] font-semibold tracking-tight text-vortex-ink">
                      {cat.name}
                    </h3>
                    <p className="mt-2 text-sm text-vortex-navy/65">{cat.blurb}</p>
                  </div>
                  <div className="flex items-center justify-between border-t hairline pt-5">
                    <span className="label-editorial text-[10px] text-vortex-ink/50">
                      {meta}
                    </span>
                    <button
                      onClick={onEnterHub}
                      className="inline-flex items-center gap-1.5 font-display text-[13px] font-semibold text-vortex-teal transition-colors hover:text-vortex-deep focus-visible:outline-2 focus-visible:outline-vortex-teal"
                    >
                      Explore <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </GalleryCard>
            );
          })}

          {/* outro spacer card */}
          <GalleryCard index={total} total={total} progress={scrollYProgress}>
            <div className="flex h-[340px] w-[min(60vw,240px)] flex-col items-start justify-center gap-5 sm:h-[380px]">
              <p className="font-serif-accent text-3xl italic leading-snug text-vortex-ink/70">
                …and the
                <br />
                next lane.
              </p>
              <button
                onClick={onEnterHub}
                className="inline-flex items-center gap-2 rounded-full bg-vortex-teal px-6 py-3.5 font-display text-[13px] font-semibold text-white transition-colors duration-500 hover:bg-vortex-deep focus-visible:outline-2 focus-visible:outline-vortex-teal"
              >
                Browse everything <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </GalleryCard>
        </motion.div>

        {/* progress rail */}
        <div className="mx-auto mt-14 w-full max-w-7xl px-6" aria-hidden="true">
          <div className="flex items-center gap-5">
            <span className="label-editorial text-[10px] text-vortex-ink/40">scroll</span>
            <div className="h-px flex-1 bg-vortex-ink/10">
              <motion.div
                className="h-full w-full origin-left bg-gradient-to-r from-vortex-teal to-vortex-cyan"
                style={{ scaleX: railScale }}
              />
            </div>
            <span className="label-editorial text-[10px] text-vortex-ink/40">
              0{CATEGORIES.length} / 0{CATEGORIES.length}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/* STATS — quiet numbers, hairline dividers, serif-flavored counters   */
/* ================================================================== */
function CountUp({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  /* SSR + pre-animation text carries the real value — the DOM must never
     claim "0 live products" (copy-paste, a11y tree, crawlers all read it) */
  const [val, setVal] = useState(to);

  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVal(to);
      return;
    }
    const controls = animate(0, to, {
      duration: 2,
      ease: EASE,
      onUpdate: (v) => setVal(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, to]);

  return <span ref={ref}>{val}</span>;
}

export function StatsSection() {
  return (
    <section className="relative border-y hairline bg-white/50">
      <div className="mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <FadeUp
            key={s.label}
            delay={i * 0.08}
            className={`px-6 py-10 sm:px-10 sm:py-14 ${
              i > 0 ? "lg:border-l hairline" : ""
            } ${i % 2 === 1 ? "border-l hairline lg:border-l" : ""} ${
              i >= 2 ? "border-t hairline lg:border-t-0" : ""
            }`}
          >
            <div className="font-display text-5xl font-semibold tracking-tight text-vortex-ink sm:text-6xl">
              {s.value === null ? (
                <span className="font-serif-accent font-normal italic text-vortex-gradient">∞</span>
              ) : (
                <>
                  <CountUp to={s.value} />
                  <span className="font-serif-accent font-normal italic text-vortex-teal">
                    {s.suffix}
                  </span>
                </>
              )}
            </div>
            <p className="label-editorial mt-4 text-[10px] text-vortex-ink/50">{s.label}</p>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}
