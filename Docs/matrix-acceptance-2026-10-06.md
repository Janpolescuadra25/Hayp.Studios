# Phase 5A-4b: Browser Acceptance Matrix & Verification
**Date:** 2026-10-06  
**Status:** IN PROGRESS  
**Local Test URL:** `http://localhost:3000` (Single-Page SPA with client-side view navigation)

---

## 1. Landing View (`view === "landing"`)
| Check | Expected Result | Verified |
|---|---|---|
| Hero Section | Tagline "Ready-Made Software" renders clearly with background effects | [ ] |
| Product Cards | 4 cards visible (Qyra, Zypra, Cirqa, Lumora) with canonical icons | [ ] |
| Qyra Card Link | Clicking Qyra card opens `https://qyra.space` in a new tab | [ ] |
| "Enter Hub" CTA | Transitions view to The Hub with smooth tunnel animation | [ ] |
| "What's New" Link | Transitions view to What's New with wave animation | [ ] |
| Reduced Motion | With prefers-reduced-motion active, transitions swap instantly | [ ] |

## 2. The Hub View (`view === "hub"`)
| Check | Expected Result | Verified |
|---|---|---|
| Product Catalog | All 4 products displayed with categories and taglines | [ ] |
| Category Filters | Filtering toggles display of Automation, Social, E-Commerce | [ ] |
| Status Badges | Live and Planned status badges styled correctly | [ ] |
| "Go Home" CTA | Transitions view back to Landing page | [ ] |
| Product Links | External links open target websites in new tab | [ ] |

## 3. What's New View (`view === "whatsnew"`)
| Check | Expected Result | Verified |
|---|---|---|
| Changelog Timeline | Chronological changelog items render with Framer Motion animations | [ ] |
| Type Tags | Feature, Fix, Improvement tags render with respective colors | [ ] |
| Responsive Layout | Timeline scales cleanly between mobile and desktop widths | [ ] |
| Fallback Data | Static changelog displays gracefully if API is disconnected | [ ] |

## 4. Navigation & Responsive Controls
| Check | Expected Result | Verified |
|---|---|---|
| Desktop Header | Nav links centered, active view highlighted with animated underline | [ ] |
| Mobile Hamburger | Clicking hamburger opens full-screen mobile menu | [ ] |
| Mobile Navigation | Tapping any link navigates and automatically closes mobile drawer | [ ] |
| Body Scroll Lock | Background scrolling locked while mobile menu is open | [ ] |
| Navbar Blur | Scrolling past 24px activates backdrop blur and border | [ ] |
