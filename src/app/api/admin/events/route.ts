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

const eventSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  slug: z.string().trim().optional(),
  eventType: z.string().trim().default("workshop"),
  description: z.string().trim().optional().nullable(),
  startDate: z.string().datetime({ offset: true }).or(z.string().min(1)),
  endDate: z.string().datetime({ offset: true }).optional().nullable(),
  location: z.string().trim().optional().nullable(),
  registrationUrl: z.string().trim().url().optional().nullable().or(z.literal("")),
  isPublished: z.boolean().default(false),
});

export async function GET(request: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const events = await db.studioEvent.findMany({
      orderBy: { startDate: "desc" },
    });

    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/events error:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = eventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const payload = parsed.data;
    const generatedSlug = payload.slug?.trim() ? slugify(payload.slug) : slugify(payload.title);

    const existing = await db.studioEvent.findUnique({
      where: { slug: generatedSlug },
    });

    if (existing) {
      return NextResponse.json({ error: "An event with this slug already exists" }, { status: 409 });
    }

    const event = await db.studioEvent.create({
      data: {
        title: payload.title.trim(),
        slug: generatedSlug,
        eventType: payload.eventType.trim() || "workshop",
        description: payload.description?.trim() || null,
        startDate: new Date(payload.startDate),
        endDate: payload.endDate ? new Date(payload.endDate) : null,
        location: payload.location?.trim() || null,
        registrationUrl: payload.registrationUrl || null,
        isPublished: payload.isPublished,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/events error:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
