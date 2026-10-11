# HAYP.STUDIOS — ACTIVE ROADMAP
**Last Updated:** 2026-10-11  
**Repository Branch:** main  
**Current Baseline Commit:** `0cdc3137e842820727f1f173244348594a1d5842`  
**Runtime Architecture:** Next.js 16.1.3 (App Router) | Bun Runtime | SQLite / PostgreSQL (Prisma ORM) | Tailwind CSS | Port 3003  
**Target Production Server:** Hetzner VPS vortex (IPv4 2.28.120.85) | Pull-Only Deployment Model  
**Archived Completed Phases:** See [ARCHIVED_ROADMAP.md](./ARCHIVED_ROADMAP.md) (Phases 1, 2, 3, 4, 5, 5B, 6, 6-3, 7 verified complete).

---

## ACTIVE MILESTONE: PHASE 8 — STUDIO OPERATIONS, SECURITY HARDENING & DATABASE ARCHITECTURE
**Status:** IN PROGRESS (ACTIVE)  
**Baseline Commit:** `0cdc3137e842820727f1f173244348594a1d5842`  
**Prerequisites:** All foundation milestones (Phases 1–7) verified operational in local runtime; Phase 8 establishes database migration and operational readiness for scalable production.

### 1. Objective & Scope
Transition Hayp.Studios from a creative portfolio showcase into an active, secure studio operations hub. This phase eliminates critical authentication vulnerabilities, initializes formal Prisma migrations with a production database transition path, establishes a database-backed client inquiry pipeline, adds an authenticated studio operations view within the existing single-page navigation architecture, and prunes unused schema stubs.

### 2. Deliverables & Implementation Sequence

- [x] **Deliverable 8.1 — Security & Authentication Hardening (Priority 1)**
  - Update NextAuth credential verification in `src/lib/auth.ts` to validate using `bcrypt.compare` against a bcrypt-hashed `ADMIN_PASSWORD` (or `ADMIN_PASSWORD_HASH`) stored in `.env`.
  - Document the requirement and CLI command to generate a bcrypt hash for the admin password in `.env.example` and documentation.
  - Enforce strict server-side session and `ADMIN` role checks across all protected API routes.

- [x] **Deliverable 8.2 — Database Architecture & Migration Workflow (Priority 2)**
  - Initialize formal Prisma migrations (`prisma/migrations/`) to replace reliance on `db:push`.
  - Configure production database migration path (supporting PostgreSQL for production deployment on Hetzner VPS `vortex` while maintaining SQLite local compatibility).
  - Update `.env.example` with documented `DATABASE_URL` format for both local SQLite and production PostgreSQL.

- [x] **Deliverable 8.3 — Database-Backed Client Inquiry Pipeline (Priority 3)**
  - Add `Inquiry` model to `prisma/schema.prisma` (fields: `id`, `name`, `email`, `engagementType`, `brief`, `status` [default: "NEW"], `createdAt`, `updatedAt`).
  - Create `/api/inquiry` route to validate and persist client project briefs across the 4 engagement tiers (Kinetic Identity, Interactive Web Experience, Motion & 3D Spatial, General Creative Partnership).
  - Reuse the existing IP-based rate-limiting utility pattern from `src/app/api/analytics/event/route.ts` to safeguard `/api/inquiry` against spam.
  - Update `src/components/hayp/hayp-contact-form.tsx` to submit to `/api/inquiry` with resilient fallback to EmailJS and Radix toast feedback.

- [x] **Deliverable 8.4 — Authenticated Admin Operations View (Priority 4)**
  - Integrate an authenticated `ADMIN` view into the existing single-page client-side view navigation in `src/app/page.tsx` (`HaypHub`), preserving Framer Motion visual transitions.
  - Build inquiry management UI allowing studio administrators to list, inspect, filter by engagement type, and update status of client inquiries.
  - Add client-side authentication gate to the analytics view (`HaypAnalytics`), displaying login prompt or redirecting unauthenticated visitors.

- [ ] **Deliverable 8.5 — Environment Documentation & Verification Runbook (Priority 5)**
  - Document all missing environment variables in `.env.example` (`NEXT_PUBLIC_EMAILJS_SERVICE_ID`, `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`, `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY`, `ADMIN_PASSWORD_HASH`).
  - Add automated test assertions or verification scripts covering `/api/inquiry` submission, rate-limiting, and admin auth gates.

### 3. Acceptance Criteria
- [ ] NextAuth credential verification uses `bcrypt.compare` against a bcrypt-hashed admin secret with zero plaintext password comparisons in code.
- [x] Formal Prisma migrations initialized and verified with zero schema sync drift.
- [x] Client contact submissions persist to the database with server-side validation and IP-based rate limiting.
- [x] Studio inquiry management interface operational within the single-page view navigation for authenticated `ADMIN` users.
- [x] Dead `Post` schema stub pruned; all environment variables documented in `.env.example`.
- [ ] Full application build (`bun run build`) compiles cleanly with exit code 0 across all routes.
