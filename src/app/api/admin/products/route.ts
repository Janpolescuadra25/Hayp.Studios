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

const productSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required").optional(),
  description: z.string().optional().default(""),
  price: z.number().nonnegative("Price must be non-negative").optional().nullable().default(null),
  currency: z.string().min(1, "Currency is required").optional().default("USD"),
  category: z.string().min(1, "Category is required").optional().default(""),
  tags: z.array(z.string()).optional().default([]),
  isFeatured: z.boolean().optional().default(false),
  isArchived: z.boolean().optional().default(false),
  artistId: z.string().optional().nullable(),
});

export async function GET() {
  const admin = await requireAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 401 });
  }

  try {
    const products = await db.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        artist: true,
        media: true,
      },
    });

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error("Admin product fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await requireAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = productSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const normalized = {
      ...parsed.data,
      title: parsed.data.title.trim(),
      slug: parsed.data.slug?.trim() ? slugify(parsed.data.slug) : slugify(parsed.data.title),
      description: parsed.data.description?.trim() ?? "",
      category: parsed.data.category?.trim() ?? "",
      currency: parsed.data.currency?.trim() || "USD",
      tags: Array.isArray(parsed.data.tags) ? parsed.data.tags.map((tag) => String(tag).trim()).filter(Boolean) : [],
      isFeatured: Boolean(parsed.data.isFeatured),
      isArchived: Boolean(parsed.data.isArchived),
      artistId: parsed.data.artistId?.trim() || null,
    };

    const existingProduct = await db.product.findUnique({
      where: { slug: normalized.slug },
    });

    if (existingProduct) {
      return NextResponse.json({ error: "A product with this slug already exists" }, { status: 409 });
    }

    const product = await db.product.create({
      data: normalized,
      include: {
        artist: true,
        media: true,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("Admin product create error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
