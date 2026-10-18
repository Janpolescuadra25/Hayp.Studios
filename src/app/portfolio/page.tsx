import type { Metadata } from "next";
import { db } from "@/lib/db";
import { HaypPortfolioGrid } from "@/components/hayp/hayp-portfolio-grid";
import type { ArtistSnippet, ProjectItem } from "@/components/hayp/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Portfolio | Hayp.Studios",
  description:
    "Explore curated artwork, creative productions, and showcases from Hayp.Studios and featured resident artists.",
};

export default async function PortfolioPage() {
  let products: ProjectItem[] = [];
  let artists: ArtistSnippet[] = [];

  try {
    const rawProducts = await db.product.findMany({
      orderBy: [
        { isFeatured: "desc" },
        { displayOrder: "asc" },
        { createdAt: "desc" },
      ],
      include: {
        artist: true,
        media: {
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    const rawArtists = await db.artistProfile.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
    });

    products = rawProducts.map((product) => ({
      id: product.id,
      slug: product.slug,
      title: product.title,
      description: product.description,
      price: product.price,
      tags: Array.isArray(product.tags) ? product.tags : product.tags ? [String(product.tags)] : [],
      category: product.title,
      isFeatured: product.isFeatured,
      displayOrder: product.displayOrder,
      artistId: product.artistId,
      artist: product.artist
        ? {
            id: product.artist.id,
            name: product.artist.name,
            slug: product.artist.slug,
            bio: product.artist.bio,
            avatarUrl: product.artist.avatarUrl,
            bannerUrl: product.artist.bannerUrl,
            socialLinks: typeof product.artist.socialLinks === "object" && product.artist.socialLinks
              ? (product.artist.socialLinks as Record<string, string>)
              : null,
          }
        : null,
      media: (product.media ?? []).map((media) => ({
        id: media.id,
        url: media.url,
        thumbnailUrl: media.thumbnailUrl,
        mediaType: media.mediaType,
        caption: media.caption,
        displayOrder: media.displayOrder,
      })),
    }));

    artists = rawArtists.map((artist) => ({
      id: artist.id,
      name: artist.name,
      slug: artist.slug,
      bio: artist.bio,
      avatarUrl: artist.avatarUrl,
      bannerUrl: artist.bannerUrl,
      socialLinks: typeof artist.socialLinks === "object" && artist.socialLinks
        ? (artist.socialLinks as Record<string, string>)
        : null,
    }));
  } catch (error) {
    console.error("Failed to fetch portfolio data from database:", error);
  }

  return (
    <main className="min-h-screen bg-background px-4 py-16 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-12">
        <div className="space-y-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            Portfolio
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Studio Portfolio
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Explore curated creations, original works, and collaborative productions
            crafted by Hayp.Studios and featured resident artists.
          </p>
        </div>

        <HaypPortfolioGrid initialProducts={products} artists={artists} />
      </div>
    </main>
  );
}
