# Health Check API Route (`/api/health`)

**Status:** ✅ DONE  
**Completed Date:** 2026-10-14  
**Commit:** `990574cd6a8fb77fd67decfa6c1c1e4d23d987c7` (`990574c`)  
**Route:** `GET /api/health`  

---

## 1. Overview
The Health Check API endpoint provides real-time operational status of the Hayp.Studios application and its PostgreSQL database connection. It is designed to be queried by external uptime monitors (UptimeRobot, Hetzner probe, Better Uptime) and internal reverse proxies (Caddy).

---

## 2. Route Behavior
- **Dynamic Execution:** Configured with `export const dynamic = "force-dynamic"` to bypass Next.js static page generation and edge caching.
- **Cache-Control:** Sends `Cache-Control: no-store, no-cache, must-revalidate` on all responses.
- **Database Ping:** Executes `db.$queryRaw\`SELECT 1\`` using the centralized Prisma client (`@/lib/db`).
- **Response Codes:**
  - `200 OK`: Database connected, memory and process uptime within normal operating parameters.
  - `503 Service Unavailable`: Database ping failed or thrown exception during query execution.

---

## 3. Response Schema
```json
{
  "status": "ok",
  "timestamp": "2026-10-14T02:30:00.000Z",
  "uptime": 1234.56,
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

---

## 4. Operational Usage
- Query URL: `https://haypstudios.com/api/health`
- Recommended Interval: Every 60 seconds
- Expected Status Code: `200`