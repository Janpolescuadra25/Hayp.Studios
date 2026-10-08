# Milestone 6-2: Upcoming Software Previews (Zypra, Cirqa, Lumora)

**Status:** Completed & Code-Verified  
**Reference Implementations:**  
- Data Model & Registry: `src/lib/hayp-data.ts`  
- Preview Modal & UI Hub: `src/components/hayp/hayp-hub.tsx`  
- Roadmap Tracking: `Road_Map.md`  

---

## 1. Overview & Objective
Milestone 6-2 delivers dedicated preview capabilities and metadata registry integration for Hayp Studios' upcoming software ecosystem:
- **Zypra:** Intelligent enterprise resource planning and accounting platform (`development`, ETA: Late 2026).
- **Cirqa:** Self-healing process automation and workflow engine (`planned`, ETA: 2027).
- **Lumora:** Decentralized sovereign social ecosystem and community platform (`planned`, ETA: 2027).

These upcoming products are registered in the core product database and featured with interactive preview modal dialogs within the unified Hayp Studios Hub.

---

## 2. Verified Runtime Product Schema Contract
Defined in `src/lib/hayp-data.ts`:

```typescript
export type Category = 'Accounting' | 'Automation' | 'Social' | 'E-Commerce' | 'Games';
export type ProductStatus = 'live' | 'development' | 'planned' | 'concept';

export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: Category;
  status: ProductStatus;
  icon: LucideIcon;
  hue: [string, string];
  tags: string[];
  releasedAt?: string;
  eta?: string;
  url?: string;
  highlights?: string[];
  features?: string[];
  architecture?: string;
  techStack?: string[];
}
```

*Note:* Upcoming products omit the optional `url` property as their public routes/domains are not yet live.

---

## 3. Product Registry Entries
Extracted directly from `src/lib/hayp-data.ts`:

### 3.1 Zypra (`id: "zypra"`)
- **Name:** Zypra
- **Tagline:** Intelligent Business ERP & Accounting
- **Category:** Accounting
- **Status:** `development`
- **ETA:** Late 2026
- **URL:** *omitted / undefined*
- **Icon:** `Calculator`
- **Gradient Hue:** `['#06b6d4', '#3b82f6']` (Cyan to Blue)
- **Tags:** `['ERP', 'Accounting', 'Automation']`
- **Description:** Next-generation enterprise resource planning with real-time analytics, automated bookkeeping, and intelligent financial forecasting.
- **Highlights:**
  - Double-entry automated ledger
  - Multi-currency settlement
  - Tax compliance engine
  - AI financial forecasting
- **Features (`string[]`):**
  - Automated bank feed reconciliation
  - Real-time cash flow predictive modeling
  - Multi-entity consolidation
  - Role-based access & compliance audit trail
- **Architecture (`string`):** Event-driven microservices architecture utilizing PostgreSQL for financial ledger integrity, Redis caching for fast dashboard aggregation, and asynchronous worker queues for statement processing.
- **Tech Stack:** `Next.js`, `Go`, `PostgreSQL`, `Redis`, `Kafka`

### 3.2 Cirqa (`id: "cirqa"`)
- **Name:** Cirqa
- **Tagline:** Self-Healing Process Automation
- **Category:** Automation
- **Status:** `planned`
- **ETA:** 2027
- **URL:** *omitted / undefined*
- **Icon:** `Workflow`
- **Gradient Hue:** `['#8b5cf6', '#d946ef']` (Purple to Fuchsia)
- **Tags:** `['Automation', 'Workflows', 'Pipelines']`
- **Description:** Workflow automation platform featuring self-healing pipelines, anomaly detection, and deep enterprise service mesh integration.
- **Highlights:**
  - Autonomous retry & self-healing
  - Visual workflow designer
  - Distributed trace analytics
  - Zero-code webhook transformations
- **Features (`string[]`):**
  - DAG-based pipeline orchestration
  - Real-time telemetry and health monitoring
  - Dynamic resource allocation for heavy jobs
  - Comprehensive audit logs and compliance controls
- **Architecture (`string`):** Distributed execution runtime leveraging Rust-based worker agents, gRPC inter-service communication, and Temporal for robust workflow state tracking and replayability.
- **Tech Stack:** `Rust`, `Temporal`, `gRPC`, `TimescaleDB`, `Docker`

### 3.3 Lumora (`id: "lumora"`)
- **Name:** Lumora
- **Tagline:** Decentralized Community Platform
- **Category:** Social
- **Status:** `planned`
- **ETA:** 2027
- **URL:** *omitted / undefined*
- **Icon:** `Share2`
- **Gradient Hue:** `['#ec4899', '#f43f5e']` (Pink to Rose)
- **Tags:** `['Social', 'Community', 'Web3']`
- **Description:** Next-generation social ecosystem built around sovereign identities, community governance, and high-fidelity interaction spaces.
- **Highlights:**
  - Sovereign identity management
  - Decentralized reputation scores
  - Token-gated interaction rooms
  - End-to-end encrypted messaging
- **Features (`string[]`):**
  - Zero-knowledge identity verification
  - Micro-tipping & creator monetization
  - Decentralized content storage via IPFS
  - Customizable space skins and interactive widgets
- **Architecture (`string`):** Hybrid decentralized architecture pairing ultra-low latency WebSockets for live peer interactions with IPFS and decentralized smart contracts for verifiable ownership and identity.
- **Tech Stack:** `React`, `WebSockets`, `IPFS`, `Solidity`, `libp2p`

---

## 4. Preview Modal Dialog Architecture (`src/components/hayp/hayp-hub.tsx`)
1. **Interactive Trigger:** Each product card renders a "Preview" button wired to `handlePreview(product)`.
2. **Modal Viewport & Layering:** Renders inside a fixed dialog with `fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm`.
3. **Dismissal Pathways:**
   - Backdrop click invokes `handleCloseModal`.
   - Top-right `X` close button invokes `handleCloseModal`.
   - Keyboard `Escape` event listener triggers `handleCloseModal`.
4. **Header & Badges:** Displays product name, tagline, category badge, and status badge with dynamic styling based on `product.status`.
5. **Icon Visualization:** Renders the assigned `LucideIcon` inside a styled container styled with `product.hue` gradient background.
6. **Content Sections:**
   - **Highlights:** Renders key highlight pills.
   - **Features List:** Maps `features` array into descriptive bullet items.
   - **Architecture Overview:** Displays the `architecture` technical design narrative inside a descriptive block.
   - **Technology Stack:** Maps `techStack` tags into badge chips.
7. **Action Controls:**
   - Live products with `product.url` render a "Visit product" external link.
   - Upcoming products (`product.status !== 'live'`) render a "Follow progress" button with a notification icon.

---

## 5. Verification & Acceptance
- Product schema and records strictly match `src/lib/hayp-data.ts`.
- Modal UX and interactivity verified in `src/components/hayp/hayp-hub.tsx`.
- Milestone 6-2 roadmap status updated to Completed & Code-Verified in `Road_Map.md`.
