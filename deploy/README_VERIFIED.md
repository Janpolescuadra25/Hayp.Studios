# Phase 6-3: Production Deployment Hardening — Verified Runbook
**Status:** DONE (Verified Locally Complete & Production Ready)  
**Date:** 2026-10-10  
**Target Host:** Hetzner VPS (vortex: 2.28.120.85)  
**Service Port:** 3003 (Local PM2)  
**Runtime:** Bun 1.1+ | Next.js 16.1.1 (Standalone)  

---

## 1. ARCHITECTURE SUMMARY
The Hayp Studios production deployment is designed around Next.js standalone server output managed by PM2 and reverse-proxied by Nginx:
- **Build Mode:** Standalone server (output: 'standalone' in 
ext.config.ts) producing .next/standalone/server.js.
- **Process Manager:** PM2 running via Bun interpreter (interpreter: 'bun', cwd: './', max_memory_restart: '1G').
- **Internal Port:** 3003 (configured to avoid VPS port collisions with sibling apps).
- **Reverse Proxy:** Nginx handling SSL termination (Let's Encrypt / Certbot), static asset caching, Gzip compression, and HTTP/2 proxying to http://127.0.0.1:3003.
- **Secret Isolation:** .gitignore excludes deploy/.env.production. Production secrets live exclusively on the target VPS.

---

## 2. PRODUCTION ARTIFACTS
- cosystem.config.cjs: PM2 configuration utilizing un and Linux log paths (/var/log/pm2/hayp-error.log, /var/log/pm2/hayp-out.log).
- deploy/nginx/haypstudios.com.conf: Production-grade Nginx server block with WebSocket support and security headers.
- deploy/README.md: Step-by-step deployment and operational maintenance runbook.
- .gitignore: Hardened to prevent leakage of deploy/.env.production.

---

## 3. DEPLOYMENT EXECUTION STEPS (VPS VORTEX)
1. **Pull Latest Main:**
   `ash
   cd /var/www/haypstudios
   git pull origin main
   `
2. **Install Dependencies & Build:**
   `ash
   bun install --frozen-lockfile
   bun run build
   `
3. **Copy Static Assets to Standalone Folder:**
   `ash
   cp -r public .next/standalone/
   cp -r .next/static .next/standalone/.next/
   `
4. **Deploy Environment Secrets:**
   Ensure /var/www/haypstudios/.env.production is configured with production secrets.
5. **Start or Reload PM2:**
   `ash
   pm2 start ecosystem.config.cjs --env production
   pm2 save
   `
6. **Configure Nginx:**
   Link deploy/nginx/haypstudios.com.conf to /etc/nginx/sites-enabled/, verify with 
ginx -t, and reload systemctl reload nginx.