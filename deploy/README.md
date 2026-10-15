# Hayp Studios — Production Deployment & Operations Directory

This directory contains production configuration, automation scripts, and operational runbooks for deploying and running **Hayp Studios** on the Hetzner VPS (`vortex`).

---

## Deployment Asset Inventory

| File | Type | Primary Role & Description |
|---|---|---|
| `Caddyfile` | Configuration | Production reverse proxy configuration routing `haypstudios.com` & `www.haypstudios.com` to port `3003` with automated Let's Encrypt TLS and security headers. |
| `ecosystem.config.js` | Configuration | PM2 process manager configuration for `hayp-frontend` (port `3003`, 1GB memory cap, cluster/fork mode). |
| `backup-postgres.sh` | Shell Script | Automated PostgreSQL backup script using `pg_dump` with gzip compression (`*.sql.gz`) and 7-day retention in `/var/backups/haypstudios/postgres/`. |
| `restore-postgres.sh` | Shell Script | Fail-closed PostgreSQL restoration script supporting compressed archives with pre-restore safety confirmations. |
| `verify-deployment.sh` | Shell Script | Automated post-deployment smoke test script verifying HTTP status, API endpoints, TLS certificate, and PM2 process health. |
| `PROD_FIREWALL_SETUP.md` | Runbook | Server hardening specifications and UFW firewall rules for Hetzner VPS `vortex` (ports 22, 80, 443). |
| `README_9.2_CICD.md` | Runbook | CI/CD pipeline documentation detailing the GitHub Actions automated deployment workflow (`.github/workflows/deploy.yml`). |
| `README_9.3_MONITORING.md` | Runbook | Production logging, PM2 monitoring, and health check endpoint operations manual. |
| `README_9.4_SECURITY.md` | Runbook | Database security policies, access controls, and credential rotation procedures. |
| `README_9.5_RUNBOOK.md` | Runbook | Comprehensive post-deployment verification runbook, pre-flight checklist, live testing procedures, and zero-downtime rollback runbook. |

---

## Operational Architecture Summary

1. **Reverse Proxy:** **Caddy** serves as the sole reverse proxy. Legacy Nginx configurations were decommissioned in Deliverable 9.1.
2. **Process Management:** **PM2** manages the Next.js standalone server on internal port `3003` under application name `hayp-frontend`.
3. **Continuous Deployment:** Orchestrated automatically via **GitHub Actions** (`.github/workflows/deploy.yml`). Deployment triggers automatically on push to `main` following successful CI tests and builds.
4. **Database Operations:** PostgreSQL backups are scheduled via cron executing `deploy/backup-postgres.sh`. Restoration is executed via `deploy/restore-postgres.sh`.
5. **Post-Deployment Verification:** Automated verification is performed via `deploy/verify-deployment.sh` following the procedures detailed in `README_9.5_RUNBOOK.md`.

---

## Security & Secrets Policy

- **No Plaintext Secrets:** Never commit `.env`, credentials, API keys, or private SSH keys to this repository.
- **Server Environment:** Secrets live exclusively on `vortex` in `/var/www/haypstudios/.env.production`.
- **Backup File Permissions:** Automated backups in `/var/backups/haypstudios/postgres/` must be restricted with `chmod 700`.