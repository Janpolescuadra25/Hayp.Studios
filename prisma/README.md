# Database Schema & Migration Documentation (`prisma/`)

## 1. Overview
Documents the Prisma ORM configuration, schema definitions, and migration protocols for Hayp Studios.

## 2. Status
- **Status:** **DONE (Verified by Hydra on 2026-10-18)**
- **Primary Files:**
  - `prisma/schema.prisma`
  - `prisma/dev.db` (Local SQLite database)

## 3. Database Environments
- **Local Development:** SQLite (`file:./dev.db`).
- **Production Server:** PostgreSQL (`HaypStudios_db` on Hetzner VPS `2.28.120.85:5432`).

## 4. Key Models
1. **`Inquiry`:**
   - `id`, `name`, `email`, `engagementType`, `brief`, `status`, `createdAt`, `updatedAt`
   - **D10.3 Additions:** `feedbackRating` (Int?), `feedbackMessage` (String?), `telemetryConsent` (Boolean @default(false))
2. **`AnalyticsEvent`:**
   - `id`, `eventType`, `entityType`, `entityId`, `metadata`, `pathname`, `sessionId`, `userAgent`, `createdAt`
   - **D10.3 Additions:** `country` (String?), `region` (String?), `deviceType` (String?), `ipHash` (String?)

## 5. Migration & Safety Commands
```bash
# Push schema updates during development
bunx prisma db push

# Regenerate Prisma Client
bunx prisma generate

# Create SQLite backup manually before schema modification (optional safeguard)
# cp prisma/dev.db prisma/dev.db.bak
```

## 6. Source of Truth
This directory is the authoritative schema and migration source for local SQLite work and production PostgreSQL deployment compatibility. Schema changes should be additive and reviewed before shipping to production.