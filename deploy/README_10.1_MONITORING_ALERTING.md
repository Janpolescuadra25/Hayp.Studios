# PRODUCTION UPTIME MONITORING & ALERTING RUNBOOK (DELIVERABLE 10.1)

**Application:** Hayp Studios (`haypstudios.com`)  
**Production Host:** Hetzner VPS `vortex` (`2.28.120.85`)  
**PM2 Process:** `hayp-frontend` (Port 3003)  
**Deliverable Status:** COMPLETE (Hydra Verified)  
**Last Updated:** 2026-10-17  

---

## 1. EXECUTIVE SUMMARY & ARCHITECTURAL OVERVIEW

Deliverable 10.1 establishes 24/7 proactive monitoring, failure detection, process resilience, and incident response procedures for Hayp Studios. The architecture follows a multi-tiered monitoring approach:
1. **Tier 1 (External Ingress & Synthetic Health Probing):** External monitoring probes query `https://haypstudios.com/api/health` at 60-second intervals to verify full-stack availability (Caddy TLS reverse proxy, Next.js application runtime, and PostgreSQL database connectivity).
2. **Tier 2 (Process Management & Resilience):** PM2 enforces automated restart policies on crashes, a 1GB memory threshold (`max_memory_restart: '1G'`), restart loop throttling (`min_uptime: '10s'`, `max_restarts: 10`), and structured log aggregation in `./logs/`.
3. **Tier 3 (Alert Escalation & On-Call Procedures):** Defined severity levels (P1–P3) route alerts immediately to operations channels with deterministic triage and rollback protocols.

---

## 2. TIER 1: EXTERNAL UPTIME MONITORING SPECIFICATION

### 2.1 Primary Health Probe Target
- **Target URL:** `https://haypstudios.com/api/health`
- **Method:** `GET`
- **Probe Interval:** 60 seconds
- **Request Timeout:** 5000 ms (5 seconds)
- **Expected HTTP Status:** `200 OK`
- **Expected JSON Payload Contract:**
  ```json
  {
    "status": "ok",
    "timestamp": "<ISO-8601-STRING>",
    "database": {
      "status": "healthy"
    }
  }
  ```
- **Failure Trigger Conditions:**
  - HTTP status != `200` (e.g. `503 Service Unavailable` on database outage, `502 Bad Gateway` on process crash).
  - TCP connection failure or TLS handshake error.
  - Response time > 5000 ms.
  - JSON payload does not contain `"status":"ok"` or `"database":{"status":"healthy"}`.
- **Incident Threshold:** 2 consecutive failed probes (120 seconds of confirmed failure).

### 2.2 Recommended Monitoring Providers
Operations may configure external monitoring using any of the following pre-validated configurations:

#### Option A: Hetzner Cloud Monitoring / External Probe
- Configure HTTP check pointing to `https://haypstudios.com/api/health`.
- Assert HTTP status code `200`.

#### Option B: Uptime Kuma (Self-Hosted on VPS vortex or Secondary VPS)
- Monitor Type: `HTTP(s) - Keyword` or `HTTP(s) - JSON Query`
- URL: `https://haypstudios.com/api/health`
- Interval: 60s
- Retries: 2
- Keyword Assertion: `"status":"ok"`
- Notification Channel: Discord Webhook, Telegram Bot, or Email.

#### Option C: UptimeRobot / Better Uptime (Cloud Free Tier)
- Monitor Type: `HTTP(s)`
- Friendly Name: `Hayp Studios Production Health`
- URL: `https://haypstudios.com/api/health`
- Monitoring Interval: 60 seconds (or 5 minutes on standard free tiers).
- Alert Contacts: Studio Owner email (`paulescuadra25@gmail.com`).

---

## 3. TIER 2: PM2 PROCESS HEALTH & LOGGING ARCHITECTURE

### 3.1 PM2 Configuration (`deploy/ecosystem.config.js`)
The production application runtime is governed by the following active configuration:
- `name`: `hayp-frontend`
- `script`: `node_modules/next/dist/bin/next start -p 3003`
- `instances`: 1 (Fork mode)
- `autorestart`: `true` (Restarts immediately on unhandled exceptions)
- `max_memory_restart`: `1G` (Prevents runaway memory leaks from consuming VPS RAM)
- `min_uptime`: `10s` (Process must stay up 10s to be considered stable)
- `max_restarts`: `10` (Prevents infinite CPU spinning during persistent crashloops)
- `error_file`: `./logs/pm2-error.log`
- `out_file`: `./logs/pm2-out.log`
- `log_date_format`: `YYYY-MM-DD HH:mm:ss Z`
- `merge_logs`: `true`

