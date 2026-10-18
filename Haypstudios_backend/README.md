# VORTEX BACKEND

The API service powering The Hub, What's New, Stats — and, from Phase 5,
the Owner Dashboard.

## Stack
Node 22 · TypeScript · Express 5 (Phase 3B) · Prisma 6 · PostgreSQL
(local 18.1 dev · Neon production).

## Status
Part A — database layer (schema, migrations, canonical seed v2,
self-healing) — ✅ HYDRA-verified complete.
Part B — API endpoints (/health, /api/products, /api/changelog,
/api/stats, /api/site-config + CORS) — ✅ HYDRA-verified complete.
Part C — owner authentication (hidden admin login, env-sourced ADMIN_PATH,
rate-limited login, bcrypt-based owner auth guard, httpOnly session cookie,
logout) — ✅ HYDRA-verified complete.
Phase 3 fully delivered.

## Phase 5A-1 — Product link field
Migration add_product_link adds an optional `link` (String?) to
Product — the foundation for clickable product cards and the
dashboard Products editor. The seed intentionally does NOT touch
`link`: dashboard-entered links survive reseeding (upsert updates
lane/status/date/description/sortOrder only).
Implemented — awaiting HYDRA verification.

## Data models
Product (lane, status, date, description, sortOrder) · ChangelogEntry
(type, date, title, body, published) · SiteConfig (key + JSON document)
· OwnerAccount (email + bcrypt hash ONLY — never plaintext) · Media
(metadata; binaries in object storage later).

## Setup
1. Copy .env.example to .env; set DATABASE_URL.
2. npm install
3. npm run db:migrate -- --name init   (fresh checkouts)
4. npm run db:seed   (self-healing — converges DB to canonical state)

## Decisions (Phase 3A)
- npm + Node (not bun): Render deployment parity.
- Local dev database: vortex_db on localhost:5432, connecting as the
  postgres superuser (JP-authorized, local-only). Production uses
  Neon with its own dedicated credentials; .env never enters git.
- Prisma enums for Lane/Status/Type: type-safe; new lanes arrive as
  reviewed migrations — the controlled path.
- Seed v2 is self-healing: upserts the 9 canonical products, deletes
  any non-canonical product names, rebuilds the changelog
  deterministically, and throws unless it converges to exactly
  9 + 5. Corrects the initial Phase 3A seed, which deployed
  non-canonical placeholder data (incident logged and corrected in
  this phase).
- Seed creates NO OwnerAccount: credentials are a Phase 4 concern;
  no plaintext password ever exists to leak.
- Phase 4 mandate: the owner login password will be a NEW, unique
  secret — never reused from any other context.
- Month-precision brief dates seeded as first-of-month; UI formats
  month-year in Phase 6.

---

## Package W3: Canonical Database Schema & Migrations

- **Delivered In**: Phase 12.1 — Master Product Studio Architecture
- **Status**: Complete & Verified
- **Database Provider**: PostgreSQL (`Haypstudios_backend/prisma/schema.prisma`)
- **Schema Snapshot**:
  - `Product`: canonical studio product catalog with `slug`, status lifecycle, release metadata, and linked `ProductUpdate` records.
  - `ProductUpdate`: versioned product release notes and changelog entries keyed to a parent product.
  - `StudioEvent`: launch/demo/livestream event records with publication controls and external registration links.
  - `SiteSetting`: typed key/value configuration store replacing legacy unstructured config.
  - `Inquiry`: inbound client and partner inquiry intake, tracked by `InquiryStatus`.
  - `OwnerAccount`: internal owner/admin identity model for authenticated dashboard access.
  - `ChangelogEntry`: structured software update ledger for release history and roadmap visibility.
  - `Media`: media asset registry for uploaded files and public assets.
- **Core Enumerations**:
  - `ProductStatus`: `CONCEPT`, `IN_DEVELOPMENT`, `BETA`, `LIVE`, `ARCHIVED`
  - `InquiryStatus`: `NEW`, `CONTACTED`, `ARCHIVED`
- **Migration & Verification Commands**:
  - `npm install`
  - `npm run db:generate`
  - `npm run db:migrate -- --name w3_master_product_studio`
  - `npm run db:seed`
- **Deployment Notes**:
  - Local PostgreSQL database is configured via `DATABASE_URL` in `.env`.
  - The schema intentionally removes the legacy `SiteConfig` model and replaces it with canonical `SiteSetting` records.
  - Seed data is deterministic and idempotent for the canonical product catalog, product updates, event set, settings, and inquiry intake.
