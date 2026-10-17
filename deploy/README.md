# Hayp Studios Deployment & Infrastructure Assets

This directory contains the deployment configurations, automation scripts, operational runbooks, and disaster recovery procedures for **Hayp Studios** (`haypstudios.com`), hosted on Hetzner VPS `vortex` (`2.28.120.85`).

---

## Asset Inventory (13 Assets)

| Asset Name | Type | Description | Deliverable |
|---|---|---|---|
| `Caddyfile` | Configuration | Reverse proxy configuration for Caddy (port 3003, automated Let's Encrypt TLS, security headers, edge caching). | D9.1 / D10.2 |
| `ecosystem.config.js` | Configuration | PM2 process specification for `hayp-frontend` (port 3003, 1GB memory limit, structured logging). | D9.1 / D10.1 |
| `PROD_FIREWALL_SETUP.md` | Runbook | Instructions for UFW firewall configuration on Hetzner VPS (ports 22, 80, 443). | D9.4 |
| `README_9.2_CICD.md` | Runbook | GitHub Actions automated deployment workflow specification (`deploy.yml`). | D9.2 |
| `README_9.3_MONITORING.md` | Runbook | Phase 9 monitoring foundation (`/api/health`, structured logging, automated daily DB backups). | D9.3 |
| `README_9.4_SECURITY.md` | Runbook | Production security hardening guidelines (Caddy headers, rate limiting, sanitization). | D9.4 |
| `README_9.5_RUNBOOK.md` | Runbook | Master deployment and operational runbook for Deliverable 9.5. | D9.5 |
| `README_9.5_PHASE1_COMPLETE.md` | Runbook | Phase 1 tooling verification record and audit trail (Hydra Certified). | D9.5 |
| `README_10.1_MONITORING_ALERTING.md` | Runbook | Production uptime monitoring, synthetic health probing, PM2 alerting & escalation runbook. | D10.1 |
| `README_10.2_PERFORMANCE.md` | Runbook | Performance optimization, edge caching directives (Caddy & Next.js), image formats, and Lighthouse targets. | D10.2 |
| `README_10.4_SECURITY.md` | Runbook | Security patch management, vulnerability scanning, dependency audits, and quarterly review procedures. | D10.4 |
| `README.md` | Documentation | This deployment directory asset index and operational summary. | System |
| `verify-deployment.sh` | Bash Script | Automated post-deployment smoke verification suite (health checks, TLS, security headers). | D9.5 |

*(Note: Database maintenance scripts `backup-postgres.sh` and `restore-postgres.sh` reside alongside these assets.)*

---

## Operational Summary

1. **Deployment Architecture:** Push-to-deploy via GitHub Actions (`main` branch) -> SSH to `vortex` -> `git pull` -> `bun install` -> `bun run build` -> `pm2 reload deploy/ecosystem.config.js --update-env`.
2. **Reverse Proxy & Edge Caching:** Caddy serves apex `haypstudios.com` and `www.haypstudios.com`, proxying traffic to PM2 service `hayp-frontend` at `127.0.0.1:3003`. Caddy enforces 1-year immutable caching on static assets (`/_next/static/*`), daily caching on media assets, and `no-store` on API routes.
3. **Image & Media Optimization:** Next.js delivers AVIF and WebP modern image formats with responsive device sizing.
4. **Database Maintenance:** Automated backup and restore tooling with fail-closed safety confirmation gates.
5. **Uptime Monitoring & Alerting:** `README_10.1_MONITORING_ALERTING.md` defines 60s synthetic probing against `/api/health`, PM2 crash resilience, and P1–P3 alert escalation protocols.
