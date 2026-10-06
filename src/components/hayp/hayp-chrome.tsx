"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ArrowUpRight, Github, Twitter, Mail } from "lucide-react";
import { HaypWordmark } from "./hayp-logo";
import { EASE } from "./hayp-shared";
import type { HaypView } from "./hayp-transition";
import { useAnalytics } from "@/hooks/use-analytics";
import { CATEGORIES } from "@/lib/hayp-data";
import { cn } from "@/lib/utils";

const NAV_LINKS: { view: HaypView; label: string }[] = [
  { view: "landing", label: "The Story" },
  { view: "hub", label: "Hub" },
  { view: "analytics", label: "Analytics" },
  { view: "whatsnew", label: "What's New" },
];

/* ------------------------------------------------------------------ */
/* NAVBAR — a quiet hairline bar. Nothing more.                        */
/* ------------------------------------------------------------------ */
export function HaypNavbar({
  view,
  onNavigate,
}: {
  view: HaypView;
  onNavigate: (v: HaypView) => void;
}) {
  const { trackPageView } = useAnalytics();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const handleNavClick = (nextView: HaypView) => {
    trackPageView(nextView);
    if (nextView === "analytics") {
      window.location.href = "/api/auth/signin";
      return;
    }
    onNavigate(nextView);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // lock scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          scrolled
            ? "border-b hairline bg-white/75 backdrop-blur-md"
            : "border-b border-transparent bg-transparent"
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:h-[4.5rem]">
          {/* logo */}
          <button
            onClick={() => onNavigate("landing")}
            className="transition-transform duration-500 hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-hayp-teal"
            aria-label="Hayp.studio — home"
          >
            <HaypWordmark size="sm" animated={!scrolled} />
          </button>

          {/* center links */}
          <nav
            className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-9 md:flex"
            aria-label="Main navigation"
          >
            {NAV_LINKS.map((link) => {
              const active = view === link.view;
              return (
                <button
                  key={link.view}
                  onClick={() => handleNavClick(link.view)}
                  className={cn(
                    "label-editorial relative py-2 transition-colors duration-400 focus-visible:outline-2 focus-visible:outline-hayp-teal",
                    active ? "text-hayp-ink" : "text-hayp-ink/50 hover:text-hayp-ink"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {link.label}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-0 -bottom-0.5 h-px bg-gradient-to-r from-hayp-teal to-hayp-cyan"
                      transition={{ type: "spring", stiffness: 380, damping: 34 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* right */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                trackPageView("hub");
                onNavigate("hub");
              }}
              className="group hidden items-center gap-2 rounded-full border border-hayp-ink/15 bg-white/60 px-5 py-2.5 font-display text-[13px] font-semibold text-hayp-ink backdrop-blur transition-all duration-500 hover:border-hayp-ink hover:bg-hayp-ink hover:text-white focus-visible:outline-2 focus-visible:outline-hayp-teal sm:inline-flex"
            >
              Enter Hub
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </button>
            <button
              className="grid h-10 w-10 place-items-center rounded-full border hairline bg-white/60 text-hayp-ink backdrop-blur md:hidden focus-visible:outline-2 focus-visible:outline-hayp-teal"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* full-screen mobile menu — big editorial type */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col bg-[#fbfdfd] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="flex flex-1 flex-col justify-center gap-2 px-8 pt-20">
              {NAV_LINKS.map((link, i) => (
                <motion.button
                  key={link.view}
                  initial={{ opacity: 0, y: 34 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{ duration: 0.7, delay: 0.08 + i * 0.08, ease: EASE }}
                  onClick={() => {
                    if (link.view === "analytics") {
                      setOpen(false);
                      window.location.href = "/api/auth/signin";
                      return;
                    }
                    trackPageView(link.view);
                    setOpen(false);
                    onNavigate(link.view);
                  }}
                  className="group flex items-baseline gap-4 border-b hairline py-5 text-left"
                >
                  <span className="label-editorial text-hayp-teal">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={cn(
                      "font-display text-4xl font-semibold tracking-tight transition-colors",
                      view === link.view ? "text-hayp-teal" : "text-hayp-ink"
                    )}
                  >
                    {link.label}
                  </span>
                  <ArrowUpRight className="ml-auto h-5 w-5 text-hayp-ink/30" />
                </motion.button>
              ))}
            </div>
            <motion.div
              className="px-8 pb-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.36 }}
            >
              <p className="font-serif-accent text-xl italic text-hayp-navy/60">
                Less friction. More momentum.
              </p>
              <p className="label-editorial mt-3 text-[10px] text-hayp-ink/40">
                hayp.studio — independent studio
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* FOOTER — quiet, editorial, hairline                                 */
/* ------------------------------------------------------------------ */
export function HaypFooter({ onNavigate }: { onNavigate: (v: HaypView) => void }) {
  const { trackExternalNav, trackPageView } = useAnalytics();

  return (
    <footer className="relative mt-auto border-t hairline bg-white/60 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6 pb-10 pt-16">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* brand */}
          <div>
            <HaypWordmark size="md" animated={false} />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-hayp-navy/65">
              An independent digital product studio. Ready-made software —
              tools, platforms and game worlds — designed, engineered and
              shipped with momentum.
            </p>
            <div className="mt-6 flex gap-2.5">
              {[
                { icon: Twitter, label: "Twitter", href: "https://x.com" },
                { icon: Github, label: "GitHub", href: "https://github.com" },
                { icon: Mail, label: "Email", href: "mailto:hello@hayp.studio" },
              ].map((s) => (
                <button
                  key={s.label}
                  aria-label={s.label}
                  onClick={() => {
                    trackExternalNav(s.href, `footer-${s.label.toLowerCase()}`);
                    window.open(s.href, "_blank", "noopener,noreferrer");
                  }}
                  className="grid h-10 w-10 place-items-center rounded-full border hairline text-hayp-navy/55 transition-all duration-400 hover:-translate-y-0.5 hover:border-hayp-teal/50 hover:text-hayp-teal focus-visible:outline-2 focus-visible:outline-hayp-teal"
                >
                  <s.icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          {/* nav column */}
          <div>
            <h3 className="label-editorial text-hayp-teal">Explore</h3>
            <ul className="mt-5 space-y-3">
              {NAV_LINKS.map((l) => (
                <li key={l.view}>
                  <button
                    onClick={() => {
                      trackPageView(l.view);
                      onNavigate(l.view);
                    }}
                    className="text-sm font-medium text-hayp-navy/70 transition-colors duration-300 hover:text-hayp-teal focus-visible:outline-2 focus-visible:outline-hayp-teal"
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* categories */}
          <div>
            <h3 className="label-editorial text-hayp-teal">Categories</h3>
            <ul className="mt-5 space-y-3">
              {CATEGORIES.map((c) => (
                <li key={c.name}>
                  <button
                    onClick={() => {
                      trackPageView("hub");
                      onNavigate("hub");
                    }}
                    className="text-sm font-medium text-hayp-navy/70 transition-colors duration-300 hover:text-hayp-teal focus-visible:outline-2 focus-visible:outline-hayp-teal"
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* motto */}
          <div className="flex flex-col justify-between gap-8">
            <div>
              <h3 className="label-editorial text-hayp-teal">Motto</h3>
              <p className="mt-5 font-display text-2xl font-bold leading-tight tracking-tight text-hayp-ink">
                Less Friction.
                <br />
                <span className="font-serif-accent font-normal italic text-hayp-gradient">
                  More Momentum.
                </span>
              </p>
            </div>
            <p className="border-l-2 border-hayp-teal/40 pl-4 text-xs leading-relaxed text-hayp-navy/60">
              Precision-built. No templates, no shortcuts — since day one.
            </p>
          </div>
        </div>

        {/* bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t hairline pt-6 sm:flex-row">
          <p className="text-xs text-hayp-navy/50">
            © {new Date().getFullYear()} Hayp.studio — designed, built and shipped with momentum.
          </p>
          <p className="label-editorial text-[10px] text-hayp-navy/40">
            spin up · ship · repeat
          </p>
        </div>
      </div>
    </footer>
  );
}
