# Deliverable 9.3: Monitoring, Logging & Error Tracking Specification

**Status:** FULLY IMPLEMENTED & VERIFIED  
**Target Environment:** Hetzner VPS `vortex` (IPv4: `2.28.120.85`, Port: `3003`)  
**Service:** `hayp-frontend` (PM2 Managed)  

---

## 1. Health Check Endpoint (`/api/health`)

- **Route:** `GET /api/health`
- **Dynamic Policy:** `force-dynamic` (Strictly bypasses static generation & edge caching)
- **Cache-Control:** `no-store, no-cache, must-revalidate`
- **Status Codes:**
  - `200 OK`: Database connected, system healthy.
  - `503 Service Unavailable`: Database ping failed or database down.
- **Payload Schema:**
  ```json
  {
    "status": "ok",
    "timestamp": "2026-10-13T12:00:00.000Z",
    "uptime": 12345.67,
    "environment": "production",
    "database": {
      "status": "healthy",
      "latencyMs": 4
    },
    "memory": {
      "rss": 54321000,
      "heapTotal": 32100000,
      "heapUsed": 21000000
    },
    "responseTimeMs": 5
  }
  ```
- **External Monitoring Integration:**
  Configure external monitors (UptimeRobot, Better Uptime, or Hetzner monitoring probe) to query `https://haypstudios.com/api/health` every 60 seconds expecting HTTP `200`.

---

## 2. Structured Centralized Logger (`src/lib/logger.ts`)

- **Design:** JSON-formatted output with ISO timestamps, log levels (`debug`, `info`, `warn`, `error`), and metadata contexts.
- **Security Guardrails:** Never logs secrets, bearer tokens, passwords, or PII.
- **Usage Example:**
  ```typescript
  import { logger } from "@/lib/logger";

  logger.info("Inquiry received", "InquiryAPI", { inquiryId: "inq_123" });
  logger.error("Failed to process transaction", error, "BillingService");
  ```

---

## 3. Database Backup & Retention Routine (`deploy/backup-postgres.sh`)

- **Script Path:** `deploy/backup-postgres.sh`
- **Execution Target:** Local PostgreSQL instance on VPS `vortex` (Port `5432`).
- **Retention Policy:** 7-day automated rotation (`find -mtime +7 -exec rm -f {} \;`).
- **Cron Setup (Run daily at 02:00 UTC):**
  ```bash
  crontab -e
  0 2 * * * /bin/bash /var/www/haypstudios/deploy/backup-postgres.sh >> /var/log/haypstudios-backup.log 2>&1
  ```
- **Restoration Procedure:**
  ```bash
  gunzip < /var/backups/haypstudios/postgres/HaypStudios_db_backup_YYYYMMDD_HHMMSS.sql.gz | psql -U postgres HaypStudios_db
  ```