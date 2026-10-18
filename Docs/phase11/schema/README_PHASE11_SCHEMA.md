# Phase 11 Deliverable 11.1: Prisma Schema & Database Models

## Architectural overview

Deliverable 11.1 establishes the data foundation for Hayp.Studios' portfolio expansion by introducing a lightweight artist-led catalog model set that can support artist profiles, product showcases, and rich gallery media without locking the project into a database engine that is incompatible with SQLite in local development.

The root Prisma schema remains intentionally conservative: the existing `User`, `AnalyticsEvent`, and `Inquiry` models are preserved exactly as-is, and the new models are appended after them to keep the current application behavior stable while enabling the next phase of portfolio tooling.

This architecture supports the Phase 11 roadmap in three layers:

- `ArtistProfile` stores the identity, presentation metadata, and publication state for each artist or studio entry.
- `Product` represents portfolio items or commercial offerings attached to an artist profile.
- `Media` stores gallery assets such as images, artwork shots, audio clips, or video references attached to a product.

## Data model details

### ArtistProfile

The `ArtistProfile` model captures each artist's public identity and storefront metadata. It includes the core fields required for portfolio browsing, filtering, and presentation ordering.

Key characteristics:
- `slug` is unique and acts as the canonical, human-readable identifier for public routes.
- `name` is the display name shown in the portfolio directory and detail pages.
- `bio` is optional so artists can publish short or long-form biographies without forced content.
- `avatarUrl` and `bannerUrl` support visual consistency across the public showcase.
- `socialLinks` is stored as `Json?` to keep the model SQLite-compatible while allowing structured social metadata.
- `isActive` and `displayOrder` support publication and sorting rules for the active showcase.

This model exposes a one-to-many relation to `Product` via `products Product[]` and is indexed by `(isActive, displayOrder)` to optimize active catalog sorting.

### Product

The `Product` model represents a portfolio item, work, service, or featured offering associated with an artist profile. It provides the record structure needed for product centric gallery and storefront pages.

Key characteristics:
- `slug` is unique and supports clean, SEO-friendly public URLs.
- `title` and `description` allow a product-style presentation with strong browsing context.
- `price` is optional so non-commercial portfolio pieces or service listings can share the same schema.
- `tags` is stored as `Json?` for SQLite compatibility and supports arbitrary arrays of strings like `["print", "digital", "editorial"]`.
- `isFeatured` and `displayOrder` allow highlight and ordering rules for the front-end showcase.
- `artistId` is nullable and uses `onDelete: SetNull` so historical product records remain intact even if an artist profile is removed.

The model includes a relation to `Media` via `media Media[]` and indexes by `artistId` and `(isFeatured, displayOrder)` for catalog queries and feature-driven galleries.

### Media

The `Media` model stores asset metadata for each product gallery item. It supports a flexible media asset registry that can include image, audio, and video assets while keeping the schema aligned with the portfolio and commerce workflows later in Phase 11.

Key characteristics:
- `url` is the primary asset location.
- `thumbnailUrl` supports smaller preview files for galleries and cards.
- `mediaType` is a simple string field with a default of `"image"` for category-based filtering.
- `caption` stores optional descriptive copy for the media item.
- `displayOrder` enables gallery ordering and presentation sequencing.
- `productId` is nullable and uses `onDelete: Cascade` so deleting a product removes all attached media records automatically.

The model is indexed by `productId` and `mediaType` to support efficient gallery queries and media filtering.

## Referential integrity decisions

### Artist deletion behavior: `onDelete: SetNull`

The `Product` model uses:

```prisma
artist ArtistProfile? @relation(fields: [artistId], references: [id], onDelete: SetNull)
```

This means that if an artist profile is removed from the system, the related products remain in the database with `artistId` set to `null`. This preserves historical project data and avoids destructive data loss for content that may still need to be archived or re-associated later.

### Product deletion behavior: `onDelete: Cascade`

The `Media` model uses:

```prisma
product Product? @relation(fields: [productId], references: [id], onDelete: Cascade)
```

This ensures that when a product is deleted, its associated media records are also removed. Since media files are attached to the product lifecycle, cascading cleanup prevents orphaned asset references and keeps the database consistent.

## SQLite compatibility details

SQLite is the active development database provider for this project, and it does not support scalar list types such as `String[]`. To maintain compatibility while still supporting complex structured data, the schema stores collection-style fields as JSON.

Examples:
- `tags Json?` on `Product` stores an array of tags such as `["art", "portrait", "editorial"]`.
- `socialLinks Json?` on `ArtistProfile` stores structured social metadata such as `{ "instagram": "@studio", "website": "https://..." }`.

Using `Json?` keeps the schema valid in SQLite while still enabling structured data access through Prisma when the application reads or updates these collections.

## Indexing strategy

The new models are intentionally indexed for the public showcase patterns that Phase 11 will need:

- `ArtistProfile`: `@@index([isActive, displayOrder])` improves active catalog ordering and filtering.
- `Product`: `@@index([artistId])` supports artist-specific gallery lookups and `@@index([isFeatured, displayOrder])` prioritizes featured product ordering.
- `Media`: `@@index([productId])` supports product gallery retrieval and `@@index([mediaType])` enables media type filtering.

These indexes are designed to keep portfolio queries simple and fast while preserving a clean relational structure.

## Summary

The D11.1 schema creates the base relational model layer required for the subsequent Phase 11 milestones. It unifies artist identity, portfolio items, and media assets into a consistent relational structure while preserving the project's existing data layer and maintaining SQLite compatibility across local development and production-ready deployment flows.
