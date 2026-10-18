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

const artistSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required").optional(),
  bio: z.string().optional().default(""),
  avatarUrl: z.string().optional().default(""),
  bannerUrl: z.string().optional().default(""),
  socialLinks: z.record(z.string(), z.string()).optional().default({}),
  tags: z.array(z.string()).optional().default([]),
  isActive: z.boolean().optional().default(true),
});

export async function GET() {
  const admin = await requireAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 401 });
  }

  try {
    const artists = await db.artistProfile.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { products: true } },
      },
    });

    return NextResponse.json({ artists }, { status: 200 });
  } catch (error) {
    console.error("Admin artist fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch artists" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await requireAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = artistSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const normalized = {
      ...parsed.data,
      slug: parsed.data.slug?.trim() ? slugify(parsed.data.slug) : slugify(parsed.data.name),
      name: parsed.data.name.trim(),
      bio: parsed.data.bio?.trim() ?? "",
      avatarUrl: parsed.data.avatarUrl?.trim() ?? "",
      bannerUrl: parsed.data.bannerUrl?.trim() ?? "",
      socialLinks: parsed.data.socialLinks ?? {},
      tags: Array.isArray(parsed.data.tags) ? parsed.data.tags.map((tag) => String(tag).trim()).filter(Boolean) : [],
      isActive: parsed.data.isActive ?? true,
    };

    const existingArtist = await db.artistProfile.findUnique({
      where: { slug: normalized.slug },
    });

    if (existingArtist) {
      return NextResponse.json({ error: "Artist slug already exists" }, { status: 409 });
    }

    const artist = await db.artistProfile.create({
      data: normalized,
    });

    return NextResponse.json({ artist }, { status: 201 });
  } catch (error) {
    console.error("Admin artist create error:", error);
    return NextResponse.json({ error: "Failed to create artist profile" }, { status: 500 });
  }
}
