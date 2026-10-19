import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const updatePatchSchema = z.object({
  title: z.string().min(1, "Title is required").max(120).optional(),
  content: z.string().min(1, "Content is required").optional(),
  version: z.string().max(30).optional().nullable(),
  publishedAt: z.string().datetime().optional().nullable(),
});

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

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const update = await db.productUpdate.findUnique({
      where: { id },
      include: {
        product: { select: { id: true, title: true, slug: true } },
      },
    });

    if (!update) {
      return NextResponse.json({ error: "Product update not found" }, { status: 404 });
    }

    return NextResponse.json(update, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/product-updates/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch product update" }, { status: 500 });
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
    const parsed = updatePatchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const existing = await db.productUpdate.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Product update not found" }, { status: 404 });
    }

    const data: {
      title?: string;
      content?: string;
      version?: string | null;
      publishedAt?: Date;
    } = {};

    if (parsed.data.title !== undefined) {
      data.title = parsed.data.title.trim();
    }
    if (parsed.data.content !== undefined) {
      data.content = parsed.data.content.trim();
    }
    if (parsed.data.version !== undefined) {
      data.version = parsed.data.version?.trim() ? parsed.data.version.trim() : null;
    }
    if (parsed.data.publishedAt !== undefined) {
      data.publishedAt = parsed.data.publishedAt ? new Date(parsed.data.publishedAt) : new Date();
    }

    const updated = await db.productUpdate.update({
      where: { id },
      data,
      include: {
        product: {
          select: { id: true, title: true, slug: true },
        },
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/admin/product-updates/[id] error:", error);
    return NextResponse.json({ error: "Failed to update product update" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const existing = await db.productUpdate.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Product update not found" }, { status: 404 });
    }

    await db.productUpdate.delete({ where: { id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/admin/product-updates/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete product update" }, { status: 500 });
  }
}