"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAnalytics } from "@/hooks/use-analytics";
import { HaypBackground } from "@/components/hayp/hayp-background";
import { HaypNavbar, HaypFooter } from "@/components/hayp/hayp-chrome";
import { HaypLanding } from "@/components/hayp/hayp-landing";
import { HaypHub } from "@/components/hayp/hayp-hub";
import { HaypWhatsNew } from "@/components/hayp/hayp-whatsnew";
import {
  HaypTransition,
  TRANSITION,
  type TransitionState,
  type TransitionVariant,
  type HaypView,
} from "@/components/hayp/hayp-transition";

const VARIANT_FOR: Record<HaypView, TransitionVariant> = {
  landing: "portal",
  hub: "tunnel",
  whatsnew: "wave",
};

export default function Home() {
  const [view, setView] = useState<HaypView>("landing");
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    trackPageView(view);
  }, [view, trackPageView]);

  const [transition, setTransition] = useState<TransitionState | null>(null);
  const busyRef = useRef(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach(clearTimeout);
  }, []);

  const navigate = useCallback(
    (target: HaypView) => {
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
      <HaypBackground />

      <HaypNavbar view={view} onNavigate={navigate} />

      <div className="flex flex-1 flex-col">
        {view === "landing" && <HaypLanding onEnterHub={() => navigate("hub")} onWhatsNew={() => navigate("whatsnew")} />}
        {view === "hub" && <HaypHub onGoHome={() => navigate("landing")} />}
        {view === "whatsnew" && <HaypWhatsNew />}
      </div>

      <HaypFooter onNavigate={navigate} />

      {transition && <HaypTransition state={transition} />}
    </div>
  );
}
