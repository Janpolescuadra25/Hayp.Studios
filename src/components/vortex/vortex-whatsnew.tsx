"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import {
  Rocket,
  RefreshCw,
  Megaphone,
  Trophy,
  Newspaper,
} from "lucide-react";
import { CHANGELOG, type ChangelogKind } from "@/lib/vortex-data";
import { cn } from "@/lib/utils";

const KIND_STYLE: Record<
  ChangelogKind,
  { icon: typeof Rocket; label: string; hue: string; ring: string }
> = {
  launch: { icon: Rocket, label: "Launch", hue: "#0d9488", ring: "bg-teal-500" },
  update: { icon: RefreshCw, label: "Update", hue: "#06b6d4", ring: "bg-cyan-500" },
  announcement: { icon: Megaphone, label: "Announcement", hue: "#10b981", ring: "bg-emerald-500" },
  milestone: { icon: Trophy, label: "Milestone", hue: "#1e3a5f", ring: "bg-vortex-navy" },
};

function TimelineEntry({
  entry,
  index,
}: {
  entry: (typeof CHANGELOG)[number];
  index: number;
}) {
  const kind = KIND_STYLE[entry.kind];
  const left = index % 2 === 0;
  const date = new Date(entry.date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <motion.li
      initial={{ opacity: 0, x: left ? -60 : 60, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.75, ease: [0.22, 0.8, 0.28, 1] }}
      className={cn(
        "relative flex w-full gap-6 pl-16 md:w-1/2 md:gap-0 md:pl-0",
        left ? "md:mr-auto md:pr-14 md:text-right" : "md:ml-auto md:pl-14"
      )}
    >
      {/* node on the spine */}
      <span
        className={cn(
          "absolute top-6 grid h-11 w-11 place-items-center rounded-2xl text-white shadow-lg md:top-7",
          kind.ring,
          left
            ? "left-0 md:left-auto md:-right-[22px]"
            : "left-0 md:-left-[22px]"
        )}
        style={{ boxShadow: `0 12px 28px -8px ${kind.hue}88` }}
      >
        <kind.icon className="h-5 w-5" />
      </span>

      {/* connector to spine (mobile) */}
      <span className="absolute left-[44px] top-10 h-px w-5 bg-gradient-to-r from-vortex-teal/50 to-transparent md:hidden" />

      <div className="glass-strong group flex-1 rounded-[1.6rem] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-22px_rgba(13,148,136,0.45)]">
        <div className={cn("flex items-center gap-3", left && "md:flex-row-reverse")}>
          <span
            className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white"
            style={{ background: kind.hue }}
          >
            {kind.label}
          </span>
          <span className="font-mono text-[11px] text-vortex-navy/50">{date}</span>
          {entry.version && (
            <span className="rounded-full border border-vortex-teal/25 bg-vortex-foam px-2 py-0.5 font-mono text-[10px] font-semibold text-vortex-teal">
              {entry.version}
            </span>
          )}
        </div>
        <h3 className="mt-3.5 font-display text-xl font-bold leading-snug text-vortex-ink transition-colors group-hover:text-vortex-teal">
          {entry.title}
        </h3>
        <p className={cn("mt-2 text-sm leading-relaxed text-vortex-navy/70", left && "md:ml-auto")}>
          {entry.body}
        </p>
      </div>
    </motion.li>
  );
}

export function VortexWhatsNew() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.72", "end 0.65"],
  });
  const spineScale = useSpring(scrollYProgress, { stiffness: 90, damping: 26 });

  return (
    <main className="relative mx-auto max-w-5xl px-6 pb-28 pt-32 sm:pt-36">
      {/* header */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 0.8, 0.28, 1] }}
          className="inline-flex items-center gap-2.5 rounded-full glass px-4 py-1.5"
        >
          <Newspaper className="h-3.5 w-3.5 text-vortex-teal" />
          <span className="font-display text-[11px] font-medium uppercase tracking-[0.22em] text-vortex-navy/80">
            Changelog &amp; milestones
          </span>
        </motion.div>
        <motion.h1
          className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight text-vortex-ink sm:text-6xl"
          initial={{ opacity: 0, y: 34 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 0.8, 0.28, 1] }}
        >
          What&apos;s <span className="text-vortex-gradient">New.</span>
        </motion.h1>
        <motion.p
          className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-vortex-navy/70"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 0.8, 0.28, 1] }}
        >
          Every launch, update and milestone from inside the studio — from the
          day the vortex first spun up to what shipped this month.
        </motion.p>
      </div>

      {/* timeline */}
      <div ref={ref} className="relative mt-16 sm:mt-20">
        {/* spine */}
        <div className="absolute bottom-0 left-[22px] top-0 w-[2.5px] rounded-full bg-vortex-teal/10 md:left-1/2 md:-translate-x-1/2">
          <motion.div
            style={{ scaleY: spineScale }}
            className="h-full w-full origin-top rounded-full bg-gradient-to-b from-teal-500 via-emerald-400 to-cyan-400"
          />
        </div>

        <ol className="relative space-y-10 md:space-y-14">
          {CHANGELOG.map((entry, i) => (
            <TimelineEntry key={entry.id} entry={entry} index={i} />
          ))}

          {/* tail */}
          <motion.li
            initial={{ opacity: 0, scale: 0.7 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, type: "spring", bounce: 0.4 }}
            className="relative pl-16 md:pl-0 md:text-center"
          >
            <span className="absolute left-[11px] top-1 grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-teal-600 to-cyan-500 text-white shadow-[0_14px_35px_-8px_rgba(13,148,136,0.7)] md:left-1/2 md:-translate-x-1/2">
              <span className="font-display text-lg font-bold">V</span>
            </span>
            <div className="pt-2 md:pt-16">
              <p className="font-display text-lg font-bold text-vortex-ink">The vortex keeps spinning…</p>
              <p className="mt-1 text-sm text-vortex-navy/60">Next update drops soon. Stay in the loop.</p>
            </div>
          </motion.li>
        </ol>
      </div>
    </main>
  );
}
