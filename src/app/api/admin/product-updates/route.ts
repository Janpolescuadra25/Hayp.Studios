import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const productUpdateSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  title: z.string().min(1, "Title is required").max(120),
  content: z.string().min(1, "Content is required"),
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

export async function GET(request: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    const updates = await db.productUpdate.findMany({
      where: productId ? { productId } : {},
      orderBy: { publishedAt: "desc" },
      include: {
        product: {
          select: { id: true, title: true, slug: true },
        },
      },
    });

    return NextResponse.json(updates, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/product-updates error:", error);
    return NextResponse.json({ error: "Failed to fetch product updates" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = productUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { productId, title, content, version, publishedAt } = parsed.data;

    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: "Parent product not found" }, { status: 404 });
    }

    const update = await db.productUpdate.create({
      data: {
        productId,
        title: title.trim(),
        content: content.trim(),
        version: version?.trim() || null,
        publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
      },
      include: {
        product: {
          select: { id: true, title: true, slug: true },
        },
      },
    });

    return NextResponse.json(update, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/product-updates error:", error);
    return NextResponse.json({ error: "Failed to create product update" }, { status: 500 });
  }
}