### 3.2 Server-Side Directory Setup & Permissions (MANDATORY PRE-RELOAD STEP)
Before reloading PM2 on the production server, ensure the logs directory exists with appropriate permissions:
```bash
# On vortex server (execute via SSH to prevent PM2 startup failures):
ssh -i ~/.ssh/id_ed25519_hetzner root@2.28.120.85 'mkdir -p /var/www/haypstudios/logs && chmod 755 /var/www/haypstudios/logs'
```

### 3.3 Log File Security & Rotation
To protect sensitive diagnostic data and prevent disk space exhaustion:
```bash
# Set secure file permissions on logs (owner read/write, group read only):
ssh -i ~/.ssh/id_ed25519_hetzner root@2.28.120.85 'chmod 640 /var/www/haypstudios/logs/pm2-*.log 2>/dev/null || true'

# Check if pm2-logrotate is installed:
ssh -i ~/.ssh/id_ed25519_hetzner root@2.28.120.85 'pm2 module:list'

# Install and configure pm2-logrotate if not present:
ssh -i ~/.ssh/id_ed25519_hetzner root@2.28.120.85 'pm2 install pm2-logrotate && pm2 set pm2-logrotate:max_size 10M && pm2 set pm2-logrotate:retain 7 && pm2 set pm2-logrotate:compress true'
```

### 3.4 Server Diagnostics & Post-Deployment Verification Commands
```bash
# Reload process after configuration update:
ssh -i ~/.ssh/id_ed25519_hetzner root@2.28.120.85 'cd /var/www/haypstudios && pm2 reload deploy/ecosystem.config.js --update-env'

# Confirm process is online with new configuration:
ssh -i ~/.ssh/id_ed25519_hetzner root@2.28.120.85 'pm2 status hayp-frontend'

# Verify local endpoint health:
ssh -i ~/.ssh/id_ed25519_hetzner root@2.28.120.85 'curl -i http://127.0.0.1:3003/api/health'
```

---

## 4. TIER 3: ALERT ESCALATION & ON-CALL RESPONSE PROCEDURES

### 4.1 Severity Level Matrix

| Severity | Definition | Examples | Response SLA | Action Required |
|---|---|---|---|---|
| **P1 — CRITICAL** | Complete service outage or primary user journey blocked. | `/api/health` returns 503 (DB down), Caddy returns 502 (PM2 process crashed), site unreachable. | < 15 minutes | Immediate page to on-call owner; follow Incident Response Runbook (§4.2). |
| **P2 — MAJOR** | Application degraded or resource threshold exceeded. | PM2 memory restarts observed, API response latency > 3s, elevated inquiry submission errors. | < 1 hour | Triage logs, inspect VPS memory/CPU, restart service if memory degraded. |
| **P3 — MINOR** | Non-critical operational anomaly. | Automated backup script warning, transient network blip (1 failed probe). | < 24 hours | Review logs during normal operational hours; verify backup integrity. |

### 4.2 Incident Response Workflow (P1 Incident)

```
[External Monitor Alert]
          │
          ▼
1. VERIFY OUTAGE (Confirm via live probe)
   curl -i https://haypstudios.com/api/health
          │
    ┌─────┴─────────────────────────────────┐
    ▼                                       ▼
HTTP 502 / Connection Refused        HTTP 503 Service Unavailable
(PM2 Process Down)                  (Database Connectivity Failure)
    │                                       │
    ▼                                       ▼
Check PM2 Process & Restart:         Check PostgreSQL Service:
ssh -i ~/.ssh/id_ed25519_hetzner    ssh -i ~/.ssh/id_ed25519_hetzner
  root@2.28.120.85                    root@2.28.120.85
pm2 status                          systemctl status postgresql
pm2 logs hayp-frontend --err        sudo -u postgres psql -c '\l'
pm2 restart hayp-frontend           systemctl restart postgresql
          │                                 │
          └───────────────┬─────────────────┘
                          │
                          ▼
2. POST-REMEDIATION VERIFICATION
   bash deploy/verify-deployment.sh https://haypstudios.com
          │
          ▼
3. INCIDENT CLOSE & LOGGING
   Document root cause in deploy/incident-logs/ (if applicable).
```

### 4.3 Emergency VPS Access Runbook
- **Host:** `2.28.120.85`
- **SSH Key:** `~/.ssh/id_ed25519_hetzner`
- **Connect Command:**
  ```bash
  ssh -i ~/.ssh/id_ed25519_hetzner root@2.28.120.85
  ```
- **App Directory:** `/var/www/haypstudios` (or target repo directory)
- **Rollback Procedure (if bad deployment):**
  ```bash
  cd /var/www/haypstudios
  git log -2 --oneline
  git checkout <LAST_KNOWN_GOOD_SHA>
  bun install --frozen-lockfile
  bun run build
  pm2 reload deploy/ecosystem.config.js --update-env
  pm2 status hayp-frontend
  ```