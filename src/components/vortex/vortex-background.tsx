"use client";

import { useEffect, useRef } from "react";

/* ================================================================== */
/* Liquid Field — interactive metaball liquid with falling droplets.   */
/*                                                                     */
/* Big soft liquid bodies drift and shimmer; the cursor stirs the     */
/* pool and pulls the liquid toward it; ambient droplets rain down and */
/* merge into the bodies (real metaball necking); clicks burst drops   */
/* and ripple rings outward. Rendered on a low-res canvas and upscaled */
/* for buttery 60fps, layered with a hairline grid, film grain and a   */
/* soft vignette. Honors prefers-reduced-motion (renders one frame).   */
/* ================================================================== */

const SCALE = 0.14; // simulation resolution (fraction of CSS pixels)
const MAX_ALPHA = 0.5; // peak liquid opacity — pastel on white
const MAX_DROPS = 32;

type RGB = [number, number, number];

const PALETTE: RGB[] = [
  [13, 148, 136], // teal
  [16, 185, 129], // emerald
  [6, 182, 212], // cyan
  [15, 118, 110], // deep teal
  [45, 212, 191], // bright teal
];

interface Blob {
  ax: number; // anchor x (0..1)
  ay: number; // anchor y (0..1)
  relR: number; // radius as fraction of min(w,h)
  phase: number;
  speed: number;
  ampX: number;
  ampY: number;
  colorA: RGB;
  colorB: RGB;
  dripIn: number; // seconds until next drip
}

interface Drop {
  x: number;
  y: number;
  vx: number;
  vy: number;
  relR: number;
  color: RGB;
}

interface Ripple {
  x: number;
  y: number;
  r: number;
  life: number;
}

interface Body {
  x: number;
  y: number;
  r: number;
  color: RGB;
}

const BLOB_SEEDS: [number, number, number][] = [
  [0.13, 0.24, 0.34],
  [0.33, 0.62, 0.27],
  [0.52, 0.18, 0.38],
  [0.72, 0.55, 0.3],
  [0.9, 0.26, 0.24],
  [0.2, 0.88, 0.29],
  [0.84, 0.84, 0.33],
];

