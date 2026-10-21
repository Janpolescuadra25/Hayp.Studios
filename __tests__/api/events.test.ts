import { beforeEach, describe, expect, it, mock } from "bun:test";
import { NextRequest } from "next/server";

const getServerSession = mock(async () => null);
const studioEventFindUnique = mock(async () => null);
const studioEventFindMany = mock(async () => []);
const studioEventCreate = mock(async () => ({
  id: "evt-123",
  title: "Studio Launch Demo",
  slug: "studio-launch-demo",
  eventType: "workshop",
  description: "Test event",
  startDate: new Date("2026-11-15T18:00:00.000Z"),
  endDate: null,
  location: "Main Studio",
  registrationUrl: "https://example.com/register",
  isPublished: true,
  createdAt: new Date("2026-11-01T00:00:00.000Z"),
  updatedAt: new Date("2026-11-01T00:00:00.000Z"),
}));

mock.module("next-auth", () => ({
  getServerSession,
}));

mock.module("@/lib/db", () => ({
  db: {
    studioEvent: {
      findUnique: studioEventFindUnique,
      findMany: studioEventFindMany,
      create: studioEventCreate,
    },
  },
}));

const { GET, POST } = await import("../../src/app/api/admin/events/route");

describe("Admin Events API Authentication & Contracts", () => {
  beforeEach(() => {
    getServerSession.mockReset();
    getServerSession.mockResolvedValue(null);
    studioEventFindUnique.mockReset();
    studioEventFindUnique.mockResolvedValue(null);
    studioEventFindMany.mockReset();
    studioEventFindMany.mockResolvedValue([]);
    studioEventCreate.mockReset();
    studioEventCreate.mockResolvedValue({
      id: "evt-123",
      title: "Studio Launch Demo",
      slug: "studio-launch-demo",
      eventType: "workshop",
      description: "Test event",
      startDate: new Date("2026-11-15T18:00:00.000Z"),
      endDate: null,
      location: "Main Studio",
      registrationUrl: "https://example.com/register",
      isPublished: true,
      createdAt: new Date("2026-11-01T00:00:00.000Z"),
      updatedAt: new Date("2026-11-01T00:00:00.000Z"),
    });
  });

  it("rejects unauthenticated GET requests with 401", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/events", { method: "GET" });
    const res = await GET(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("rejects malformed payloads with 400", async () => {
    getServerSession.mockResolvedValueOnce({
      user: { email: "paulescuadra25@gmail.com", role: "ADMIN" },
    });

    const req = new NextRequest("http://localhost:3000/api/admin/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "",
        startDate: "",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Validation error");
  });
});
