"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { VortexBackground } from "@/components/vortex/vortex-background";
import { VortexNavbar, VortexFooter } from "@/components/vortex/vortex-chrome";
import { VortexLanding } from "@/components/vortex/vortex-landing";
import { VortexHub } from "@/components/vortex/vortex-hub";
import { VortexWhatsNew } from "@/components/vortex/vortex-whatsnew";
import {
  VortexTransition,
  TRANSITION,
  type TransitionState,
  type TransitionVariant,
  type VortexView,
} from "@/components/vortex/vortex-transition";

const VARIANT_FOR: Record<VortexView, TransitionVariant> = {
  landing: "portal",
  hub: "tunnel",
  whatsnew: "wave",
};

export default function Home() {
  const [view, setView] = useState<VortexView>("landing");
  const [transition, setTransition] = useState<TransitionState | null>(null);
  const busyRef = useRef(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach(clearTimeout);
  }, []);

  const navigate = useCallback(
    (target: VortexView) => {
      if (busyRef.current || target === view) return;

      // reduced motion — instant swap, no cinematic overlay
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setView(target);
        window.scrollTo({ top: 0, behavior: "auto" });
        return;
      }

      busyRef.current = true;
      setTransition({
        active: true,
        variant: VARIANT_FOR[target],
        target,
        nonce: Date.now(),
      });

      timersRef.current.push(
        setTimeout(() => {
          setView(target);
          window.scrollTo({ top: 0, behavior: "auto" });
        }, TRANSITION.swapAt),
        setTimeout(() => {
          setTransition(null);
          busyRef.current = false;
        }, TRANSITION.total)
      );
    },
    [view]
  );

  return (
    <div className="relative flex min-h-[100svh] flex-col">
      <VortexBackground />

      <VortexNavbar view={view} onNavigate={navigate} />

      <div className="flex flex-1 flex-col">
        {view === "landing" && <VortexLanding onEnterHub={() => navigate("hub")} onWhatsNew={() => navigate("whatsnew")} />}
        {view === "hub" && <VortexHub onGoHome={() => navigate("landing")} />}
        {view === "whatsnew" && <VortexWhatsNew />}
      </div>

      <VortexFooter onNavigate={navigate} />

      {transition && <VortexTransition state={transition} />}
    </div>
  );
}
