# Hayp Studios — Deliverable 10.3: Feedback, Funnel Analytics & Telemetry Runbook

**Asset ID:** Asset #14  
**Deliverable:** 10.3  
**Environment:** Production Hetzner VPS `vortex` (`2.28.120.85`)  
**Status:** Operational  
**Last Updated:** 2026-10-18

---

## 1. Scope
Deliverable 10.3 adds structured client feedback capture, funnel conversion insights, and privacy-conscious device/geographic telemetry for Hayp Studios. The platform records user sentiment, tracks trend metrics, and provides admins with a single operational dashboard for satisfaction and conversion analysis.

## 2. User Feedback & Inquiry Capture

### Inquiry payload fields
The inquiry route accepts the following fields while preserving existing workflow and validation:

- `name` — required, sanitized, 2-120 characters
- `email` — required, validated format
- `engagementType` — required, enum-driven partner type
- `brief` — required, 12-8000 characters
- `feedbackRating` — optional, integer 1-5
- `feedbackMessage` — optional, trimmed, max 1000 characters
- `telemetryConsent` — optional boolean, defaults to false

### Behavioral rules
- Feedback submissions without a rating or message are still accepted as valid inquiries.
- Invalid rating values outside 1-5 return HTTP 400 with a structured `{ error: string }` payload.
- Oversized feedback text returns HTTP 400 and is not persisted.

## 3. Telemetry Ingestion Contract

### Endpoint
`POST /api/analytics/event`

### Captured fields
- `eventType` — required, max 64 chars
- `entityType` / `entityId` — optional, limited to safe string lengths
- `metadata` — optional JSON object or string
- `pathname` — optional page route
- `sessionId` — optional session identifier
- `userAgent` — parsed for device detection
- `country` — highest-confidence geo header from proxy/CDN or `UNKNOWN`
- `region` — region header or `UNKNOWN`
- `deviceType` — `desktop`, `tablet`, or `mobile`
- `ipHash` — SHA-256 hash of the client IP for privacy-safe telemetry storage

### Privacy posture
- IP addresses are never stored in plaintext.
- Telemetry is opt-in via the contact form consent checkbox.
- Storage is limited to pseudonymous values suitable for analytics and troubleshooting.

## 4. Analytics Metrics Contract

### Endpoint
`GET /api/analytics/metrics`

### Returned data
- `totals.totalInquiries`
- `totals.averageSatisfaction`
- `totals.ratedInquiries`
- `funnel.pageViews`
- `funnel.inquiriesSubmitted`
- `funnel.conversionRatePercent`
- `deviceBreakdown`
- `countryBreakdown`

### Conversion rate
The funnel conversion rate is calculated as:

$$
\text{conversionRatePercent} = \frac{\text{inquiriesSubmitted}}{\text{pageViews}} \times 100
$$

If there are zero page views, the conversion rate returns `0` to avoid division-by-zero errors.

## 5. Operational Procedures

### Health checks
- Confirm API availability at `https://haypstudios.com/api/health`.
- Confirm admin metrics endpoint response is 200 for owner session requests.

### Log review
```bash
ssh -i ~/.ssh/id_ed25519_hetzner root@2.28.120.85
pm2 logs hayp-frontend --lines 200
```

### Validation gates
Run the following before shipping analytics changes to production:

```bash
bun test
bun run build
```

## 6. Ownership & Escalation
For anomalies in conversion data, missing feedback, or telemetry collection errors:
1. Check PM2 service health.
2. Verify Prisma SQLite schema sync.
3. Review `/api/analytics/event` and `/api/analytics/metrics` logs.
4. Confirm the production app is running on port `3003` and behind Caddy.

---

## 7. Summary
This deliverable strengthens Hayp Studios’ customer intelligence without compromising privacy or operational safety. It gives the studio a repeatable, auditable way to measure satisfaction and conversion while keeping the deployment simple and transparent.
