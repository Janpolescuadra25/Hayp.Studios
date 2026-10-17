import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { logger } from "@/lib/logger";

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;
const inquiryRequestCounts = new Map<string, { count: number; resetAt: number }>();
const VALID_INQUIRY_STATUSES = ["NEW", "IN_REVIEW", "CONTACTED", "ARCHIVED"] as const;

const VALID_ENGAGEMENT_TYPES = [
  "Kinetic Identity",
  "Interactive Web Experience",
  "Motion & 3D Spatial",
  "General Creative Partnership",
];

function requireAdminSession() {
  return getServerSession(authOptions).then((session) => {
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
  });
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = inquiryRequestCounts.get(ip);

  if (!entry || now > entry.resetAt) {
    inquiryRequestCounts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
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
  for (const [ip, entry] of inquiryRequestCounts.entries()) {
    if (now > entry.resetAt) {
      inquiryRequestCounts.delete(ip);
    }
  }
}, 5 * 60 * 1000).unref?.();

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function GET(request: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized: Studio owner session required" },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");
    const limit = Number.parseInt(searchParams.get("limit") ?? "100", 10);

    const where =
      statusFilter && VALID_INQUIRY_STATUSES.includes(statusFilter as (typeof VALID_INQUIRY_STATUSES)[number])
        ? { status: statusFilter }
        : {};

    const inquiries = await db.inquiry.findMany({
      where,
      take: Number.isFinite(limit) && limit > 0 ? Math.min(limit, 200) : 100,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        engagementType: true,
        brief: true,
        status: true,
        feedbackRating: true,
        feedbackMessage: true,
        telemetryConsent: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      { ok: true, inquiries },
      {
        status: 200,
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  } catch (error) {
    logger.error("Failed to load inquiries", error, "InquiryAPI");
    return NextResponse.json(
      { ok: false, error: "Internal server error loading inquiries" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized: Studio owner session required" },
      { status: 401 }
    );
  }

  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { ok: false, error: "Request body must be a JSON object" },
        { status: 400 }
      );
    }

    const payload = body as Record<string, unknown>;
    const id = typeof payload.id === "string" ? payload.id.trim() : "";
    const status = typeof payload.status === "string" ? payload.status.trim() : "";

    if (!id) {
      return NextResponse.json(
        { ok: false, error: "Field 'id' is required" },
        { status: 400 }
      );
    }

    if (!VALID_INQUIRY_STATUSES.includes(status as (typeof VALID_INQUIRY_STATUSES)[number])) {
      return NextResponse.json(
        { ok: false, error: "Field 'status' must be one of NEW, IN_REVIEW, CONTACTED, ARCHIVED" },
        { status: 400 }
      );
    }

    const inquiry = await db.inquiry.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        name: true,
        email: true,
        engagementType: true,
        brief: true,
        status: true,
        feedbackRating: true,
        feedbackMessage: true,
        telemetryConsent: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      { ok: true, inquiry },
      {
        status: 200,
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "P2025"
    ) {
      return NextResponse.json(
        { ok: false, error: "Inquiry not found" },
        { status: 404 }
      );
    }

    logger.error("Failed to update inquiry", error, "InquiryAPI");
    return NextResponse.json(
      { ok: false, error: "Internal server error updating inquiry" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const forwardedFor = req.headers.get("x-forwarded-for");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { error: "Too many inquiries. Please wait a moment and try again." },
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

    const name = typeof payload.name === "string" ? payload.name.trim() : "";
    if (!name || name.length < 2 || name.length > 120) {
      return NextResponse.json(
        { error: "Field 'name' must be a non-empty string between 2 and 120 characters" },
        { status: 400 }
      );
    }

    const email = typeof payload.email === "string" ? payload.email.trim() : "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Field 'email' must be a valid email address" },
        { status: 400 }
      );
    }

    const engagementType = typeof payload.engagementType === "string" ? payload.engagementType.trim() : "";
    if (!VALID_ENGAGEMENT_TYPES.includes(engagementType)) {
      return NextResponse.json(
        { error: "Field 'engagementType' is not supported" },
        { status: 400 }
      );
    }

    const brief = typeof payload.brief === "string" ? payload.brief.trim() : "";
    if (brief.length < 12 || brief.length > 8000) {
      return NextResponse.json(
        { error: "Field 'brief' must be between 12 and 8000 characters" },
        { status: 400 }
      );
    }

    let feedbackRating: number | null = null;
    if (payload.feedbackRating !== undefined && payload.feedbackRating !== null && payload.feedbackRating !== "") {
      const parsedRating = Number(payload.feedbackRating);
      if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
        return NextResponse.json(
          { error: "Feedback rating must be an integer between 1 and 5." },
          { status: 400 }
        );
      }
      feedbackRating = parsedRating;
    }

    let feedbackMessage: string | null = null;
    if (payload.feedbackMessage !== undefined && payload.feedbackMessage !== null && payload.feedbackMessage !== "") {
      if (typeof payload.feedbackMessage !== "string") {
        return NextResponse.json(
          { error: "Feedback message must be a string when provided." },
          { status: 400 }
        );
      }
      feedbackMessage = payload.feedbackMessage.trim();
      if (feedbackMessage.length > 1000) {
        return NextResponse.json(
          { error: "Feedback message exceeds the maximum length of 1000 characters." },
          { status: 400 }
        );
      }
    }

    if (
      payload.telemetryConsent !== undefined &&
      payload.telemetryConsent !== null &&
      typeof payload.telemetryConsent !== "boolean"
    ) {
      return NextResponse.json(
        { error: "Telemetry consent must be a boolean value." },
        { status: 400 }
      );
    }

    const telemetryConsent = Boolean(payload.telemetryConsent);

    const inquiry = await db.inquiry.create({
      data: {
        name,
        email,
        engagementType,
        brief,
        status: "NEW",
        feedbackRating,
        feedbackMessage,
        telemetryConsent,
      },
      select: {
        id: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        id: inquiry.id,
        createdAt: inquiry.createdAt,
      },
      {
        status: 201,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    logger.error("Failed to save inquiry", error, "InquiryAPI");
    return NextResponse.json(
      { error: "Internal server error saving inquiry" },
      { status: 500 }
    );
  }
}
