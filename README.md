# Hayp Studios — Ready-Made Software

Official website and digital hub for **Hayp Studios** (`haypstudios.com`), crafting purposeful, ready-made software and financial automation products.

---

## 🌟 Overview

Hayp Studios builds focused, production-grade applications with zero fluff. Every product is engineered to solve a specific workflow friction point—from transaction reconciliation to automated ledger synchronization.

### Active & Upcoming Products
- **Qyra** (`https://qyra.space`): Financial automation Chrome extension and pipeline that auto-posts POS and transaction data straight into QuickBooks Online. (Live)
- **Zypra**: The Hayp automation engine retooled for Xero auto-posting and sync pipelines. (Development — ETA Late 2026)
- **Cirqa**: Circle-first social feeds, communities, and messaging. (Planned — ETA 2027)
- **Lumora**: High-converting digital storefronts built to sell. (Planned — ETA 2027)

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Components)
- **Runtime & Package Manager**: [Bun](https://bun.sh/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/) (Radix UI Primitives)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Database / ORM**: [Prisma ORM](https://www.prisma.io/)

---

## 🚀 Getting Started

### Prerequisites
- [Bun](https://bun.sh/) installed locally (v1.1+)

### Installation
```bash
# Install dependencies
bun install

# Start development server
bun dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### Production Build
```bash
# Generate production bundle
bun run build

# Start production standalone server
bun run start
```

---

## 🌐 Deployment & Domain

- **Live Domain**: `https://haypstudios.com`
- **Infrastructure**: Hetzner Cloud VPS (`vortex` at `2.28.120.85`), PM2 process `hayp-frontend` on port 3002, reverse-proxied via Nginx with Let's Encrypt SSL.
- **Repository**: [https://github.com/Janpolescuadra25/Hayp.Studios](https://github.com/Janpolescuadra25/Hayp.Studios)
