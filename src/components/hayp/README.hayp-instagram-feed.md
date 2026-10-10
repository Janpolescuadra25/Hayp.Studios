# Component: HaypInstagramFeed (`hayp-instagram-feed.tsx`)
**Status:** DONE (VERIFIED)
**Location:** `src/components/hayp/hayp-instagram-feed.tsx`
**Associated Route:** `src/app/api/instagram/route.ts`
**Dependencies:** `lucide-react`, `next/image`

---

## 1. PURPOSE & OVERVIEW
Renders a responsive visual dispatch grid showcasing recent studio motion, typography, and 3D visual experiments. Provides seamless fallback rendering when live Instagram Graph API access tokens are unset or offline.

## 2. ARCHITECTURE & BEHAVIOR
- **Client Component:** Declared with `'use client'`. Fetches media items asynchronously from `/api/instagram`.
- **Loading State:** Displays an animated 4-card skeleton grid (`animate-pulse`) while querying.
- **Hover Transitions:** Cards scale smoothly on hover (`group-hover:scale-105`) with gradient overlay reveal for post captions.
- **Resilience:** If network fetch fails or API returns fallback data, renders curated fallback studio assets without throwing errors.

## 3. USAGE
```tsx
import { HaypInstagramFeed } from '@/components/hayp/hayp-instagram-feed';

export default function StudioPage() {
  return <HaypInstagramFeed />;
}
```
