# Analytics Event Ingestion API (`/api/analytics/event`)

## 1. Overview
This API route ingests client-side user engagement events, including page navigations, button interactions, and card clicks, with automated privacy-safe telemetry enrichment.

## 2. Status
- **Status:** **DONE (Verified by Hydra on 2026-10-18)**
- **Deliverable:** Phase 10 Deliverable 10.3
- **Primary Files:**
  - `src/app/api/analytics/event/route.ts`
  - `prisma/schema.prisma` (`AnalyticsEvent` model)

## 3. Architecture & Data Flow
1. **Client Payload:** Receives JSON containing `eventType`, `pathname`, optional `entityType`, `entityId`, `metadata`, `sessionId`, and `consent`.
2. **Device & Geolocation Telemetry:**
   - Detects `deviceType` (`mobile`, `tablet`, `desktop`) via `User-Agent`.
   - Extracts geographic headers (`x-vercel-ip-country`, `cf-ipcountry`, `x-vercel-ip-country-region`).
3. **Privacy-Safe IP Hashing:**
   - Raw IP addresses are **never** stored in plaintext.
   - Client IP is hashed using SHA-256 (`ipHash = hashIp(clientIp).slice(0, 64)`). No internal salt is used in the hashing process.
   - If `consent === false`, geolocation and IP hashing are bypassed.
4. **Rate Limiting:** Enforces a rate limit of 100 requests/minute per client.

## 4. Usage Example
```bash
POST /api/analytics/event
Content-Type: application/json

{
  "eventType": "page_view",
  "pathname": "/contact",
  "consent": true
}
```