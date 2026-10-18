import express from "express";
import morgan from "morgan";
import cors from "cors";
import "dotenv/config";
import { PrismaClient, Lane, ProductStatus, ChangelogType } from "@prisma/client";
import { createAuthRouter } from "./auth.js";
import { createProductsAdminRouter } from "./products-admin.js";

const app = express();
const prisma = new PrismaClient();
const PORT = Number(process.env.PORT ?? 4000);
const CORS_ORIGIN = (process.env.CORS_ORIGIN ?? "http://localhost:3000").trim();

app.set("trust proxy", 1);
app.use(morgan("dev"));
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());

const LANES: string[] = ["ACCOUNTING", "AUTOMATION", "SOCIAL", "ECOMMERCE", "GAMES"];
const STATUSES: string[] = ["LIVE", "IN_DEVELOPMENT", "PLANNED", "CONCEPT"];
const CHANGELOG_TYPES: string[] = ["LAUNCH", "UPDATE", "ANNOUNCEMENT", "MILESTONE"];

const SITE_CONFIG_DEFAULTS: Record<string, unknown> = {
  sections: { hero: true, showcase: true, story: true },
  appearance: { hexIgnition: true, reticle: true, shockwave: true },
};

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "vortex-backend", time: new Date().toISOString() });
});

app.use("/api/auth", createAuthRouter());
app.use("/api/admin/products", createProductsAdminRouter());

app.get("/api/products", async (req, res, next) => {
  try {
    const status = req.query.status as string | undefined;
    const lane = req.query.lane as string | undefined;

    if (status !== undefined && !STATUSES.includes(status)) {
      return res.status(400).json({ error: `invalid status '${status}'` });
    }
    if (lane !== undefined && !LANES.includes(lane)) {
      return res.status(400).json({ error: `invalid lane '${lane}'` });
    }

    const products = await prisma.product.findMany({
      where: {
        ...(status !== undefined ? { status: status as ProductStatus } : {}),
        ...(lane !== undefined ? { lane: lane as Lane } : {}),
      },
      orderBy: { sortOrder: "asc" },
    });

    res.json({ count: products.length, products });
  } catch (err) {
    next(err);
  }
});

app.get("/api/changelog", async (req, res, next) => {
  try {
    const type = req.query.type as string | undefined;

    if (type !== undefined && !CHANGELOG_TYPES.includes(type)) {
      return res.status(400).json({ error: `invalid type '${type}'` });
    }

    const entries = await prisma.changelogEntry.findMany({
      where: {
        published: true,
        ...(type !== undefined ? { type: type as ChangelogType } : {}),
      },
      orderBy: { date: "desc" },
    });

    res.json({ count: entries.length, entries });
  } catch (err) {
    next(err);
  }
});

app.get("/api/stats", async (_req, res, next) => {
  try {
    const products = await prisma.product.count();
    const live = await prisma.product.count({ where: { status: "LIVE" } });
    const pipeline = await prisma.product.count({ where: { status: { not: "LIVE" } } });
    const laneRows = await prisma.product.findMany({
      select: { lane: true },
      distinct: ["lane"],
    });

    res.json({ products, live, pipeline, lanes: laneRows.length });
  } catch (err) {
    next(err);
  }
});

app.get("/api/site-config", async (_req, res, next) => {
  try {
    const overrides = await prisma.siteConfig.findMany();
    const config: Record<string, unknown> = JSON.parse(JSON.stringify(SITE_CONFIG_DEFAULTS));
    for (const row of overrides) {
      config[row.key] = row.data;
    }
    res.json(config);
  } catch (err) {
    next(err);
  }
});

app.use((_req, res) => {
  res.status(404).json({ error: "not found" });
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "internal error" });
});

app.listen(PORT, () => {
  console.log(`vortex-backend listening on http://localhost:${PORT}`);
});
