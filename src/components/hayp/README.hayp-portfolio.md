# Deliverable 11.3: Dynamic Portfolio & Artist Showcase UI

## Overview
This component module implements the public dynamic portfolio gallery and resident artist showcase for Hayp.Studios Phase 11.

- Status: DONE: Deliverable 11.3 Dynamic Portfolio & Artist Showcase UI
- Routes provided:
  - /portfolio: Studio portfolio gallery with responsive filtering and modal preview.
  - /artists: Resident artist directory cards and publication details.

## Component Architecture
- src/components/hayp/types.ts: Shared contracts for media, artist, and product shape.
- src/components/hayp/hayp-portfolio-grid.tsx: Client Component for local filter state and gallery interactions.
- src/components/hayp/hayp-project-modal.tsx: Dialog-based media viewer and project detail panel.
- src/components/hayp/hayp-portfolio-grid.test.tsx: Colocated validation for filter logic and empty states.

## Server / Client Boundary
- src/app/portfolio/page.tsx is a Server Component that fetches active products and artists from Prisma and injects them into the client gallery.
- src/app/artists/page.tsx is a Server Component that loads active artist profiles and their primary media.
- The local filtering, modal state, and card interactions remain on the client so the public UI remains responsive without repeated server round-trips.

## Reused UI Primitives
- Dialog primitives from src/components/ui/dialog.tsx.
- Carousel primitives from src/components/ui/carousel.tsx.
- Badge and Button from src/components/ui/badge.tsx and src/components/ui/button.tsx.

## Responsive Layout
- Mobile: 1 column layout.
- Small screens: 2 columns at the sm breakpoint.
- Desktop: 3 columns at the lg breakpoint.
- Filter controls remain horizontally scrollable when there are many artist or tag options.

## Accessibility notes
- Artist filter buttons and tag options use aria-pressed states.
- Gallery cards are keyboard-focusable and respond to Enter/Space activation.
- The project modal provides close actions and a clear fallback state when no media is attached to an item.
