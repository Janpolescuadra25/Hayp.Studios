import { beforeEach, describe, expect, it, mock } from "bun:test";
import { renderToString } from "react-dom/server";

const useSession = mock(() => ({ data: null, status: "unauthenticated" }));

mock.module("next-auth/react", () => ({
  useSession,
  signIn: mock(async () => undefined),
  signOut: mock(async () => undefined),
}));

const { HaypAdminPortfolio } = await import("./hayp-admin-portfolio");

describe("HaypAdminPortfolio", () => {
  beforeEach(() => {
    useSession.mockReset();
    useSession.mockReturnValue({ data: null, status: "unauthenticated" });
  });

  it("renders access denial for unauthorized sessions", () => {
    const html = renderToString(<HaypAdminPortfolio />);
    expect(html).toContain("Restricted Access");
  });

  it("renders management tabs and project list", () => {
    useSession.mockReturnValue({
      data: {
        user: {
          email: "paulescuadra25@gmail.com",
          role: "ADMIN",
        },
      },
      status: "authenticated",
    });

    const html = renderToString(
      <HaypAdminPortfolio
        initialProducts={[
          {
            id: "prod-1",
            slug: "qyra",
            title: "Qyra",
            description: "Automation suite",
            price: 2500,
            category: "Automation",
            isFeatured: true,
            isArchived: false,
            displayOrder: 1,
            tags: ["Automation"],
            artistId: "artist-1",
            artist: { id: "artist-1", name: "Ada Lane", slug: "ada-lane", isActive: true },
            media: [{ id: "media-1", url: "/uploads/qyra.png", thumbnailUrl: "/uploads/qyra.png", mediaType: "image", caption: "Hero", displayOrder: 1, productId: "prod-1" }],
          },
        ]}
        initialArtists={[
          { id: "artist-1", name: "Ada Lane", slug: "ada-lane", isActive: true, tags: ["Automation"], avatarUrl: "https://example.com/avatar.png" },
        ]}
      />
    );

    expect(html).toContain("Portfolio Manager");
    expect(html).toContain("Qyra");
    expect(html).toContain("Artists");
  });
});
