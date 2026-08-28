"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ArrowUpRight, Github, Twitter, Mail } from "lucide-react";
import { VortexWordmark } from "./vortex-logo";
import { EASE } from "./vortex-shared";
import type { VortexView } from "./vortex-transition";
import { CATEGORIES } from "@/lib/vortex-data";
import { cn } from "@/lib/utils";

const NAV_LINKS: { view: VortexView; label: string }[] = [
  { view: "landing", label: "The Story" },
  { view: "hub", label: "Hub" },
  { view: "whatsnew", label: "What's New" },
];

/* ------------------------------------------------------------------ */
/* NAVBAR — a quiet hairline bar. Nothing more.                        */
/* ------------------------------------------------------------------ */
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
            className="transition-transform duration-500 hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-vortex-teal"
            aria-label="Vortex.studio — home"
          >
            <VortexWordmark size="sm" animated={!scrolled} />
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
                  onClick={() => onNavigate(link.view)}
                  className={cn(
                    "label-editorial relative py-2 transition-colors duration-400 focus-visible:outline-2 focus-visible:outline-vortex-teal",
                    active ? "text-vortex-ink" : "text-vortex-ink/50 hover:text-vortex-ink"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {link.label}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-0 -bottom-0.5 h-px bg-gradient-to-r from-vortex-teal to-vortex-cyan"
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
              onClick={() => onNavigate("hub")}
              className="group hidden items-center gap-2 rounded-full border border-vortex-ink/15 bg-white/60 px-5 py-2.5 font-display text-[13px] font-semibold text-vortex-ink backdrop-blur transition-all duration-500 hover:border-vortex-ink hover:bg-vortex-ink hover:text-white focus-visible:outline-2 focus-visible:outline-vortex-teal sm:inline-flex"
            >
              Enter Hub
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </button>
            <button
              className="grid h-10 w-10 place-items-center rounded-full border hairline bg-white/60 text-vortex-ink backdrop-blur md:hidden focus-visible:outline-2 focus-visible:outline-vortex-teal"
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
                    setOpen(false);
                    onNavigate(link.view);
                  }}
                  className="group flex items-baseline gap-4 border-b hairline py-5 text-left"
                >
                  <span className="label-editorial text-vortex-teal">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={cn(
                      "font-display text-4xl font-semibold tracking-tight transition-colors",
                      view === link.view ? "text-vortex-teal" : "text-vortex-ink"
                    )}
                  >
                    {link.label}
                  </span>
                  <ArrowUpRight className="ml-auto h-5 w-5 text-vortex-ink/30" />
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
              <p className="font-serif-accent text-xl italic text-vortex-navy/60">
                Less friction. More momentum.
              </p>
              <p className="label-editorial mt-3 text-[10px] text-vortex-ink/40">
                vortex.studio — independent studio
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
export function VortexFooter({ onNavigate }: { onNavigate: (v: VortexView) => void }) {
  return (
    <footer className="relative mt-auto border-t hairline bg-white/60 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6 pb-10 pt-16">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* brand */}
          <div>
            <VortexWordmark size="md" animated={false} />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-vortex-navy/65">
              An independent digital product studio. Ready-made software —
              tools, platforms and game worlds — designed, engineered and
              shipped with momentum.
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
                  className="grid h-10 w-10 place-items-center rounded-full border hairline text-vortex-navy/55 transition-all duration-400 hover:-translate-y-0.5 hover:border-vortex-teal/50 hover:text-vortex-teal focus-visible:outline-2 focus-visible:outline-vortex-teal"
                >
                  <s.icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          {/* nav column */}
          <div>
            <h3 className="label-editorial text-vortex-teal">Explore</h3>
            <ul className="mt-5 space-y-3">
              {NAV_LINKS.map((l) => (
                <li key={l.view}>
                  <button
                    onClick={() => onNavigate(l.view)}
                    className="text-sm font-medium text-vortex-navy/70 transition-colors duration-300 hover:text-vortex-teal focus-visible:outline-2 focus-visible:outline-vortex-teal"
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* categories */}
          <div>
            <h3 className="label-editorial text-vortex-teal">Categories</h3>
            <ul className="mt-5 space-y-3">
              {CATEGORIES.map((c) => (
                <li key={c.name}>
                  <button
                    onClick={() => onNavigate("hub")}
                    className="text-sm font-medium text-vortex-navy/70 transition-colors duration-300 hover:text-vortex-teal focus-visible:outline-2 focus-visible:outline-vortex-teal"
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
              <h3 className="label-editorial text-vortex-teal">Motto</h3>
              <p className="mt-5 font-display text-2xl font-bold leading-tight tracking-tight text-vortex-ink">
                Less Friction.
                <br />
                <span className="font-serif-accent font-normal italic text-vortex-gradient">
                  More Momentum.
                </span>
              </p>
            </div>
            <p className="border-l-2 border-vortex-teal/40 pl-4 text-xs leading-relaxed text-vortex-navy/60">
              Precision-built. No templates, no shortcuts — since day one.
            </p>
          </div>
        </div>

        {/* bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t hairline pt-6 sm:flex-row">
          <p className="text-xs text-vortex-navy/50">
            © {new Date().getFullYear()} Vortex.studio — designed, built and shipped with momentum.
          </p>
          <p className="label-editorial text-[10px] text-vortex-navy/40">
            spin up · ship · repeat
          </p>
        </div>
      </div>
    </footer>
  );
}
