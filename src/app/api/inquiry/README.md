# /api/inquiry Route Implementation
## IMPLEMENTATION STATUS: DONE (Verified 2026-10-13)

### Overview
Database-backed client inquiry endpoint that handles public submission of creative project requests, with admin-only access to list and update inquiry statuses. Implements IP-based rate-limiting to prevent spam and strict authentication guards for protected operations.

### Architecture
- **HTTP Methods**: GET (admin-only), POST (public), PATCH (admin-only), OPTIONS (CORS preflight)
- **Rate Limiting**: 5 requests per minute per IP (in-memory tracking with 5-minute cleanup interval)
- **Authentication**: NextAuth server session validation with ADMIN role or owner email check

### Key Components (from `/api/inquiry/route.ts`)
1. **`requireAdminSession()`**: Core authentication guard that validates NextAuth session, checks for ADMIN role or matching admin email, returns null for unauthorized users.
2. **`isRateLimited(ip: string)`**: IP-based rate-limiting utility that tracks request counts and resets after 60-second window.
3. **Input Validation**: Strict validation of all POST/PATCH payload fields, including email format, valid engagement types, and valid inquiry statuses.

### Files Involved
| File Path | Purpose |
|-----------|---------|
| `src/app/api/inquiry/route.ts` | Core route implementation |
| `__tests__/api/inquiry.test.ts` | Automated test suite (6 passing tests) |
| `prisma/schema.prisma` | Inquiry model definition |
| `src/components/hayp/hayp-contact-form.tsx` | Frontend form that submits to this endpoint |
| `src/components/hayp/hayp-admin.tsx` | Frontend admin UI that consumes this endpoint |

### Usage Examples
#### Public Submission (POST)
```http
POST /api/inquiry
Content-Type: application/json

{
  "name": "Client Name",
  "email": "client@example.com",
  "engagementType": "Interactive Web Experience",
  "brief": "Project description..."
}
```

#### Admin List Inquiries (GET)
```http
GET /api/inquiry?limit=100&status=NEW
Authorization: Bearer <next-auth-jwt>
```

#### Admin Update Status (PATCH)
```http
PATCH /api/inquiry
Content-Type: application/json

{
  "id": "inquiry-uuid",
  "status": "CONTACTED"
}
```

### Test Execution
Run the automated test suite with:
```bash
bun test
```
Tests cover: unauthenticated 401 responses for GET/PATCH, input validation 400 responses for invalid payloads, and rate-limiting enforcement for excessive requests.
