import { describe, expect, it } from "bun:test";
import { filterPortfolioItems, getUniqueArtists, getUniqueCategories } from "./hayp-portfolio-grid";

describe("Hayp portfolio filters", () => {
  const samplePortfolio = [
    {
      id: "prod-1",
      slug: "qyra",
      title: "Qyra",
      description: "Auto-posting ledger automation.",
      tags: ["Automation", "QuickBooks"],
      artist: { id: "artist-1", name: "Hayp Studio", slug: "hayp-studio" },
      category: "Automation",
      featured: true,
    },
    {
      id: "prod-2",
      slug: "cirqa",
      title: "Cirqa",
      description: "Social platform design direction.",
      tags: ["Social"],
      artist: { id: "artist-2", name: "Aster Rowe", slug: "aster-rowe" },
      category: "Social",
      featured: false,
    },
    {
      id: "prod-3",
      slug: "lumora",
      title: "Lumora",
      description: "E-commerce storefront concept.",
      tags: ["Commerce"],
      artist: { id: "artist-1", name: "Hayp Studio", slug: "hayp-studio" },
      category: "E-Commerce",
      featured: true,
    },
  ] as const;

  it("returns every item when no filters are applied", () => {
    expect(filterPortfolioItems(samplePortfolio, "all", "all")).toHaveLength(3);
  });

  it("filters portfolio items by category and artist", () => {
    const filtered = filterPortfolioItems(samplePortfolio, "Automation", "artist-1");
    expect(filtered).toHaveLength(1);
    expect(filtered[0].title).toBe("Qyra");
  });

  it("extracts unique categories and artists for the filter UI", () => {
    expect(getUniqueCategories(samplePortfolio)).toEqual([
      "Automation",
      "QuickBooks",
      "Social",
      "E-Commerce",
      "Commerce",
    ]);
    expect(getUniqueArtists(samplePortfolio)).toEqual([
      { id: "artist-1", name: "Hayp Studio", slug: "hayp-studio" },
      { id: "artist-2", name: "Aster Rowe", slug: "aster-rowe" },
    ]);
  });
});
