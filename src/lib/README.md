# Shared Application Utilities (`src/lib`)

**Status:** ✅ ACTIVE & MAINTAINED  
**Last Updated:** 2026-10-14  

---

## 1. Modules Overview

| File | Purpose | Consumers |
|---|---|---|
| `db.ts` | Centralized Prisma Client instance with global singleton protection | All API routes (`inquiry`, `analytics`, `health`) |
| `logger.ts` | Structured JSON logger with log levels and secret/stack protection | Application core, API routes, operational scripts |
| `auth.ts` | NextAuth configuration and credentials provider | Authentication route (`/api/auth/[...nextauth]`) |

---

## 2. Centralized Logger (`src/lib/logger.ts`)

### Features
- **JSON-Structured Output:** Generates machine-parseable JSON log entries with ISO timestamps.
- **Log Levels:** `debug`, `info`, `warn`, `error`.
- **Security Protection:** Never logs sensitive credentials, passwords, or PII.
- **Stack Trace Masking:** Only includes error stack traces in non-production environments (`NODE_ENV !== "production"`).

### Usage Examples
```typescript
import { logger } from "@/lib/logger";

// Informational log with context
logger.info("Inquiry received", "InquiryHandler", { inquiryId: "inq_123" });

// Warning log
logger.warn("Rate limit approached", "RateLimiter", { ip: "1.2.3.4", count: 9 });

// Error log with error object
try {
  // operation
} catch (err) {
  logger.error("Database query failed", err, "HealthCheck");
}
```