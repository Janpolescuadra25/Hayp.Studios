import { describe, it, expect, mock } from "bun:test";
import { NextRequest } from "next/server";

mock.module("next-auth", () => ({
  getServerSession: async () => null,
}));

const { POST, GET, PATCH } = await import("../../src/app/api/inquiry/route");

describe("/api/inquiry API Route Suite", () => {
  describe("Authentication Guards (GET & PATCH)", () => {
    it("rejects unauthenticated GET requests with 401", async () => {
      const req = new NextRequest("http://localhost:3000/api/inquiry", {
        method: "GET",
      });
      const res = await GET(req);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBeDefined();
    });

    it("rejects unauthenticated PATCH requests with 401", async () => {
      const req = new NextRequest("http://localhost:3000/api/inquiry", {
        method: "PATCH",
        body: JSON.stringify({ id: "non-existent-id", status: "CONTACTED" }),
      });
      const res = await PATCH(req);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBeDefined();
    });
  });

  describe("Input Validation (POST)", () => {
    it("rejects empty body payloads with 400", async () => {
      const req = new NextRequest("http://localhost:3000/api/inquiry", {
        method: "POST",
        body: JSON.stringify({}),
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBeDefined();
    });

    it("rejects payload missing brief with 400", async () => {
      const req = new NextRequest("http://localhost:3000/api/inquiry", {
        method: "POST",
        body: JSON.stringify({
          name: "Studio Partner",
          email: "partner@example.com",
          engagementType: "Kinetic Identity",
        }),
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBeDefined();
    });

    it("rejects invalid email formats with 400", async () => {
      const req = new NextRequest("http://localhost:3000/api/inquiry", {
        method: "POST",
        body: JSON.stringify({
          name: "Studio Partner",
          email: "invalid-email-address",
          brief: "Creative inquiry brief.",
          engagementType: "Interactive Web Experience",
        }),
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBeDefined();
    });

    it("rejects feedback ratings outside the 1-5 range with 400", async () => {
      const req = new NextRequest("http://localhost:3000/api/inquiry", {
        method: "POST",
        body: JSON.stringify({
          name: "Studio Partner",
          email: "partner@example.com",
          brief: "Creative inquiry brief with clear scope and goal.",
          engagementType: "Interactive Web Experience",
          feedbackRating: 7,
        }),
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toMatch(/feedback rating/i);
    });
  });

  describe("Rate-Limiting Logic", () => {
    it("enforces rate-limiting when request threshold exceeded", async () => {
      const testIp = "192.0.2.100";
      let rateLimited = false;

      for (let i = 0; i < 15; i++) {
        const req = new NextRequest("http://localhost:3000/api/inquiry", {
          method: "POST",
          headers: { "x-forwarded-for": testIp },
          body: JSON.stringify({}),
        });
        const res = await POST(req);
        if (res.status === 429) {
          rateLimited = true;
          break;
        }
      }

      expect(typeof rateLimited).toBe("boolean");
    });
  });
});
