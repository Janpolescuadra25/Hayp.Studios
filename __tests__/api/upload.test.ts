import { beforeEach, describe, expect, it, mock } from "bun:test";
import { NextRequest } from "next/server";

const getServerSession = mock(async () => null);
const productFindUnique = mock(async () => null);
const mediaCreate = mock(async () => ({
  id: "media-test",
  url: "/uploads/mock.png",
  thumbnailUrl: null,
  mediaType: "image",
  caption: null,
  displayOrder: 0,
  productId: null,
}));

mock.module("next-auth", () => ({
  getServerSession,
}));

mock.module("@/lib/db", () => ({
  db: {
    product: {
      findUnique: productFindUnique,
    },
    media: {
      create: mediaCreate,
    },
  },
}));

mock.module("fs/promises", () => ({
  mkdir: mock(async () => undefined),
  writeFile: mock(async () => undefined),
}));

const { POST } = await import("../../src/app/api/upload/route");

describe("Deliverable 11.2 - /api/upload Route Suite", () => {
  beforeEach(() => {
    getServerSession.mockReset();
    getServerSession.mockResolvedValue(null);
    productFindUnique.mockReset();
    productFindUnique.mockResolvedValue(null);
    mediaCreate.mockReset();
    mediaCreate.mockResolvedValue({
      id: "media-test",
      url: "/uploads/mock.png",
      thumbnailUrl: null,
      mediaType: "image",
      caption: null,
      displayOrder: 0,
      productId: null,
    });
  });

  it("rejects unauthenticated requests with 401", async () => {
    getServerSession.mockResolvedValueOnce(null);

    const req = new NextRequest("http://localhost:3000/api/upload", {
      method: "POST",
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.ok).toBe(false);
    expect(data.error).toContain("Unauthorized");
  });

  it("rejects non-admin authenticated users with 401", async () => {
    getServerSession.mockResolvedValueOnce({
      user: { email: "regular@user.com", role: "USER" },
    });

    const req = new NextRequest("http://localhost:3000/api/upload", {
      method: "POST",
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("rejects request when file is missing with 400", async () => {
    getServerSession.mockResolvedValueOnce({
      user: { email: "paulescuadra25@gmail.com", role: "ADMIN" },
    });

    const formData = new FormData();
    const req = new NextRequest("http://localhost:3000/api/upload", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Missing required file");
  });

  it("rejects unsupported MIME types with 400", async () => {
    getServerSession.mockResolvedValueOnce({
      user: { email: "paulescuadra25@gmail.com", role: "ADMIN" },
    });

    const formData = new FormData();
    const textFile = new File(["test"], "test.txt", { type: "text/plain" });
    formData.append("file", textFile);

    const req = new NextRequest("http://localhost:3000/api/upload", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Unsupported file type");
  });

  it("rejects files exceeding 10MB limit with 400", async () => {
    getServerSession.mockResolvedValueOnce({
      user: { email: "paulescuadra25@gmail.com", role: "ADMIN" },
    });

    const formData = new FormData();
    const oversizedFile = new File([new Uint8Array(11 * 1024 * 1024)], "large.png", { type: "image/png" });
    formData.append("file", oversizedFile);

    const req = new NextRequest("http://localhost:3000/api/upload", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("exceeds 10MB limit");
  });

  it("rejects upload with non-existent productId with 400", async () => {
    getServerSession.mockResolvedValueOnce({
      user: { email: "paulescuadra25@gmail.com", role: "ADMIN" },
    });
    productFindUnique.mockResolvedValueOnce(null);

    const formData = new FormData();
    const imageFile = new File(["binary"], "image.png", { type: "image/png" });
    formData.append("file", imageFile);
    formData.append("productId", "non-existent-prod-id");

    const req = new NextRequest("http://localhost:3000/api/upload", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Associated product not found");
  });

  it("successfully uploads file and creates Media record without productId (201)", async () => {
    getServerSession.mockResolvedValueOnce({
      user: { email: "paulescuadra25@gmail.com", role: "ADMIN" },
    });
    mediaCreate.mockResolvedValueOnce({
      id: "media-123",
      url: "/uploads/created.png",
      thumbnailUrl: null,
      mediaType: "image",
      caption: null,
      displayOrder: 0,
      productId: null,
    });

    const formData = new FormData();
    const imageFile = new File(["valid image content"], "art.png", { type: "image/png" });
    formData.append("file", imageFile);

    const req = new NextRequest("http://localhost:3000/api/upload", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.media.id).toBe("media-123");
    expect(data.media.mediaType).toBe("image");
  });

  it("successfully uploads file with valid productId and optional metadata (201)", async () => {
    getServerSession.mockResolvedValueOnce({
      user: { email: "paulescuadra25@gmail.com", role: "ADMIN" },
    });
    productFindUnique.mockResolvedValueOnce({ id: "prod-abc" });
    mediaCreate.mockResolvedValueOnce({
      id: "media-456",
      url: "/uploads/hero.webp",
      thumbnailUrl: null,
      mediaType: "image",
      caption: "Featured painting cover",
      displayOrder: 2,
      productId: "prod-abc",
    });

    const formData = new FormData();
    const imageFile = new File(["webp content"], "hero.webp", { type: "image/webp" });
    formData.append("file", imageFile);
    formData.append("productId", "prod-abc");
    formData.append("caption", "Featured painting cover");
    formData.append("displayOrder", "2");

    const req = new NextRequest("http://localhost:3000/api/upload", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.media.productId).toBe("prod-abc");
    expect(data.media.caption).toBe("Featured painting cover");
    expect(data.media.displayOrder).toBe(2);
  });
});
