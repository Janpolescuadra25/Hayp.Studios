
---
Task ID: 18
Agent: Main Agent (Super Z)
Task: User request — "in the qyra website, link it to qyra.space, then also remove the Haypbooks website in the qyra." Map: the Hub product cards' website affordance (the only site-wide "Visit product" entry point). Qyra gets its real public link; Haypbooks (live but hub-only) loses the website link entirely.

Work Log:
- Audited all link affordances: the Hub card footer button (hayp-hub.tsx:124-137) was the only "Visit product" website entry — it fired a placeholder toast ("public product links arrive at launch") for live products. Showcase cards' "In the Hub" spans are labels, not links; no external links existed anywhere.
- `src/lib/hayp-data.ts`: added optional `url?: string` to the Product interface ("public website — live products without one stay hub-only") and set `url: "https://qyra.space"` on the Qyra entry.
- `src/components/hayp/hayp-hub.tsx` (HubCard footer): replaced the single toast button with a three-way branch —
  1) `product.url` → real external `<a href target="_blank" rel="noopener noreferrer">Visit product ↗</a>`
  2) live without url (Haypbooks) → nothing rendered (website affordance removed; card keeps Live chip, description, tags, date footer)
  3) pipeline products → unchanged "Follow progress" toast
  Removed the now-obsolete live-demo toast branch ("demo link" / "public product links arrive at launch").
- Updated `download/hayp-studios-brief.md`: Qyra table row notes public site qyra.space; new "Product links in the Hub" rule under §8 (live products link out only when they have a public site; Haypbooks is hub-only by design).
- Updated `scripts/refresh-hayp-zip.sh` overlay set for Task 18 (hayp-hub.tsx + hayp-data.ts + worklog.md) and rebuilt `download/hayp.zip`.

Verification:
- `tsc --noEmit` clean.
- Desktop 1440×900 DOM assertions: Qyra card → exactly one anchor {href: https://qyra.space, target: _blank, rel: noopener noreferrer, text: "Visit product"}; Haypbooks card → zero anchors, zero buttons; Zypra card → "Follow progress" button intact; 9 cards total.
- Mobile 390×844: Qyra link visible in viewport, Haypbooks has no anchor/button, scrollWidth 390 = clientWidth (no overflow), zero page errors.
- VLM screenshot review (desktop): Qyra "Visit product" + arrow confirmed; Haypbooks footer shows only "DEC 2025" with no right-side link; cards visually balanced; no layout glitches.
- Console clean (HMR logs only).

Stage Summary:
- Qyra Hub card now links out to https://qyra.space in a new tab; Haypbooks' website affordance removed (hub-only by design); pipeline "Follow progress" toasts untouched.
- Data model gains `Product.url` — future live products (Zypra etc.) link out by simply adding a url in hayp-data.ts.
- Deliverables refreshed: download/hayp.zip (rebuilt), download/hayp-studios-brief.md (§3 + §8).
