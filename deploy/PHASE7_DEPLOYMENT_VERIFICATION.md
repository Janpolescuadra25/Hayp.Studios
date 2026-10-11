# Phase 7 Production Deployment Verification & Operations Runbook

**Verification Date:** 2026-10-11  
**Baseline Commit:** `38fc80bf37c3ae273156d592d8e861a49b07153f`  
**Target Environment:** Hetzner Cloud VPS `vortex`  
**Production Domains:** `https://haypstudios.com`, `https://www.haypstudios.com`  
**Status:** VERIFIED OPERATIONAL (HTTP/2 200 OK)

---

## 1. Production Architecture Overview

| Component | Verified Specification |
|---|---|
| **Host IP** | `2.28.120.85` |
| **OS** | Ubuntu 24.04 LTS |
| **Runtime Engine** | Bun `1.4.2` |
| **Application Framework** | Next.js 16.1.3 (Standalone Output) |
| **Process Manager** | PM2 `7.0.4` |
| **Process Name** | `hayp-frontend` |
| **Internal Binding Port** | `127.0.0.1:3003` |
| **Web Server / Reverse Proxy** | Nginx `1.28.3` |
| **SSL / TLS Certificate** | Let's Encrypt via `certbot` |
| **Root Directory** | `/var/www/hayp.studios` |

---

## 2. Verified Service Health & Endpoints

- **Live HTTPS Endpoint:** `https://haypstudios.com` returns HTTP/2 200 OK.
- **Apex to WWW / HTTP to HTTPS:** HTTP port 80 returns 301 redirect to HTTPS.
- **Internal PM2 Loopback:** `curl -I http://127.0.0.1:3003` returns HTTP 200 OK.
- **Process Health:** PM2 process `hayp-frontend` is `online` and bound to the application runtime.
- **Reverse Proxy Validation:** `nginx -t` returned a successful syntax validation.

---

## 3. Routine Operations & Maintenance Commands

All commands below are executed on Hetzner VPS `vortex` via SSH as user `root` (or with `sudo`).

### Application Updates & Redeployment

```bash
cd /var/www/hayp.studios
git fetch origin main
git checkout main
git pull origin main
bun install --frozen-lockfile
bun x prisma generate
bun run build
pm2 reload ecosystem.config.cjs --env production
```

### Process Inspection & Logs

```bash
# View process status
pm2 status hayp-frontend

# Tail real-time application logs
pm2 logs hayp-frontend --lines 50

# Restart application process
pm2 restart hayp-frontend
```

### Nginx Reverse Proxy Management

```bash
# Test configuration syntax
nginx -t

# Reload configuration without dropping connections
systemctl reload nginx

# View Nginx access & error logs
tail -n 50 /var/log/nginx/access.log
tail -n 50 /var/log/nginx/error.log
```

### SSL Certificate Renewal Verification

```bash
# Test automatic Let's Encrypt certificate renewal dry-run
certbot renew --dry-run
```

---

## 4. Key Security & Operational Invariants

- Application runs strictly on loopback `127.0.0.1:3003` and is exposed externally through Nginx.
- Production `.env` is isolated within `/var/www/hayp.studios/.env` and never committed to the repository.
- PM2 log directory `/var/log/pm2` is configured with write permissions for the runtime user.
- SSL policies are enforced at the Nginx boundary with HTTP strict transport security and security headers.
