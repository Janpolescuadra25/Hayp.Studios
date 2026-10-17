# PERFORMANCE OPTIMIZATION & EDGE CACHING RUNBOOK (DELIVERABLE 10.2)

**Application:** Hayp Studios (`haypstudios.com`)  
**Production Host:** Hetzner VPS `vortex` (`2.28.120.85`)  
**Reverse Proxy:** Caddy v2  
**Application Runtime:** Next.js 16 (Standalone) / Node.js 20+ via PM2 (`hayp-frontend`, Port 3003)  
**Deliverable Status:** COMPLETE (Hydra Verified)  
**Last Updated:** 2026-10-17  

---

## 1. EXECUTIVE SUMMARY & TARGET OBJECTIVES

Deliverable 10.2 establishes edge caching rules, static asset caching headers, and modern image optimization to achieve production Lighthouse scores > 90 across mobile and desktop viewports.

### Target Performance Metrics
- **Lighthouse Performance Score:** > 90 / 100
- **Largest Contentful Paint (LCP):** < 2.5 seconds
- **First Input Delay (FID) / Interaction to Next Paint (INP):** < 200 ms
- **Cumulative Layout Shift (CLS):** < 0.1
- **Time to First Byte (TTFB):** < 400 ms (via VPS Caddy reverse proxy)

---

## 2. EDGE CACHING ARCHITECTURE (`deploy/Caddyfile`)

Caddy operates at the network edge on Hetzner VPS `vortex`, intercepting all client traffic before proxying to Next.js on `127.0.0.1:3003`.

### 2.1 Cache-Control Directives by Request Pattern

| Matcher Pattern | Target Assets | Cache-Control Header | Rationale |
|---|---|---|---|
| `/_next/static/*`, `/static/*`, `/favicon.ico`, `/icon.svg` | Next.js compilation chunks, hashed CSS/JS bundles, favicons | `public, max-age=31536000, immutable` | Filenames contain cryptographic content hashes. Any content change produces a new URL; browsers can cache safely for 1 year. |
| `*.png`, `*.jpg`, `*.jpeg`, `*.gif`, `*.webp`, `*.avif`, `*.svg`, `*.ico`, `*.woff`, `*.woff2` | Media files, photography, web fonts | `public, max-age=86400, stale-while-revalidate=604800` | Cached locally for 24 hours; background revalidation ensures instant loading without stale data. |
| `/api/*` | Dynamic server routes (`/api/health`, `/api/inquiry`, `/api/analytics/*`) | `no-store, no-cache, must-revalidate` | Prevents browser and proxy caching of sensitive user submissions, health status, and live analytics. |
| Root & Dynamic Page HTML | Server-rendered and static page shells | `public, max-age=0, s-maxage=60, stale-while-revalidate=300` | Revalidates dynamically while enabling edge caching for short bursts to absorb traffic spikes. |

### 2.2 Wire Compression
- **Algorithms:** `zstd` (high-ratio compression for modern browsers) and `gzip` (legacy fallback).
- **Enforced via:** `encode gzip zstd` in `deploy/Caddyfile`.

---

## 3. NEXT.JS ASSET & IMAGE OPTIMIZATION (`next.config.ts`)

### 3.1 Image Optimization Pipeline
- **Next-Gen Formats:** Automatically serves `AVIF` (first priority, ~30% smaller than WebP) and `WebP` (fallback) to supporting browsers.
- **Responsive Device Sizing:** `deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048]` generates tailored image dimensions for mobile, tablet, and desktop screens.
- **Component Icons & Thumbnails:** `imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]`.
- **Remote Image Domains:** Authorized remote patterns for Instagram CDN domains (`**.instagram.com`, `**.cdninstagram.com`) supporting the `/api/instagram` portfolio feed.

### 3.2 Runtime Optimization
- **Gzip/Deflate Compression:** Enabled via `compress: true`.
- **Header Hardening:** Suppressed `X-Powered-By: Next.js` via `poweredByHeader: false`.
- **Standalone Build:** Maintained via `output: "standalone"` for minimal memory footprint under PM2.

---

## 4. PRODUCTION DEPLOYMENT & VERIFICATION RUNBOOK

### 4.1 VPS Deployment Commands
When changes to `deploy/Caddyfile` or `next.config.ts` are pulled to `vortex`:
```bash
# 1. SSH to Hetzner VPS vortex:
ssh -i ~/.ssh/id_ed25519_hetzner root@2.28.120.85

# 2. Navigate to application root:
cd /var/www/haypstudios

# 3. Pull latest changes:
git pull origin main

# 4. Rebuild Next.js standalone application:
bun install --frozen-lockfile
bun run build

# 5. Reload PM2 frontend service:
pm2 reload deploy/ecosystem.config.js --update-env

# 6. Validate Caddyfile syntax (MANDATORY before reload):
caddy validate --config /var/www/haypstudios/deploy/Caddyfile

# 7. Reload Caddy reverse proxy without downtime:
caddy reload --config /var/www/haypstudios/deploy/Caddyfile
```

### 4.2 Cache Header Verification Commands
Run these probes from any terminal to verify live edge headers:
```bash
# Verify static chunk immutable caching:
curl -I https://haypstudios.com/_next/static/chunks/main.js
# Expected: Cache-Control: public, max-age=31536000, immutable

# Verify API route no-store policy:
curl -I https://haypstudios.com/api/health
# Expected: Cache-Control: no-store, no-cache, must-revalidate

# Verify HTML page revalidation header:
curl -I https://haypstudios.com/
# Expected: Cache-Control: public, max-age=0, s-maxage=60, stale-while-revalidate=300

# Verify compression:
curl -I -H "Accept-Encoding: gzip, zstd" https://haypstudios.com/
# Expected: content-encoding: zstd (or gzip)
```

---

## 5. INCIDENT TRIAGE & CACHE INVALIDATION
- **Stale Static Assets:** Next.js chunk hashing ensures automated invalidation upon each build. If an emergency cache purge is needed, reload Caddy: `caddy reload --config /var/www/haypstudios/deploy/Caddyfile`.
- **Lighthouse Regressions:** If scores dip below 90, run Next.js bundle analysis to identify uncompressed dependencies or oversized external images.