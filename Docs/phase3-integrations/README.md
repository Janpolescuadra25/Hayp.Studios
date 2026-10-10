# Phase 3: Third-Party Integrations — Implementation Documentation
**Status:** IN PROGRESS  
**Baseline Commit:** 4c22b541b9ee3be04a84ffcf95045a9cc59874fd  
**Purpose:** Implement Instagram Basic Display API feed and EmailJS contact form integrations with resilient mock/fallback architectures for local development.

---

## 1. PLANNED DELIVERABLES
1. **Instagram Feed Integration:**
   - Server API Route: src/app/api/instagram/route.ts
   - UI Component: src/components/hayp/hayp-instagram-feed.tsx
   - Resilient Fallback: Returns simulated photography and studio assets when INSTAGRAM_ACCESS_TOKEN is unset.
2. **EmailJS Contact Form Integration:**
   - UI Component: src/components/hayp/hayp-contact-form.tsx
   - Modal Integration: Embedded into booking/contact modal workflows in src/components/hayp/hayp-hub.tsx.
   - Resilient Fallback: Input validation with simulated success toasts and console telemetry when EmailJS public keys are unset.
3. **Configuration Declarations:**
   - Environment variable template declared in .env.production.example.

---

## 2. ARCHITECTURAL INVARIANTS
- **Zero Runtime Breakage:** Development builds and production standalone servers run cleanly without requiring live third-party API credentials.
- **Client/Server Isolation:** Sensitive API tokens are consumed via server routes; public EmailJS keys strictly follow NEXT_PUBLIC_ prefixes.
- **UI/UX Consistency:** Components adhere to established Tailwind styling and Radix UI primitive patterns.