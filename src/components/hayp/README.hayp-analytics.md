# HaypAnalytics Component Documentation

**Status:** ✅ CORE IMPLEMENTATION DONE (2026-10-06)  
**Location:** `src/components/hayp/hayp-analytics.tsx`  
**Associated Route:** `src/app/api/analytics/metrics/route.ts`  

---

## 1. Overview
The `HaypAnalytics` component is an internal studio telemetry dashboard providing real-time visibility into product card interactions, session volumes, navigation flow, and conversion events across the Hayp Studios portfolio.

---

## 2. Key Architecture & Dependencies
- **Data Source**: Aggregated via `GET /api/analytics/metrics` backed by the Prisma `AnalyticsEvent` SQLite database.
- **Visualization**: Recharts (`ResponsiveContainer`, `BarChart`, `Bar`, `XAxis`, `YAxis`, `Tooltip`, `CartesianGrid`) for 7-day engagement activity.
- **Icons**: `lucide-react` (`Activity`, `Eye`, `MousePointerClick`, `ExternalLink`, `Users`, `RefreshCw`, `AlertTriangle`, `BarChart3`, `ShieldCheck`).
- **Client Telemetry Integration**: Interacts with `src/hooks/use-analytics.ts` (`trackPageView`, `trackCardClick`, `trackExternalNav`).

---

## 3. Component Features & States
1. **Metric KPI Cards**:
   - Total Page Views (SPA view transitions)
   - Unique Sessions (distinct session UUID cohorts)
   - Product Card Clicks (engagement signals from `hayp-hub.tsx`)
   - Outbound Navigation (ecosystem conversion transitions from `hayp-chrome.tsx`)
2. **Engagement Distribution Chart**:
   - 7-day daily breakdown of page views, card clicks, and outbound navigations.
3. **Recent Ingested Events Table**:
   - Sanitized tabular view of the 25 most recent events with timestamp, event type, entity/path, and session cohort.
4. **Resilience & UX States**:
   - Defensive loading state with animated refresh indicator.
   - Interactive error banner with "Retry" action handling HTTP 401 and HTTP 500 responses.
   - Clean empty-state zero fallbacks.

---

## 4. Authentication & Security Context
- **Current Mechanism**: Authenticates via `x-studio-key` header matching `STUDIO_ANALYTICS_KEY` / `NEXT_PUBLIC_STUDIO_ANALYTICS_KEY`.
- **Target Architecture (Milestone 5B-5)**: Transition to NextAuth.js server-side session checks, removing client-side key exposure and restricting dashboard access to authenticated studio administrators.

---

## 5. SPA Mounting
Mounted in root `src/app/page.tsx`:
```tsx
{view === "analytics" && <HaypAnalytics />}
```
Transition variant registered in `VARIANT_FOR` as `analytics: "portal"`.