import { beforeEach, describe, expect, it, mock } from "bun:test";
import { NextRequest } from "next/server";

const getServerSession = mock(async () => null);
const artistFindMany = mock(async () => []);
const artistCreate = mock(async () => ({ id: "artist-123", name: "Ada", bio: "", avatarUrl: "", tags: ["Editorial"], isActive: true }));
const artistFindUnique = mock(async () => null);
const artistUpdate = mock(async () => ({ id: "artist-123", name: "Ada", bio: "Updated", isActive: true }));
const artistDelete = mock(async () => ({ id: "artist-123" }));
const productFindMany = mock(async () => []);
const productCreate = mock(async () => ({ id: "prod-123", title: "Qyra", slug: "qyra", price: 2500, category: "Automation", artistId: "artist-123" }));
const productFindUnique = mock(async () => null);
const productUpdate = mock(async () => ({ id: "prod-123", title: "Qyra", slug: "qyra", category: "Automation", isFeatured: true }));
const productDelete = mock(async () => ({ id: "prod-123" }));

mock.module("next-auth", () => ({
  getServerSession,
}));

mock.module("@/lib/db", () => ({
  db: {
    artistProfile: {
      findMany: artistFindMany,
      create: artistCreate,
      findUnique: artistFindUnique,
      update: artistUpdate,
      delete: artistDelete,
    },
    product: {
      findMany: productFindMany,
      create: productCreate,
      findUnique: productFindUnique,
      update: productUpdate,
      delete: productDelete,
    },
  },
}));

const { GET: getArtists, POST: createArtist } = await import("../../src/app/api/admin/artists/route");
const { GET: getProducts, POST: createProduct } = await import("../../src/app/api/admin/products/route");

describe("Admin portfolio API routes", () => {
  beforeEach(() => {
    getServerSession.mockReset();
    getServerSession.mockResolvedValue(null);
    artistFindMany.mockReset();
    artistFindMany.mockResolvedValue([]);
    artistCreate.mockReset();
    artistCreate.mockResolvedValue({ id: "artist-123", name: "Ada", bio: "", avatarUrl: "", tags: ["Editorial"], isActive: true });
    productFindMany.mockReset();
    productFindMany.mockResolvedValue([]);
    productCreate.mockReset();
    productCreate.mockResolvedValue({ id: "prod-123", title: "Qyra", slug: "qyra", price: 2500, category: "Automation", artistId: "artist-123" });
  });

  it("rejects unauthenticated artist requests with 401", async () => {
    const res = await getArtists();
    expect(res.status).toBe(401);

    const req = new NextRequest("http://localhost:3000/api/admin/artists", {
      method: "POST",
      body: JSON.stringify({ name: "Ada" }),
      headers: { "Content-Type": "application/json" },
    });

    const createRes = await createArtist(req);
    expect(createRes.status).toBe(401);
  });

  it("rejects malformed artist payloads with 400", async () => {
    getServerSession.mockResolvedValueOnce({ user: { email: "paulescuadra25@gmail.com", role: "ADMIN" } });

    const req = new NextRequest("http://localhost:3000/api/admin/artists", {
      method: "POST",
      body: JSON.stringify({ name: "" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await createArtist(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Validation failed");
  });

  it("creates an artist profile with valid payload", async () => {
    getServerSession.mockResolvedValueOnce({ user: { email: "paulescuadra25@gmail.com", role: "ADMIN" } });
    artistCreate.mockResolvedValueOnce({
      id: "artist-123",
      name: "Ada",
      slug: "ada",
      bio: "Creative technologist",
      avatarUrl: "https://example.com/ada.png",
      tags: ["Editorial"],
      isActive: true,
      socialLinks: { instagram: "@ada" },
    });

    const req = new NextRequest("http://localhost:3000/api/admin/artists", {
      method: "POST",
      body: JSON.stringify({
        name: "Ada",
        bio: "Creative technologist",
        avatarUrl: "https://example.com/ada.png",
        socialLinks: { instagram: "@ada" },
        tags: ["Editorial"],
        isActive: true,
      }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await createArtist(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.artist.name).toBe("Ada");
  });

  it("rejects unauthenticated product requests with 401", async () => {
    const res = await getProducts();
    expect(res.status).toBe(401);

    const req = new NextRequest("http://localhost:3000/api/admin/products", {
      method: "POST",
      body: JSON.stringify({ title: "Qyra", slug: "qyra" }),
      headers: { "Content-Type": "application/json" },
    });

    const createRes = await createProduct(req);
    expect(createRes.status).toBe(401);
  });

  it("rejects malformed product payloads with 400", async () => {
    getServerSession.mockResolvedValueOnce({ user: { email: "paulescuadra25@gmail.com", role: "ADMIN" } });

    const req = new NextRequest("http://localhost:3000/api/admin/products", {
      method: "POST",
      body: JSON.stringify({ title: "", slug: "" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await createProduct(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Validation failed");
  });

  it("creates a product with valid payload", async () => {
    getServerSession.mockResolvedValueOnce({ user: { email: "paulescuadra25@gmail.com", role: "ADMIN" } });
    productCreate.mockResolvedValueOnce({
      id: "prod-123",
      title: "Qyra",
      slug: "qyra",
      description: "Automation suite",
      price: 2500,
      category: "Automation",
      currency: "USD",
      tags: ["Automation"],
      isFeatured: true,
      isArchived: false,
      artistId: "artist-123",
    });

    const req = new NextRequest("http://localhost:3000/api/admin/products", {
      method: "POST",
      body: JSON.stringify({
        title: "Qyra",
        slug: "qyra",
        description: "Automation suite",
        price: 2500,
        category: "Automation",
        currency: "USD",
        tags: ["Automation"],
        isFeatured: true,
        isArchived: false,
        artistId: "artist-123",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await createProduct(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.product.title).toBe("Qyra");
  });
});
