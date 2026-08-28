"use client";

import { useEffect, useRef } from "react";

/* ================================================================== */
/*  NEON ARCADE FIELD                                                  */
/*  A white-void arena that behaves like a game board.                 */
/*                                                                     */
/*  • Hexagonal strategy lattice — the arena floor                     */
/*  • Neon light streaks sweep the void in long clean arcs with        */
/*    glowing afterglow and occasional nitro boosts                    */
/*  • Hex cells ignite under every streak — the board powers up        */
/*  • Pixel sparks (rotating diamonds) scatter off the streaks         */
/*  • Click / tap casts a shockwave that ignites cells in a radial     */
/*    wave, MOBA-ability style                                         */
/*                                                                     */
/*  Two canvases: a static lattice layer (redrawn only on resize) and  */
/*  a dynamic layer whose streaks are faded each frame with            */
/*  destination-out compositing — silky neon afterglow on the white    */
/*  base for free. Honors prefers-reduced-motion (one composed still   */
/*  frame) and pauses when the tab is hidden.                          */
/* ================================================================== */

type RGB = [number, number, number];

const PALETTE: RGB[] = [
  [13, 148, 136], // teal
  [16, 185, 129], // emerald
  [6, 182, 212], // cyan
  [15, 118, 110], // deep teal
  [45, 212, 191], // bright teal
];

const rgba = (c: RGB, a: number) => `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${a})`;

const SQRT3 = Math.sqrt(3);

/* ---------------- flat-top hex math ---------------- */

function hexRound(qf: number, rf: number): [number, number] {
  const sf = -qf - rf;
  let q = Math.round(qf);
  let r = Math.round(rf);
  const s = Math.round(sf);
  const dq = Math.abs(q - qf);
  const dr = Math.abs(r - rf);
  const ds = Math.abs(s - sf);
  if (dq > dr && dq > ds) q = -r - s;
  else if (dr > ds) r = -q - s;
  return [q, r];
}

function axialToPixel(q: number, r: number, s: number): [number, number] {
  return [1.5 * s * q, SQRT3 * s * (r + q / 2)];
}

function pixelToAxial(x: number, y: number, s: number): [number, number] {
  return hexRound(((2 / 3) * x) / s, (-x / 3 + (SQRT3 / 3) * y) / s);
}

function hexPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  ctx.moveTo(cx + s, cy);
  for (let i = 1; i < 6; i++) {
    const a = (Math.PI / 3) * i;
    ctx.lineTo(cx + s * Math.cos(a), cy + s * Math.sin(a));
  }
  ctx.closePath();
}

/* ---------------- entities ---------------- */

interface Racer {
  x: number;
  y: number;
  px: number;
  py: number;
  heading: number;
  speedF: number; // fraction of minDim per second
  turn: number;
  seed: number;
  color: RGB;
  coreW: number;
  haloW: number;
  boost: number; // remaining boost seconds
  cooldown: number;
  sparkIn: number;
}
interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  size: number;
  life: number;
  color: RGB;
}

interface Wave {
  x: number;
  y: number;
  r: number;
  life: number;
}

interface Pulse {
  cx: number;
  cy: number;
  i: number;
  color: RGB;
}

const SPEEDS = [0.26, 0.16, 0.22, 0.15, 0.24];

const angDelta = (from: number, to: number) => {
  let d = (to - from) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
};

