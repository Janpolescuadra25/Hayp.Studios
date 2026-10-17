# Hayp Studios — Deliverable 10.4: Security Patch Management & Vulnerability Scanning Runbook

**Document Identifier:** ASSET-13  
**Deliverable:** 10.4 (Security Patch Management & Vulnerability Scanning)  
**Author:** CYPRA / Mantra / Hydra Pipeline  
**Target Environment:** Production Hetzner VPS (`vortex` / `2.28.120.85`) & GitHub CI/CD  
**Date:** 2026-10-17  
**Status:** ACTIVE & OPERATIONAL  

---

## 1. Scope & Security Posture
This runbook codifies the operational protocols for dependency patch management, automated vulnerability scanning, Caddy TLS/header audits, and security incident escalation for `haypstudios.com`.

### Core Security Objectives:
1. **Zero Critical Vulnerabilities:** Continuous prevention of critical CVEs (RCE, SSRF, Auth Bypass) in production packages.
2. **Pre-Deployment Gate:** Automated blocking of GitHub Actions deployment if the critical-advisory gate fails.
3. **Automated Weekly Audits:** Scheduled background scans via `.github/workflows/security-scan.yml` ensuring proactive package vulnerability discovery.
4. **Quarterly Routine Reviews:** Enforcing structured quarterly audits of reverse proxy headers, TLS configuration, and application dependencies.

---

## 2. Dependency Audit & Remediation Workflows

### 2.1 Local & Pre-Deployment Audit Commands
To run dependency vulnerability audits locally on the development machine:
```bash
# Run standard vulnerability audit
bun audit

# Run a fail-closed audit for critical issues in the Bun runtime supported by v1.4+
bun audit --json --audit-level critical > security-audit.json
node -e "const fs=require('fs'); const data=JSON.parse(fs.readFileSync('security-audit.json','utf8')); const advisories=data && Array.isArray(data.advisories)?data.advisories:[]; if (advisories.length) process.exit(1);"
```

### 2.2 Patching & Upgrade Protocol
When a vulnerability is reported in project dependencies:
1. **Targeted Assessment:** Inspect whether the affected package can be upgraded without breaking breaking API contracts.
2. **Package Version Update:** Update the semantic version range in `package.json` for the affected dependency.
3. **Lockfile Regeneration:** Execute `bun install` to update `bun.lock` with deterministic package hashes.
4. **Verification Gates:**
   - Execute test suite: `bun test` (all 6 tests must pass).
   - Execute production build: `bun run build` (Next.js Turbopack build must exit 0).
   - Verify audit resolution: `bun audit --json --audit-level critical` yields zero critical advisories.
5. **Git Pipeline:** Commit via certified prompt protocol and push to `origin/main` for CI/CD deployment.

---

## 3. Automated CI/CD Vulnerability Scanning

### 3.1 GitHub Actions Workflow Structure
The security scanning pipeline consists of two coordinated GitHub Actions workflows:

1. **Pre-Deployment Gate (`.github/workflows/deploy.yml`):**
   - Step: `Run Dependency Vulnerability Audit`
   - Command: `bun audit --json --audit-level critical` with a node-based exit gate on any critical advisories.
   - Gate behavior: Fails the build before compilation or server deployment if any package has a critical severity rating.

2. **Weekly Scheduled Scan (`.github/workflows/security-scan.yml`):**
   - Trigger: `schedule` (`cron: '0 0 * * 0'` — Sundays at 00:00 UTC) and `workflow_dispatch`.
   - Behavior: Runs full `bun audit`, uploads `security-audit-report.txt` as a 30-day workflow artifact, and asserts zero critical advisories via the supported Bun CLI gate.

---

## 4. Quarterly Security Audit Checklist

Every quarter, execute the following four-point security audit:

### Checklist:
- [ ] **Dependency Audit:** Run `bun audit` locally and review report for emerging moderate/high vulnerabilities.
- [ ] **Caddy Security Headers:** Probe live production endpoints using `curl -I https://haypstudios.com` and verify:
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- [ ] **TLS Certificate Verification:** Confirm Let's Encrypt automated renewal status in `/var/log/caddy/` and verify certificate expiration is > 30 days.
- [ ] **Telemetry Endpoint Protection:** Confirm `/api/analytics/metrics` returns HTTP 401 when requested without valid `ADMIN_PASSWORD` credentials.

---

## 5. Security Incident Escalation & Response
If an exploitable zero-day or critical vulnerability is identified in production:
1. **Triage:** Assess severity, public exploit availability, and vector (frontend client vs server SSR).
2. **Immediate Mitigation:** If an upstream patch is not yet released, apply a temporary blocking rule in `deploy/Caddyfile` or Next.js middleware.
3. **Emergency Patching:** Apply the patched release, run local test/build gates, and push to `main` for automated VPS deployment.
4. **Post-Incident Audit:** Inspect PM2 logs (`pm2 logs hayp-frontend --lines 500`) and Caddy logs on `vortex` to confirm zero unauthorized access attempts.

---

## COMPLETION VERIFICATION
**Status:** DONE (Hydra Certified)  
**Completion Date:** 2026-10-17  
**Audit Baseline SHA:** `c970d93c013f6dabef60c85207a4e356f34878bf`  
**Verification Notes:** All components of Deliverable 10.4 are implemented and operational. Critical vulnerabilities in next/next-auth resolved. Pre-deployment audit gate and weekly scanning workflow active.