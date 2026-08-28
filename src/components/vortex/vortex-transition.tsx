"use client";

import { motion } from "framer-motion";
import { VortexMark } from "./vortex-logo";

export type VortexView = "landing" | "hub" | "whatsnew";

export type TransitionVariant = "tunnel" | "wave" | "portal";

export interface TransitionState {
  active: boolean;
  variant: TransitionVariant;
  target: VortexView;
  nonce: number;
}

/** Timing contract (ms): screen fully covered at ~680ms, gone by ~1600ms */
export const TRANSITION = { swapAt: 680, total: 1600 };

const RING_COLORS = ["#0d9488", "#10b981", "#06b6d4"];

/* ------------------------------------------------------------------ */
/* Variant 1 — Vortex Tunnel (used when entering the Hub)              */
/* Staggered rings + conic swirl disc collapse into a wormhole         */
/* ------------------------------------------------------------------ */
function TunnelVariant() {
  return (
    <>
      {/* backdrop */}
      <motion.div
        className="absolute inset-0 bg-[linear-gradient(135deg,#0f766e_0%,#10b981_45%,#06b6d4_100%)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 1, 1, 0] }}
        transition={{ duration: 1.5, times: [0, 0.1, 0.38, 0.75, 1], ease: "easeInOut" }}
      />
      {/* tunnel rings */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-1/2 rounded-full border-[5px] md:border-[7px]"
          style={{
            width: "24vmax",
            height: "24vmax",
            marginLeft: "-12vmax",
            marginTop: "-12vmax",
            borderColor: RING_COLORS[i % 3],
            borderStyle: i % 2 ? "dashed" : "solid",
          }}
          initial={{ scale: 0, rotate: 0, opacity: 0 }}
          animate={{
            scale: [0, 1, 18],
            rotate: i % 2 ? -260 : 260,
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1.2,
            delay: i * 0.07,
            times: [0, 0.32, 1],
            ease: "easeOut",
          }}
        />
      ))}
      {/* conic swirl core */}
      <motion.div
        className="absolute left-1/2 top-1/2 rounded-full"
        style={{
          width: "34vmax",
          height: "34vmax",
          marginLeft: "-17vmax",
          marginTop: "-17vmax",
          background:
            "conic-gradient(from 0deg, #0d9488, #ccfbf1, #06b6d4, #134e4a, #10b981, #ccfbf1, #0d9488)",
          filter: "blur(1px)",
        }}
        initial={{ scale: 0, rotate: 0 }}
        animate={{ scale: [0, 1.5, 14], rotate: 620 }}
        transition={{ duration: 1.3, ease: [0.16, 0.8, 0.3, 1] }}
      />
      {/* logo flash */}
      <motion.div
        className="absolute inset-0 grid place-items-center"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1, 1.08, 1.9] }}
        transition={{ duration: 1.5, times: [0, 0.26, 0.62, 1], ease: "easeInOut" }}
      >
        <div className="grid place-items-center rounded-full bg-white/85 backdrop-blur-md p-5 vortex-glow-lg">
          <VortexMark size={96} animated={false} showOrbit={false} idPrefix="tr-tunnel" />
        </div>
      </motion.div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Variant 2 — Emerald Wave (used for What's New)                      */
/* Skewed gradient columns crash down staggered, then lift away        */
/* ------------------------------------------------------------------ */
function WaveVariant() {
  const cols = [0, 1, 2, 3, 4, 5, 6];
  return (
    <div className="absolute inset-0 flex">
      {cols.map((i) => (
        <motion.div
          key={i}
          className="relative h-full flex-1 origin-top"
          style={{
            background: `linear-gradient(180deg, ${
              ["#0f766e", "#0d9488", "#10b981", "#34d399", "#06b6d4", "#0d9488", "#0f766e"][i]
            } 0%, #f0fdfa 130%)`,
            skewX: "-6deg",
            scaleX: 1.25,
          }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: [0, 1, 1, 0], y: ["0%", "0%", "0%", "-104%"] }}
          transition={{
            duration: 1.5,
            delay: i * 0.035,
            times: [0, 0.25, 0.7, 1],
            ease: ["easeIn", "linear", "easeInOut"],
          }}
        >
          {/* subtle shine edge */}
          <div className="absolute inset-y-0 right-0 w-[3px] bg-white/40" />
        </motion.div>
      ))}
      {/* logo badge */}
      <motion.div
        className="absolute inset-0 grid place-items-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: [0, 1, 1, 0], y: [30, 0, 0, -36] }}
        transition={{ duration: 1.5, times: [0, 0.3, 0.6, 1], ease: "easeInOut" }}
      >
        <div className="grid place-items-center rounded-3xl bg-white/90 backdrop-blur-md p-5 vortex-glow-lg">
          <VortexMark size={92} animated={false} showOrbit={false} idPrefix="tr-wave" />
        </div>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Variant 3 — Portal Iris (used when returning Home)                  */
/* Disc expands & spins to cover, then a white iris opens from center  */
/* ------------------------------------------------------------------ */
function PortalVariant() {
  return (
    <>
      {/* rotating cover disc */}
      <motion.div
        className="absolute left-1/2 top-1/2 rounded-full"
        style={{
          width: "160vmax",
          height: "160vmax",
          marginLeft: "-80vmax",
          marginTop: "-80vmax",
          background:
            "conic-gradient(from 90deg, #0d9488, #10b981, #ccfbf1, #06b6d4, #0f766e, #10b981, #0d9488)",
        }}
        initial={{ scale: 0, rotate: -140 }}
        animate={{ scale: [0, 1], rotate: [ -140, 40 ] }}
        transition={{ duration: 0.72, ease: [0.3, 0.7, 0.2, 1] }}
      />
      {/* second swirl layer for depth */}
      <motion.div
        className="absolute left-1/2 top-1/2 rounded-full mix-blend-overlay"
        style={{
          width: "120vmax",
          height: "120vmax",
          marginLeft: "-60vmax",
          marginTop: "-60vmax",
          background:
            "conic-gradient(from 270deg, transparent, rgba(255,255,255,0.85), transparent 40%, rgba(255,255,255,0.6), transparent 75%, rgba(255,255,255,0.7))",
        }}
        initial={{ scale: 0, rotate: 200 }}
        animate={{ scale: [0, 1.05], rotate: [200, -30] }}
        transition={{ duration: 0.78, ease: [0.3, 0.7, 0.2, 1] }}
      />
      {/* logo at portal heart */}
      <motion.div
        className="absolute inset-0 grid place-items-center"
        initial={{ opacity: 0, scale: 0.4, rotate: -30 }}
        animate={{ opacity: [0, 1, 0], scale: [0.4, 1, 0.4], rotate: [-30, 0, 30] }}
        transition={{ duration: 1.5, times: [0, 0.4, 1], ease: "easeInOut" }}
      >
        <div className="grid place-items-center rounded-full bg-white/90 backdrop-blur-md p-6 vortex-glow-lg">
          <VortexMark size={100} animated={false} showOrbit={false} idPrefix="tr-portal" />
        </div>
      </motion.div>
      {/* iris — white portal opens from center revealing the new view */}
      <motion.div
        className="absolute left-1/2 top-1/2 rounded-full bg-white"
        style={{ width: "10vmax", height: "10vmax", marginLeft: "-5vmax", marginTop: "-5vmax" }}
        initial={{ scale: 0 }}
        animate={{ scale: [0, 0, 32] }}
        transition={{ duration: 1.5, times: [0, 0.4, 1], ease: [0.6, 0, 0.2, 1] }}
      />
      {/* everything fades to reveal */}
      <motion.div
        className="absolute inset-0 bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 1, 1, 0] }}
        transition={{ duration: 1.6, times: [0, 0.4, 0.52, 0.8, 1] }}
      />
    </>
  );
}

/**
 * Full-screen cinematic transition overlay. The parent swaps the underlying
 * view at TRANSITION.swapAt while the screen is fully covered.
 */
export function VortexTransition({ state }: { state: TransitionState }) {
  if (!state.active) return null;
  return (
    <motion.div
      key={state.nonce}
      className="fixed inset-0 z-[80] overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: [1, 1, 0] }}
      transition={{ duration: TRANSITION.total / 1000, times: [0, 0.86, 1], ease: "linear" }}
      aria-hidden="true"
    >
      {state.variant === "tunnel" && <TunnelVariant />}
      {state.variant === "wave" && <WaveVariant />}
      {state.variant === "portal" && <PortalVariant />}
    </motion.div>
  );
}
