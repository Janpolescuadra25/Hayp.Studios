import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const slugify = (input: string) =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "project";

async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return null;
  }

  const role = (session.user as { role?: string }).role;
  const email = session.user.email?.toLowerCase();
  const adminEmail = (process.env.ADMIN_EMAIL ?? "paulescuadra25@gmail.com").toLowerCase();

  if (role !== "ADMIN" && email !== adminEmail) {
    return null;
  }

  return session;
}

const updateProductSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  slug: z.string().min(1, "Slug is required").optional(),
  description: z.string().optional(),
  price: z.number().nonnegative("Price must be non-negative").optional().nullable(),
  currency: z.string().min(1, "Currency is required").optional(),
  category: z.string().min(1, "Category is required").optional(),
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  artistId: z.string().nullable().optional(),
});

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const product = await db.product.findUnique({
      where: { id },
      include: {
        artist: true,
        media: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product }, { status: 200 });
  } catch (error) {
    console.error("Admin product lookup error:", error);
    return NextResponse.json({ error: "Failed to load product" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = updateProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const nextSlug = parsed.data.slug?.trim() ? slugify(parsed.data.slug) : existing.slug;
    if (parsed.data.slug && nextSlug !== existing.slug) {
      const slugConflict = await db.product.findUnique({ where: { slug: nextSlug } });
      if (slugConflict) {
        return NextResponse.json({ error: "A product with this slug already exists" }, { status: 409 });
      }
    }

    if (parsed.data.artistId !== undefined && parsed.data.artistId !== null && parsed.data.artistId.trim() === "") {
      parsed.data.artistId = null;
    }

    const product = await db.product.update({
      where: { id },
      data: {
        ...parsed.data,
        ...(parsed.data.slug ? { slug: nextSlug } : {}),
        ...(parsed.data.title ? { title: parsed.data.title.trim() } : {}),
        ...(parsed.data.description !== undefined ? { description: parsed.data.description?.trim() ?? "" } : {}),
        ...(parsed.data.category !== undefined ? { category: parsed.data.category?.trim() ?? "" } : {}),
        ...(parsed.data.currency !== undefined ? { currency: parsed.data.currency?.trim() || "USD" } : {}),
        ...(parsed.data.tags ? { tags: parsed.data.tags.map((tag) => String(tag).trim()).filter(Boolean) } : {}),
      },
      include: {
        artist: true,
        media: true,
      },
    });

    return NextResponse.json({ product }, { status: 200 });
  } catch (error) {
    console.error("Admin product update error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await db.product.delete({ where: { id } });
    return NextResponse.json({ ok: true, deleted: true }, { status: 200 });
  } catch (error) {
    console.error("Admin product delete error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
