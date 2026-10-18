import { PrismaClient, Lane, ProductStatus, ChangelogType } from "@prisma/client";

const prisma = new PrismaClient();

const PRODUCTS: Array<{
  name: string; lane: Lane; status: ProductStatus;
  date: Date | null; description: string; sortOrder: number;
}> = [
  { name: "Haypbooks", lane: "ACCOUNTING", status: "LIVE",
    date: new Date("2025-12-01"), sortOrder: 1,
    description: "The accounting system that speaks human. Complete accounting suite — ledgers, invoicing, expenses, financial reports." },
  { name: "Qyra", lane: "AUTOMATION", status: "LIVE",
    date: new Date("2026-02-01"), sortOrder: 2,
    description: "Your data, auto-posted to QuickBooks. Automation pipeline that maps, validates and reconciles transactions into QuickBooks without manual entry." },
  { name: "Zypra", lane: "AUTOMATION", status: "IN_DEVELOPMENT",
    date: new Date("2026-12-01"), sortOrder: 3,
    description: "The same magic, wired to Xero. The Vortex automation engine retooled for Xero — auto-posting, account mapping, sync pipelines." },
  { name: "Cirqa", lane: "SOCIAL", status: "PLANNED",
    date: null, sortOrder: 4,
    description: "Feeds with real gravity. Social platform." },
  { name: "Lumora", lane: "ECOMMERCE", status: "PLANNED",
    date: null, sortOrder: 5,
    description: "Storefronts built to sell. Marketplace." },
  { name: "Project: Arena", lane: "GAMES", status: "CONCEPT",
    date: null, sortOrder: 6,
    description: "MOBA game concept." },
  { name: "Project: Bastion", lane: "GAMES", status: "CONCEPT",
    date: null, sortOrder: 7,
    description: "Base-building strategy game concept." },
  { name: "Project: Overdrive", lane: "GAMES", status: "CONCEPT",
    date: null, sortOrder: 8,
    description: "Open-world action game concept." },
  { name: "Project: Emberfall", lane: "GAMES", status: "CONCEPT",
    date: null, sortOrder: 9,
    description: "Story-driven RPG concept." },
];

const CANONICAL_NAMES = PRODUCTS.map((p) => p.name);

const CHANGELOG: Array<{
  type: ChangelogType; date: Date; title: string; body: string;
}> = [
  { type: "LAUNCH", date: new Date("2025-11-01"),
    title: "The vortex begins",
    body: "Vortex Studios is founded with one obsession: software that feels effortless. Strategy, design, engineering and motion spin as one force." },
  { type: "LAUNCH", date: new Date("2025-12-01"),
    title: "Haypbooks goes live",
    body: "The first product leaves the vortex — complete, running live from day one. Less friction. More momentum." },
  { type: "LAUNCH", date: new Date("2026-02-01"),
    title: "Qyra goes live",
    body: "Your data, auto-posted to QuickBooks. The second product ships whole, on standard." },
  { type: "ANNOUNCEMENT", date: new Date("2026-08-10"),
    title: "Vortex Games Division announced",
    body: "Four game concepts enter the pipeline. New lanes. Same standard." },
  { type: "MILESTONE", date: new Date("2026-08-25"),
    title: "2 live, 7 spinning",
    body: "Two products live, seven more in motion. Momentum made visible." },
];

async function main() {
  for (const p of PRODUCTS) {
    await prisma.product.upsert({
      where: { name: p.name },
      update: { lane: p.lane, status: p.status, date: p.date,
                description: p.description, sortOrder: p.sortOrder },
      create: p,
    });
  }

  const removed = await prisma.product.deleteMany({
    where: { name: { notIn: CANONICAL_NAMES } },
  });

  await prisma.changelogEntry.deleteMany({});
  await prisma.changelogEntry.createMany({ data: CHANGELOG });

  const products = await prisma.product.count();
  const changelog = await prisma.changelogEntry.count();

  console.log(`removed non-canonical products: ${removed.count}`);
  console.log(`seed complete — products: ${products}, changelog: ${changelog}`);
  if (products !== 9 || changelog !== 5) {
    throw new Error(`seed convergence failed — products: ${products}, changelog: ${changelog}`);
  }
  console.log("canonical check — OK (9 canonical products, 5 canonical changelog entries)");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
