# API Route: Instagram Dispatch (`/api/instagram`)
**Status:** DONE (VERIFIED)
**Location:** `src/app/api/instagram/route.ts`
**Endpoint:** `GET /api/instagram`
**Runtime:** Next.js 16.1.3 App Router

---

## 1. PURPOSE & OVERVIEW
Provides server-side aggregation for Instagram media items. Shields the client from direct Graph API credential handling and guarantees instant JSON delivery via cached studio fallbacks.

## 2. ARCHITECTURE & FALLBACK STRATEGY
- **Environment Key:** `INSTAGRAM_ACCESS_TOKEN` (server-side only, never prefixed with `NEXT_PUBLIC_`).
- **Cache Policy:** Queries Instagram Graph API with `{ next: { revalidate: 3600 } }` (1-hour TTL).
- **Fallback Payload:** Delivers 4 curated studio mock items (`FALLBACK_INSTAGRAM_POSTS`) if:
  1. `INSTAGRAM_ACCESS_TOKEN` is unset or blank.
  2. Upstream Instagram Graph API returns non-200 HTTP status.
  3. A network exception occurs during fetch.
- **Response Format:**
```json
{
  "source": "live" | "fallback",
  "message": "string (optional description)",
  "data": [
    {
      "id": "hayp-ig-1",
      "caption": "Kinetic typography...",
      "media_type": "IMAGE",
      "media_url": "https://...",
      "permalink": "https://...",
      "timestamp": "2026-10-08T14:30:00Z"
    }
  ]
}
```
