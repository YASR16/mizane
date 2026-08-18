import { describe, expect, it } from "vitest";
import { articles } from "@/content/articles";
import { intentPages, intentSlugs } from "@/content/intent-pages";

describe("SEO content", () => {
  it("has unique intent slugs and titles", () => {
    expect(new Set(intentSlugs).size).toBe(intentSlugs.length);
    expect(new Set(intentPages.map((p) => p.title)).size).toBe(intentPages.length);
    expect(intentPages.length).toBeGreaterThanOrEqual(8);
  });

  it("has unique article slugs", () => {
    const slugs = articles.map((a) => a.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(articles.length).toBeGreaterThanOrEqual(9);
  });
});
