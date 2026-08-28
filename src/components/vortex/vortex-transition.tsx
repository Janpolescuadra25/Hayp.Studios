"use client";

import { motion } from "framer-motion";
import { VortexMark } from "./vortex-logo";

export type VortexView = "landing" | "hub" | "whatsnew";

/**
 * Variant keys are kept stable (they are wired in page.tsx), but the
 * choreography is now quiet-cinematic:
 *   tunnel → "The Curtain"  (entering the Hub)
 *   wave   → "Silk Veil"    (entering What's New)
 *   portal → "The Iris"     (returning Home)
 */
export type TransitionVariant = "tunnel" | "wave" | "portal";

export interface TransitionState {
  active: boolean;
  variant: TransitionVariant;
  target: VortexView;
  nonce: number;
}

/** Timing contract (ms): screen fully covered at ~680ms, gone by ~1600ms */
export const TRANSITION = { swapAt: 680, total: 1600 };

const EASE_CINEMA: [number, number, number, number] = [0.76, 0, 0.24, 1];
const EASE_SOFT: [number, number, number, number] = [0.33, 1, 0.68, 1];

/* ------------------------------------------------------------------ */
/* Shared center brand moment — the mark, held in stillness            */
/* ------------------------------------------------------------------ */
function BrandMoment({
  label,
  markId,
  dark = true,
}: {
  label: string;
  markId: string;
  dark?: boolean;
}) {
  return (
    <motion.div
      className="absolute inset-0 z-10 grid place-items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0, 1, 1, 0] }}
      transition={{ duration: 1.6, times: [0, 0.24, 0.42, 0.72, 1], ease: "easeInOut" }}
    >
      <div className="flex flex-col items-center gap-5">
        <motion.div
          initial={{ scale: 0.86, y: 8 }}
          animate={{ scale: [0.86, 0.86, 1, 1, 1.04], y: [8, 8, 0, 0, -6] }}
          transition={{ duration: 1.6, times: [0, 0.24, 0.42, 0.72, 1], ease: EASE_SOFT }}
        >
          <VortexMark size={104} animated idPrefix={markId} showOrbit={false} />
        </motion.div>
        <motion.div
          className="flex items-center gap-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: [0, 0, 1, 1, 0], y: [10, 10, 0, 0, -6] }}
          transition={{ duration: 1.6, times: [0, 0.3, 0.48, 0.7, 1], ease: "easeInOut" }}
        >
          <span className={`h-px w-8 ${dark ? "bg-white/30" : "bg-vortex-ink/20"}`} />
          <span
            className={`label-editorial ${
              dark ? "text-white/80" : "text-vortex-ink/70"
            }`}
          >
            {label}
          </span>
          <span className={`h-px w-8 ${dark ? "bg-white/30" : "bg-vortex-ink/20"}`} />
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Variant 1 — The Curtain (used when entering the Hub)                 */
/* A deep-ink gradient panel with curved lips rises, holds the mark,   */
/* then continues upward — like a stage curtain between scenes.        */
/* ------------------------------------------------------------------ */
function CurtainVariant() {
  return (
    <>
      <motion.div
        className="absolute inset-x-[-4%] bottom-0 z-0 h-[112%] origin-bottom"
        style={{
          background:
            "linear-gradient(168deg, #0b2e33 0%, #0f4d47 46%, #0d9488 100%)",
          borderRadius: "48% 48% 0 0 / 4.5% 4.5% 0 0",
          boxShadow: "0 -30px 90px -20px rgba(13,148,136,0.35)",
        }}
        initial={{ y: "104%" }}
        animate={{ y: ["104%", "0%", "0%", "-104%"] }}
        transition={{ duration: 1.6, times: [0, 0.4, 0.58, 1], ease: EASE_CINEMA }}
      >
        {/* faint texture inside the curtain */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />
      </motion.div>
      <BrandMoment label="Vortex Hub" markId="tr-curtain" />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Variant 2 — Silk Veil (used for What's New)                          */
/* A wide silk sheet with a softly rippling leading edge glides across */
/* the screen left → right, like a page of fabric pulled over the set. */
/* ------------------------------------------------------------------ */
function VeilVariant() {
  return (
    <>
      <motion.div
        className="absolute inset-y-[-4%] left-0 z-0 w-[118%]"
        initial={{ x: "-104%" }}
        animate={{ x: ["-104%", "0%", "0%", "104%"] }}
        transition={{ duration: 1.6, times: [0, 0.4, 0.58, 1], ease: EASE_CINEMA }}
      >
        <div
          className="absolute inset-y-0 right-0 w-[16%]"
          style={{ overflow: "visible" }}
        >
          {/* rippling leading edge */}
          <svg
            className="absolute inset-y-[-2%] right-[-2%] h-[104%] w-[110%]"
            viewBox="0 0 120 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M 120 0 C 78 8, 86 26, 44 33 C 16 38, 22 62, 52 68 C 88 75, 80 92, 120 100 Z"
              fill="#0d9488"
            />
            <path
              d="M 120 0 C 78 8, 86 26, 44 33 C 16 38, 22 62, 52 68 C 88 75, 80 92, 120 100 Z"
              fill="none"
              stroke="rgba(204,251,241,0.45)"
              strokeWidth="0.6"
            />
          </svg>
        </div>
        <div
          className="absolute inset-y-0 left-0 right-[8%]"
          style={{
            background:
              "linear-gradient(96deg, #0b2e33 0%, #0f4d47 58%, #0d9488 100%)",
            boxShadow: "30px 0 90px -20px rgba(13,148,136,0.35)",
          }}
        >
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1px)",
              backgroundSize: "26px 26px",
            }}
          />
        </div>
      </motion.div>
      <BrandMoment label="What's New" markId="tr-veil" />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Variant 3 — The Iris (used when returning Home)                      */
/* A soft white breath: the veil fades in, the mark holds with a thin  */
/* ring quietly expanding — then everything dissolves back to the page.*/
/* ------------------------------------------------------------------ */
function IrisVariant() {
  return (
    <>
      <motion.div
        className="absolute inset-0 z-0 bg-[#fbfdfd]"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: 1.6, times: [0, 0.34, 0.62, 1], ease: "easeInOut" }}
      />
      {/* slow expanding halo rings */}
      {[0, 1].map((i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-1/2 z-0 rounded-full border border-vortex-teal/25"
          style={{ width: "36vmax", height: "36vmax", marginLeft: "-18vmax", marginTop: "-18vmax" }}
          initial={{ scale: 0.45, opacity: 0 }}
          animate={{ scale: [0.45, 0.45, 1.25, 1.5], opacity: [0, 0, 0.7, 0] }}
          transition={{ duration: 1.6, delay: i * 0.12, times: [0, 0.22, 0.66, 1], ease: "easeOut" }}
        />
      ))}
      <BrandMoment label="Vortex . studio" markId="tr-iris" dark={false} />
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
      transition={{ duration: TRANSITION.total / 1000, times: [0, 0.92, 1], ease: "linear" }}
      aria-hidden="true"
    >
      {state.variant === "tunnel" && <CurtainVariant />}
      {state.variant === "wave" && <VeilVariant />}
      {state.variant === "portal" && <IrisVariant />}
    </motion.div>
  );
}
