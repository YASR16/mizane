import { Link } from "@/i18n/routing";
import { articles } from "@/content/articles";
import { Card } from "@/components/ui/card";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Blog — CV, ATS et carrière au Maroc",
  description: "Guides utiles pour analyser, corriger et adapter un CV au marché marocain et aux ATS.",
  path: "/blog",
});

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="font-display text-4xl">Blog</h1>
      <p className="mt-3 text-ink-soft">Contenu utile, pas de pages clones. Chaque article vise une vraie question de candidat.</p>
      <div className="mt-10 space-y-4">
        {articles.map((a) => (
          <Card key={a.slug} className="p-6">
            <p className="text-xs uppercase tracking-wide text-cedar">{a.category}</p>
            <h2 className="mt-2 font-display text-2xl">
              <Link href={`/blog/${a.slug}`}>{a.title}</Link>
            </h2>
            <p className="mt-2 text-sm text-ink-soft">{a.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
