# Analytics Metrics Aggregation API (`/api/analytics/metrics`)

## 1. Overview
Provides aggregated reporting on customer inquiries, user feedback satisfaction ratings, conversion funnel progression, and device/geographic distributions.

## 2. Status
- **Status:** **DONE (Verified by Hydra on 2026-10-18)**
- **Deliverable:** Phase 10 Deliverable 10.3
- **Primary Files:**
  - `src/app/api/analytics/metrics/route.ts`

## 3. Metrics Computed
1. **Inquiry & Feedback Metrics:**
   - `totalInquiries`: Total inquiries submitted.
   - `avgSatisfactionScore`: Mean score (1.00–5.00) across all submissions providing `feedbackRating`.
   - `ratedInquiriesCount`: Number of inquiries with feedback ratings.
2. **Device & Geographic Breakdown:**
   - Aggregated count of events categorized by `deviceType` (desktop, mobile, tablet).
   - Aggregated count of events categorized by `country`.
3. **Conversion Funnel Analytics:**
   - `totalPageViews`: Total `page_view` events recorded.
   - `contactPageViews`: Total visits to `/contact`.
   - `inquiriesSubmitted`: Total conversion events.
   - `conversionRatePct`: Percentage calculation of inquiries relative to total page views.

## 4. Usage Example
```bash
GET /api/analytics/metrics
```
Response:
```json
{
  "success": true,
  "metrics": {
    "totalInquiries": 12,
    "totalEvents": 1450,
    "avgSatisfactionScore": 4.85,
    "ratedInquiriesCount": 8,
    "deviceBreakdown": { "desktop": 980, "mobile": 470 },
    "countryBreakdown": { "PH": 1200, "US": 250 },
    "funnel": {
      "totalPageViews": 1100,
      "contactPageViews": 85,
      "inquiriesSubmitted": 12,
      "conversionRatePct": 1.09
    }
  }
}
```

## 5. Operational Notes
This endpoint is intentionally read-only and serves derived analytics from the inquiry and event tables for funnel, satisfaction, and device/country reporting.