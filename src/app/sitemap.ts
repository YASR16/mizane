import { MetadataRoute } from "next";
import { articles } from "@/content/articles";
import { intentPages } from "@/content/intent-pages";
import { publicAppUrl } from "@/lib/app-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = publicAppUrl();
  const publicPaths = [
    "",
    "/analyser",
    "/tarifs",
    "/faq",
    "/blog",
    "/confidentialite",
    "/conditions",
    "/a-propos",
    "/comment-ca-marche",
  ];
  const locales = ["", "/en", "/ar"];
  const entries: MetadataRoute.Sitemap = [];
  for (const locale of locales) {
    for (const path of publicPaths) {
      entries.push({
        url: `${base}${locale}${path || "/"}`,
        changeFrequency: "weekly",
        priority: path === "" ? 1 : 0.6,
      });
    }
    for (const a of articles) {
      entries.push({ url: `${base}${locale}/blog/${a.slug}`, changeFrequency: "monthly", priority: 0.7 });
    }
  }
  for (const page of intentPages) {
    entries.push({
      url: `${base}/${page.slug}`,
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }
  return entries;
}
