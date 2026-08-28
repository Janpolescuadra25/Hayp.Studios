"use client";

import { cn } from "@/lib/utils";

/**
 * The Vortex mark — an esports-grade badge.
 *
 * A sharp faceted "V" (twin blades meeting in a point) forged inside a
 * hexagonal frame — the same hex language as the arcade-field lattice.
 * Animated mode adds a slowly rotating dashed reticle hex with a comet
 * dot, like a game HUD target lock.
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

interface VortexMarkProps {
  size?: number;
  animated?: boolean;
  showOrbit?: boolean;
  className?: string;
  idPrefix?: string;
}

export function VortexMark({
  size = 64,
  animated = true,
  showOrbit = true,
  className,
  idPrefix = "vx",
}: VortexMarkProps) {
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
      aria-label="Vortex Studios logo"
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
          className={animated ? "vortex-rot-cw" : undefined}
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

      {/* the V — twin blades forged to a point */}
      <g filter={`url(#${idPrefix}-glow)`}>
        <path
          d="M 32 34 L 48 34 L 60 72 L 72 34 L 88 34 L 65.5 94 L 54.5 94 Z"
          fill={`url(#${idPrefix}-blade)`}
          strokeLinejoin="round"
        />
        {/* center facet seam */}
        <path
          d="M 60 72 L 60 94"
          stroke="#ccfbf1"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.4"
        />
        {/* blade edge highlights */}
        <path
          d="M 34 36 L 47 36 L 59 71"
          stroke="#ccfbf1"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.5"
          fill="none"
        />
        <path
          d="M 86 36 L 73 36 L 61 71"
          stroke="#ccfbf1"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.5"
          fill="none"
        />
        {/* apex spark */}
        <path d="M 60 100 L 63.4 104.5 L 60 109 L 56.6 104.5 Z" fill="#06b6d4" opacity="0.85" />
      </g>
    </svg>
  );
}

interface VortexWordmarkProps {
  size?: "sm" | "md" | "lg" | "hero";
  animated?: boolean;
  className?: string;
}

/**
 * Full wordmark: [V badge] + gradient "ortex" with ".studio" set below.
 */
export function VortexWordmark({ size = "md", animated = true, className }: VortexWordmarkProps) {
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
      <VortexMark
        size={markSize}
        animated={animated}
        showOrbit={size === "hero" || size === "lg" || size === "md"}
        idPrefix={`wm-${size}`}
      />
      <div className="flex flex-col items-start -ml-1">
        <span
          className={cn(
            "font-display font-bold leading-[0.95] tracking-tight text-vortex-gradient",
            textClass
          )}
        >
          ortex
        </span>
        <span className={cn("font-display font-medium text-vortex-navy/70 uppercase", subClass)}>
          .studio
        </span>
      </div>
    </div>
  );
}
