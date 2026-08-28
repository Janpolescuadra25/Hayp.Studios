"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface Particle {
  x: number;
  y: number;
  px: number;
  py: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  width: number;
}

interface Vortex {
  x: number;
  y: number;
  strength: number;
  pull: number;
  phase: number;
  speed: number;
  baseX: number;
  baseY: number;
  orbitR: number;
}

const PALETTE = ["#0d9488", "#10b981", "#06b6d4", "#34d399", "#1e3a5f", "#14b8a6"];

/**
 * Full-screen animated background: silky particles flowing through a field of
 * slowly-drifting vortex attractors. Renders on canvas, fixed behind content.
 */
export function VortexBackground({
  className,
  particleAlpha = 0.5,
}: {
  className?: string;
  particleAlpha?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let running = true;
    let w = 0;
    let h = 0;
    let t = 0;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const particles: Particle[] = [];
    const vortices: Vortex[] = [];

    const pointer = { x: -9999, y: -9999, active: false };

    function spawn(p?: Particle): Particle {
      const np: Particle = p ?? ({} as Particle);
      np.x = Math.random() * w;
      np.y = Math.random() * h;
      np.px = np.x;
      np.py = np.y;
      const sp = 0.2 + Math.random() * 0.8;
      const a = Math.random() * Math.PI * 2;
      np.vx = Math.cos(a) * sp;
      np.vy = Math.sin(a) * sp;
      np.maxLife = 180 + Math.random() * 260;
      np.life = Math.random() * np.maxLife;
      np.color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      np.width = 0.7 + Math.random() * 1.6;
      return np;
    }

    function setupVortices() {
      vortices.length = 0;
      const count = w < 768 ? 2 : 3;
      for (let i = 0; i < count; i++) {
        const baseX = w * (0.2 + 0.3 * i) + (Math.random() - 0.5) * w * 0.1;
        const baseY = h * (0.3 + 0.35 * ((i + 1) % 2)) + (Math.random() - 0.5) * h * 0.15;
        vortices.push({
          baseX,
          baseY,
          x: baseX,
          y: baseY,
          strength: (0.9 + Math.random() * 1.5) * (Math.random() > 0.4 ? 1 : -1),
          pull: 0.22 + Math.random() * 0.4,
          phase: Math.random() * Math.PI * 2,
          speed: 0.00012 + Math.random() * 0.00022,
          orbitR: 60 + Math.random() * 130,
        });
      }
    }

    function resize() {
      if (!canvas) return;
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = "round";

      const target = Math.min(300, Math.max(110, Math.floor((w * h) / 8500)));
      particles.length = 0;
      for (let i = 0; i < target; i++) particles.push(spawn());
      setupVortices();
      // clean slate
      ctx.clearRect(0, 0, w, h);
    }

    function field(x: number, y: number): [number, number] {
      let vx = 0;
      let vy = 0;
      for (const v of vortices) {
        const dx = x - v.x;
        const dy = y - v.y;
        const d = Math.sqrt(dx * dx + dy * dy) + 90;
        const swirl = v.strength * 42 / d;
        vx += -dy * swirl * 0.02;
        vy += dx * swirl * 0.02;
        const pull = v.pull * 26 / d;
        vx += -dx * pull * 0.02;
        vy += -dy * pull * 0.02;
      }
      // ambient drift
      const n = Math.sin(x * 0.0016 + t * 0.25) + Math.cos(y * 0.0021 - t * 0.2);
      vx += n * 0.14;
      vy += Math.cos(x * 0.0013 - t * 0.22 + n) * 0.14;

      // pointer swirl
      if (pointer.active) {
        const dx = x - pointer.x;
        const dy = y - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 48400) {
          const d = Math.sqrt(d2) + 24;
          const s = (1 - d / 220) * 1.6;
          vx += (-dy / d) * s - (dx / d) * s * 0.35;
          vy += (dx / d) * s - (dy / d) * s * 0.35;
        }
      }
      return [vx, vy];
    }

    function drawGlow(x: number, y: number, r: number, color: string, alpha: number) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, color);
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.globalAlpha = alpha;
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    function step() {
      if (!running) return;
      t += 1;

      // translucent white veil → silk trails
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(255,255,255,0.055)";
      ctx.fillRect(0, 0, w, h);

      // drift vortex attractors
      for (const v of vortices) {
        v.x = v.baseX + Math.cos(t * v.speed * 60 + v.phase) * v.orbitR;
        v.y = v.baseY + Math.sin(t * v.speed * 42 + v.phase * 1.7) * v.orbitR * 0.6;
      }

      // soft vortex cores
      ctx.globalCompositeOperation = "source-over";
      drawGlow(vortices[0].x, vortices[0].y, 190, "rgba(13,148,136,0.10)", 1);
      if (vortices[1]) drawGlow(vortices[1].x, vortices[1].y, 160, "rgba(6,182,212,0.09)", 1);
      if (vortices[2]) drawGlow(vortices[2].x, vortices[2].y, 150, "rgba(16,185,129,0.08)", 1);

      // particles
      ctx.globalCompositeOperation = "source-over";
      for (const p of particles) {
        const [fx, fy] = field(p.x, p.y);
        p.vx = p.vx * 0.93 + fx * 0.55;
        p.vy = p.vy * 0.93 + fy * 0.55;
        p.px = p.x;
        p.py = p.y;
        p.x += p.vx * 1.6;
        p.y += p.vy * 1.6;
        p.life += 1;

        const margin = 40;
        if (
          p.life > p.maxLife ||
          p.x < -margin || p.x > w + margin ||
          p.y < -margin || p.y > h + margin
        ) {
          spawn(p);
          continue;
        }

        const fade = Math.min(1, p.life / 24) * Math.min(1, (p.maxLife - p.life) / 40);
        ctx.strokeStyle = p.color;
        ctx.globalAlpha = particleAlpha * fade;
        ctx.lineWidth = p.width;
        ctx.beginPath();
        ctx.moveTo(p.px, p.py);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(step);
    }

    function onPointer(e: PointerEvent) {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    }
    function onLeave() {
      pointer.active = false;
      pointer.x = -9999;
      pointer.y = -9999;
    }
    function onVisibility() {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!reduced) {
        running = true;
        raf = requestAnimationFrame(step);
      }
    }

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);

    if (reduced) {
      // static artful frame for reduced motion
      for (let i = 0; i < 400; i++) {
        t = i;
        for (const p of particles) {
          const [fx, fy] = field(p.x, p.y);
          p.vx = p.vx * 0.93 + fx * 0.55;
          p.vy = p.vy * 0.93 + fy * 0.55;
          p.px = p.x;
          p.py = p.y;
          p.x += p.vx * 1.6;
          p.y += p.vy * 1.6;
          ctx.strokeStyle = p.color;
          ctx.globalAlpha = 0.28;
          ctx.lineWidth = p.width;
          ctx.beginPath();
          ctx.moveTo(p.px, p.py);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    } else {
      raf = requestAnimationFrame(step);
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [particleAlpha]);

  return (
    <div className={cn("fixed inset-0 -z-10 overflow-hidden bg-white", className)} aria-hidden="true">
      <canvas ref={canvasRef} className="block h-full w-full" />
      {/* static aurora wash for depth */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 h-[34rem] w-[34rem] rounded-full bg-teal-500/10 blur-3xl animate-vortex-pulse-soft" />
        <div className="absolute top-1/3 -right-40 h-[30rem] w-[30rem] rounded-full bg-cyan-400/10 blur-3xl animate-vortex-pulse-soft" style={{ animationDelay: "-2s" }} />
        <div className="absolute -bottom-40 left-1/4 h-[28rem] w-[28rem] rounded-full bg-emerald-400/10 blur-3xl animate-vortex-pulse-soft" style={{ animationDelay: "-4s" }} />
      </div>
    </div>
  );
}
