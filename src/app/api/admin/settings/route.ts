import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

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

const settingsSchema = z.object({
  settings: z.array(
    z.object({
      key: z.string().trim().min(1, "Key is required"),
      value: z.string().trim().min(1, "Value is required"),
      description: z.string().trim().optional().nullable(),
    })
  ),
});

export async function GET(request: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const settings = await db.siteSetting.findMany({
      orderBy: { key: "asc" },
    });

    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/settings error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = settingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const updated = await Promise.all(
      parsed.data.settings.map((setting) =>
        db.siteSetting.upsert({
          where: { key: setting.key },
          update: {
            value: setting.value,
            description: setting.description ?? null,
          },
          create: {
            key: setting.key,
            value: setting.value,
            description: setting.description ?? null,
          },
        })
      )
    );

    return NextResponse.json({ success: true, count: updated.length }, { status: 200 });
  } catch (error) {
    console.error("POST /api/admin/settings error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
