# Worklog

---
Task ID: 1
Agent: Main Agent (Super Z)
Task: Build a mind-blowing landing page for Vortex.studio — solo-founded digital product studio. Requirements: animated background, scroll-driven story animations, products on a separate page with different transitions per navigation, green/blue theme with white-dominant background, custom Vortex logo.

Work Log:
- Initialized fullstack environment (Next.js 16 + Tailwind 4 + shadcn/ui + framer-motion already available)
- Designed theme system in `src/app/globals.css`: teal (#0d9488) / emerald (#10b981) / cyan (#06b6d4) / navy (#1e3a5f) on white; glassmorphism utilities, conic-border animation, gradient text, rotation keyframes, marquee, float, scroll-dot animations
- Set up fonts (Space Grotesk display + Inter body) and Vortex metadata in `src/app/layout.tsx`
- Created data layer `src/lib/vortex-data.ts`: 12 products across 6 categories, 8 changelog entries, stats
- Built custom SVG logo `src/components/vortex/vortex-logo.tsx`: bold curved V arms + mathematically generated tapered logarithmic spiral + counter-rotating orbit rings with comet dots; plus full wordmark component ([V]ortex / .studio)
- Built canvas background `src/components/vortex/vortex-background.tsx`: flow-field particle system with 2-3 drifting vortex attractors, silk trails, pointer swirl interaction, reduced-motion static fallback, visibility/resize handling
- Built 3 distinct cinematic page transitions `src/components/vortex/vortex-transition.tsx`: tunnel (rings + conic swirl → Hub), wave (skewed gradient columns → What's New), portal (rotating disc + iris → Landing), with timing contract (swapAt 680ms / total 1600ms)
- Built landing page sections:
  - `vortex-landing-hero.tsx`: hero (wordmark entrance, parallax fade on scroll, magnetic CTAs, floating stat chips, scroll indicator) + angled marquee strip + shared helpers (ScrollScrubText word-illumination, FadeUp, SectionTag, MagneticWrap)
  - `vortex-landing-story.tsx`: Ch.1 Solo Vision (orbiting founder visual + scroll-scrub text), Ch.2 Ready.Set.Ship (parallax browser mockups + alternating blur-in features), Ch.3 horizontal pinned scroll catalog fly-through with progress rail, Stats count-up flip cards
  - `vortex-landing-showcase.tsx`: featured teaser (3D tilt cards), Motto (letter-by-letter flip reveal + rotating swirl halo), Final CTA (conic animated border panel)
- Built Vortex Hub `src/components/vortex/vortex-hub.tsx`: sticky glass control bar (live search, 7 category pills with layoutId spring, sort select), animated grid (AnimatePresence popLayout), empty state, toast on visit
- Built What's New `src/components/vortex/vortex-whatsnew.tsx`: scroll-drawn timeline spine, alternating glass entries with kind badges (launch/update/announcement/milestone)
- Built chrome `src/components/vortex/vortex-chrome.tsx`: glass navbar (scroll-aware, active pill, mobile hamburger panel) + footer
- Assembled `src/app/page.tsx`: client-side view routing (landing/hub/whatsnew) with transition orchestration, reduced-motion instant swap, timer cleanup

Verification (agent-browser + VLM):
- Hero verified: logo, gradient wordmark, CTAs, particle background all render
- Story chapters verified: orbit visual, gradient headings, mockups, horizontal cards all clean
- Transitions verified mid-flight: tunnel covers screen with rings + logo; wave covers with gradient columns + logo badge
- Hub verified: search "finance" → 1 result; reset → 12; sort Newest → AnalytiQ first; category pills present
- What's New verified: timeline with nodes + alternating cards
- Mobile (390px) verified: hero/story/footer stack cleanly, hamburger menu navigates correctly
- Fixed issues found: marquee w-max horizontal overflow (wrapped in clipping parent with -mx-4), framer-motion scroll-container warning (html position: relative)
- Final state: zero console warnings/errors, no horizontal overflow at any scroll position, lint passes

Stage Summary:
- Deliverable: fully interactive single-route Next.js app at `/` with 3 views connected by distinct cinematic transitions
- All animations respect prefers-reduced-motion; canvas pauses when tab hidden
- Preview: https://preview-<bot-id>.space-z.ai/ (use Preview Panel)

---
Task ID: 2
Agent: Main Agent (Super Z)
Task: Redesign per user feedback — replace exaggerated background with aesthetic interactive liquid + droplets background; fix Ch.1 statement to "Every product. Built by Vortex Studios."; replace fictional 12-product catalog with the real product lineup (Haypbooks, Qyra live; Zypra, Cirqa, Lumora + 4 game concepts in pipeline).

Work Log:
- Added Instrument Serif font (editorial italic accents) to layout.tsx
- globals.css: quieter glass, editorial shadows (no neon glows), label-editorial utility, aurora/grain/spin-slow keyframes, slowed all logo rotations
- Built vortex-shared.tsx: MaskedLine, WordIlluminate, SectionTag, Magnetic, FadeUp, EASE primitives
- Rewrote background as interactive liquid metaball canvas (vortex-background.tsx): low-res ImageData field render upscaled + blur; 7 drifting blobs that lean toward cursor; cursor stirrer blob that grows with pointer speed; ambient droplet rain + blob drips that merge/absorb (metaball necking); click = burst of 7 droplets + double ripple rings; hairline grid + film grain + vignette; reduced-motion static frame; pauses when tab hidden
- Rewrote page transitions as quiet-cinematic: Curtain (Hub), Silk Veil with rippling SVG edge (What's New), Iris breath (Home) — each holds the V mark + editorial label mid-transition
- Rewrote hero: intro curtain, masked line reveals, rotating orbit badge, editorial spec strip (02 live / 07 pipeline / 05 categories / ∞), marquee with real product names
- Rewrote story: Ch.1 word-illuminated statement "Every product. Built by Vortex Studios. No exceptions." with real-product caption; Ch.2 sticky editorial craft rows; Ch.3 measured horizontal category gallery (5 categories, live counts, "2 live today. 7 more spinning." intro card); quiet count-up stats
- Rewrote showcase: featured spread = Haypbooks/Qyra/Zypra with status chips; pinned scrubbed Motto scene; refined CTA
- Rewrote data layer (vortex-data.ts): 9 products — Haypbooks (Accounting, LIVE), Qyra (Automation/QuickBooks, LIVE), Zypra (Automation/Xero, development), Cirqa (Social, planned), Lumora (E-Commerce, planned), Project: Arena (MOBA), Bastion (strategy), Overdrive (open world), Emberfall (RPG — all concept); STATUS_META chips, STATUS_ORDER sort, 8-entry changelog telling the real studio story, honest STATS (2/7/5/∞)
- Reworked Hub: status chips on cards, "Live first" default sort, live/pipeline meta line, quiet hairline control bar, mobile full-screen editorial menu
- Updated metadata (title/description/keywords) to reflect real products

Verification (agent-browser + VLM + pixel analysis):
- Liquid background renders and animates (VLM confirmed shape movement between frames)
- Droplets verified via pixel-cluster analysis: 25 small droplet clusters visible per frame
- Ripples visible on click (VLM confirmed)
- Ch.1 statement + Ch.3 gallery verified correct (5 categories, live counts)
- Hub verified: all 9 products with correct Live/In development/Planned/Concept chips
- Mobile 390px: no horizontal overflow, hero/story clean, liquid scales well
- Final: zero console errors/warnings; verify screenshots cleaned from download/

Stage Summary:
- Deliverable: aesthetic ad-style landing with interactive liquid+droplets background, real product catalog across landing/hub/whatsnew
- All motion respects prefers-reduced-motion; canvas pauses when hidden
- Preview: https://preview-<bot-id>.space-z.ai/

---
Task ID: 3
Agent: Main Agent (Super Z)
Task: Replace the rejected liquid-metaball background (too dark/heavy) with a new white-dominant, gamer-fit background concept per user feedback.

Work Log:
- Deleted liquid-era verification artifact scripts/analyze_drops.py (user asked for the new output to be permanently removed)
- Designed + implemented "NEON ARCADE FIELD" background concept in vortex-background.tsx (complete rewrite):
  - Static hexagonal strategy lattice canvas (flat-top axial hex grid, navy 3% strokes, drawn once per resize; shared edges intentionally double toward 6%)
  - Dynamic canvas: 5 neon light-cycle racers (3 on mobile) in brand teal/emerald/cyan sweep the white void with layered halo+core strokes and destination-out per-frame fade (silky afterglow)
  - Racer behavior: layered-sine wander, edge steering band keeps action mid-screen, occasional nitro boosts (2.7x speed, wider halo, spark burst), off-screen respawn aimed across the screen
  - Hex cells ignite under every trail head (axial pixel→hex cube rounding) and fade out — the board powers up
  - Pixel sparks: rotating diamond squares shed from trails, click bursts
  - Cursor = player token (pointer:fine only): spring-followed halo + ring + rotating pickup diamond + orbiting satellite dot; trails steer toward the token within 34% of viewport
  - Click/tap = MOBA-style ability: expanding shockwave ring + echo ring + radial hex-cell ignition wave + 10-spark burst
  - White dominance: near-white #fbfdfd base, two 5% brand radial tints, trails are thin 2–3px cores with 10% halos, pulse fills capped at 11% alpha
  - Perf: DPR capped 1.5, pulse map capped 220/240, sparks capped 110, passive listeners, visibilitychange pause, prefers-reduced-motion renders one composed still frame (110-step warm-up sim)
- TypeScript clean for the file; no console errors

Verification (agent-browser + VLM):
- VLM confirmed: background is overwhelmingly white-dominant and light; teal/cyan glow trails visible; hexagonal lattice visible; "energetic/gamer-like yet clean and premium"; no harsh dark areas or artifacts
- Interaction verified: click shockwave ring visible + expanding; trails move between frames (alive); cursor token with ring visible after mouse move; hex cells softly lit
- Desktop story + gallery sections: background stays clean behind content, text readable
- Mobile 390px: no horizontal overflow, white-dominant, trails scaled appropriately
- Temp screenshots kept in /tmp/vortex-verify (outside download/)

Stage Summary:
- New background concept "Neon Arcade Field" live: hex strategy lattice + neon racers + cell ignition + pixel sparks + player token + click shockwaves, all white-dominant and gamer-fit
- Rest of the site (real product catalog, editorial sections, transitions) unchanged and verified against the new background

---
Task ID: 4
Agent: Main Agent (Super Z)
Task: Per user feedback — remove cursor token and snake-cursor feel from background (keep animation); rewrite identity copy to advertise Vortex itself (no product lists, no "one person/founder/solo"); replace motto "Less clicks. More results."; redesign logo to fit gamer aesthetic.

Work Log:
- Logo redesign (vortex-logo.tsx full rewrite): esports hex-badge — sharp faceted twin-blade "V" with center seam facet, edge highlights, apex spark diamond, inside a pointy-top hexagonal frame (R=52, gradient stroke + inner echo ring), radial energy aura; animated mode adds slowly rotating dashed hex reticle (R=55) with cyan comet dot. Same component API (size/animated/showOrbit/idPrefix) so all 6 usages (navbar, footer, hero intro, orbit badge, transition BrandMoment, motto watermark) update automatically
- Background de-snaking (vortex-background.tsx): removed player-token cursor visual + pointermove listener + cursor attraction entirely; removed round head-glow dots (the "snake head"); wander turn rates cut ~60% (0.28-0.58 rad/s) and sine frequencies slowed (0.3/0.13) for long straight light sweeps; afterglow fade lowered 0.085→0.07 for longer streak tails; kept hex lattice, cell ignition, nitro boosts, pixel sparks, click shockwaves
- Copy → brand advertising (no products, no person):
  - Ch.1 caption: "Vortex is momentum made visible — an independent studio built on a single obsession: digital products that feel effortless. Strategy, design, engineering and motion spin here as one force. No templates, no shortcuts, no settling. What leaves the vortex lands ahead of expectation — every time."
  - Hero paragraph: "Vortex.studio is an independent digital studio built on momentum — strategy, design, engineering and motion spinning as one force. We obsess over the details others skip, and nothing ships until it feels effortless."
  - Craft rows de-personalized ("same pair of hands"/"founder who answers" → one-system/accountability phrasing); Ch.2 quote "No outsourcing." → "No templates."; FinalCta founder line → momentum line; OrbitBadge ring text "founder-built" → "precision-built"; marquee "Founder-built" → "Independent Studio"; changelog day-one entry de-founderized; metadata description/OG/keywords de-soloized
- New motto "Less friction. More momentum." everywhere: MottoSection (friction/momentum with gradient), footer motto block, mobile menu, marquee, craft-row reference
- Footer stale mock categories (SaaS/Portfolio/Blog/Fintech/Health) replaced with real CATEGORIES from data (Accounting, Automation, Social, E-Commerce, Games)

Verification (agent-browser + VLM):
- Hero: hex-badge logo confirmed top-left + orbit badge; white-dominant lattice + light sweeps; no cursor token/head dots; hero paragraph quoted correctly with no products/founder
- Click shockwave ring still expands on click
- Ch.1 caption verified at correct scroll position — pure studio-identity copy
- Motto section verified: "Less friction." / "More momentum." gradient + faint giant hex-badge watermark
- Footer verified: hex-badge logo, real categories, new motto
- Hub verified: new logo in navbar, status chips intact
- Mobile 390px: no overflow, clean hero; console clean across checks

Stage Summary:
- Gamer hex-badge logo live across all surfaces; background is now autonomous light sweeps (no cursor dependence, no snake feel) with all animations intact; all identity copy is pure Vortex brand advertising; motto updated to "Less friction. More momentum."

---
Task ID: 5
Agent: Main Agent (Super Z)
Task: Per user feedback — confirm cursor-snake is gone from the background (keep the hex "snake octagon" light sweeps); replace the hero headline "Ready-made digital products, done properly." without using the phrase "Digital products".

Work Log:
- Audited current state: cursor token/attraction was already removed in commit cc968b2; grep confirmed the only pointer code left is the Magnetic button hover (UI affordance) and the pointerdown click-shockwave (no tracking). Last commit before this session touched worklog only, so served code = de-snaked code.
- Headline rewrite: hero H1 line 2 "digital products," → "software," — headline now reads "Ready-made / software, / done *properly.*" (keeps 3-line masked reveal + serif gradient finale)
- Consistency sweep of the exact phrase "digital products" (now zero matches in src/):
  - layout.tsx: title + OG title → "Vortex.studio — Ready-Made Software"; keyword "digital products" → "ready-made software"
  - vortex-landing-story.tsx Ch.1 caption: "a single obsession: software that feels effortless."
  - vortex-data.ts changelog day-one entry: "ship complete, ready-to-use software…"
  - Deliberately kept the studio descriptor phrases ("A digital product studio — est. 2025" overline, footer "independent digital product studio") — different phrase, user-approved positioning
- Verification (agent-browser + VLM at 1440x900):
  - Headline verified: "Ready-made software, done properly." renders in the hero
  - Cursor test: mouse moved to (300,450), (1150,200), (720,480) with screenshots — VLM confirmed NO marker/ring/diamond/player-token at any cursor position; backgrounds identical in nature across shots
  - Animation alive: streaks/trails moved between frames (VLM confirmed)
  - Click shockwave: ring + radial hex ignition still fires on click (VLM confirmed)
  - Zero console errors/warnings; tsc clean for src/
- Committed as 3a91b2b; verification screenshots cleaned from /tmp

Stage Summary:
- Background is fully autonomous: hex lattice + light sweeps + cell ignition + sparks + click shockwaves, with zero cursor dependence (user should hard-refresh if they still see the old token — browser cache)
- Hero headline and all site copy now use "software" instead of "digital products"; metadata title/OG/keywords updated to match

---
Task ID: 6
Agent: Main Agent (Super Z)
Task: Per user feedback — Chapter 3 "The Catalog / 5 worlds. One standard." doesn't fit the studio; review the whole section (intro card, category cards, outro) and decide better copy.

Work Log:
- Review findings: (1) "The Catalog" reads dry/e-commerce, breaks the arcade-momentum voice; (2) "worlds" is inaccurate — only Games is a world, accounting/automation/social/e-commerce are not; (3) intro card body listed the categories the cards show seconds later (redundant); (4) blurbs were flat feature-lists; (5) outro "…and then, game worlds." came AFTER the Games card — anticlimactic and redundant
- Decision: align the section with the racing metaphor the background already establishes (neon light racers sweeping lanes across the hex field)
- Changes (vortex-landing-story.tsx):
  - SectionTag: "The Catalog" → "The Circuit" (+ code comment updated)
  - Headline: "5 worlds. One standard." → "5 lanes. One standard." (data-driven CATEGORIES.length kept)
  - Intro card body: category list → "Every lane runs the same standard — strategy, design, engineering and motion as one force. Live today or spinning up next, it all lives in the Hub." (kept "The pipeline / 2 live today. 7 more spinning." — real numbers, on-brand)
  - Outro card: "…and then, game worlds." → "…and the next spin."
- Changes (vortex-data.ts CATEGORIES blurbs → momentum voice):
  - Accounting: "Books, ledgers & reports" → "Bookkeeping, set in motion."
  - Automation: "Data auto-posting pipelines" → "Data that posts itself."
  - Social: "Feeds, circles & messaging" → "Feeds with real gravity."
  - E-Commerce: "Marketplaces & stores" → "Storefronts built to sell."
  - Games: "Worlds worth playing." kept (the payoff — games ARE worlds)
- Ch.2 "from accounting systems to game worlds" intentionally kept — it's a scale contrast where "worlds" is literal for games

Verification (agent-browser + VLM at 1440x900, pinned section at 380vh):
- Start: "03 — The Circuit" / "5 lanes. One standard." / dark card "The pipeline / 2 live today. 7 more spinning." / cards 01–03 with new blurbs — all quoted exactly by VLM
- Mid: Automation / Social "Feeds with real gravity." / E-Commerce "Storefronts built to sell." / Games "Worlds worth playing." confirmed
- Intro body paragraph quoted verbatim by VLM; outro "…and the next spin." confirmed via DOM textContent
- Mobile 390px: no horizontal overflow (scrollWidth 390); console clean; committed as 5a5109f; screenshots cleaned

Stage Summary:
- Chapter 3 is now "The Circuit — 5 lanes. One standard." with vortex-voiced blurbs and a forward-motion outro; the section's racing language matches the neon racer background instead of generic catalog copy

---
Task ID: 7
Agent: Main Agent (Super Z)
Task: Per user feedback — (1) lighten the click shockwave (too dark), (2) remove the moving snake-line streak animation from the background entirely.

Work Log:
- Full rewrite of vortex-background.tsx ("HEX ARCADE FIELD — the calm cut"):
  - REMOVED: all racer code (Racer interface, SPEEDS, makeRacer, respawn, stepRacers, angDelta, edge steering, nitro boosts, trail shedding, wrap logic, racer clamping in onResize) — the moving neon snake lines are gone
  - Background is now a STILL hexagonal lattice; the dynamic canvas animates only on click/tap
  - Lightened the click shockwave: main ring dark teal [13,148,136] @ alpha 0.5 / 2.5px → bright teal [45,212,191] @ alpha 0.3 / 2px; echo ring cyan alpha 0.24 → 0.14
  - Palette swapped to lighter set (bright teal / cyan / emerald — dropped dark & deep teal); hex ignition fill cap 0.11 → 0.10, stroke 0.09 → 0.08; sparks alpha 0.85 → 0.7, cap 110 → 60, click burst 10 → 8
  - fadeFrame 0.07 → 0.12 — cleaner residue-free ring afterglow
  - Reduced-motion still frame recomposed: gentle ring of lit cells around center + a few sparks (was warmed-up racers)
  - Kept: static hex lattice, brand tints, grain, vignette, click shockwave + radial hex ignition + sparks, DPR cap, visibilitychange pause, passive listeners

Verification (agent-browser + VLM, 1440x900 + 390px):
- Idle frames 1.6s apart: VLM confirmed background is a completely still hex grid, zero streaks/snake lines; frames identical
- Click: shockwave ring + radial hex ignition present; VLM confirmed color reads "light and subtle (pale bright teal) rather than dark or saturated"
- Mid-scroll content over the calm background: clean, text/cards legible
- Mobile 390px: no horizontal overflow, no layout breaks; zero console errors
- tsc clean for src/; committed as 9d05d2f; screenshots cleaned

Stage Summary:
- The background is now a calm, still hex board that reacts only to clicks with a light bright-teal shockwave + cell ignition + sparks — no roaming lines, no cursor dependence, nothing dark

---
Task ID: 8
Agent: Main Agent (Super Z)
Task: Per user feedback — (1) rewrite the four Chapter 2 craft rows so they relate to what Vortex is about, (2) review ALL site wordings for logical correctness and fix where needed.

Work Log:
- Full-copy audit across hero, story chapters, showcase, hub, whatsnew, chrome, data layer, metadata. Verified as CORRECT: counts (2 live / 7 pipeline / 5 categories everywhere), changelog chronology vs product dates (founded 2025-11-01 → games 2026-08-10 → milestone 2026-08-25), motto consistency, marquee, circuit card meta lines, no founder/solo phrasing, zero "digital products" phrase.
- CRAFT_ROWS rewritten (vortex-landing-story.tsx):
  1. "Ships whole, always" — "Every product leaves the vortex complete — screens, flows, states, edge cases and docs included. Not a starter kit, not a promising beta. A finished thing, running live." (was "you can launch the same afternoon" — template-seller speak contradicting Vortex's own live products)
  2. "One system, one voice" — "…crafted as one system, under one roof. Nothing gets lost between disciplines — so the product speaks with a single voice, end to end." (was "teams that don't talk" — generic corporate jab)
  3. "Effortless is the bar" — kept the ledger/feed/game-HUD line; "isn't just the motto" → "isn't a slogan on a wall here"
  4. "Dependable by default" — "Clean code, honest docs and support that answers. From live ledgers to worlds still loading… it has to work — and keep working." (was "accountability… isn't a department")
- Logic fixes found by the audit:
  - Footer brand blurb + metadata description/OG: "Ready-made websites, tools and platforms" → "Ready-made software — tools, platforms and game worlds…" (catalog contains ZERO websites — factually wrong claim)
  - Featured section label "In the Wild" → "The Lineup" (Zypra is In development — not "in the wild"; lineup = accurate for live + upcoming)
  - FinalCta overline "Spin one up" → "Take one for a spin" (imperative told the VISITOR to create a product — visitors adopt, the studio spins up) + closing line "for whoever launches next" → "one lane at a time." (agency-vibe ambiguity, ties to Circuit)
  - Hub header "Two products live, seven more spinning" hardcoded → dynamic {LIVE_COUNT}/{PIPELINE_COUNT}
  - Hub footer note "Head back to the story to see what's coming next" → "…to see where the momentum comes from." ("what's coming next" is What's New's job; the story explains the studio)
  - Hub live-product toast "This catalog is a live preview. Product links open from the public hub." → "This hub is a live preview — public product links arrive at launch." (old copy confused: we ARE in the hub)

Verification (agent-browser + VLM + DOM):
- Craft rows 02/03 + "04 — THE LINEUP" + card statuses (Haypbooks LIVE, Qyra LIVE, Zypra IN DEVELOPMENT) quoted exactly by VLM
- DOM asserts all green: all 4 new craft row titles+bodies, The Lineup label, "Take one for a spin", "one lane at a time.", footer blurb swap
- Hub header renders "2 products live, 7 more spinning…" (dynamic); CTA panel visually verified clean with all new copy; zero console errors; tsc clean for src/
- Committed as 2eac12e; screenshots cleaned

Stage Summary:
- Craft rows now speak pure Vortex (whole-shipping, one-voice, effortless bar, dependability) and every factual/logical copy error found in the site-wide audit is fixed — most notably the false "websites" claim and the mislabeled "In the Wild" section

---
Task ID: 9
Agent: Main Agent (Super Z)
Task: Per user feedback — change the hero headline "Ready-made software, done properly." because "done properly" over-promises (a shipped bug would make it a joke). Find a bug-proof replacement.

Work Log:
- Reasoning: "done properly" is an OUTCOME claim (perfect execution) that a single bug disproves; replaced with a MOMENTUM claim the studio can always keep. Chose "built to move." — software that's alive, evolving, continuously updated (the What's New changelog literally proves it); a bug doesn't contradict it, a fix CONFIRMS it. Avoided "with momentum."/"in motion." (collide with the hero paragraph's "built on momentum"/"engineering and motion" in the same viewport) and "no shortcuts." (negative construction + repeats Ch.1 canon)
- Grep audit: "properly" existed in exactly ONE place in src/ (hero H1 line 3); zero other perfection claims site-wide (no "perfect/flawless/bug-free/bulletproof")
- Edit (vortex-landing-hero.tsx): H1 line 3 "done properly." → "built to move." — accent span (italic serif + vortex-gradient) now wraps "move."; identical 14-char length so the 3-line masked reveal layout is unchanged
- Deliberately unchanged: metadata title "Vortex.studio — Ready-Made Software" (no perfection claim), OrbitBadge "precision-built" (build-intent, not outcome), craft rows "Ships whole, always"/"has to work" (scope/standard statements, distinct from the flawlessness promise the user rejected)

Verification (agent-browser + VLM, 1440x900 + 390px):
- DOM assert: h1.textContent = "Ready-made software, built to move."; accent node = "move." with italic + teal gradient backgroundImage
- VLM: quoted headline verbatim line-by-line; confirmed "move" italic-serif gradient accent, 3-line layout balanced, no clipping/glitches
- Mobile 390px: headline correct, no horizontal overflow; console clean (zero errors/warnings); tsc clean for src/
- Committed as 4eb4895; screenshots cleaned from /tmp

Stage Summary:
- Hero headline is now "Ready-made software, built to move." — bug-proof positioning that trades the perfection promise for the momentum promise, keeping the 3-line masked reveal + serif gradient finale intact
