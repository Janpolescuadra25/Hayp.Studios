# HAYP.STUDIOS — PROJECT ROADMAP
**Active Baseline Commit:** c9096dc89430913720b3eddbe786d4eba63d82ab  
**Last Updated:** 2026-10-18 — Phase 12: Resident Artist Profiles, Dynamic SEO & Commercial Commission Pipeline initialized  
**Project Status:** Phases 1 through 11 are 100% COMPLETE and fully archived in ARCHIVED_ROADMAP.md. Phase 12 is currently ACTIVE.

---

## ARCHIVE REFERENCE
All completed phases and deliverables are preserved with verification dates and baseline commit hashes in:
- **ARCHIVED_ROADMAP.md** (Phases 1 through 11 inclusive)

---

## ACTIVE ROADMAP: PHASE 12 — RESIDENT ARTIST PROFILES, DYNAMIC SEO & COMMERCIAL COMMISSION PIPELINE

### Overview & Strategic Goal
Phase 12 transforms Hayp.Studios from a portfolio showcase into a complete creator agency platform. It delivers dedicated individual artist public profiles, search-optimized dynamic metadata and rich previews, an end-to-end commercial project commission pipeline, and high-performance media delivery.

---

### Deliverables Breakdown

- [ ] **Deliverable 12.1: Individual Artist Public Profiles (`/artists/[slug]`) & Portfolio Deep-Linking**
  - Implement dynamic page `src/app/artists/[slug]/page.tsx` rendering individual resident creator profile, full biography, social links, and categorized project gallery.
  - Add deep-linking between `/portfolio` project showcase cards and artist profile views.
  - Implement direct artist commission contact modal with artist pre-selection.
  - Unit and component tests in `src/app/artists/[slug]/page.test.tsx` and `src/components/hayp/hayp-artist-profile.test.tsx`.
  - *Documentation:* `src/components/hayp/README.hayp-artist-profiles.md`.

- [ ] **Deliverable 12.2: Dynamic SEO, OpenGraph Preview Cards & Schema.org Structured Data**
  - Implement Next.js `generateMetadata` on `/artists/[slug]` and portfolio project modals with dynamic titles, descriptions, and keywords.
  - Configure dynamic OpenGraph preview cards (`og:image`, `og:title`, `og:description`) and Twitter card summaries for seamless social sharing.
  - Embed Schema.org JSON-LD structured data (`ProfilePage`, `Person`, `VisualArtwork`, `Organization`) for rich search indexing.
  - Unit tests for metadata generation and structured data formatting.
  - *Documentation:* `src/components/seo/README.md`.

- [ ] **Deliverable 12.3: Project Commission Inquiry Flow & Commercial Work Request Pipeline**
  - Extend `/api/inquiry` route and schema to support project-specific commission inquiries linked to `productId` and `artistId` with budget tiers.
  - Add commercial inquiry trigger from project modal and artist profile pages.
  - Enhance admin inquiry management dashboard (`hayp-admin.tsx`) with status lifecycle (`NEW`, `REVIEWING`, `ACCEPTED`, `DECLINED`), project badges, and admin response notes.
  - API and component regression tests in `__tests__/api/inquiry-commercial.test.ts`.
  - *Documentation:* `src/components/hayp/README.hayp-inquiry-commercial.md`.

- [ ] **Deliverable 12.4: Frontend Media Performance & Next.js Image Component Hardening**
  - Upgrade raw `<img>` tags across `hayp-portfolio-grid.tsx`, `hayp-project-modal.tsx`, and artist profile views to Next.js `<Image />`.
  - Implement responsive `sizes` attribute, progressive blur placeholders, and graceful fallback handling for missing/slow assets.
  - Validate client-side caching parity with Caddy 1-day immutable edge caching (`/uploads/*`).
  - Component performance tests verifying responsive image attributes and loading fallbacks.
  - *Documentation:* `src/components/hayp/README.hayp-media-optimization.md`.

- [ ] **Deliverable 12.5: Phase 12 Deployment Runbook, Production Validation & Final Regression Drill**
  - Create operational runbook `deploy/README_12.5_COMMISSION_SEO_DEPLOYMENT.md` for Hetzner VPS `vortex` (`2.28.120.85`).
  - Execute full regression test suite (`bun test`) and Turbopack production compilation (`bun run build`).
  - Verify live HTTP status, dynamic OpenGraph headers via curl, and edge caching headers.
  - Update `deploy/README.md` and complete Phase 12 closeout.
  - *Documentation:* `deploy/README_12.5_COMMISSION_SEO_DEPLOYMENT.md`.
