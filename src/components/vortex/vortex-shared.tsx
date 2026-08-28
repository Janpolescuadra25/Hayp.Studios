"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";

/** Signature easing — long, confident settle (used everywhere) */
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* ------------------------------------------------------------------ */
/* FadeUp — the standard reveal: 24px rise + fade, 0.9s, once          */
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
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* MaskedLine — headline line rising from behind a mask (the ad move)  */
/* ------------------------------------------------------------------ */
export function MaskedLine({
  children,
  delay = 0,
  className,
  innerClassName,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  innerClassName?: string;
}) {
  return (
    <span className={cn("block overflow-hidden pb-[0.08em] -mb-[0.08em]", className)}>
      <motion.span
        className={cn("block will-change-transform", innerClassName)}
        initial={{ y: "112%" }}
        whileInView={{ y: "0%" }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 1.1, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* SectionTag — editorial chapter label:  01 / THE STUDIO  ————        */
/* ------------------------------------------------------------------ */
export function SectionTag({
  index,
  label,
  className,
  tone = "light",
}: {
  index: string;
  label: string;
  className?: string;
  tone?: "light" | "dark";
}) {
  return (
    <FadeUp className={cn("flex items-center gap-4", className)} amount={0.8}>
      <span
        className={cn(
          "label-editorial",
          tone === "light" ? "text-vortex-teal" : "text-teal-300"
        )}
      >
        {index}
      </span>
      <span
        className={cn(
          "h-px w-12",
          tone === "light" ? "bg-vortex-ink/20" : "bg-white/25"
        )}
      />
      <span
        className={cn(
          "label-editorial",
          tone === "light" ? "text-vortex-ink/55" : "text-white/60"
        )}
      >
        {label}
      </span>
    </FadeUp>
  );
}

/* ------------------------------------------------------------------ */
/* Word — one word of a scroll-illuminated statement                   */
/* ------------------------------------------------------------------ */
function Word({
  children,
  progress,
  range,
  accent = false,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
  accent?: boolean;
}) {
  const opacity = useTransform(progress, range, [0.13, 1]);
  const y = useTransform(progress, range, [8, 0]);
  return (
    <motion.span
      style={{ opacity, y }}
      className={cn(
        "inline-block will-change-transform",
        accent && "text-vortex-gradient"
      )}
    >
      {children}
    </motion.span>
  );
}

/* ------------------------------------------------------------------ */
/* WordIlluminate — statement whose words light up as you scroll       */
/* through the pinned section. The Apple-keynote move, done quietly.  */
/* ------------------------------------------------------------------ */
export function WordIlluminate({
  text,
  progress,
  start = 0.12,
  end = 0.78,
  accentWords = [],
  className,
}: {
  text: string;
  progress: MotionValue<number>;
  start?: number;
  end?: number;
  /** words rendered in the brand gradient (matched case-insensitively) */
  accentWords?: string[];
  className?: string;
}) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((word, i) => {
        const clean = word.replace(/[^a-zA-Z]/g, "").toLowerCase();
        const accent = accentWords.some((w) => w.toLowerCase() === clean);
        return (
          <span key={i}>
            <Word
              progress={progress}
              range={[start + (i / words.length) * (end - start), start + ((i + 1) / words.length) * (end - start)]}
              accent={accent}
            >
              {word}
            </Word>{" "}
          </span>
        );
      })}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Magnetic — element gently leans toward the cursor (max ~7px)        */
/* ------------------------------------------------------------------ */
export function Magnetic({
  children,
  className,
  strength = 7,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 180, damping: 16, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 180, damping: 16, mass: 0.4 });

  return (
    <motion.div
      ref={ref}
      className={cn("inline-block", className)}
      style={{ x: sx, y: sy }}
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        const px = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        const py = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        x.set(px * strength);
        y.set(py * strength);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* useParallax — tiny helper: returns a springy y offset for a         */
/* scroll progress value.                                             */
/* ------------------------------------------------------------------ */
export function useParallax(
  progress: MotionValue<number>,
  distance: number
): MotionValue<number> {
  const raw = useTransform(progress, [0, 1], [distance, -distance]);
  return useSpring(raw, { stiffness: 60, damping: 20 });
}
