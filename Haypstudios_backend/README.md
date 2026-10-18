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
