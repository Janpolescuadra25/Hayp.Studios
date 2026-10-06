import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized: Owner session required" },
        { status: 401 }
      );
    }

    const role = (session.user as { role?: string }).role;
    const email = session.user.email?.toLowerCase();
    const adminEmail = (process.env.ADMIN_EMAIL ?? "paulescuadra25@gmail.com").toLowerCase();

    if (role !== "ADMIN" && email !== adminEmail) {
      return NextResponse.json(
        { error: "Unauthorized: Owner session required" },
        { status: 401 }
      );
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [totalEvents, pageViews, cardClicks, externalNavs, sessions, eventsByType, recentEvents, weekEvents] = await Promise.all([
      db.analyticsEvent.count(),
      db.analyticsEvent.count({ where: { eventType: "page_view" } }),
      db.analyticsEvent.count({ where: { eventType: "card_click" } }),
      db.analyticsEvent.count({ where: { eventType: "external_nav" } }),
      db.analyticsEvent.groupBy({
        by: ["sessionId"],
        _count: { sessionId: true },
      }),
      db.analyticsEvent.groupBy({
        by: ["eventType"],
        _count: { _all: true },
      }),
      db.analyticsEvent.findMany({
        take: 25,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          eventType: true,
          entityType: true,
          entityId: true,
          pathname: true,
          sessionId: true,
          createdAt: true,
        },
      }),
      db.analyticsEvent.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { eventType: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    const dailyMap: Record<string, { date: string; views: number; clicks: number; navs: number }> = {};
    for (let offset = 6; offset >= 0; offset -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - offset);
      const key = date.toISOString().split("T")[0];
      dailyMap[key] = { date: key, views: 0, clicks: 0, navs: 0 };
    }

    for (const event of weekEvents) {
      const key = new Date(event.createdAt).toISOString().split("T")[0];
      if (!dailyMap[key]) continue;

      if (event.eventType === "page_view") {
        dailyMap[key].views += 1;
      } else if (event.eventType === "card_click") {
        dailyMap[key].clicks += 1;
      } else if (event.eventType === "external_nav") {
        dailyMap[key].navs += 1;
      }
    }

    return NextResponse.json(
      {
        ok: true,
        data: {
          totals: {
            totalEvents,
            pageViews,
            cardClicks,
            externalNavs,
            uniqueSessions: sessions.length,
          },
          eventsByType: eventsByType.map((entry) => ({
            type: entry.eventType,
            count: entry._count._all,
          })),
          dailyActivity: Object.values(dailyMap),
          recentEvents,
        },
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  } catch (error) {
    console.error("Failed to aggregate analytics metrics:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error fetching analytics metrics" },
      { status: 500 }
    );
  }
}