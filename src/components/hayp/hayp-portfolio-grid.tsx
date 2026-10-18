"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HaypProjectModal } from "./hayp-project-modal";
import type { ArtistSnippet, ProjectItem } from "./types";

export function normalizeTags(tags: ProjectItem["tags"]): string[] {
  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag).trim()).filter(Boolean);
  }

  if (typeof tags === "string") {
    try {
      const parsed = JSON.parse(tags) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.map((tag) => String(tag).trim()).filter(Boolean);
      }
    } catch {
      return tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
    }
  }

  return [];
}

export function getUniqueArtists(
  items: Array<{ artist?: ArtistSnippet | null; artistId?: string | null }>
): ArtistSnippet[] {
  const seen = new Set<string>();
  const unique: ArtistSnippet[] = [];

  for (const item of items) {
    const artist = item.artist;
    if (!artist) {
      continue;
    }

    const key = artist.id || artist.slug || artist.name;
    if (!key || seen.has(key)) {
      continue;
    }

    seen.add(key);
    unique.push(artist);
  }

  return unique;
}

export function getUniqueCategories(
  items: Array<{ category?: string | null; tags?: ProjectItem["tags"] }>
): string[] {
  const seen = new Set<string>();
  const values: string[] = [];

  for (const item of items) {
    const category = item.category?.trim();
    if (category && !seen.has(category)) {
      seen.add(category);
      values.push(category);
    }

    for (const tag of normalizeTags(item.tags)) {
      if (!seen.has(tag)) {
        seen.add(tag);
        values.push(tag);
      }
    }
  }

  return values;
}

export function filterPortfolioItems(
  items: Array<{
    category?: string | null;
    artist?: ArtistSnippet | null;
    artistId?: string | null;
    tags?: ProjectItem["tags"];
  }>,
  selectedCategory: string,
  selectedArtistId: string
) {
  const categoryFilter = selectedCategory?.trim();
  const artistFilter = selectedArtistId?.trim();

  return items.filter((item) => {
    if (artistFilter && artistFilter.toLowerCase() !== "all") {
      const matchesArtist =
        item.artist?.id === artistFilter ||
        item.artistId === artistFilter ||
        item.artist?.slug === artistFilter;

      if (!matchesArtist) {
        return false;
      }
    }

    if (categoryFilter && categoryFilter.toLowerCase() !== "all") {
      const value = categoryFilter;
      const tagMatches = normalizeTags(item.tags).includes(value);
      const categoryMatches = (item.category ?? "").toLowerCase() === value.toLowerCase();

      if (!categoryMatches && !tagMatches) {
        return false;
      }
    }

    return true;
  });
}

interface HaypPortfolioGridProps {
  initialProducts: ProjectItem[];
  artists: ArtistSnippet[];
}

export function HaypPortfolioGrid({
  initialProducts,
  artists,
}: HaypPortfolioGridProps) {
  const [selectedArtistId, setSelectedArtistId] = useState<string>("ALL");
  const [selectedTag, setSelectedTag] = useState<string>("ALL");
  const [activeModalProduct, setActiveModalProduct] = useState<ProjectItem | null>(null);

  const availableFilters = useMemo(() => {
    const seen = new Set<string>();
    const values: string[] = [];

    for (const product of initialProducts) {
      if (product.category && !seen.has(product.category)) {
        seen.add(product.category);
        values.push(product.category);
      }

      for (const tag of normalizeTags(product.tags)) {
        if (!seen.has(tag)) {
          seen.add(tag);
          values.push(tag);
        }
      }
    }

    return values;
  }, [initialProducts]);

  const filteredProducts = useMemo(
    () => filterPortfolioItems(initialProducts, selectedTag, selectedArtistId),
    [initialProducts, selectedArtistId, selectedTag]
  );

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          <span>Filter by</span>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={selectedArtistId === "ALL" ? "default" : "outline"}
              size="sm"
              aria-pressed={selectedArtistId === "ALL"}
              onClick={() => setSelectedArtistId("ALL")}
            >
              All Artists
            </Button>
            {artists.map((artist) => (
              <Button
                key={artist.id}
                variant={selectedArtistId === artist.id ? "default" : "outline"}
                size="sm"
                aria-pressed={selectedArtistId === artist.id}
                onClick={() => setSelectedArtistId(artist.id)}
              >
                {artist.name}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={selectedTag === "ALL" ? "default" : "outline"}
              className="cursor-pointer px-3 py-1 text-xs"
              aria-pressed={selectedTag === "ALL"}
              onClick={() => setSelectedTag("ALL")}
            >
              All
            </Badge>
            {availableFilters.map((filterValue) => (
              <Badge
                key={filterValue}
                variant={selectedTag === filterValue ? "default" : "outline"}
                className="cursor-pointer px-3 py-1 text-xs"
                aria-pressed={selectedTag === filterValue}
                onClick={() => setSelectedTag(filterValue)}
              >
                {filterValue}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => {
            const primaryMedia = product.media?.[0] ?? null;
            const imageUrl = primaryMedia?.thumbnailUrl || primaryMedia?.url || "";

            return (
              <article
                key={product.id}
                role="button"
                tabIndex={0}
                aria-label={`Open ${product.title}`}
                onClick={() => setActiveModalProduct(product)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setActiveModalProduct(product);
                  }
                }}
                className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/60"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={product.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      No preview available
                    </div>
                  )}

                  {(product.isFeatured || product.featured) && (
                    <div className="absolute left-3 top-3">
                      <Badge className="bg-primary text-primary-foreground text-[10px]">
                        Featured
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col justify-between gap-4 p-5">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-semibold leading-tight text-foreground">
                        {product.title}
                      </h3>
                      {product.price !== null && product.price !== undefined ? (
                        <span className="text-sm font-semibold text-primary">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                          }).format(product.price)}
                        </span>
                      ) : null}
                    </div>

                    {product.artist ? (
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                        {product.artist.name}
                      </p>
                    ) : null}

                    {product.description ? (
                      <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                        {product.description}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                      View project
                    </span>
                    {product.media?.length ? (
                      <span className="text-xs text-muted-foreground">
                        {product.media.length} media
                      </span>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card/60 py-16 text-center">
          <p className="text-base text-muted-foreground">
            No projects match the selected filters.
          </p>
          <Button
            variant="link"
            className="mt-4 text-primary"
            onClick={() => {
              setSelectedArtistId("ALL");
              setSelectedTag("ALL");
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}

      <HaypProjectModal
        product={activeModalProduct}
        isOpen={Boolean(activeModalProduct)}
        onClose={() => setActiveModalProduct(null)}
      />
    </div>
  );
}
