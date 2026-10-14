# Deliverable 9.4: Production Security Hardening Specification

**Status:** FULLY IMPLEMENTED & VERIFIED  
**Target Environment:** Hetzner VPS `vortex` (IPv4: `2.28.120.85`, Port: `3003`)  
**Domain:** `haypstudios.com` & `www.haypstudios.com`  

---

## 1. Authentication & Session Security (`src/lib/auth.ts`)
- **JWT Session Duration:** Strict 24-hour expiration (`maxAge: 86400`).
- **Cookie Guardrails:**
  - Production Cookie Name: `__Secure-next-auth.session-token`
  - Cookie Attributes: `httpOnly: true`, `sameSite: "strict"`, `secure: true` (in production).
- **Admin Password Verification:** Authenticates against bcrypt-hashed passwords in the PostgreSQL database.

---

## 2. Reverse Proxy & TLS Edge Security (`deploy/Caddyfile`)
- **Automated TLS:** Automatic Let's Encrypt certificate management (`tls paulescuadra25@gmail.com`).
- **Request Sizing Limits:** Enforces `request_body { max_size 10MB }` to mitigate denial-of-service payloads.
- **HTTP Security Headers:**
  - `Strict-Transport-Security`: `max-age=31536000; includeSubDomains; preload`
  - `X-Content-Type-Options`: `nosniff`
  - `X-Frame-Options`: `DENY`
  - `Referrer-Policy`: `strict-origin-when-cross-origin`
  - `Permissions-Policy`: `camera=(), microphone=(), geolocation=()`
  - Server Token Stripping: `-Server` (masks server banner)

---

## 3. Centralized Structured Logging (`src/lib/logger.ts`)
- Core API routes (`/api/inquiry`, `/api/analytics/event`, `/api/analytics/metrics`, `/api/instagram`) log exclusively through `@/lib/logger`.
- **Security Features:**
  - Secret and PII masking.
  - Stack trace exclusion in production builds (`NODE_ENV === "production"`).
  - Contextual tagging (`InquiryAPI`, `AnalyticsEventAPI`, `AnalyticsMetricsAPI`, `InstagramAPI`).

---

## 4. HSTS Preload Submission Runbook
To activate browser-level preload for `haypstudios.com`:
1. Ensure Caddy is serving HTTPS with valid Let's Encrypt certificates.
2. Verify response headers in terminal:
   ```bash
   curl -I https://haypstudios.com
   ```
   Confirm presence of `strict-transport-security: max-age=31536000; includeSubDomains; preload`.
3. Submit domain to the official Chromium HSTS preload list:
   - Navigate to `https://hstspreload.org`
   - Enter `haypstudios.com` and submit verification.

---

## 5. Admin Credential Rotation Guideline
To rotate the studio owner password:
1. Generate a new bcrypt hash using cost factor 12:
   ```bash
   node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('NEW_PASSWORD', 12));"
   ```
2. Update the `password` field in the database for `paulescuadra25@gmail.com`:
   ```sql
   UPDATE "User" SET "password" = '$2a$12$NEW_HASH...' WHERE "email" = 'paulescuadra25@gmail.com';
   ```
3. Restart the PM2 process:
   ```bash
   pm2 restart hayp-frontend
   ```

---

## 6. Post-Deployment Browser Verification
Verify security headers in DevTools:
1. Open DevTools -> Network Tab on `https://haypstudios.com`.
2. Inspect any response from `/api/health` or `/`:
   - `strict-transport-security: max-age=31536000; includeSubDomains; preload`
   - `x-content-type-options: nosniff`
   - `x-frame-options: DENY`
   - `referrer-policy: strict-origin-when-cross-origin`
   - `permissions-policy: camera=(), microphone=(), geolocation=()`
   - Server header stripped.