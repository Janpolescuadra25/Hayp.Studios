# Deliverable 11.2: Secure Media Upload Pipeline

## Overview
This API route implements the authenticated media upload pipeline for Hayp.Studios Phase 11.

- **Status**: **DONE: Deliverable 11.2 Secure Media Upload Pipeline**
- **Endpoint**: `POST /api/upload`
- **CORS**: `OPTIONS /api/upload`

## Authentication & Authorization
- Guarded by NextAuth studio owner session check.
- Requires either `session.user.role === "ADMIN"` or `session.user.email === ADMIN_EMAIL`.
- Unauthenticated or unauthorized callers receive HTTP `401 Unauthorized`.

## Upload Specifications
- **Format**: `multipart/form-data`
- **Fields**:
  - `file` (File, required): the media asset binary.
  - `productId` (String, optional): associated product identifier in Prisma.
  - `caption` (String, optional): caption or descriptive metadata.
  - `displayOrder` (Integer, optional, default 0): sorting priority value.
- **Allowed MIME Types**:
  - `image/jpeg` (`.jpg`)
  - `image/png` (`.png`)
  - `image/webp` (`.webp`)
  - `image/avif` (`.avif`)
  - `video/mp4` (`.mp4`)
- **Max File Size**: 10MB (10,485,760 bytes). Requests over this limit receive `400 Bad Request`.

## Storage & Database Integration
- **Storage Path**: Assets are saved to `public/uploads/<timestamp>-<uuid-8><extension>`.
- **Public URL**: `/uploads/<filename>`.
- **Database Persistence**: Saved as a Prisma `Media` record via `db.media.create`.
- **Relation Handling**: When `productId` is provided, the route validates the related product exists before saving.

## Collision Prevention and Safety
- Filenames are generated using `Date.now()` and a short `crypto.randomUUID()` suffix so uploads never overwrite one another.
- All writes occur inside `public/uploads/` to match the Next.js static asset routing model.
- Rejects unsupported MIME types, oversized files, and missing file payloads before writing any file data to disk.
