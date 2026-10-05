"use client";

import { cn } from "@/lib/utils";

/**
 * The Hayp mark — an esports-grade badge.
 *
 * A sharp faceted "H" (twin blades joined by a rising crossbar — forward
 * momentum forged into the letterform) set inside a hexagonal frame —
 * the same hex language as the arcade-field lattice. Animated mode adds
 * a slowly rotating dashed reticle hex with a comet dot, like a game HUD
 * target lock.
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
  // hex frame: center (60,60), circumradius 52 → top (60,8), bottom (60,112),
  // left/right walls at x = 60 ± 45
  const frame = hexPoints(60, 60, 52);
  // outer rotating reticle hex (slightly larger, dashed)
  const reticle = hexPoints(60, 60, 55);

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
      <circle cx="60" cy="62" r="46" fill={`url(#${idPrefix}-core)`} />

      {/* rotating reticle ring — HUD target lock */}
      {showOrbit && (
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
      )}

      {/* hexagonal badge frame */}
      <path
        d={frame}
        stroke={`url(#${idPrefix}-frame)`}
        strokeWidth="2.6"
        strokeLinejoin="round"
        fill="none"
        filter={`url(#${idPrefix}-glow)`}
      />
      {/* inner frame echo — depth facet */}
      <path
        d={hexPoints(60, 60, 46)}
        stroke="#0d9488"
        strokeWidth="0.8"
        strokeLinejoin="round"
        opacity="0.22"
        fill="none"
      />

      {/* the H — twin blades joined by a rising crossbar */}
      <g filter={`url(#${idPrefix}-glow)`}>
        <path
          d="M 38 34 L 52 34 L 52 58 L 68 52 L 68 34 L 82 34 L 80 88 L 68 88 L 68 64 L 52 70 L 50 88 L 40 88 Z"
          fill={`url(#${idPrefix}-blade)`}
          strokeLinejoin="round"
        />
        {/* blade edge highlights */}
        <path
          d="M 40 36.5 L 50.5 36.5 L 50.5 57.5"
          stroke="#ccfbf1"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.5"
          fill="none"
        />
        <path
          d="M 80 36.5 L 69.5 36.5 L 69.5 51.5"
          stroke="#ccfbf1"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.5"
          fill="none"
        />
        {/* crossbar facet highlight */}
        <path
          d="M 53.5 57 L 66.5 51.5"
          stroke="#ccfbf1"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.55"
          fill="none"
        />
        {/* heart spark — the energy core at the center of the H */}
        <path
          d="M 60 55.5 L 64.8 61 L 60 66.5 L 55.2 61 Z"
          fill="#ccfbf1"
          opacity="0.95"
          filter={`url(#${idPrefix}-glow)`}
        />
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
