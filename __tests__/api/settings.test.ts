import { beforeEach, describe, expect, it, mock } from "bun:test";
import { NextRequest } from "next/server";

const getServerSession = mock(async () => null);
const siteSettingFindMany = mock(async () => []);
const siteSettingUpsert = mock(async () => ({
  id: "setting-123",
  key: "site_title",
  value: "Hayp Studios",
  description: "Public brand title",
  updatedAt: new Date("2026-11-01T00:00:00.000Z"),
}));

mock.module("next-auth", () => ({
  getServerSession,
}));

mock.module("@/lib/db", () => ({
  db: {
    siteSetting: {
      findMany: siteSettingFindMany,
      upsert: siteSettingUpsert,
    },
  },
}));

const { GET, POST } = await import("../../src/app/api/admin/settings/route");

describe("Admin Settings API Authentication & Contracts", () => {
  beforeEach(() => {
    getServerSession.mockReset();
    getServerSession.mockResolvedValue(null);
    siteSettingFindMany.mockReset();
    siteSettingFindMany.mockResolvedValue([]);
    siteSettingUpsert.mockReset();
    siteSettingUpsert.mockResolvedValue({
      id: "setting-123",
      key: "site_title",
      value: "Hayp Studios",
      description: "Public brand title",
      updatedAt: new Date("2026-11-01T00:00:00.000Z"),
    });
  });

  it("rejects unauthenticated GET requests with 401", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/settings", { method: "GET" });
    const res = await GET(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("rejects malformed payloads with 400", async () => {
    getServerSession.mockResolvedValueOnce({
      user: { email: "paulescuadra25@gmail.com", role: "ADMIN" },
    });

    const req = new NextRequest("http://localhost:3000/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        settings: [{ key: "", value: "" }],
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Validation error");
  });
});
