# HAYP.STUDIOS — ACTIVE ROADMAP
**Last Updated:** 2026-10-11  
**Repository Branch:** main  
**Current Baseline Commit:** 061790432c0f90701065ff44d1f8eb3de08b473c  
**Runtime Architecture:** Next.js 16.1.3 (App Router) | Bun Runtime | SQLite (Prisma ORM) | Tailwind CSS | Port 3003  
**Target Production Server:** Hetzner VPS vortex (IPv4 2.28.120.85) | Pull-Only Deployment Model  
**Archived Completed Phases:** See [ARCHIVED_ROADMAP.md](./ARCHIVED_ROADMAP.md) (Phases 1, 2, 3, 4, 5, 5B, 6, 6-3 verified complete).

---

## ACTIVE MILESTONE: PHASE 7 — PRODUCTION DEPLOYMENT & SERVER SYNCHRONIZATION
**Status:** IN PROGRESS (DEPLOYMENT HARDENING)

### 1. Objective & Scope
Solidify production configuration assets, validate deployment runbooks, and synchronize the local repository state with the remote Hetzner VPS vortex (2.28.120.85) utilizing the pull-only deployment architecture on allocated port 3003.

### 2. Deliverables & Tracking
- [x] Deployment runbook declared: deploy/README.md
- [x] Nginx reverse proxy configuration declared: deploy/nginx/haypstudios.com.conf (Port 3003 proxy pass)
- [x] Process manager configuration validated: ecosystem.config.cjs (Next.js standalone + Bun on port 3003)
- [x] Local deployment asset tracking: deploy/README.md, deploy/nginx/haypstudios.com.conf, ecosystem.config.cjs (verified in current baseline)
- [ ] Push local main to GitHub remote (Prerequisite for server pull)
- [ ] Remote Hetzner VPS vortex pull-only sync (git pull origin main)
- [ ] Server-side standalone build & PM2 restart (pm2 restart hayp-studios)
- [ ] Live domain verification via Nginx reverse proxy

### 3. Acceptance Criteria
- [x] Deployment assets tracked and committed in repository version control.
- [x] Build passes with zero compilation errors under bun run build.
- [ ] Remote server serves live application on allocated port 3003 with zero 502 Bad Gateway errors.
- [ ] Public HTTPS routing operational through Nginx reverse proxy.


