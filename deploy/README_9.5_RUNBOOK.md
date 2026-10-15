# HAYP STUDIOS — PRODUCTION DEPLOYMENT & VERIFICATION RUNBOOK
**Document:** Deliverable 9.5 Production Runbook & Operational Checklist (Phase 1)  
**Target Domain:** `https://haypstudios.com` / `https://www.haypstudios.com`  
**Server Node:** `vortex` (Hetzner Cloud cx33 — `2.28.120.85` — Ubuntu 24.04 LTS)  
**Application Port:** `3003` (`hayp-frontend` via PM2)  
**Status:** RUNBOOK & VERIFICATION TOOLING ESTABLISHED (READY FOR VPS EXECUTION)  

---

> ### ⚠️ ENVIRONMENT PATH PREAMBLE
> - **Local Development:** Windows 11 host at `C:\Users\HomePC\Desktop\Hayp.Studios`.
> - **Production Target:** Linux VPS `vortex` (`2.28.120.85`).
> - All paths referenced below (`/var/www/hayp.studios`, `/var/backups/postgres`, `/etc/caddy/Caddyfile`) represent target directories on the production server. For custom directory setups, use the environment variables `$HAYP_APP_DIR` and `$POSTGRES_BACKUP_DIR`.
> - **NEVER** execute production rollback or PM2 reload commands on the local Windows development machine.

---

## 1. PRE-EXECUTION PRODUCTION CHECKLIST

Before performing the server deployment procedure on `vortex`, verify the following prerequisites:
- [ ] Hetzner VPS cx33 provisioned with Ubuntu 24.04 LTS at IP `2.28.120.85`.
- [ ] SSH key-based access active: `ssh -i ~/.ssh/id_ed25519_hetzner root@2.28.120.85`.
- [ ] PostgreSQL 16 active on port `5432` with database `HaypStudios_db` created.
- [ ] UFW firewall enabled with allowed ports: `22` (SSH), `80` (HTTP), `443` (HTTPS).
- [ ] Node.js v20+ LTS or Bun v1.0+ and PM2 installed globally on the VPS.
- [ ] Caddy v2 installed and configured.
- [ ] Production `.env` file created in `/var/www/hayp.studios/.env` with permissions `600`.

---

## 2. SYSTEM ARCHITECTURE OVERVIEW

| Component | Technology | Target / Configuration | Port / Binding | Environment |
|---|---|---|---|---|
| **Web / Application** | Next.js 15 Standalone | Node.js via PM2 (`hayp-frontend`) | `localhost:3003` | Production VPS |
| **Reverse Proxy & TLS** | Caddy v2 | Automated Let's Encrypt TLS + Security Headers | Ports `80`, `443` | Production VPS |
| **Database** | PostgreSQL 16 | Prisma ORM (`DATABASE_URL`) | `localhost:5432` (`HaypStudios_db`) | Production VPS |
| **Process Manager** | PM2 | Cluster / fork execution via `deploy/ecosystem.config.js` | Auto-restart & log rotation | Production VPS |
| **Health Check** | Next.js Dynamic Route | `/api/health` (DB Ping `SELECT 1`, Uptime, Memory) | Status `healthy` (200) | Local & Production |
| **Automated Backups** | Bash + pg_dump | `deploy/backup-postgres.sh` (Permissions `0700`) | Daily cron at `03:00 UTC` | Production VPS |

---

## 3. PREREQUISITES & SYSTEM DEPENDENCIES

### Required System Packages (Ubuntu/Debian on VPS):
```bash
sudo apt-get update
sudo apt-get install -y curl bash grep coreutils systemd postgresql-client
```

### Security Hardening for Backups & Secrets:
```bash
# Secure backup directory permissions (owner-only access)
sudo mkdir -p /var/backups/postgres
sudo chmod 700 /var/backups/postgres

# Restrict .env file permissions
chmod 600 /var/www/hayp.studios/.env
```
> **CRITICAL SECURITY RULE:** NEVER commit `.env` or secret values to version control. All secrets reside exclusively on the production server.

---

## 4. PRODUCTION DEPLOYMENT PROCEDURE (PULL-ONLY SERVER RULE)
Server deployments adhere strictly to the **Pull-Only Rule** (`Local push -> GitHub main -> Server pull`).

### Step 1: Connect to Production Server
```bash
ssh -i ~/.ssh/id_ed25519_hetzner root@2.28.120.85
```

