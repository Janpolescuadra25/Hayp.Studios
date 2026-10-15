# HAYP STUDIOS — PRODUCTION DEPLOYMENT ASSET INVENTORY
**Directory:** `/deploy`  
**Target Environment:** Hetzner Cloud cx33 (`vortex` — `2.28.120.85`)  
**Status:** DELIVERABLE 9.5 PHASE 1 COMPLETE — READY FOR PHASE 2 VPS EXECUTION  
**Last Updated:** 2026-10-15  

---

## 1. DEPLOYMENT ASSET DIRECTORY

This directory contains production deployment configurations, automated scripts, security specifications, and operational runbooks for Hayp Studios:

| File Name | Description | Deliverable | Status |
|---|---|---|---|
| **`ecosystem.config.js`** | PM2 process manager configuration for Next.js standalone application | Deliverable 9.2 | ✅ READY |
| **`Caddyfile`** | Caddy v2 reverse proxy configuration with automated Let's Encrypt TLS & security headers | Deliverable 9.4 | ✅ READY |
| **`backup-postgres.sh`** | Automated PostgreSQL backup script with gzip compression & 7-day retention | Deliverable 9.3 | ✅ READY (`0700`) |
| **`PROD_FIREWALL_SETUP.md`** | UFW firewall rules specification (Ports 22, 80, 443) | Deliverable 9.2 | ✅ READY |
| **`verify-deployment.sh`** | Automated post-deployment smoke verification script for `/api/health`, headers, & auth | Deliverable 9.5 | ✅ **DONE (Phase 1)** |
| **`README_9.2_CICD.md`** | CI/CD pipeline and GitHub Actions workflow documentation | Deliverable 9.2 | ✅ COMPLETE |
| **`README_9.3_MONITORING.md`** | Production monitoring, logging, and database backup documentation | Deliverable 9.3 | ✅ COMPLETE |
| **`README_9.4_SECURITY.md`** | Session security hardening, Caddy headers, and logger migration specs | Deliverable 9.4 | ✅ COMPLETE |
| **`README_9.5_RUNBOOK.md`** | Comprehensive production operations, verification, & emergency rollback runbook | Deliverable 9.5 | ✅ **DONE (Phase 1)** |
| **`README.md`** | This deployment directory asset index and operational overview | Phase 9 | ✅ CURRENT |

---

## 2. PRODUCTION SECURITY GUIDELINES

1. **Pull-Only Server Deployment Rule:**
   - Server deployments follow `Local push -> GitHub main -> Server pull`.
   - Never commit or edit files directly on the production VPS.
2. **Zero Secrets in Version Control:**
   - Secrets (`DATABASE_URL`, `NEXTAUTH_SECRET`, `ADMIN_PASSWORD`) reside exclusively on VPS `vortex` in `/var/www/hayp.studios/.env`.
   - Ensure `.env` permissions are set to `600` (`chmod 600 .env`).
3. **Backup Directory Security:**
   - Production backup directory `/var/backups/postgres` must be restricted to owner-only access (`chmod 700 /var/backups/postgres`).
4. **Automated Verification:**
   - After pulling updates on the VPS, always execute `./deploy/verify-deployment.sh` to validate live application health before declaring deployment complete.