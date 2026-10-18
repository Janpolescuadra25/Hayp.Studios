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
    .replace(/^-+|-+$/g, "") || "artist";

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

const updateArtistSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  slug: z.string().min(1, "Slug is required").optional(),
  bio: z.string().optional(),
  avatarUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
  socialLinks: z.record(z.string(), z.string()).optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
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
    const artist = await db.artistProfile.findUnique({
      where: { id },
      include: {
        products: { include: { media: true } },
      },
    });

    if (!artist) {
      return NextResponse.json({ error: "Artist not found" }, { status: 404 });
    }

    return NextResponse.json({ artist }, { status: 200 });
  } catch (error) {
    console.error("Admin artist lookup error:", error);
    return NextResponse.json({ error: "Failed to load artist profile" }, { status: 500 });
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
    const parsed = updateArtistSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const existing = await db.artistProfile.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Artist not found" }, { status: 404 });
    }

    const nextSlug = parsed.data.slug?.trim() ? slugify(parsed.data.slug) : existing.slug;
    if (parsed.data.slug && nextSlug !== existing.slug) {
      const slugConflict = await db.artistProfile.findUnique({ where: { slug: nextSlug } });
      if (slugConflict) {
        return NextResponse.json({ error: "Artist slug already exists" }, { status: 409 });
      }
    }

    const artist = await db.artistProfile.update({
      where: { id },
      data: {
        ...parsed.data,
        ...(parsed.data.slug ? { slug: nextSlug } : {}),
        ...(parsed.data.name ? { name: parsed.data.name.trim() } : {}),
        ...(parsed.data.bio !== undefined ? { bio: parsed.data.bio?.trim() ?? "" } : {}),
        ...(parsed.data.avatarUrl !== undefined ? { avatarUrl: parsed.data.avatarUrl?.trim() ?? "" } : {}),
        ...(parsed.data.bannerUrl !== undefined ? { bannerUrl: parsed.data.bannerUrl?.trim() ?? "" } : {}),
        ...(parsed.data.tags ? { tags: parsed.data.tags.map((tag) => String(tag).trim()).filter(Boolean) } : {}),
      },
    });

    return NextResponse.json({ artist }, { status: 200 });
  } catch (error) {
    console.error("Admin artist update error:", error);
    return NextResponse.json({ error: "Failed to update artist profile" }, { status: 500 });
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
    const existing = await db.artistProfile.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Artist not found" }, { status: 404 });
    }

    await db.artistProfile.delete({ where: { id } });
    return NextResponse.json({ ok: true, deleted: true }, { status: 200 });
  } catch (error) {
    console.error("Admin artist delete error:", error);
    return NextResponse.json({ error: "Failed to delete artist profile" }, { status: 500 });
  }
}
