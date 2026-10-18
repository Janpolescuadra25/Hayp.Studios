import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Resident Artists | Hayp.Studios",
  description:
    "Discover the creative visionaries collaborating under the Hayp.Studios umbrella.",
};

export default async function ArtistsPage() {
  let artists: Array<{
    id: string;
    name: string;
    slug: string;
    bio?: string | null;
    avatarUrl?: string | null;
    bannerUrl?: string | null;
    socialLinks?: Record<string, string> | null;
    products: Array<{ id: string; title: string; media: Array<{ id: string; url: string; thumbnailUrl?: string | null; mediaType: string; displayOrder: number }> }>;
  }> = [];

  try {
    artists = await db.artistProfile.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
      include: {
        products: {
          include: {
            media: {
              orderBy: { displayOrder: "asc" },
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch artists data from database:", error);
  }

  return (
    <main className="min-h-screen bg-background px-4 py-16 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-12">
        <div className="space-y-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            Residents
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Resident Artists & Creators
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Discover the creative visionaries collaborating under the Hayp.Studios umbrella.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {artists.map((artist) => {
            const firstWork = artist.products[0]?.media[0];

            return (
              <article
                key={artist.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
              >
                <div className="relative h-52 overflow-hidden bg-muted">
                  {firstWork ? (
                    <img
                      src={firstWork.thumbnailUrl || firstWork.url}
                      alt={artist.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-cyan-500/10 text-sm font-medium text-muted-foreground">
                      Artist profile
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-5 p-6">
                  <div className="flex items-center gap-4">
                    {artist.avatarUrl ? (
                      <img
                        src={artist.avatarUrl}
                        alt={artist.name}
                        className="h-14 w-14 rounded-full border border-border object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                        {artist.name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div>
                      <h2 className="text-xl font-semibold">{artist.name}</h2>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        Resident Artist
                      </p>
                    </div>
                  </div>

                  {artist.bio ? (
                    <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                      {artist.bio}
                    </p>
                  ) : null}

                  {artist.socialLinks && Object.keys(artist.socialLinks).length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(artist.socialLinks).map(([key, value]) => (
                        <a
                          key={key}
                          href={value}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                        >
                          {key}
                        </a>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
                    <span className="text-xs text-muted-foreground">
                      {artist.products.length} {artist.products.length === 1 ? "piece" : "pieces"}
                    </span>
                    <Link href="/portfolio" className="text-xs font-semibold text-primary hover:underline">
                      View gallery
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
