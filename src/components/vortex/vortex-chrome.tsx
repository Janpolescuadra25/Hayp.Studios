"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ArrowUpRight, Github, Twitter, Mail } from "lucide-react";
import { VortexWordmark } from "./vortex-logo";
import type { VortexView } from "./vortex-transition";
import { cn } from "@/lib/utils";

const NAV_LINKS: { view: VortexView; label: string }[] = [
  { view: "landing", label: "The Story" },
  { view: "hub", label: "Hub" },
  { view: "whatsnew", label: "What's New" },
];

export function VortexNavbar({
  view,
  onNavigate,
}: {
  view: VortexView;
  onNavigate: (v: VortexView) => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled ? "py-2.5" : "py-5"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <nav
          className={cn(
            "flex items-center justify-between rounded-full pl-5 pr-2.5 transition-all duration-500",
            scrolled
              ? "glass-strong py-2 shadow-[0_14px_45px_-20px_rgba(13,148,136,0.45)]"
              : "border border-transparent py-2.5"
          )}
          aria-label="Main navigation"
        >
          {/* logo */}
          <button
            onClick={() => onNavigate("landing")}
            className="transition-transform duration-300 hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-vortex-teal"
            aria-label="Vortex.studio — home"
          >
            <VortexWordmark size="sm" animated={scrolled === false} />
          </button>

          {/* desktop links */}
          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => {
              const active = view === link.view;
              return (
                <button
                  key={link.view}
                  onClick={() => onNavigate(link.view)}
                  className={cn(
                    "relative rounded-full px-4 py-2 font-display text-[13px] font-semibold transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-vortex-teal",
                    active ? "text-white" : "text-vortex-navy/70 hover:text-vortex-teal"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-600 to-cyan-500 shadow-[0_8px_22px_-8px_rgba(13,148,136,0.6)]"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative">{link.label}</span>
                </button>
              );
            })}
            <button
              onClick={() => onNavigate("hub")}
              className="group ml-2 inline-flex items-center gap-2 rounded-full border border-vortex-teal/30 bg-white/60 px-5 py-2.5 font-display text-[13px] font-bold text-vortex-teal backdrop-blur transition-all duration-300 hover:border-vortex-teal/60 hover:bg-vortex-foam focus-visible:outline-2 focus-visible:outline-vortex-teal"
            >
              Enter Hub
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* mobile toggle */}
          <button
            className="grid h-10 w-10 place-items-center rounded-full glass text-vortex-navy md:hidden focus-visible:outline-2 focus-visible:outline-vortex-teal"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {/* mobile panel */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -14, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.22, 0.8, 0.28, 1] }}
              className="glass-strong mt-2 overflow-hidden rounded-3xl p-3 shadow-[0_24px_60px_-24px_rgba(13,148,136,0.5)] md:hidden"
            >
              {NAV_LINKS.map((link, i) => (
                <motion.button
                  key={link.view}
                  initial={{ opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.06 * i, duration: 0.3 }}
                  onClick={() => {
                    setOpen(false);
                    onNavigate(link.view);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-2xl px-5 py-3.5 font-display text-base font-semibold transition-colors",
                    view === link.view
                      ? "bg-gradient-to-r from-teal-600 to-cyan-500 text-white"
                      : "text-vortex-navy/75 hover:bg-vortex-teal/10 hover:text-vortex-teal"
                  )}
                >
                  {link.label}
                  <ArrowUpRight className="h-4 w-4 opacity-60" />
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* FOOTER                                                              */
/* ------------------------------------------------------------------ */

export function VortexFooter({ onNavigate }: { onNavigate: (v: VortexView) => void }) {
  return (
    <footer className="relative mt-auto">
      <div className="mx-auto max-w-7xl px-6 pb-10 pt-16">
        <div className="glass overflow-hidden rounded-[2.2rem]">
          <div className="grid gap-10 p-8 sm:p-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
            {/* brand */}
            <div>
              <VortexWordmark size="md" />
              <p className="mt-5 max-w-xs text-sm leading-relaxed text-vortex-navy/65">
                A solo-founded digital product studio. Ready-made websites and
                digital tools — designed, built and shipped by one person.
              </p>
              <div className="mt-6 flex gap-2.5">
                {[
                  { icon: Twitter, label: "Twitter" },
                  { icon: Github, label: "GitHub" },
                  { icon: Mail, label: "Email" },
                ].map((s) => (
                  <button
                    key={s.label}
                    aria-label={s.label}
                    className="grid h-10 w-10 place-items-center rounded-xl border border-vortex-teal/15 bg-white/60 text-vortex-navy/60 transition-all duration-300 hover:-translate-y-0.5 hover:border-vortex-teal/40 hover:text-vortex-teal focus-visible:outline-2 focus-visible:outline-vortex-teal"
                  >
                    <s.icon className="h-4.5 w-4.5" />
                  </button>
                ))}
              </div>
            </div>

            {/* nav column */}
            <div>
              <h3 className="font-display text-[11px] font-bold uppercase tracking-[0.24em] text-vortex-teal">Explore</h3>
              <ul className="mt-4 space-y-2.5">
                {NAV_LINKS.map((l) => (
                  <li key={l.view}>
                    <button
                      onClick={() => onNavigate(l.view)}
                      className="text-sm font-medium text-vortex-navy/70 transition-colors hover:text-vortex-teal focus-visible:outline-2 focus-visible:outline-vortex-teal"
                    >
                      {l.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* categories */}
            <div>
              <h3 className="font-display text-[11px] font-bold uppercase tracking-[0.24em] text-vortex-teal">Categories</h3>
              <ul className="mt-4 space-y-2.5">
                {["SaaS", "E-Commerce", "Portfolio", "Blog", "Fintech", "Health"].map((c) => (
                  <li key={c}>
                    <button
                      onClick={() => onNavigate("hub")}
                      className="text-sm font-medium text-vortex-navy/70 transition-colors hover:text-vortex-teal focus-visible:outline-2 focus-visible:outline-vortex-teal"
                    >
                      {c}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* motto */}
            <div className="flex flex-col justify-between gap-8">
              <div>
                <h3 className="font-display text-[11px] font-bold uppercase tracking-[0.24em] text-vortex-teal">Motto</h3>
                <p className="mt-4 font-display text-2xl font-bold leading-tight text-vortex-ink">
                  Less Clicks.
                  <br />
                  <span className="text-vortex-gradient">More Results.</span>
                </p>
              </div>
              <div className="rounded-2xl border border-vortex-teal/15 bg-vortex-foam p-4">
                <p className="text-xs leading-relaxed text-vortex-navy/65">
                  100% founder-built. No outsourcing, no shortcuts — since day one.
                </p>
              </div>
            </div>
          </div>

          {/* bottom bar */}
          <div className="flex flex-col items-center justify-between gap-3 border-t border-vortex-teal/12 px-8 py-5 sm:flex-row">
            <p className="text-xs text-vortex-navy/50">
              © {new Date().getFullYear()} Vortex.studio — all products founder-built.
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-vortex-navy/40">
              spin up · ship · repeat
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
