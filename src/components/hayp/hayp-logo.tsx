"use client";

import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";

/**
 * The Hayp mark — an esports-grade badge.
 *
 * A wide, confident letter "H" custom-cut for the hexagon: two chamfered
 * stems (the 45° cuts echo the hex's pointed geometry) welded by a level
 * crossbar that seats 3 units into each stem — one forged piece, no
 * hairline joints. A bright diamond spark sits at its heart.
 *
 * On mount the letter forges itself: the left stem drops in, the right
 * stem rises to meet it, the crossbar sweeps across, and the spark pings.
 * The hex frame draws itself around the finished letter. All of it honors
 * prefers-reduced-motion and the `animated` flag.
 */

/** Pointy-top hexagon path centered at (cx, cy) with circumradius R */
function hexPoints(cx: number, cy: number, R: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    // start at top vertex, go clockwise
    const a = (Math.PI / 3) * i - Math.PI / 2;
    pts.push(`${(cx + R * Math.cos(a)).toFixed(2)}, ${(cy + R * Math.sin(a)).toFixed(2)}`);
  }
  return `M ${pts.join(" L ")} Z`;
}

/* --- the letterform, drawn for the 120×120 canvas ------------------- */
/* Letter box: x 33→87 (54 wide), y 31→89 (58 tall) — a wide stance that
   fills the badge. Stems 17 wide, counter 20, crossbar 13 thick seated
   at the optical center (y 53→66), welded 3 units into each stem.      */

const STEM_L = "M 38 31 L 50 31 L 50 89 L 38 89 L 33 84 L 33 36 Z";
const STEM_R = "M 82 31 L 87 36 L 87 84 L 82 89 L 70 89 L 70 31 Z";
const CROSSBAR = "M 47 53 L 73 53 L 73 66 L 47 66 Z";
const SPARK = "M 60 53.5 L 65 59.5 L 60 65.5 L 55 59.5 Z";

/* machined facet highlights — light catching the inner edges */
const HL_STEM_L = "M 48.3 36.5 L 48.3 83.5";
const HL_STEM_R = "M 71.7 36.5 L 71.7 83.5";
const HL_BAR = "M 48.5 54.7 L 71.5 54.7";

interface HaypMarkProps {
  size?: number;
  animated?: boolean;
  showOrbit?: boolean;
  className?: string;
  idPrefix?: string;
}

