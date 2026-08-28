"use client";

/**
 * Ambient background — "quiet light".
 *
 * No particles, no chaos. Just three slow aurora washes drifting like
 * light through water, a fine film-grain veil, and a hairline grid that
 * fades toward the edges. It breathes; it never shouts.
 *
 * All motion is CSS-driven (GPU-composited transforms), honors
 * prefers-reduced-motion via the global animation kill-switch, and
 * costs ~zero JS.
 */
export function VortexBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* base — pure white canvas */}
      <div className="absolute inset-0 bg-[#fbfdfd]" />

      {/* aurora washes — big, soft, slow */}
      <div
        className="aurora-a absolute -left-[18%] -top-[22%] h-[75vmax] w-[75vmax] rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(13,148,136,0.14), rgba(13,148,136,0.05) 55%, transparent 72%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="aurora-b absolute -right-[20%] top-[8%] h-[65vmax] w-[65vmax] rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(6,182,212,0.11), rgba(6,182,212,0.04) 55%, transparent 72%)",
          filter: "blur(48px)",
        }}
      />
      <div
        className="aurora-c absolute bottom-[-28%] left-[12%] h-[70vmax] w-[70vmax] rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(16,185,129,0.10), rgba(16,185,129,0.035) 55%, transparent 72%)",
          filter: "blur(56px)",
        }}
      />

      {/* hairline grid — faint, fades out toward edges */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(11,46,51,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(11,46,51,0.035) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage:
            "radial-gradient(ellipse 90% 70% at 50% 40%, black 30%, transparent 78%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 70% at 50% 40%, black 30%, transparent 78%)",
        }}
      />

      {/* film grain — still texture, alive but almost imperceptible */}
      <div
        className="absolute -inset-[6%]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
          opacity: 0.028,
          animation: "grain-shift 9s steps(5) infinite",
        }}
      />

      {/* vignette — pulls the eye to the center, like a lens */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 120% 90% at 50% 45%, transparent 60%, rgba(11,46,51,0.035) 100%)",
        }}
      />
    </div>
  );
}
