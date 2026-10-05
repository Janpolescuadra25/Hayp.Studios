import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 100;
const ipRequestCounts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipRequestCounts.get(ip);

  if (!entry || now > entry.resetAt) {
    ipRequestCounts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  entry.count += 1;
  return false;
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of ipRequestCounts.entries()) {
    if (now > entry.resetAt) {
      ipRequestCounts.delete(ip);
    }
  }
}, 5 * 60 * 1000).unref?.();

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const forwardedFor = req.headers.get("x-forwarded-for");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Request body must be a JSON object" },
        { status: 400 }
      );
    }

    const payload = body as Record<string, unknown>;

    const eventType = payload.eventType;
    if (typeof eventType !== "string" || !eventType.trim()) {
      return NextResponse.json(
        { error: "Field 'eventType' is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    if (eventType.length > 64) {
      return NextResponse.json(
        { error: "Field 'eventType' exceeds maximum length of 64 characters" },
        { status: 400 }
      );
    }

    const entityType = typeof payload.entityType === "string" ? payload.entityType.trim().slice(0, 64) : null;
    const entityId = typeof payload.entityId === "string" ? payload.entityId.trim().slice(0, 128) : null;
    const pathname = typeof payload.pathname === "string" ? payload.pathname.trim().slice(0, 256) : null;
    const sessionId = typeof payload.sessionId === "string" ? payload.sessionId.trim().slice(0, 128) : null;

    let metadata: string | null = null;
    if (payload.metadata !== undefined && payload.metadata !== null) {
      if (typeof payload.metadata === "object") {
        try {
          metadata = JSON.stringify(payload.metadata).slice(0, 4096);
        } catch {
          metadata = null;
        }
      } else if (typeof payload.metadata === "string") {
        metadata = payload.metadata.slice(0, 4096);
      }
    }

    const userAgent = (req.headers.get("user-agent") || "").slice(0, 512) || null;

    const createdEvent = await db.analyticsEvent.create({
      data: {
        eventType: eventType.trim(),
        entityType,
        entityId,
        metadata,
        pathname,
        sessionId,
        userAgent,
      },
      select: {
        id: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        id: createdEvent.id,
        createdAt: createdEvent.createdAt,
      },
      {
        status: 201,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Failed to record analytics event:", error);
    return NextResponse.json(
      { error: "Internal server error recording analytics event" },
      { status: 500 }
    );
  }
}
