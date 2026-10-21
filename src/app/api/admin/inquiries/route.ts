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
    const statusFilter = searchParams.get("status");

    const whereClause = statusFilter && statusFilter !== "ALL" ? { status: statusFilter } : {};

    const [inquiries, counts] = await Promise.all([
      db.inquiry.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
      }),
      db.inquiry.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
    ]);

    const statusCounts: Record<string, number> = {
      ALL: 0,
      NEW: 0,
      PENDING: 0,
      CONTACTED: 0,
      IN_PROGRESS: 0,
      ARCHIVED: 0,
    };

    let total = 0;
    for (const group of counts) {
      const key = String(group.status ?? "");
      if (key in statusCounts) {
        statusCounts[key] = Number(group._count.status ?? 0);
        total += Number(group._count.status ?? 0);
      }
    }

    statusCounts.ALL = total;

    return NextResponse.json({ inquiries, statusCounts }, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/inquiries error:", error);
    return NextResponse.json({ error: "Failed to fetch inquiries" }, { status: 500 });
  }
}
