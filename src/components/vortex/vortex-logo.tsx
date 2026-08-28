"use client";

import { cn } from "@/lib/utils";

/**
 * Generates a logarithmic-ish spiral path centered at (cx, cy).
 * Radius grows from startR to endR over `turns` full rotations.
 */
function spiralPath(
  cx: number,
  cy: number,
  turns = 2.4,
  startR = 2.5,
  endR = 20,
  dir = 1
): string {
  const steps = 140;
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const angle = dir * t * turns * Math.PI * 2 - Math.PI / 2;
    const r = startR * Math.pow(endR / startR, t);
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    pts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return pts.join(" ");
}

/** Splits the spiral into tapered segments (thin at center → thick at outer edge) */
function spiralSegments(
  cx: number,
  cy: number,
  segments = 10,
  turns = 2.4,
  startR = 2.5,
  endR = 20,
  dir = 1
): { d: string; width: number }[] {
  const segs: { d: string; width: number }[] = [];
  const steps = 140;
  for (let s = 0; s < segments; s++) {
    const i0 = Math.floor((s / segments) * steps);
    const i1 = Math.floor(((s + 1) / segments) * steps);
    const pts: string[] = [];
    for (let i = i0; i <= i1; i++) {
      const t = i / steps;
      const angle = dir * t * turns * Math.PI * 2 - Math.PI / 2;
      const r = startR * Math.pow(endR / startR, t);
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      pts.push(`${i === i0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`);
    }
    const width = 1.1 + 5.2 * (s / (segments - 1));
    segs.push({ d: pts.join(" "), width });
  }
  return segs;
}

interface VortexMarkProps {
  size?: number;
  animated?: boolean;
  showOrbit?: boolean;
  className?: string;
  idPrefix?: string;
}

/**
 * The Vortex mark — a bold curved "V" whose arms curl into a rotating
 * tapered spiral (the vortex), wrapped in two counter-rotating orbit rings.
 */
export function VortexMark({
  size = 64,
  animated = true,
  showOrbit = true,
  className,
  idPrefix = "vx",
}: VortexMarkProps) {
  const spiral = spiralSegments(60, 37, 10, 2.35, 2.5, 20.5, 1);
  void spiralPath;

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
        <linearGradient id={`${idPrefix}-arm`} x1="8" y1="10" x2="112" y2="104" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0d9488" />
          <stop offset="0.5" stopColor="#10b981" />
          <stop offset="1" stopColor="#06b6d4" />
        </linearGradient>
        <linearGradient id={`${idPrefix}-spiral`} x1="40" y1="17" x2="80" y2="57" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#06b6d4" />
          <stop offset="0.55" stopColor="#10b981" />
          <stop offset="1" stopColor="#0d9488" />
        </linearGradient>
        <radialGradient id={`${idPrefix}-core`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#10b981" stopOpacity="0.55" />
          <stop offset="0.6" stopColor="#0d9488" stopOpacity="0.16" />
          <stop offset="1" stopColor="#0d9488" stopOpacity="0" />
        </radialGradient>
        <filter id={`${idPrefix}-glow`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* soft vortex aura */}
      <circle cx="60" cy="37" r="34" fill={`url(#${idPrefix}-core)`} />

      {/* orbit rings */}
      {showOrbit && (
        <g stroke="#0d9488" fill="none" opacity="0.5">
          <g
            className={animated ? "vortex-rot-cw" : undefined}
            style={{ transformOrigin: "60px 60px" }}
          >
            <circle cx="60" cy="60" r="53" strokeWidth="1.1" strokeDasharray="1.5 6" strokeLinecap="round" opacity="0.6" />
            <circle cx="60" cy="7" r="2.8" fill="#06b6d4" stroke="none" filter={`url(#${idPrefix}-glow)`} />
            <circle cx="60" cy="7" r="1.3" fill="#ccfbf1" stroke="none" />
          </g>
          <g
            className={animated ? "vortex-rot-ccw" : undefined}
            style={{ transformOrigin: "60px 60px" }}
          >
            <circle cx="60" cy="60" r="45" strokeWidth="1" strokeDasharray="2 9" strokeLinecap="round" opacity="0.4" />
            <circle cx="105" cy="60" r="1.8" fill="#10b981" stroke="none" opacity="0.9" />
          </g>
        </g>
      )}

      {/* the V arms — curved as if drawn into the vortex */}
      <g
        stroke={`url(#${idPrefix}-arm)`}
        strokeWidth="11"
        strokeLinecap="round"
        fill="none"
      >
        <path d="M 24 20 C 31 48, 45 74, 63 97" />
        <path d="M 96 20 C 89 48, 75 74, 57 97" />
      </g>
      {/* arm inner highlight */}
      <g
        stroke="#ccfbf1"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      >
        <path d="M 26 24 C 33 50, 46 74, 62 92" />
        <path d="M 94 24 C 87 50, 74 74, 58 92" />
      </g>

      {/* the vortex spiral */}
      <g
        filter={`url(#${idPrefix}-glow)`}
        className={animated ? "vortex-rot-cw-slow" : undefined}
        style={{ transformOrigin: "60px 37px" }}
      >
        {spiral.map((seg, i) => (
          <path
            key={i}
            d={seg.d}
            stroke={`url(#${idPrefix}-spiral)`}
            strokeWidth={seg.width}
            strokeLinecap="round"
            fill="none"
          />
        ))}
        <circle cx="60" cy="37" r="2.2" fill="#0d9488" />
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
 * Full wordmark: [V mark] + gradient "ortex" with ".studio" set below.
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
