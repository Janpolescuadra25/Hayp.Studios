"use client";

import { VortexHero, VortexMarquee } from "./vortex-landing-hero";
import { ChapterOne, ChapterTwo, ChapterThree, StatsSection } from "./vortex-landing-story";
import { FeaturedTeaser, MottoSection, FinalCta } from "./vortex-landing-showcase";

/**
 * The Vortex landing page — a scroll-driven story:
 * Hero → Marquee → Ch.1 The Studio → Ch.2 The Craft →
 * Ch.3 Horizontal Catalog Fly-through → Stats → Featured → Motto → CTA
 */
export function VortexLanding({
  onEnterHub,
  onWhatsNew,
}: {
  onEnterHub: () => void;
  onWhatsNew: () => void;
}) {
  return (
    <main className="relative">
      <VortexHero onEnterHub={onEnterHub} onWhatsNew={onWhatsNew} />
      <VortexMarquee />
      <ChapterOne />
      <ChapterTwo />
      <ChapterThree onEnterHub={onEnterHub} />
      <StatsSection />
      <FeaturedTeaser onEnterHub={onEnterHub} />
      <MottoSection />
      <FinalCta onEnterHub={onEnterHub} />
    </main>
  );
}
