import express from "express";
import { PrismaClient, Lane, ProductStatus } from "@prisma/client";
import { requireOwner } from "./auth.js";

const prisma = new PrismaClient();

const LANES: string[] = ["ACCOUNTING", "AUTOMATION", "SOCIAL", "ECOMMERCE", "GAMES"];
const STATUSES: string[] = ["LIVE", "IN_DEVELOPMENT", "PLANNED", "CONCEPT"];

function validLink(link: string): boolean {
  return link === "" || /^https?:\/\/\S+$/.test(link);
}

export function createProductsAdminRouter(): express.Router {
  const router = express.Router();

  router.use(requireOwner);

  router.get("/", async (_req, res, next) => {
    try {
      const products = await prisma.product.findMany({
        orderBy: { sortOrder: "asc" },
      });
      res.json({ count: products.length, products });
    } catch (err) {
      next(err);
    }
  });

  router.put("/:id", async (req, res, next) => {
    try {
      const existing = await prisma.product.findUnique({
        where: { id: req.params.id },
      });
      if (!existing) {
        return res.status(404).json({ error: "product not found" });
      }

      const b = req.body ?? {};
      const update: Record<string, unknown> = {};

      if (b.description !== undefined) {
        if (typeof b.description !== "string") {
          return res.status(400).json({ error: "description must be a string" });
        }
        update.description = b.description;
      }
      if (b.link !== undefined) {
        if (typeof b.link !== "string" || !validLink(b.link)) {
          return res.status(400).json({ error: "link must be empty or an http(s) URL" });
        }
        update.link = b.link === "" ? null : b.link;
      }
      if (b.sortOrder !== undefined) {
        if (!Number.isInteger(b.sortOrder)) {
          return res.status(400).json({ error: "sortOrder must be an integer" });
        }
        update.sortOrder = b.sortOrder;
      }
      if (b.status !== undefined) {
        if (!STATUSES.includes(b.status)) {
          return res.status(400).json({ error: `invalid status '${b.status}'` });
        }
        update.status = b.status as ProductStatus;
      }
      if (b.lane !== undefined) {
        if (!LANES.includes(b.lane)) {
          return res.status(400).json({ error: `invalid lane '${b.lane}'` });
        }
        update.lane = b.lane as Lane;
      }
      if (b.name !== undefined) {
        return res.status(400).json({ error: "name is immutable" });
      }

      if (Object.keys(update).length === 0) {
        return res.status(400).json({ error: "no valid fields to update" });
      }

      const product = await prisma.product.update({
        where: { id: req.params.id },
        data: update,
      });
      return res.json({ product });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
