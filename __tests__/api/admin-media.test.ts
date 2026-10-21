import { beforeEach, describe, expect, it, mock } from "bun:test";
import { NextRequest } from "next/server";

const getServerSession = mock(async () => null);
const mediaFindMany = mock(async () => []);
const mediaFindUnique = mock(async () => null);
const mediaDelete = mock(async () => ({ id: "media_123" }));

mock.module("next-auth", () => ({
  getServerSession,
}));

mock.module("@/lib/db", () => ({
  db: {
    media: {
      findMany: mediaFindMany,
      findUnique: mediaFindUnique,
      delete: mediaDelete,
    },
  },
}));

const { GET, DELETE } = await import("../../src/app/api/admin/media/route");

describe("Admin Media API Security Guards", () => {
  beforeEach(() => {
    getServerSession.mockReset();
    getServerSession.mockResolvedValue(null);
    mediaFindMany.mockReset();
    mediaFindMany.mockResolvedValue([]);
    mediaFindUnique.mockReset();
    mediaFindUnique.mockResolvedValue(null);
    mediaDelete.mockReset();
    mediaDelete.mockResolvedValue({ id: "media_123" });
  });

  it("rejects unauthenticated GET requests to /api/admin/media with 401", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/media");
    const res = await GET(req);
    expect(res.status).toBe(401);
    expect((await res.json()).error).toBe("Unauthorized");
  });

  it("rejects unauthenticated DELETE requests to /api/admin/media with 401", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/media?id=media_123", {
      method: "DELETE",
    });
    const res = await DELETE(req);
    expect(res.status).toBe(401);
  });
});