function lerpC(a: RGB, b: RGB, t: number): RGB {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

function LiquidCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let minDim = 0;
    let img: ImageData | null = null;

    const blobs: Blob[] = BLOB_SEEDS.map(([ax, ay, relR], i) => ({
      ax,
      ay,
      relR,
      phase: i * 1.83,
      speed: 0.05 + (i % 3) * 0.022,
      ampX: 0.03 + (i % 4) * 0.012,
      ampY: 0.035 + (i % 3) * 0.014,
      colorA: PALETTE[i % PALETTE.length],
      colorB: PALETTE[(i + 2) % PALETTE.length],
      dripIn: 3 + i * 1.3,
    }));

    const drops: Drop[] = [];
    const ripples: Ripple[] = [];

    // cursor "stirrer"
    const ptr = { tx: 0.32, ty: 0.42, x: 0.32, y: 0.42, speed: 0 };

    let rainIn = 0.4;

    const resize = () => {
      w = Math.max(2, Math.round(window.innerWidth * SCALE));
      h = Math.max(2, Math.round(window.innerHeight * SCALE));
      minDim = Math.min(w, h);
      canvas.width = w;
      canvas.height = h;
      img = ctx.createImageData(w, h);
    };
    resize();

    const onMove = (e: PointerEvent) => {
      const nx = e.clientX / window.innerWidth;
      const ny = e.clientY / window.innerHeight;
      const d = Math.hypot(nx - ptr.tx, ny - ptr.ty);
      ptr.speed = Math.min(1, ptr.speed + d * 18);
      ptr.tx = nx;
      ptr.ty = ny;
    };

    const onDown = (e: PointerEvent) => {
      if (reduced) return;
      const x = (e.clientX / window.innerWidth) * w;
      const y = (e.clientY / window.innerHeight) * h;
      ripples.push({ x, y, r: minDim * 0.04, life: 1 });
      // splash burst
      for (let i = 0; i < 7; i++) {
        const ang = (Math.PI * 2 * i) / 7 + Math.random() * 0.6;
        const sp = minDim * (0.45 + Math.random() * 0.6);
        drops.push({
          x,
          y,
          vx: Math.cos(ang) * sp,
          vy: Math.sin(ang) * sp - minDim * 0.15,
          relR: 0.042 + Math.random() * 0.032,
          color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        });
      }
      while (drops.length > MAX_DROPS) drops.shift();
    };

    const spawnRain = () => {
      drops.push({
        x: Math.random() * w,
        y: -minDim * 0.05,
        vx: (Math.random() - 0.5) * minDim * 0.06,
        vy: minDim * (0.18 + Math.random() * 0.24),
        relR: 0.05 + Math.random() * 0.035,
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      });
      while (drops.length > MAX_DROPS) drops.shift();
    };

    const update = (dt: number, t: number) => {
      // cursor spring + decay
      ptr.x += (ptr.tx - ptr.x) * Math.min(1, dt * 7);
      ptr.y += (ptr.ty - ptr.y) * Math.min(1, dt * 7);
      ptr.speed = Math.max(0, ptr.speed - dt * 1.6);

      // ambient rain
      rainIn -= dt;
      if (rainIn <= 0) {
        spawnRain();
        rainIn = 0.35 + Math.random() * 0.55;
      }

      const pullRange = Math.max(w, h) * 0.42;

      for (const b of blobs) {
        b.x = (b.ax + Math.cos(t * b.speed + b.phase) * b.ampX) * w;
        b.y = (b.ay + Math.sin(t * b.speed * 0.9 + b.phase * 1.7) * b.ampY) * h;
        b.r = b.relR * minDim * (1 + 0.05 * Math.sin(t * 0.6 + b.phase));

        // liquid leans toward the cursor when it's near
        const dx = ptr.x * w - b.x;
        const dy = ptr.y * h - b.y;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist < pullRange) {
          const f = (1 - dist / pullRange) * 0.03;
          b.x += dx * f;
          b.y += dy * f;
        }

        // occasional drip from the underside
        b.dripIn -= dt;
        if (b.dripIn <= 0) {
          b.dripIn = 2.5 + Math.random() * 3.5;
          drops.push({
            x: b.x + (Math.random() - 0.5) * b.r * 0.8,
            y: b.y + b.r * 0.82,
            vx: (Math.random() - 0.5) * minDim * 0.08,
            vy: minDim * 0.08,
            relR: 0.038 + Math.random() * 0.028,
            color: lerpC(b.colorA, b.colorB, Math.random()),
          });
        }
      }

      // droplets
      const G = minDim * 0.4;
      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        d.vy += G * dt;
        d.vx *= 1 - 0.4 * dt;
        d.x += d.vx * dt;
        d.y += d.vy * dt;

        // absorbed when sinking into a body
        let absorbed = false;
        for (const b of blobs) {
          if (Math.hypot(d.x - b.x, d.y - b.y) < b.r * 0.7) {
            absorbed = true;
            break;
          }
        }
        if (absorbed || d.y > h * 1.18 || d.x < -w * 0.2 || d.x > w * 1.2) {
          if (absorbed && Math.random() < 0.6) {
            ripples.push({ x: d.x, y: d.y, r: minDim * 0.03, life: 0.6 });
          }
          drops.splice(i, 1);
        }
      }

      // ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.r += minDim * 0.85 * dt;
        r.life -= dt * 1.15;
        if (r.life <= 0) ripples.splice(i, 1);
      }
    };

    const render = (t: number) => {
      if (!img) return;
      const data = img.data;

      // live bodies this frame
      const bodies: Body[] = [];
      for (const b of blobs) {
        bodies.push({
          x: b.x,
          y: b.y,
          r: b.r,
          color: lerpC(b.colorA, b.colorB, (Math.sin(t * 0.05 + b.phase) + 1) / 2),
        });
      }
      // cursor stirrer
      bodies.push({
        x: ptr.x * w,
        y: ptr.y * h,
        r: minDim * (0.13 + ptr.speed * 0.18),
        color: [6, 182, 212],
      });
      for (const d of drops) {
        bodies.push({ x: d.x, y: d.y, r: d.relR * minDim, color: d.color });
      }

      const n = bodies.length;
      for (let py = 0; py < h; py++) {
        for (let px = 0; px < w; px++) {
          let f = 0;
          let cr = 0;
          let cg = 0;
          let cb = 0;
          for (let i = 0; i < n; i++) {
            const b = bodies[i];
            const dx = px - b.x;
            const dy = py - b.y;
            const wgt = (b.r * b.r) / (dx * dx + dy * dy + 1);
            f += wgt;
            cr += wgt * b.color[0];
            cg += wgt * b.color[1];
            cb += wgt * b.color[2];
          }
          const idx = (py * w + px) * 4;
          if (f > 0.72) {
            const tt = Math.min(1, (f - 0.72) / 0.65);
            const s = tt * tt * (3 - 2 * tt); // smoothstep edge
            const depth = 0.78 + 0.22 * Math.min(1, (f - 0.72) / 2.2);
            const a = s * MAX_ALPHA * depth;
            data[idx] = cr / f;
            data[idx + 1] = cg / f;
            data[idx + 2] = cb / f;
            data[idx + 3] = a * 255;
          } else {
            data[idx + 3] = 0;
          }
        }
      }
      ctx.putImageData(img, 0, 0);

      // ripple rings on top
      if (ripples.length) {
        ctx.lineWidth = 1.4;
        for (const r of ripples) {
          ctx.strokeStyle = `rgba(13,148,136,${(r.life * 0.5).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
          ctx.stroke();
          // inner echo ring for depth
          if (r.r > minDim * 0.12) {
            ctx.strokeStyle = `rgba(6,182,212,${(r.life * 0.28).toFixed(3)})`;
            ctx.beginPath();
            ctx.arc(r.x, r.y, r.r * 0.55, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      }
    };

    let raf = 0;
    let running = !reduced;
    let last = performance.now();

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      update(dt, now / 1000);
      render(now / 1000);
      if (running) raf = requestAnimationFrame(frame);
    };

    const onResize = () => resize();
    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!reduced) {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };

    if (reduced) {
      // one still frame — liquid present, nothing moving
      update(0.016, 1.5);
      render(1.5);
    } else {
      raf = requestAnimationFrame(frame);
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerdown", onDown, { passive: true });
    }
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      style={{ filter: "blur(3px)" }}
      aria-hidden="true"
    />
  );
}

/* ------------------------------------------------------------------ */
/* The full ambient stack                                              */
/* ------------------------------------------------------------------ */
export function VortexBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* base — near-white canvas */}
      <div className="absolute inset-0 bg-[#fbfdfd]" />

      {/* interactive liquid + droplets */}
      <LiquidCanvas />

      {/* hairline grid — faint, fades out toward edges */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(11,46,51,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(11,46,51,0.03) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage:
            "radial-gradient(ellipse 90% 70% at 50% 40%, black 30%, transparent 78%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 70% at 50% 40%, black 30%, transparent 78%)",
        }}
      />

      {/* film grain */}
      <div
        className="absolute -inset-[6%]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
          opacity: 0.028,
          animation: "grain-shift 9s steps(5) infinite",
        }}
      />

      {/* vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 120% 90% at 50% 45%, transparent 60%, rgba(11,46,51,0.04) 100%)",
        }}
      />
    </div>
  );
}
