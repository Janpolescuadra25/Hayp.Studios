# HaypAdmin Component (`src/components/hayp/hayp-admin.tsx`)

## Overview
`HaypAdmin` is an authenticated operations dashboard integrated into the Hayp.Studios single-page architecture for managing client inquiries and reviewing studio operations in real time.

## Key Technical Specifications
- **Authentication:** Client-side integration with NextAuth via `useSession()`.
- **Access Guard:** Restricted to authenticated sessions with `role === "ADMIN"` or matching the designated administrator email.
- **Navigation Guard:** `src/components/hayp/hayp-chrome.tsx` enforces authentication redirect to `/api/auth/signin` for unauthenticated visitors attempting to select the Admin view.
- **API Endpoints:**
  - `GET /api/inquiry`: Fetches inquiries with optional status/type filtering and pagination.
  - `PATCH /api/inquiry`: Atomically updates inquiry processing statuses (`NEW`, `IN_REVIEW`, `CONTACTED`, `ARCHIVED`).
- **State Handling:** Full UX coverage for loading spinners, empty states, error notices, and manual inquiry refresh.

## Key Files Involved
- `src/components/hayp/hayp-admin.tsx` — Dashboard UI component.
- `src/components/hayp/hayp-chrome.tsx` — Navigation bar with admin guard.
- `src/components/hayp/hayp-transition.tsx` — View state typing (`HaypView = ... | "admin"`).
- `src/app/page.tsx` — Top-level view routing and rendering.
- `src/app/api/inquiry/route.ts` — Protected backend endpoints.

## Completion Status
- **Deliverable:** Phase 8, Deliverable 8.4
- **Verified Commit:** `20756ab5c3d2e915a16d5e381b54e9f47e2cee1d`
- **Status:** DONE (VERIFIED)