### Step 2: Navigate to Application Directory & Pull Verified Commit
```bash
cd /var/www/hayp.studios
git fetch origin main
git checkout main
git pull origin main
```

### Step 3: Verify Environment Secrets Configuration
Confirm `/var/www/hayp.studios/.env` exists and contains required production values:
```bash
ls -la .env
chmod 600 .env
```
*(Required: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL=https://haypstudios.com`, `ADMIN_PASSWORD`)*

### Step 4: Install Dependencies & Build Standalone Bundle
```bash
bun install --frozen-lockfile
bun run build
```

### Step 5: Start / Reload Application via PM2
```bash
pm2 reload deploy/ecosystem.config.js --update-env
pm2 save
```

### Step 6: Validate & Reload Caddy Reverse Proxy
```bash
caddy validate --config deploy/Caddyfile
systemctl reload caddy
```

---

## 5. AUTOMATED POST-DEPLOYMENT VERIFICATION

### Running Verification Against Live Domain:
```bash
chmod +x deploy/verify-deployment.sh
./deploy/verify-deployment.sh https://haypstudios.com
```

### Running Verification Locally (or prior to DNS switch):
```bash
./deploy/verify-deployment.sh --local
```

### Automated Checks Performed:
1. `GET /api/health` returns `200 OK` with a payload containing `"status": "ok"` (or `"status": "healthy"`) and a nested database status such as `"database": { "status": "healthy" }`.
2. HTTP Security Headers are present (`Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`).
3. Protected route guardrail: `GET /api/analytics/metrics` rejects unauthenticated access with `401 Unauthorized`.
4. API input validation: `POST /api/inquiry` rejects malformed payloads with `400 Bad Request`.
5. HTTP to HTTPS redirection is enforced (`301` or `308`).

---

## 6. MONITORING & LOGGING RUNBOOK

### Process & Application Logs:
```bash
# View live tail of Next.js application logs
pm2 logs hayp-frontend --lines 100

# Inspect PM2 process status & resource usage
pm2 status hayp-frontend
pm2 monit
```

### Caddy Reverse Proxy & TLS Logs:
```bash
# Inspect Caddy reverse proxy access & error logs
journalctl -u caddy -n 100 -f --no-pager
```

### Health Check Endpoint Inspection:
```bash
curl -s -i https://haypstudios.com/api/health
```

---

## 7. DATABASE CONNECTION & HEALTH CHECK TROUBLESHOOTING

If `/api/health` returns HTTP `503` or a JSON payload with `"database": { "status": "unhealthy" }`:
1. Check PostgreSQL service status: `systemctl status postgresql`
2. Test direct local connection: `psql -U postgres -d HaypStudios_db -c "SELECT 1;"`
3. Verify connection pool: inspect Prisma connections in `src/lib/prisma.ts`
4. Verify `.env` credentials: check `DATABASE_URL` format and user permissions on PostgreSQL.

---

## 8. DATABASE BACKUP & RESTORATION PROCEDURE

### Scheduled Daily Backups:
The backup script `deploy/backup-postgres.sh` runs automatically via cron:
```cron
0 3 * * * /var/www/hayp.studios/deploy/backup-postgres.sh >> /var/log/hayp-backup.log 2>&1
```

### Manual Backup On-Demand:
```bash
chmod 700 deploy/backup-postgres.sh
./deploy/backup-postgres.sh
```

### Emergency Database Restoration:
```bash
# List available compressed backups
ls -lh /var/backups/postgres/

# Restore database from selected timestamp backup
gunzip -c /var/backups/postgres/hayp_backup_YYYYMMDD_HHMMSS.sql.gz | psql -U postgres -d HaypStudios_db
```

---

## 9. INCIDENT RESPONSE & EMERGENCY ROLLBACK PROTOCOL

If a fatal regression or service disruption is detected on the production server:

### Rollback Step 1: Revert Production Server to Previous Stable PIN
*(Execute on server `vortex` only — never on local dev machine)*
```bash
cd /var/www/hayp.studios
git checkout <PREVIOUS_STABLE_COMMIT_SHA>
```

### Rollback Step 2: Rebuild & Reload PM2 Process
```bash
bun install --frozen-lockfile
bun run build
pm2 reload hayp-frontend
```

### Rollback Step 3: Run Automated Verification Probe
```bash
./deploy/verify-deployment.sh https://haypstudios.com
```