import crypto from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "video/mp4": ".mp4",
};

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

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    if (!session) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized: Studio owner session required" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { ok: false, error: "Missing required file" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { ok: false, error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    const extension = ALLOWED_MIME_TYPES[file.type];
    if (!extension) {
      return NextResponse.json(
        { ok: false, error: "Unsupported file type. Allowed: JPEG, PNG, WebP, AVIF, MP4" },
        { status: 400 }
      );
    }

    const rawProductId = formData.get("productId");
    const productId = typeof rawProductId === "string" && rawProductId.trim() ? rawProductId.trim() : null;

    if (productId) {
      const existingProduct = await db.product.findUnique({
        where: { id: productId },
      });

      if (!existingProduct) {
        return NextResponse.json(
          { ok: false, error: "Associated product not found" },
          { status: 400 }
        );
      }
    }

    const rawCaption = formData.get("caption");
    const caption = typeof rawCaption === "string" && rawCaption.trim() ? rawCaption.trim() : null;

    const rawDisplayOrder = formData.get("displayOrder");
    const displayOrder = rawDisplayOrder !== null && rawDisplayOrder !== undefined
      ? Number.parseInt(String(rawDisplayOrder), 10) || 0
      : 0;

    const uniqueSuffix = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
    const filename = `${uniqueSuffix}${extension}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const media = await db.media.create({
      data: {
        url: `/uploads/${filename}`,
        thumbnailUrl: null,
        mediaType: file.type.startsWith("video/") ? "video" : "image",
        caption,
        displayOrder,
        productId,
      },
    });

    return NextResponse.json({ ok: true, media }, { status: 201 });
  } catch (error) {
    console.error("Upload API Error:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error during media upload" },
      { status: 500 }
    );
  }
}
