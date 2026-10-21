import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";

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

const VALID_STATUSES = ["NEW", "PENDING", "CONTACTED", "IN_PROGRESS", "ARCHIVED"] as const;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const inquiry = await db.inquiry.findUnique({ where: { id } });

    if (!inquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    return NextResponse.json(inquiry, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/inquiries/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch inquiry" }, { status: 500 });
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
    const { status, internalNotes } = body as { status?: string; internalNotes?: string };

    const dataToUpdate: Record<string, unknown> = {};

    if (status !== undefined) {
      const nextStatus = String(status).toUpperCase();
      if (!VALID_STATUSES.includes(nextStatus as (typeof VALID_STATUSES)[number])) {
        return NextResponse.json(
          {
            error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
          },
          { status: 400 }
        );
      }
      dataToUpdate.status = nextStatus;
    }

    if (internalNotes !== undefined) {
      const note = typeof internalNotes === "string" ? internalNotes.trim() : "";
      dataToUpdate.feedbackMessage = note || null;
    }

    const updated = await db.inquiry.update({
      where: { id },
      data: dataToUpdate as any,
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/admin/inquiries/[id] error:", error);
    return NextResponse.json({ error: "Failed to update inquiry" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    await db.inquiry.delete({ where: { id } });

    return NextResponse.json({ success: true, id }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/admin/inquiries/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete inquiry" }, { status: 500 });
  }
}
