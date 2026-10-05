"use client";

import { HaypHero, HaypMarquee } from "./hayp-landing-hero";
import { ChapterOne, ChapterTwo, ChapterThree, StatsSection } from "./hayp-landing-story";
import { FeaturedTeaser, MottoSection, FinalCta } from "./hayp-landing-showcase";

/**
 * The Hayp landing page — a scroll-driven story:
 * Hero → Marquee → Ch.1 The Studio → Ch.2 The Craft →
 * Ch.3 Horizontal Catalog Fly-through → Stats → Featured → Motto → CTA
 */
export function HaypLanding({
  onEnterHub,
  onWhatsNew,
}: {
  onEnterHub: () => void;
  onWhatsNew: () => void;
}) {
  return (
    <main className="relative">
      <HaypHero onEnterHub={onEnterHub} onWhatsNew={onWhatsNew} />
      <HaypMarquee />
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
