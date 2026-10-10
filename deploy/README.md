# HAYP.STUDIOS — PRODUCTION DEPLOYMENT RUNBOOK (Phase 6-3)
**Target Host:** `vortex` (Hetzner VPS cx33, IPv4 `2.28.120.85`)  
**Assigned Port:** `3003`  
**Canonical Domain:** `https://haypstudios.com` (and `https://www.haypstudios.com`)  
**Runtime Manager:** PM2 (`ecosystem.config.cjs` using Bun runtime)  
**Reverse Proxy:** Nginx (`/etc/nginx/sites-available/haypstudios.com.conf`)

---

## 1. PRE-DEPLOYMENT PREREQUISITES ON SERVER

1. Verify server connectivity:
   ```bash
   ssh -i ~/.ssh/id_ed25519_hetzner root@2.28.120.85
   ```
2. Verify Bun runtime and PM2 are available:
   ```bash
   bun --version
   pm2 --version
   ```
3. Ensure PM2 log directory exists with appropriate permissions:
   ```bash
   mkdir -p /var/log/pm2
   chmod 755 /var/log/pm2
   ```
4. Verify port 3003 is unencumbered or currently owned by hayp-frontend:
   ```bash
   lsof -i :3003
   ```

---

## 2. APPLICATION DEPLOYMENT PROCEDURE

1. Navigate to target application directory:
   ```bash
   cd /var/www/hayp.studios
   ```
2. Fetch and fast-forward to the latest approved commit on `main`:
   ```bash
   git fetch origin main
   git checkout main
   git pull origin main
   ```
3. Verify environment configuration:
   ```bash
   # If first deployment, copy template and supply secret values:
   cp .env.production.example .env.production
   nano .env.production
   ```
4. Install dependencies:
   ```bash
   bun install --frozen-lockfile
   ```
5. Apply database migrations:
   ```bash
   bun x prisma migrate deploy
   ```
6. Build standalone Next.js production bundle:
   ```bash
   bun run build
   ```
   *Verify that `.next/standalone/server.js` exists after build.*
7. Start or restart PM2 process:
   ```bash
   pm2 startOrReload ecosystem.config.cjs --env production
   pm2 save
   ```
8. Verify process status and health:
   ```bash
   pm2 status hayp-frontend
   curl -I http://127.0.0.1:3003
   ```

---

## 3. NGINX REVERSE PROXY & SSL CONFIGURATION

1. Verify Nginx configuration file is in place:
   ```bash
   cp deploy/nginx/haypstudios.com.conf /etc/nginx/sites-available/haypstudios.com.conf
   ln -sf /etc/nginx/sites-available/haypstudios.com.conf /etc/nginx/sites-enabled/
   ```
2. Test Nginx configuration:
   ```bash
   nginx -t
   ```
3. Obtain Let's Encrypt SSL certificate (if not already provisioned):
   ```bash
   certbot --nginx -d haypstudios.com -d www.haypstudios.com
   ```
4. Reload Nginx:
   ```bash
   systemctl reload nginx
   ```
5. Verify HTTPS access from outside:
   ```bash
   curl -IL https://haypstudios.com
   ```

---

## 4. SMOKE TESTING & VALIDATION

1. Test landing page:
   ```bash
   curl -s -o /dev/null -w "%{http_code}\n" https://haypstudios.com
   # Expected output: 200
   ```
2. Test internal telemetry API endpoint:
   ```bash
   curl -s -o /dev/null -w "%{http_code}\n" -H "x-admin-password: <ADMIN_PASSWORD>" https://haypstudios.com/api/analytics/metrics
   # Expected output: 200
   ```
3. Inspect PM2 logs for runtime errors:
   ```bash
   pm2 logs hayp-frontend --lines 50
   ```

---

## 5. ROLLBACK PROCEDURE

If a deployment failure occurs:
1. Roll back Git repository to previous verified commit:
   ```bash
   git checkout <PREVIOUS_COMMIT_SHA>
   ```
2. Re-install dependencies and rebuild:
   ```bash
   bun install --frozen-lockfile
   bun run build
   ```
3. Reload PM2 process:
   ```bash
   pm2 reload hayp-frontend
   ```
4. Confirm application recovers on port 3003:
   ```bash
   curl -I http://127.0.0.1:3003
   ```