export function VortexBackground() {
  const latticeRef = useRef<HTMLCanvasElement>(null);
  const dynRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const lattice = latticeRef.current;
    const dyn = dynRef.current;
    if (!lattice || !dyn) return;
    const lctx = lattice.getContext("2d");
    const dctx = dyn.getContext("2d");
    if (!lctx || !dctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let minDim = 0;
    let hex = 26;
    let dpr = 1;

    const racers: Racer[] = [];
    const sparks: Spark[] = [];
    const waves: Wave[] = [];
    const pulses = new Map<string, Pulse>();

    /* ---------------- setup ---------------- */

    const makeRacer = (i: number): Racer => {
      const r: Racer = {
        x: 0,
        y: 0,
        px: 0,
        py: 0,
        heading: 0,
        speedF: SPEEDS[i % SPEEDS.length],
        turn: 0.28 + Math.random() * 0.3,
        seed: Math.random() * 100,
        color: PALETTE[i % PALETTE.length],
        coreW: i % 2 === 0 ? 2.2 : 3,
        haloW: i % 2 === 0 ? 9 : 13,
        boost: 0,
        cooldown: 2 + Math.random() * 6,
        sparkIn: Math.random(),
      };
      return r;
    };

    const respawn = (r: Racer) => {
      const side = Math.floor(Math.random() * 4);
      if (side === 0) {
        r.x = -70;
        r.y = Math.random() * h;
      } else if (side === 1) {
        r.x = w + 70;
        r.y = Math.random() * h;
      } else if (side === 2) {
        r.x = Math.random() * w;
        r.y = -70;
      } else {
        r.x = Math.random() * w;
        r.y = h + 70;
      }
      const tx = w * (0.2 + Math.random() * 0.6);
      const ty = h * (0.2 + Math.random() * 0.6);
      r.heading = Math.atan2(ty - r.y, tx - r.x);
      r.px = r.x;
      r.py = r.y;
    };

    const buildLattice = () => {
      lctx.clearRect(0, 0, w, h);
      // full hexes at half alpha — shared edges land at the intended strength
      lctx.strokeStyle = "rgba(30, 58, 95, 0.03)";
      lctx.lineWidth = 1;
      const qMin = Math.floor(-hex / (1.5 * hex)) - 1;
      const qMax = Math.ceil(w / (1.5 * hex)) + 1;
      lctx.beginPath();
      for (let q = qMin; q <= qMax; q++) {
        const rMin = Math.floor((-hex) / (SQRT3 * hex) - q / 2) - 1;
        const rMax = Math.ceil((h + hex) / (SQRT3 * hex) - q / 2) + 1;
        for (let r = rMin; r <= rMax; r++) {
          const [cx, cy] = axialToPixel(q, r, hex);
          hexPath(lctx, cx, cy, hex);
        }
      }
      lctx.stroke();
    };

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      minDim = Math.min(w, h);
      hex = Math.max(22, Math.min(30, Math.round(minDim / 30)));
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      for (const cv of [lattice, dyn]) {
        cv.width = Math.round(w * dpr);
        cv.height = Math.round(h * dpr);
      }
      lctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildLattice();
    };

    /* ---------------- helpers ---------------- */

    const ignite = (x: number, y: number, amount: number, color: RGB) => {
      const [q, r] = pixelToAxial(x, y, hex);
      const key = `${q},${r}`;
      const p = pulses.get(key);
      if (p) {
        p.i = Math.max(p.i, amount);
      } else if (pulses.size < 220) {
        const [cx, cy] = axialToPixel(q, r, hex);
        pulses.set(key, { cx, cy, i: amount, color });
      }
    };

    const igniteRing = (wx: number, wy: number, radius: number, amount: number) => {
      const [qq, rr] = pixelToAxial(wx, wy, hex);
      const span = Math.ceil((radius + 40) / (1.5 * hex));
      for (let q = qq - span; q <= qq + span; q++) {
        for (let r = rr - span; r <= rr + span; r++) {
          const [cx, cy] = axialToPixel(q, r, hex);
          const d = Math.hypot(cx - wx, cy - wy);
          if (Math.abs(d - radius) < 30) {
            const key = `${q},${r}`;
            const color = (q + r) % 2 === 0 ? PALETTE[0] : PALETTE[2];
            const p = pulses.get(key);
            if (p) {
              p.i = Math.max(p.i, amount);
            } else if (pulses.size < 240) {
              pulses.set(key, { cx, cy, i: amount, color });
            }
          }
        }
      }
    };

    const spawnSparks = (x: number, y: number, n: number, base: { vx: number; vy: number }) => {
      for (let i = 0; i < n; i++) {
        if (sparks.length > 110) sparks.shift();
        const ang = Math.random() * Math.PI * 2;
        const sp = 20 + Math.random() * 70;
        sparks.push({
          x,
          y,
          vx: base.vx * 0.15 + Math.cos(ang) * sp,
          vy: base.vy * 0.15 + Math.sin(ang) * sp,
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 6,
          size: 2.2 + Math.random() * 2.2,
          life: 0.5 + Math.random() * 0.45,
          color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        });
      }
    };

    /* ---------------- simulation + drawing ---------------- */

    const stepRacers = (dt: number, t: number) => {
      const B = 90; // steering band — keep the action mid-screen

      for (const r of racers) {
        r.px = r.x;
        r.py = r.y;

        // gentle wander — slow, wide S-curves read as light sweeps,
        // not wriggling creatures
        r.heading +=
          (Math.sin(t * 0.3 + r.seed) + Math.sin(t * 0.13 + r.seed * 2.7)) *
          0.5 *
          r.turn *
          dt;

        // steer back toward the middle near edges
        if (r.x < B || r.x > w - B || r.y < B || r.y > h - B) {
          const desired = Math.atan2(h / 2 - r.y, w / 2 - r.x);
          r.heading += angDelta(r.heading, desired) * Math.min(1, dt * 1.1);
        }

        // nitro boosts
        if (r.boost > 0) {
          r.boost -= dt;
        } else {
          r.cooldown -= dt;
          if (r.cooldown <= 0 && Math.random() < dt / 7) {
            r.boost = 0.6;
            r.cooldown = 7 + Math.random() * 6;
            spawnSparks(r.x, r.y, 5, { vx: 0, vy: 0 });
          }
        }

        const speed = r.speedF * minDim * (r.boost > 0 ? 2.7 : 1);
        r.x += Math.cos(r.heading) * speed * dt;
        r.y += Math.sin(r.heading) * speed * dt;

        // draw streak segment — halo then crisp core; bright leading edge
        const boost = r.boost > 0;
        dctx.lineCap = "round";
        dctx.strokeStyle = rgba(r.color, boost ? 0.17 : 0.1);
        dctx.lineWidth = r.haloW * (boost ? 1.7 : 1);
        dctx.beginPath();
        dctx.moveTo(r.px, r.py);
        dctx.lineTo(r.x, r.y);
        dctx.stroke();

        dctx.strokeStyle = rgba(r.color, 0.88);
        dctx.lineWidth = boost ? r.coreW * 1.3 : r.coreW;
        dctx.beginPath();
        dctx.moveTo(r.px, r.py);
        dctx.lineTo(r.x, r.y);
        dctx.stroke();

        // cell under the streak powers up
        ignite(r.x, r.y, boost ? 0.68 : 0.45, r.color);

        // pixel sparks shed from the trail
        r.sparkIn -= dt;
        if (r.sparkIn <= 0) {
          r.sparkIn = 0.5 + Math.random() * 1.2;
          spawnSparks(r.x, r.y, boost ? 3 : 1, {
            vx: Math.cos(r.heading) * speed,
            vy: Math.sin(r.heading) * speed,
          });
        }

        // wrap around when fully off-screen
        const M = 110;
        if (r.x < -M || r.x > w + M || r.y < -M || r.y > h + M) respawn(r);
      }
    };

    const drawEffects = (dt: number, t: number) => {
      // hex pulses — the board lighting up
      for (const [key, p] of pulses) {
        p.i -= dt * 1.25;
        if (p.i <= 0.02) {
          pulses.delete(key);
          continue;
        }
        dctx.fillStyle = rgba(p.color, Math.min(0.11, p.i * 0.11));
        dctx.strokeStyle = rgba(p.color, p.i * 0.09);
        dctx.lineWidth = 1;
        dctx.beginPath();
        hexPath(dctx, p.cx, p.cy, hex);
        dctx.fill();
        dctx.stroke();
      }

      // pixel sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.life -= dt * 1.5;
        if (s.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.vx *= 1 - 1.6 * dt;
        s.vy *= 1 - 1.6 * dt;
        s.rot += s.vr * dt;
        dctx.save();
        dctx.translate(s.x, s.y);
        dctx.rotate(s.rot);
        const sz = s.size * (0.35 + 0.65 * s.life);
        dctx.fillStyle = rgba(s.color, s.life * 0.85);
        dctx.fillRect(-sz / 2, -sz / 2, sz, sz);
        dctx.restore();
      }

      // shockwaves
      for (let i = waves.length - 1; i >= 0; i--) {
        const wv = waves[i];
        wv.r += (300 + 240 * wv.life) * dt;
        wv.life -= dt * 1.05;
        if (wv.life <= 0) {
          waves.splice(i, 1);
          continue;
        }
        igniteRing(wv.x, wv.y, wv.r, Math.min(0.6, wv.life * 0.75));
        dctx.strokeStyle = rgba(PALETTE[0], wv.life * 0.5);
        dctx.lineWidth = 2.5;
        dctx.beginPath();
        dctx.arc(wv.x, wv.y, wv.r, 0, Math.PI * 2);
        dctx.stroke();
        dctx.strokeStyle = rgba(PALETTE[2], wv.life * 0.24);
        dctx.lineWidth = 1.5;
        dctx.beginPath();
        dctx.arc(wv.x, wv.y, wv.r * 0.62, 0, Math.PI * 2);
        dctx.stroke();
      }
    };

    const fadeFrame = () => {
      dctx.globalCompositeOperation = "destination-out";
      dctx.fillStyle = "rgba(0, 0, 0, 0.07)";
      dctx.fillRect(0, 0, w, h);
      dctx.globalCompositeOperation = "source-over";
    };

    /* ---------------- events ---------------- */

    const onDown = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth) * w;
      const y = (e.clientY / window.innerHeight) * h;
      waves.push({ x, y, r: 8, life: 1 });
      spawnSparks(x, y, 10, { vx: 0, vy: 0 });
    };

    const onResize = () => {
      resize();
      for (const r of racers) {
        r.x = Math.min(Math.max(r.x, -70), w + 70);
        r.y = Math.min(Math.max(r.y, -70), h + 70);
        r.px = r.x;
        r.py = r.y;
      }
    };

    /* ---------------- run ---------------- */

    resize();
    const count = w < 640 ? 3 : 5;
    for (let i = 0; i < count; i++) {
      const r = makeRacer(i);
      respawn(r);
      r.x = w * (0.15 + Math.random() * 0.7);
      r.y = h * (0.15 + Math.random() * 0.7);
      r.px = r.x;
      r.py = r.y;
      racers.push(r);
    }

    let raf = 0;
    let running = false;
    let last = performance.now();

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      fadeFrame();
      stepRacers(dt, now / 1000);
      drawEffects(dt, now / 1000);
      if (running) raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running || reduced) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    if (reduced) {
      // one composed still frame — a frozen moment of the arena
      for (let i = 0; i < 110; i++) stepRacers(0.03, i * 0.03);
      for (const r of racers) {
        ignite(r.x, r.y, 0.5, r.color);
        spawnSparks(r.x, r.y, 2, { vx: 0, vy: 0 });
      }
      for (const s of sparks) s.life = 0.35 + Math.random() * 0.5;
      drawEffects(0, 2.4);
    } else {
      start();
      window.addEventListener("pointerdown", onDown, { passive: true });
    }
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* base — near-white canvas */}
      <div className="absolute inset-0 bg-[#fbfdfd]" />

      {/* brand tints — depth without darkness */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 10% -6%, rgba(13, 148, 136, 0.05), transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 92% 106%, rgba(16, 185, 129, 0.045), transparent 70%)",
        }}
      />

      {/* hex strategy lattice — the arena floor */}
      <canvas ref={latticeRef} className="absolute inset-0 h-full w-full" />

      {/* neon streaks, cell pulses, sparks, shockwaves */}
      <canvas ref={dynRef} className="absolute inset-0 h-full w-full" />

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
            "radial-gradient(ellipse 120% 90% at 50% 45%, transparent 60%, rgba(11, 46, 51, 0.04) 100%)",
        }}
      />
    </div>
  );
}
