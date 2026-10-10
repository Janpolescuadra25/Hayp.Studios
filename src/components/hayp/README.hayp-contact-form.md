# Component: HaypContactForm (`hayp-contact-form.tsx`)
**Status:** DONE (VERIFIED)
**Location:** `src/components/hayp/hayp-contact-form.tsx`
**Integration Point:** `src/components/hayp/hayp-hub.tsx` (via Radix UI Dialog)
**Dependencies:** `lucide-react`, `@/hooks/use-toast`, `@/hooks/use-analytics`

---

## 1. PURPOSE & OVERVIEW
Provides a structured creative engagement form for potential clients to submit project briefs (Name, Email, Engagement Type, and Message). Integrates EmailJS REST dispatch in production with a simulated dev fallback.

## 2. KEY FEATURES & VALIDATION
- **Engagement Types:** Kinetic Identity & Branding, Interactive Web Experience, Motion & 3D Spatial Systems, General Creative Partnership.
- **Analytics Tracking:** Emits `contact_form_submitted` event through `useAnalytics().sendEvent`.
- **Dev-Mode Simulation:** When `NEXT_PUBLIC_EMAILJS_*` environment variables are absent, logs captured brief to console, simulates an 800ms network roundtrip, and triggers a toast notice.
- **Production REST Dispatch:** Posts directly to EmailJS REST endpoint (`https://api.emailjs.com/api/v1.0/email/send`) with payload parameters.
- **Success State:** Displays animated `CheckCircle2` confirmation icon upon completion.
- **Client Validation:** Rejects empty values, invalid emails, and overly short briefs before submission.

## 3. USAGE
```tsx
import { HaypContactForm } from '@/components/hayp/hayp-contact-form';

export function ModalWrapper({ onClose }: { onClose: () => void }) {
  return <HaypContactForm onSuccess={onClose} />;
}
```
