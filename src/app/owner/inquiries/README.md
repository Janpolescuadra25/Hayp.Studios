# STATUS: DONE - Fully Implemented & Verified

# Owner Inquiries Management Console

The Inquiries console gives the studio owner a centralized workflow for managing inbound client briefs and lifecycle status tracking.

## Scope

- Review all inbound inquiries and check status filters
- Search by lead name, email, and project brief
- Inspect full project details and contact information
- Move inquiries through the status pipeline
- Save private operational notes and remove stale leads

## Route Coverage

- `GET /api/admin/inquiries` — list inquiries with aggregate status counts
- `GET /api/admin/inquiries/[id]` — fetch a single inquiry record
- `PATCH /api/admin/inquiries/[id]` — update status and notes
- `DELETE /api/admin/inquiries/[id]` — remove inquiry records

## Data Model

The root Prisma schema includes the `Inquiry` model and indexes for status and engagement sorting.

- `Inquiry.status` drives lifecycle filtering and triage
- `Inquiry.engagementType` classifies the client request type
- `Inquiry.brief` contains the full client submission text

## Security

All inquiry endpoints require the verified admin guard:

- `ADMIN` or `OWNER` session role
- or matching environment email override

## Verification

- Test suite includes admin inquiries contract checks and passes with `bun test`
- Production build passes with `bun run build`
- Owner console route is mounted at `/owner/inquiries`
