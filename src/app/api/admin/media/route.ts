import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

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
    const mediaTypeParam = searchParams.get("mediaType");
    const normalizedType = mediaTypeParam ? mediaTypeParam.toUpperCase() : "ALL";
    const whereClause = normalizedType !== "ALL" ? { mediaType: normalizedType.toLowerCase() } : {};

    const media = await db.media.findMany({
      where: whereClause,
      include: {
        product: {
          select: { id: true, title: true },
        },
      },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(media, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/media error:", error);
    return NextResponse.json({ error: "Failed to fetch media assets" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await request.json();
        id = typeof body?.id === "string" ? body.id : null;
      } catch {
        // no-op for empty body
      }
    }

    if (!id) {
      return NextResponse.json({ error: "Media asset ID is required" }, { status: 400 });
    }

    const record = await db.media.findUnique({ where: { id } });
    if (!record) {
      return NextResponse.json({ error: "Media asset not found" }, { status: 404 });
    }

    await db.media.delete({ where: { id } });

    return NextResponse.json({ success: true, id }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/admin/media error:", error);
    return NextResponse.json({ error: "Failed to delete media asset" }, { status: 500 });
  }
}