export function HaypMark({
  size = 64,
  animated = true,
  showOrbit = true,
  className,
  idPrefix = "hp",
}: HaypMarkProps) {
  const reduce = useReducedMotion();
  const build = animated && !reduce; // one-time forge-in; false = render final state

  // hex frame: center (60,60), circumradius 52; rotating reticle slightly larger
  const frame = hexPoints(60, 60, 52);
  const reticle = hexPoints(60, 60, 55);

  const spring = { type: "spring" as const, stiffness: 240, damping: 22 };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("select-none", className)}
      role="img"
      aria-label="Hayp Studios logo"
    >
      <defs>
        {/* blade fill — teal forging into cyan edge */}
        <linearGradient id={`${idPrefix}-blade`} x1="30" y1="26" x2="92" y2="98" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0f766e" />
          <stop offset="0.45" stopColor="#0d9488" />
          <stop offset="0.75" stopColor="#10b981" />
          <stop offset="1" stopColor="#06b6d4" />
        </linearGradient>
        {/* frame stroke — emerald into cyan */}
        <linearGradient id={`${idPrefix}-frame`} x1="15" y1="8" x2="105" y2="112" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0d9488" />
          <stop offset="0.5" stopColor="#10b981" />
          <stop offset="1" stopColor="#06b6d4" />
        </linearGradient>
        {/* inner aura */}
        <radialGradient id={`${idPrefix}-core`} cx="0.5" cy="0.62" r="0.55">
          <stop offset="0" stopColor="#10b981" stopOpacity="0.5" />
          <stop offset="0.65" stopColor="#0d9488" stopOpacity="0.14" />
          <stop offset="1" stopColor="#0d9488" stopOpacity="0" />
        </radialGradient>
        <filter id={`${idPrefix}-glow`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* soft energy aura behind the badge */}
      <motion.circle
        cx="60"
        cy="62"
        r="46"
        fill={`url(#${idPrefix}-core)`}
        initial={build ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.6 }}
      />

      {/* rotating reticle ring — HUD target lock */}
      {showOrbit && (
        <motion.g
          initial={build ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.5 }}
        >
          <g
            className={animated ? "hayp-rot-cw" : undefined}
            style={{ transformOrigin: "60px 60px" }}
          >
            <path
              d={reticle}
              stroke="#0d9488"
              strokeWidth="1.1"
              strokeDasharray="1.5 7"
              strokeLinecap="round"
              opacity="0.55"
              fill="none"
            />
            {/* comet dot riding the reticle */}
            <circle cx="60" cy="5" r="2.8" fill="#06b6d4" stroke="none" filter={`url(#${idPrefix}-glow)`} />
            <circle cx="60" cy="5" r="1.3" fill="#ccfbf1" stroke="none" />
          </g>
        </motion.g>
      )}

      {/* hexagonal badge frame — draws itself around the letter */}
      <motion.path
        d={frame}
        stroke={`url(#${idPrefix}-frame)`}
        strokeWidth="2.6"
        strokeLinejoin="round"
        fill="none"
        filter={`url(#${idPrefix}-glow)`}
        initial={build ? { pathLength: 0, opacity: 0 } : false}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ pathLength: { duration: 1.05, ease: "easeInOut" }, opacity: { duration: 0.3 } }}
      />
      {/* inner frame echo — depth facet */}
      <motion.path
        d={hexPoints(60, 60, 46)}
        stroke="#0d9488"
        strokeWidth="0.8"
        strokeLinejoin="round"
        opacity="0.22"
        fill="none"
        initial={build ? { opacity: 0 } : false}
        animate={{ opacity: 0.22 }}
        transition={{ delay: 0.55, duration: 0.5 }}
      />

      {/* the H — forged piece by piece */}
      <g filter={`url(#${idPrefix}-glow)`}>
        {/* left stem — drops in from above */}
        <motion.g
          initial={build ? { opacity: 0, y: -18 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.05 }}
        >
          <path d={STEM_L} fill={`url(#${idPrefix}-blade)`} strokeLinejoin="round" />
          <path d={HL_STEM_L} stroke="#ccfbf1" strokeWidth="1.4" strokeLinecap="round" opacity="0.45" fill="none" />
        </motion.g>

        {/* right stem — rises from below */}
        <motion.g
          initial={build ? { opacity: 0, y: 18 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.15 }}
        >
          <path d={STEM_R} fill={`url(#${idPrefix}-blade)`} strokeLinejoin="round" />
          <path d={HL_STEM_R} stroke="#ccfbf1" strokeWidth="1.4" strokeLinecap="round" opacity="0.45" fill="none" />
        </motion.g>

        {/* crossbar — sweeps across the joint */}
        <motion.g
          initial={build ? { opacity: 0, scaleX: 0 } : false}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.34 }}
          style={{ transformOrigin: "47px 59.5px" }}
        >
          <path d={CROSSBAR} fill={`url(#${idPrefix}-blade)`} strokeLinejoin="round" />
          <path d={HL_BAR} stroke="#ccfbf1" strokeWidth="1.4" strokeLinecap="round" opacity="0.5" fill="none" />
        </motion.g>

        {/* heart spark — the energy core, pings awake */}
        <motion.g
          initial={build ? { opacity: 0, scale: 0 } : false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 420, damping: 15, delay: 0.58 }}
          style={{ transformOrigin: "60px 59.5px" }}
        >
          <path d={SPARK} fill="#ccfbf1" opacity="0.95" filter={`url(#${idPrefix}-glow)`} />
        </motion.g>

        {/* one-shot ping ring radiating from the heart */}
        {build && (
          <motion.circle
            cx="60"
            cy="59.5"
            r="7"
            fill="none"
            stroke="#ccfbf1"
            strokeWidth="1.2"
            initial={{ scale: 0.3, opacity: 0.85 }}
            animate={{ scale: 2.4, opacity: 0 }}
            transition={{ delay: 0.7, duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: "60px 59.5px" }}
          />
        )}
      </g>
    </svg>
  );
}

interface HaypWordmarkProps {
  size?: "sm" | "md" | "lg" | "hero";
  animated?: boolean;
  className?: string;
}

/**
 * Full wordmark: [H badge] + gradient "ayp" with ".studio" set below.
 */
export function HaypWordmark({ size = "md", animated = true, className }: HaypWordmarkProps) {
  const markSize = { sm: 34, md: 46, lg: 60, hero: 132 }[size];
  const textClass = {
    sm: "text-[1.35rem]",
    md: "text-[1.9rem]",
    lg: "text-[2.6rem]",
    hero: "text-[5.4rem] sm:text-[7rem] lg:text-[8.6rem]",
  }[size];
  const subClass = {
    sm: "text-[0.6rem] tracking-[0.32em]",
    md: "text-[0.72rem] tracking-[0.38em]",
    lg: "text-[0.85rem] tracking-[0.42em]",
    hero: "text-[0.95rem] sm:text-[1.15rem] lg:text-[1.3rem] tracking-[0.55em]",
  }[size];

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <HaypMark
        size={markSize}
        animated={animated}
        showOrbit={size === "hero" || size === "lg" || size === "md"}
        idPrefix={`wm-${size}`}
      />
      <div className="flex flex-col items-start -ml-1">
        <span
          className={cn(
            "font-display font-bold leading-[0.95] tracking-tight text-hayp-gradient",
            textClass
          )}
        >
          ayp
        </span>
        <span className={cn("font-display font-medium text-hayp-navy/70 uppercase", subClass)}>
          .studio
        </span>
      </div>
    </div>
  );
}
