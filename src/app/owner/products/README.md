# Owner Products & Product Updates Management Console

The Products console is the private owner workspace for catalog operations and release-note publishing. It provides a dedicated interface for managing the product catalog, pricing, visibility, and versioned changelog notes for each item.

## Scope

- Create and edit product records
- Manage categories, pricing, featured status, and archive state
- Publish and review product updates for each catalog item
- Keep the product admin area isolated behind the owner session shell

## Route Coverage

- `GET /api/admin/products` — list catalog items
- `POST /api/admin/products` — create a product
- `PATCH /api/admin/products/[id]` — update a product
- `DELETE /api/admin/products/[id]` — remove a product
- `GET /api/admin/product-updates?productId=<id>` — fetch updates for a product
- `POST /api/admin/product-updates` — create a product update
- `PATCH /api/admin/product-updates/[id]` — update a product update
- `DELETE /api/admin/product-updates/[id]` — remove a product update

## Data Model

The root Prisma schema includes the `Product` and `ProductUpdate` models with a one-to-many relation from product to updates.

- `ProductUpdate.productId -> Product.id`
- `Product.updates -> ProductUpdate[]`
- Deletion is cascade-safe so update records are removed when a parent product is removed.

## Security

All product and product-update API routes require a valid owner/admin session. The guard accepts:

- `ADMIN` role
- `OWNER` role
- the configured environment email as an override

## UI Structure

The page is organized as:

1. Summary KPI cards
2. Search and filtering controls
3. Product table with status and action buttons
4. Create/Edit modal for catalog records
5. Release notes modal for product-specific updates

## Verification

This package follows the repo’s schema-first order and validates through the existing build/test pipeline.
