import { beforeEach, describe, expect, it, mock } from "bun:test";
import { NextRequest } from "next/server";

const getServerSession = mock(async () => null);
const inquiryFindMany = mock(async () => []);
const inquiryGroupBy = mock(async () => []);
const inquiryFindUnique = mock(async () => null);
const inquiryUpdate = mock(async () => ({ id: "inq_123" }));
const inquiryDelete = mock(async () => ({ id: "inq_123" }));

mock.module("next-auth", () => ({
  getServerSession,
}));

mock.module("@/lib/db", () => ({
  db: {
    inquiry: {
      findMany: inquiryFindMany,
      groupBy: inquiryGroupBy,
      findUnique: inquiryFindUnique,
      update: inquiryUpdate,
      delete: inquiryDelete,
    },
  },
}));

const { GET } = await import("../../src/app/api/admin/inquiries/route");
const { GET: getById, PATCH } = await import("../../src/app/api/admin/inquiries/[id]/route");

describe("Admin Inquiries API Security Guards", () => {
  beforeEach(() => {
    getServerSession.mockReset();
    getServerSession.mockResolvedValue(null);
    inquiryFindMany.mockReset();
    inquiryFindMany.mockResolvedValue([]);
    inquiryGroupBy.mockReset();
    inquiryGroupBy.mockResolvedValue([]);
    inquiryFindUnique.mockReset();
    inquiryFindUnique.mockResolvedValue(null);
    inquiryUpdate.mockReset();
    inquiryUpdate.mockResolvedValue({ id: "inq_123" });
    inquiryDelete.mockReset();
    inquiryDelete.mockResolvedValue({ id: "inq_123" });
  });

  it("rejects unauthenticated GET requests to /api/admin/inquiries with 401", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/inquiries");
    const res = await GET(req);
    expect(res.status).toBe(401);
    expect((await res.json()).error).toBe("Unauthorized");
  });

  it("rejects unauthenticated PATCH requests to /api/admin/inquiries/[id] with 401", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/inquiries/inq_123", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CONTACTED" }),
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: "inq_123" }) });
    expect(res.status).toBe(401);
  });

  it("rejects unauthenticated GET requests to /api/admin/inquiries/[id] with 401", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/inquiries/inq_123");
    const res = await getById(req, { params: Promise.resolve({ id: "inq_123" }) });
    expect(res.status).toBe(401);
  });
});
