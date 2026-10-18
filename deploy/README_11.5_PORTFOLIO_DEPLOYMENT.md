# Deliverable 11.5: Portfolio Expansion Production Deployment Runbook

## Overview
This runbook defines the operational deployment and validation procedure for `Hayp.Studios` Phase 11 on the Hetzner VPS server `vortex` (`2.28.120.85`).

## Infrastructure Topology
- **Server**: `vortex` (`2.28.120.85`)
- **Domain**: `haypstudios.com`, `www.haypstudios.com`
- **Application Process**: `hayp-frontend` managed via PM2 (`ecosystem.config.cjs`) on internal port `3003`
- **Reverse Proxy**: Caddy with Let's Encrypt TLS and 1-day immutable edge caching on `/uploads/*`
- **Database**: PostgreSQL (`HaypStudios_db` on `localhost:5432`)

---

## Deployment Procedure (Step-by-Step)

### 1. Repository Synchronization on VPS
```bash
cd /var/www/hayp-studios
git fetch origin
git checkout main
git pull origin main
```

### 2. Dependency & Database Migration
```bash
bun install --frozen-lockfile
bunx prisma migrate deploy
bunx prisma generate
```

### 3. Production Build
```bash
bun run build
```
*Verify Next.js standalone build generates `.next/standalone/server.js`.*

### 4. Process Manager Restart (Zero-Downtime)
```bash
pm2 reload ecosystem.config.cjs --env production || pm2 start ecosystem.config.cjs --env production
pm2 save
```

### 5. Caddy Reverse Proxy & Edge Caching Reload
```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo caddy reload --config /etc/caddy/Caddyfile
```

---

## Post-Deployment Verification Drill

Execute these verification checks immediately following deployment:

1. **Process Health**:
   ```bash
   pm2 status hayp-frontend
   curl -I http://localhost:3003/api/health
   ```
   *Expected: Status `online`, HTTP 200 OK.*

2. **Public Edge & Domain Response**:
   ```bash
   curl -I https://haypstudios.com
   curl -I https://www.haypstudios.com
   ```
   *Expected: HTTP 200 on apex, HTTP 301/308 redirect from www to apex.*

3. **Edge Media Caching Verification**:
   ```bash
   curl -I https://haypstudios.com/uploads/sample.webp
   ```
   *Expected Header: `Cache-Control: public, max-age=86400, immutable`.*

4. **Dynamic Portfolio & Admin UI**:
   - Navigate to `https://haypstudios.com/portfolio` — verify grid renders with interactive category filtering.
   - Navigate to `https://haypstudios.com/artists` — verify resident artist directory.
   - Navigate to `https://haypstudios.com/admin` — verify admin authentication gate and portfolio management dashboard.

---

## Rollback Procedure
If a critical regression occurs in production:
```bash
git checkout HEAD~1
bun run build
pm2 reload hayp-frontend
```

## Status
- Deliverable: 11.5
- Status: **DONE**
