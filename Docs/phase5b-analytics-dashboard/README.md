# Phase 5B: Analytics Dashboard & Telemetry Architecture

**Status:** In Progress  
**Initiated:** 2026-10-06  
**Target:** Owner Studio Telemetry, Usage Metrics, and Performance Dashboard  

---

## 1. Overview & Objectives
Phase 5B introduces a private, privacy-conscious analytics pipeline and owner dashboard for Hayp Studios:
- **Product Engagement Tracking:** Measure user interactions across all Hayp product cards (Qyra, Zypra, Cirqa, Lumora).
- **Outbound Link Telemetry:** Track conversions to external product sites (e.g., `https://qyra.space`).
- **View Navigation Analytics:** Monitor dwell time and flow across SPA views (`landing`, `hub`, `whatsnew`).
- **Owner Dashboard UI:** Data visualization powered by `recharts`, tabular logs with `@tanstack/react-table`, and real-time metric aggregates.

---

## 2. Telemetry Schema (`AnalyticsEvent`)
Persisted via Prisma ORM (SQLite for local dev, PostgreSQL for production deployment):
- `id`: Unique event identifier (`cuid`).
- `eventType`: Category of interaction (`page_view`, `card_click`, `external_nav`, `modal_toggle`).
- `entityType`: Target entity type (`product`, `view`, `link`, `action`).
- `entityId`: Target identifier (e.g., `qyra`, `zypra`, `hub`, `whatsnew`).
- `metadata`: Structured JSON string for event-specific payload parameters.
- `pathname`: Active route or view at event trigger.
- `sessionId`: Anonymous client session hash for cohort analysis without PII.
- `userAgent`: User agent header string for device/browser telemetry.
- `createdAt`: Timestamp of event creation.

---

## 3. Implementation Milestones
- [x] **5B-1:** Initialize Phase 5B, architecture documentation, and `AnalyticsEvent` Prisma schema.
- [ ] **5B-2:** Ingestion API route (`/api/analytics/event`) with payload validation and rate limiting.
- [ ] **5B-3:** Client telemetry hooks (`useAnalytics`) embedded in SPA Chrome and product cards.
- [ ] **5B-4:** Studio Analytics Dashboard view (`hayp-analytics.tsx`) with metric cards, engagement charts, and event log table.
- [ ] **5B-5:** Owner authentication and dashboard access control.
