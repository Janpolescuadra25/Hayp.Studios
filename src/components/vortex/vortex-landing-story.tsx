"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useInView,
  animate,
} from "framer-motion";
import {
  Code2,
  Palette,
  Rocket,
  Search,
  CheckCircle2,
  Layers,
  MousePointerClick,
  Package,
  type LucideIcon,
} from "lucide-react";
import { CATEGORIES, STATS } from "@/lib/vortex-data";
import { FadeUp, SectionTag, ScrollScrubText } from "./vortex-landing-hero";
import { cn } from "@/lib/utils";

/* ================================================================== */
/* CHAPTER 1 — "One founder. Every pixel."                             */
/* Sticky orbiting visual + scroll-scrub illuminated text              */
/* ================================================================== */

function OrbitVisual() {
  const rings = [
    { size: 300, duration: 26, icons: [{ Icon: Code2, angle: 0, hue: "#0d9488" }, { Icon: Rocket, angle: 180, hue: "#06b6d4" }] },
    { size: 200, duration: 18, reverse: true, icons: [{ Icon: Palette, angle: 90, hue: "#10b981" }] },
  ];

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[340px]">
      {/* core */}
      <div className="absolute left-1/2 top-1/2 z-10 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-cyan-600 text-white shadow-[0_20px_50px_-12px_rgba(13,148,136,0.6)]">
        <span className="font-display text-2xl font-bold">1</span>
        <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-teal-100">founder</span>
      </div>
      {/* pulse */}
      <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 animate-vortex-pulse-soft rounded-full bg-teal-400/20 blur-xl" />

      {rings.map((ring, ri) => (
        <div
          key={ri}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-vortex-teal/25"
          style={{
            width: ring.size,
            height: ring.size,
            animation: `vortex-rotate-${ring.reverse ? "ccw" : "cw"} ${ring.duration}s linear infinite`,
          }}
        >
          <div
            className="absolute inset-0 rounded-full border border-dashed border-vortex-cyan/20"
            style={{ inset: 10 }}
          />
          {ring.icons.map(({ Icon, angle, hue }) => {
            const rad = (angle * Math.PI) / 180;
            const r = ring.size / 2;
            const x = Math.cos(rad) * r;
            const y = Math.sin(rad) * r;
            return (
              <div
                key={angle}
                className="absolute left-1/2 top-1/2"
                style={{ transform: `translate(${x - 22}px, ${y - 22}px)` }}
              >
                <div
                  className="grid h-11 w-11 place-items-center rounded-2xl glass-strong vortex-glow"
                  style={{
                    animation: `vortex-rotate-${ring.reverse ? "cw" : "ccw"} ${ring.duration}s linear infinite`,
                  }}
                >
                  <Icon className="h-5 w-5" style={{ color: hue }} />
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export function ChapterOne() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const orbitScale = useTransform(scrollYProgress, [0, 0.35, 1], [0.7, 1, 1.08]);
  const orbitRotate = useTransform(scrollYProgress, [0, 1], [-20, 20]);

  return (
    <section id="vortex-story" ref={ref} className="relative mx-auto max-w-7xl px-6 py-28 sm:py-36">
      <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        {/* sticky-ish visual with parallax */}
        <div className="relative order-2 lg:order-1">
          <motion.div style={{ scale: orbitScale, rotate: orbitRotate }}>
            <OrbitVisual />
          </motion.div>
          {/* caption chips */}
          <FadeUp delay={0.2} className="absolute -bottom-2 left-0 right-0 flex justify-center gap-2">
            {["designs", "codes", "ships"].map((label, i) => (
              <span
                key={label}
                className={cn(
                  "glass rounded-full px-3.5 py-1.5 font-display text-[11px] font-semibold uppercase tracking-[0.16em] text-vortex-navy/70",
                  i === 1 && "lg:mb-8"
                )}
              >
                {label}
              </span>
            ))}
          </FadeUp>
        </div>

        {/* scrubbed story text */}
        <div className="order-1 lg:order-2">
          <SectionTag index="01" label="The Solo Vision" />
          <h2 className="mt-6 font-display text-4xl font-bold leading-[1.08] tracking-tight text-vortex-ink sm:text-5xl">
            One founder.
            <br />
            <span className="text-vortex-gradient">Every pixel.</span>
          </h2>
          <ScrollScrubText
            className="mt-7 max-w-xl text-lg leading-relaxed text-vortex-navy/80 sm:text-xl"
            text="Vortex.studio is a one-person product studio. Every website, every dashboard, every tool in the catalog is designed, coded, and published by a single pair of hands. When you buy from Vortex, you know exactly who made what you're getting — no agencies, no hand-offs, no dilution."
            accentWords={["designed,", "coded,", "published", "single"]}
          />
          <FadeUp delay={0.15} className="mt-8">
            <div className="glass vortex-glow inline-flex items-center gap-3 rounded-2xl px-5 py-4">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
              <p className="text-sm font-medium text-vortex-navy/80">
                The tagline isn&apos;t marketing — <span className="font-semibold text-vortex-teal">no outsourcing, no shortcuts</span> is the operating system.
              </p>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/* CHAPTER 2 — "Ready. Set. Ship."                                     */
/* Parallax stacking browser mockups + alternating feature rows        */
/* ================================================================== */

function BrowserMock({
  className,
  hue,
  label,
  icon: Icon,
  depth,
  progress,
}: {
  className?: string;
  hue: [string, string];
  label: string;
  icon: LucideIcon;
  depth: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const y = useTransform(progress, [0, 1], [depth * 120, depth * -60]);
  const rotate = useTransform(progress, [0, 1], [depth * 3, depth * -1.5]);

  return (
    <motion.div
      style={{ y, rotate }}
      className={cn(
        "absolute w-[240px] overflow-hidden rounded-2xl glass-strong vortex-glow sm:w-[290px]",
        className
      )}
    >
      {/* chrome bar */}
      <div className="flex items-center gap-1.5 border-b border-vortex-teal/10 px-3.5 py-2.5">
        <span className="h-2 w-2 rounded-full bg-rose-300" />
        <span className="h-2 w-2 rounded-full bg-amber-300" />
        <span className="h-2 w-2 rounded-full bg-emerald-300" />
        <span className="ml-2 flex-1 truncate rounded-full bg-vortex-teal/5 px-2.5 py-0.5 font-mono text-[9px] text-vortex-navy/50">
          vortex.studio/{label.toLowerCase().replace(/\s+/g, "-")}
        </span>
      </div>
      {/* css art */}
      <div className="relative h-32 p-3.5 sm:h-36">
        <div
          className="absolute inset-3.5 rounded-xl opacity-90"
          style={{ background: `linear-gradient(135deg, ${hue[0]}14, ${hue[1]}1f)` }}
        />
        <div className="relative flex h-full flex-col justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-lg" style={{ background: `linear-gradient(135deg, ${hue[0]}, ${hue[1]})` }}>
              <Icon className="h-3.5 w-3.5 text-white" />
            </div>
            <div>
              <div className="h-1.5 w-20 rounded-full" style={{ background: `${hue[0]}66` }} />
              <div className="mt-1 h-1.5 w-12 rounded-full bg-vortex-navy/10" />
            </div>
          </div>
          <div className="space-y-1.5">
            {[92, 74, 58].map((wd, i) => (
              <div key={i} className="h-1.5 rounded-full" style={{ width: `${wd}%`, background: `${hue[i % 2]}2e` }} />
            ))}
          </div>
          <div className="flex gap-1.5">
            <div className="h-6 w-16 rounded-lg" style={{ background: `linear-gradient(90deg, ${hue[0]}cc, ${hue[1]}cc)` }} />
            <div className="h-6 w-10 rounded-lg bg-vortex-navy/8" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function ChapterTwo() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  const features = [
    {
      icon: Package,
      title: "Not templates. Products.",
      body: "These aren't starter kits or half-wired themes. Every listing is a complete, deployable product — pages, logic, and polish included.",
      hue: "#0d9488",
    },
    {
      icon: MousePointerClick,
      title: "Deploy in minutes",
      body: "Buy, connect your domain, press deploy. The buyer's journey has exactly three steps because the work is already done.",
      hue: "#10b981",
    },
    {
      icon: Search,
      title: "Zero dev work needed",
      body: "No sprints, no standups, no freelancers to brief. It works out of the box — the way buying something should feel.",
      hue: "#06b6d4",
    },
  ];

  return (
    <section ref={ref} className="relative overflow-hidden py-28 sm:py-36">
      {/* ambient band */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -z-[5] h-[36rem] -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.07),transparent_65%)]" />

      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl">
          <SectionTag index="02" label="Ready to Use" />
          <h2 className="mt-6 font-display text-4xl font-bold leading-[1.08] tracking-tight text-vortex-ink sm:text-5xl">
            Ready. Set. <span className="text-vortex-gradient">Ship.</span>
          </h2>
          <ScrollScrubText
            className="mt-7 text-lg leading-relaxed text-vortex-navy/80 sm:text-xl"
            text="Vortex products work the moment you get them. Websites, dashboards, stores, blogs — complete, deployable, and finished out of the box. The only thing you bring is a domain and an idea."
            accentWords={["complete,", "deployable,", "finished"]}
          />
        </div>

        <div className="mt-20 grid items-center gap-16 lg:grid-cols-2">
          {/* parallax mockup stack */}
          <div className="relative h-[380px] sm:h-[420px]">
            <BrowserMock className="left-[8%] top-2 rotate-[-7deg]" hue={["#0d9488", "#06b6d4"]} label="Dashboard" icon={Layers} depth={1.4} progress={scrollYProgress} />
            <BrowserMock className="left-[26%] top-24 z-10 rotate-[3deg]" hue={["#10b981", "#0d9488"]} label="Store" icon={Package} depth={0.7} progress={scrollYProgress} />
            <BrowserMock className="left-[6%] top-44 rotate-[-2deg]" hue={["#06b6d4", "#10b981"]} label="Journal" icon={Search} depth={1.05} progress={scrollYProgress} />
            {/* orbiting badge */}
            <motion.div
              className="absolute -right-2 top-6 z-20"
              style={{ y: useTransform(scrollYProgress, [0, 1], [30, -50]) }}
            >
              <div className="animate-vortex-float glass-strong vortex-glow flex items-center gap-2 rounded-2xl px-4 py-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <div>
                  <p className="font-display text-xs font-bold text-vortex-ink">Launch-ready</p>
                  <p className="text-[10px] text-vortex-navy/60">out of the box</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* alternating slide-in features */}
          <div className="space-y-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className={cn(
                  "glass group flex gap-5 rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_-18px_rgba(13,148,136,0.4)]",
                  i % 2 === 0 ? "ml-0 sm:ml-10" : "sm:mr-10"
                )}
                initial={{ opacity: 0, x: i % 2 === 0 ? 70 : -70, filter: "blur(6px)" }}
                whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.75, delay: i * 0.12, ease: [0.22, 0.8, 0.28, 1] }}
              >
                <div
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-white transition-transform duration-500 group-hover:rotate-[8deg] group-hover:scale-110"
                  style={{ background: `linear-gradient(135deg, ${f.hue}, ${f.hue}99, #06b6d4)` }}
                >
                  <f.icon className="h-5.5 w-5.5" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-vortex-ink">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-vortex-navy/70">{f.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/* CHAPTER 3 — "The catalog never sleeps."                             */
/* Horizontal pinned scroll with category cards                        */
/* ================================================================== */

function CategoryCard({
  name,
  blurb,
  icon: Icon,
  index,
  onEnterHub,
}: {
  name: string;
  blurb: string;
  icon: LucideIcon;
  index: number;
  onEnterHub: () => void;
}) {
  const hues: [string, string][] = [
    ["#0d9488", "#06b6d4"],
    ["#10b981", "#0d9488"],
    ["#06b6d4", "#10b981"],
    ["#0d9488", "#10b981"],
    ["#1e3a5f", "#06b6d4"],
    ["#10b981", "#06b6d4"],
  ];
  const [h1, h2] = hues[index % hues.length];

  return (
    <button
      onClick={onEnterHub}
      className="group relative flex h-[46vh] min-h-[340px] w-[270px] shrink-0 flex-col justify-between overflow-hidden rounded-[2rem] p-7 text-left transition-transform duration-500 hover:-translate-y-3 focus-visible:outline-2 focus-visible:outline-vortex-teal sm:w-[310px]"
      style={{ background: `linear-gradient(160deg, ${h1}, ${h2})` }}
    >
      {/* decorative swirl */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full border-[10px] border-white/10 transition-transform duration-700 group-hover:rotate-45 group-hover:scale-125" />
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full border-[6px] border-dashed border-white/15 transition-transform duration-700 group-hover:-rotate-90" />
      <div className="pointer-events-none absolute -bottom-20 -left-14 h-52 w-52 rounded-full bg-white/8 blur-2xl transition-all duration-700 group-hover:bg-white/15" />

      <div className="relative flex items-start justify-between">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 backdrop-blur-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
          <Icon className="h-6.5 w-6.5 text-white" />
        </div>
        <span className="font-mono text-xs font-bold text-white/50">0{index + 1}</span>
      </div>

      <div className="relative">
        <h3 className="font-display text-2xl font-bold text-white sm:text-[1.7rem]">{name}</h3>
        <p className="mt-1 text-sm text-white/70">{blurb}</p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/12 px-3.5 py-1.5 text-xs font-semibold text-white/85 backdrop-blur-sm transition-all duration-300 group-hover:gap-3.5 group-hover:bg-white/22">
          Browse in Hub
          <span aria-hidden>→</span>
        </div>
      </div>
    </button>
  );
}

export function ChapterThree({ onEnterHub }: { onEnterHub: () => void }) {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: targetRef });
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 28, mass: 0.6 });
  const x = useTransform(smooth, [0, 1], ["2%", "-72%"]);
  const progressW = useTransform(scrollYProgress, [0, 1], ["4%", "100%"]);

  return (
    <section ref={targetRef} className="relative h-[340vh]">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="mx-auto mb-10 w-full max-w-7xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <SectionTag index="03" label="Always Expanding" />
              <h2 className="mt-6 font-display text-4xl font-bold leading-[1.08] tracking-tight text-vortex-ink sm:text-5xl">
                The catalog <span className="text-vortex-gradient">never sleeps.</span>
              </h2>
            </div>
            <FadeUp delay={0.1} className="max-w-xs">
              <p className="text-sm leading-relaxed text-vortex-navy/70">
                Six categories and counting — each product page is a door. Keep scrolling to fly through them, or jump straight into the Hub.
              </p>
            </FadeUp>
          </div>
        </div>

        {/* horizontal track */}
        <motion.div style={{ x }} className="flex gap-6 pl-6 sm:gap-8 lg:pl-[calc((100vw-80rem)/2+1.5rem)]">
          {/* intro card */}
          <div className="flex h-[46vh] min-h-[340px] w-[270px] shrink-0 flex-col justify-center rounded-[2rem] glass p-8 sm:w-[310px]">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-vortex-teal">fly through</p>
            <p className="mt-4 font-display text-2xl font-bold leading-snug text-vortex-ink">
              Every category, <span className="text-vortex-gradient">one vortex.</span>
            </p>
            <p className="mt-3 text-sm leading-relaxed text-vortex-navy/70">
              From SaaS dashboards to wellness platforms — scroll to glide across the whole catalog.
            </p>
            <div className="mt-6 flex items-center gap-3 text-vortex-teal">
              <div className="relative h-1 w-24 overflow-hidden rounded-full bg-vortex-teal/15">
                <div className="absolute inset-y-0 left-0 animate-vortex-marquee w-8 rounded-full bg-gradient-to-r from-teal-500 to-cyan-400" style={{ animationDuration: "2.6s" }} />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-widest">keep scrolling</span>
            </div>
          </div>

          {CATEGORIES.map((cat, i) => (
            <CategoryCard
              key={cat.name}
              name={cat.name}
              blurb={cat.blurb}
              icon={cat.icon}
              index={i}
              onEnterHub={onEnterHub}
            />
          ))}

          {/* end card */}
          <div className="flex h-[46vh] min-h-[340px] w-[270px] shrink-0 flex-col items-center justify-center gap-5 rounded-[2rem] border-2 border-dashed border-vortex-teal/30 bg-white/40 p-8 text-center sm:w-[310px]">
            <div className="animate-vortex-pulse-soft text-4xl font-display font-bold text-vortex-gradient">∞</div>
            <p className="font-display text-lg font-bold text-vortex-ink">…and growing</p>
            <button
              onClick={onEnterHub}
              className="rounded-full bg-gradient-to-r from-teal-600 to-cyan-500 px-6 py-3 font-display text-sm font-semibold text-white shadow-lg shadow-teal-500/30 transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-vortex-teal"
            >
              Enter the Hub
            </button>
          </div>
        </motion.div>

        {/* progress rail */}
        <div className="mx-auto mt-10 w-full max-w-7xl px-6">
          <div className="h-[3px] w-full overflow-hidden rounded-full bg-vortex-teal/10">
            <motion.div
              style={{ width: progressW }}
              className="h-full rounded-full bg-gradient-to-r from-teal-500 via-emerald-400 to-cyan-400"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/* STATS — count-up flip board                                         */
/* ================================================================== */

function CountUpStat({ value, suffix, label, delay }: { value: number | null; suffix: string; label: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (value === null) return;
    const controls = animate(0, value, {
      duration: 1.8,
      delay,
      ease: [0.16, 0.84, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value, delay]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, rotateX: 55, y: 40 }}
      whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.85, delay, ease: [0.2, 0.8, 0.25, 1] }}
      className="glass group relative overflow-hidden rounded-[1.8rem] p-8 text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_60px_-20px_rgba(13,148,136,0.45)]"
      style={{ transformPerspective: 800 }}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br from-teal-400/15 to-cyan-400/10 blur-xl transition-transform duration-500 group-hover:scale-150" />
      <p className="font-display text-5xl font-bold tracking-tight text-vortex-gradient sm:text-6xl">
        {value === null ? "∞" : display}
        <span className="text-3xl sm:text-4xl">{suffix}</span>
      </p>
      <p className="mt-3 font-display text-[11px] font-semibold uppercase tracking-[0.28em] text-vortex-navy/60">{label}</p>
    </motion.div>
  );
}

export function StatsSection() {
  const stats = [
    { ...STATS[0], suffix: "+" },
    { ...STATS[1], suffix: "%" },
    { ...STATS[2], suffix: "+" },
    { ...STATS[3], suffix: "" },
  ];
  return (
    <section className="relative mx-auto max-w-7xl px-6 py-24 sm:py-28">
      <div className="mb-14 text-center">
        <SectionTag index="04" label="By the numbers" />
        <h2 className="mt-6 font-display text-4xl font-bold tracking-tight text-vortex-ink sm:text-5xl">
          Proof, <span className="text-vortex-gradient">in motion.</span>
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {stats.map((s, i) => (
          <CountUpStat key={s.label} value={s.value} suffix={s.suffix} label={s.label} delay={i * 0.12} />
        ))}
      </div>
    </section>
  );
}
