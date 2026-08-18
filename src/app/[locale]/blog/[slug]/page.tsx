import { notFound } from "next/navigation";
import { getArticle, articles } from "@/content/articles";
import { Link } from "@/i18n/routing";
import { articleJsonLd, pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  const prefix = locale === "fr" ? "" : `/${locale}`;
  return pageMetadata({
    title: article.title,
    description: article.description,
    path: `${prefix}/blog/${article.slug}`,
    locale,
  });
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params;
  const article = getArticle(slug);
  if (!article) notFound();
  const prefix = locale === "fr" ? "" : `/${locale}`;
  return (
    <article className="mx-auto max-w-2xl px-4 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            articleJsonLd({
              title: article.title,
              description: article.description,
              path: `${prefix}/blog/${article.slug}`,
              date: article.date,
            }),
          ),
        }}
      />
      <p className="text-xs uppercase tracking-wide text-cedar">{article.category}</p>
      <h1 className="mt-2 font-display text-4xl leading-tight">{article.title}</h1>
      <div className="mt-8 space-y-5 text-[17px] leading-relaxed text-ink-soft">
        {article.content.map((p) => (
          <p key={p.slice(0, 24)}>{p}</p>
        ))}
      </div>
      <p className="mt-10 text-sm">
        <Link href="/analyser" className="font-medium text-cedar">
          Analyser mon CV gratuitement →
        </Link>
      </p>
    </article>
  );
}
