import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "event";

async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return null;
  }

  const role = (session.user as { role?: string }).role;
  const email = session.user.email?.trim().toLowerCase();
  const adminEmail = (process.env.ADMIN_EMAIL ?? process.env.OWNER_EMAIL)?.trim().toLowerCase();

  if (role === "ADMIN" || role === "OWNER" || (adminEmail && email === adminEmail)) {
    return session;
  }

  return null;
}

const updateEventSchema = z.object({
  title: z.string().trim().min(1, "Title is required").optional(),
  slug: z.string().trim().optional(),
  eventType: z.string().trim().optional(),
  description: z.string().trim().optional().nullable(),
  startDate: z.string().datetime({ offset: true }).or(z.string().min(1)).optional(),
  endDate: z.string().datetime({ offset: true }).optional().nullable(),
  location: z.string().trim().optional().nullable(),
  registrationUrl: z.string().trim().url().optional().nullable().or(z.literal("")),
  isPublished: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const event = await db.studioEvent.findUnique({ where: { id } });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(event, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/events/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = updateEventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const existing = await db.studioEvent.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const payload = parsed.data;
    const changes: Record<string, unknown> = {};

    if (payload.title !== undefined) changes.title = payload.title.trim();
    if (payload.slug !== undefined) {
      const nextSlug = slugify(payload.slug);
      const slugConflict = await db.studioEvent.findFirst({
        where: { slug: nextSlug, NOT: { id } },
      });
      if (slugConflict) {
        return NextResponse.json({ error: "Slug already in use by another event" }, { status: 409 });
      }
      changes.slug = nextSlug;
    }
    if (payload.eventType !== undefined) changes.eventType = payload.eventType.trim();
    if (payload.description !== undefined) changes.description = payload.description?.trim() || null;
    if (payload.startDate !== undefined) changes.startDate = new Date(payload.startDate);
    if (payload.endDate !== undefined) changes.endDate = payload.endDate ? new Date(payload.endDate) : null;
    if (payload.location !== undefined) changes.location = payload.location?.trim() || null;
    if (payload.registrationUrl !== undefined) changes.registrationUrl = payload.registrationUrl || null;
    if (payload.isPublished !== undefined) changes.isPublished = payload.isPublished;

    const updated = await db.studioEvent.update({
      where: { id },
      data: changes,
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/admin/events/[id] error:", error);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    await db.studioEvent.delete({ where: { id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/admin/events/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
