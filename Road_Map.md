# Hayp Studios — Master Engineering Roadmap

**Active Baseline Anchor:** `1ad22e38902868e0c830fc6f599ccad8b13b9d98` (Package W7 Media Library & Inquiries Console Baseline)  
**Current Pipeline State:** Phase 13: Production VPS Deployment & Live Operations  
**Current Focus:** Deliverable 13.1 — Production Deployment on VPS vortex (haypstudios.com, Port 3003, PM2 hayp-frontend, Caddy / Nginx reverse proxy verification)  

---

## ARCHIVED GROUNDWORK LEDGER (Completed & Fully Verified)

| Package | Scope / Features | Baseline Commit | Primary Documentation | Verification Status |
|---|---|---|---|---|
| **Package W1 (12.1)** | Core Foundation, App Shell, Modern Architecture & Build Gates | `2a84b12` | `README.md` | COMPLETED & VERIFIED |
| **Package W2 (12.2A)** | Artist Roster & Profile Management Systems | `cd18ef1` (Consolidated) | `src/components/hayp/README.hayp-admin-portfolio.md` | COMPLETED & VERIFIED |
| **Package W3 (12.2B)** | Studio Discography, Audio Previews & Release Catalogs | `cd18ef1` (Consolidated) | `src/components/hayp/README.hayp-admin-portfolio.md` | COMPLETED & VERIFIED |
| **Package W4 (12.3)** | Studio Merch & Physical Product Management Consoles | `d4e5f6a` | `src/app/owner/products/README.md` | COMPLETED & VERIFIED |
| **Package W5 (12.3B)** | Products & Product Updates Management Console | `1120e5a` | `src/app/owner/products/README.md` | COMPLETED & VERIFIED (Commit: 1120e5a) |
| **Package W6 (12.4)** | Studio Events, Page Content & Key-Value Settings Consoles | `6ee419f` | `src/app/owner/events/README.md` & `src/app/owner/settings/README.md` | COMPLETED & VERIFIED (Commit: 6ee419f) |
| **Package W7 (12.5)** | Media Asset Library & Client Inquiries Management Consoles | `1ad22e3` | `src/app/owner/media/README.md` & `src/app/owner/inquiries/README.md` | COMPLETED & VERIFIED (Commit: 1ad22e3) |

---

## ACTIVE PIPELINE: PHASE 13 — PRODUCTION VPS DEPLOYMENT & LIVE OPERATIONS

### Deliverable 13.1 — Production Deployment on VPS vortex
- **Target Host:** Hetzner VPS `vortex` (`2.28.120.85`, Port 3003)
- **Domains:** `https://haypstudios.com` & `https://www.haypstudios.com`
- **Application Service:** PM2 process `hayp-frontend`
- **Database Target:** `HaypStudios_db` on `localhost:5432` (`vortex`)
- **Reverse Proxy:** Nginx / Caddy SSL configuration on ports 80/443
- **Status Note:** Code complete & verified (Commit `afa6268`). Live deployment execution is paused pending creation of `/var/www/hayp-studios/.env` on Hetzner VPS `vortex` (`2.28.120.85`).
- **Scope & Verification Steps:**
  1. Pull verified commit `afa6268` on server `vortex`.
  2. Execute production Prisma schema push/migrations and client generation on server.
  3. Execute production build (`bun run build`).
  4. Reload PM2 service `hayp-frontend` without downtime.
  5. Run external HTTPS health and telemetry checks against `https://haypstudios.com`.

---

## REPOSITORY INVARIANTS & POLICIES
1. **Single Source of Truth:** Codebase state is adjudicated strictly against Hydra forensic verification.
2. **Quality Gates:** `bun test` and `bun run build` must pass cleanly before any commit.
3. **Fail-Closed Staging:** Whitelisted files only; no collateral commits of unstaged or dirty files.
4. **Documentation Rule:** Every console section maintains a dedicated `README.md` marked `# STATUS: DONE - Fully Implemented & Verified`.

