"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { ProjectItem } from "./types";

function normalizeTags(tags: ProjectItem["tags"]): string[] {
  if (Array.isArray(tags)) {
    return tags
      .map((tag) => String(tag).trim())
      .filter(Boolean);
  }

  if (typeof tags === "string") {
    try {
      const parsed = JSON.parse(tags) as unknown;
      if (Array.isArray(parsed)) {
        return parsed
          .map((tag) => String(tag).trim())
          .filter(Boolean);
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

export function HaypProjectModal({
  product,
  isOpen,
  onClose,
}: {
  product: ProjectItem | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!product) {
    return null;
  }

  const mediaList = product.media ?? [];
  const tags = normalizeTags(product.tags);
  const priceText =
    product.price === null || product.price === undefined
      ? null
      : new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(product.price);

  const renderMedia = (item: ProjectItem["media"][number], key: string) => {
    const isVideo = item.mediaType === "video";

    return (
      <div key={key} className="flex w-full flex-col items-center">
        {isVideo ? (
          <video
            src={item.url}
            controls
            className="max-h-[480px] w-full rounded-xl border border-border bg-slate-950 object-contain"
          />
        ) : (
          <img
            src={item.url}
            alt={item.caption ?? product.title}
            className="max-h-[480px] w-full rounded-xl border border-border bg-slate-100 object-contain"
          />
        )}
        {item.caption ? (
          <p className="mt-3 text-center text-xs italic text-muted-foreground">
            {item.caption}
          </p>
        ) : null}
      </div>
    );
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto bg-background p-0 sm:p-0">
        <div className="p-6 sm:p-8">
          <DialogHeader className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {product.isFeatured || product.featured ? (
                <Badge variant="default">Featured Work</Badge>
              ) : null}
              {product.artist ? (
                <Badge variant="outline">{product.artist.name}</Badge>
              ) : null}
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight sm:text-3xl">
              {product.title}
            </DialogTitle>
            {priceText ? (
              <p className="text-lg font-semibold text-primary">{priceText}</p>
            ) : null}
          </DialogHeader>

          <div className="mt-6">
            {mediaList.length > 1 ? (
              <Carousel className="relative">
                <CarouselContent>
                  {mediaList.map((item, index) => (
                    <CarouselItem
                      key={item.id ?? `${product.id}-${index}`}
                      className="basis-full"
                    >
                      {renderMedia(item, item.id ?? `${product.id}-${index}`)}
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious
                  className="left-2"
                  aria-label="Previous media item"
                />
                <CarouselNext className="right-2" aria-label="Next media item" />
              </Carousel>
            ) : mediaList.length === 1 ? (
              renderMedia(mediaList[0], mediaList[0].id ?? `${product.id}-single`)
            ) : (
              <div className="flex h-72 items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 text-sm text-muted-foreground">
                No media preview available
              </div>
            )}
          </div>

          <div className="mt-6 space-y-6">
            {product.description ? (
              <DialogDescription className="text-sm leading-7 text-foreground sm:text-base">
                {product.description}
              </DialogDescription>
            ) : null}

            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            ) : null}

            {product.artist ? (
              <div className="flex items-center gap-4 rounded-xl border border-border bg-muted/30 p-4">
                {product.artist.avatarUrl ? (
                  <img
                    src={product.artist.avatarUrl}
                    alt={product.artist.name}
                    className="h-14 w-14 rounded-full border border-border object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {product.artist.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {product.artist.name}
                  </p>
                  {product.artist.bio ? (
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {product.artist.bio}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}

            <div className="flex justify-end gap-3 border-t border-border pt-4">
              <Button variant="outline" onClick={onClose} aria-label="Close dialog">
                Close
              </Button>
              <Button asChild>
                <a href="/#contact">Inquire About This Piece</a>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
