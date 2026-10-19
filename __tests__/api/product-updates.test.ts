import { beforeEach, describe, expect, it, mock } from "bun:test";
import { NextRequest } from "next/server";

const getServerSession = mock(async () => null);
const productFindUnique = mock(async () => null);
const productUpdateFindMany = mock(async () => []);
const productUpdateCreate = mock(async () => ({
  id: "pu-123",
  productId: "prod-123",
  title: "v1.2 release",
  content: "Updated release notes for the launch edition.",
  version: "v1.2",
  publishedAt: new Date("2026-10-01T00:00:00.000Z"),
  createdAt: new Date("2026-10-01T00:00:00.000Z"),
  updatedAt: new Date("2026-10-01T00:00:00.000Z"),
  product: { id: "prod-123", title: "Qyra", slug: "qyra" },
}));

mock.module("next-auth", () => ({
  getServerSession,
}));

mock.module("@/lib/db", () => ({
  db: {
    product: {
      findUnique: productFindUnique,
    },
    productUpdate: {
      findMany: productUpdateFindMany,
      create: productUpdateCreate,
    },
  },
}));

const { GET, POST } = await import("../../src/app/api/admin/product-updates/route");

describe("Deliverable 12.3 - /api/admin/product-updates Route Suite", () => {
  beforeEach(() => {
    getServerSession.mockReset();
    getServerSession.mockResolvedValue(null);
    productFindUnique.mockReset();
    productFindUnique.mockResolvedValue(null);
    productUpdateFindMany.mockReset();
    productUpdateFindMany.mockResolvedValue([]);
    productUpdateCreate.mockReset();
    productUpdateCreate.mockResolvedValue({
      id: "pu-123",
      productId: "prod-123",
      title: "v1.2 release",
      content: "Updated release notes for the launch edition.",
      version: "v1.2",
      publishedAt: new Date("2026-10-01T00:00:00.000Z"),
      createdAt: new Date("2026-10-01T00:00:00.000Z"),
      updatedAt: new Date("2026-10-01T00:00:00.000Z"),
      product: { id: "prod-123", title: "Qyra", slug: "qyra" },
    });
  });

  it("rejects unauthenticated GET requests with 401", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/product-updates", { method: "GET" });
    const res = await GET(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("rejects malformed payloads with 400", async () => {
    getServerSession.mockResolvedValueOnce({
      user: { email: "paulescuadra25@gmail.com", role: "ADMIN" },
    });

    const req = new NextRequest("http://localhost:3000/api/admin/product-updates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: "",
        title: "",
        content: "",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Validation failed");
  });

  it("rejects requests for non-existent parent products with 404", async () => {
    getServerSession.mockResolvedValueOnce({
      user: { email: "paulescuadra25@gmail.com", role: "ADMIN" },
    });
    productFindUnique.mockResolvedValueOnce(null);

    const req = new NextRequest("http://localhost:3000/api/admin/product-updates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: "missing-prod",
        title: "v1.2 release",
        content: "Updated release notes for the launch edition.",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toBe("Parent product not found");
  });
});
