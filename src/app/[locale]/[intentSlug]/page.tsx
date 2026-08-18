import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import { getIntentPage, intentSlugs } from "@/content/intent-pages";
import { faqJsonLd, pageMetadata } from "@/lib/seo";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function generateStaticParams() {
  return intentSlugs.map((intentSlug) => ({ intentSlug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; intentSlug: string }>;
}) {
  const { locale, intentSlug } = await params;
  const page = getIntentPage(intentSlug);
  if (!page || locale !== "fr") return { robots: { index: false, follow: false } };
  return pageMetadata({
    title: page.title,
    description: page.description,
    path: `/${page.slug}`,
    locale: "fr",
  });
}

export default async function IntentPage({
  params,
}: {
  params: Promise<{ locale: string; intentSlug: string }>;
}) {
  const { locale, intentSlug } = await params;
  const page = getIntentPage(intentSlug);
  if (!page || locale !== "fr") notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(page.faqs)) }} />
      <h1 className="font-display text-4xl leading-tight">{page.h1}</h1>
      <p className="mt-4 text-lg text-ink-soft">{page.description}</p>
      {page.sections.map((section) => (
        <section key={section.heading} className="mt-10">
          <h2 className="font-display text-2xl">{section.heading}</h2>
          {section.paragraphs.map((p) => (
            <p key={p.slice(0, 40)} className="mt-3 leading-relaxed text-ink-soft">
              {p}
            </p>
          ))}
        </section>
      ))}
      <div className="mt-10 space-y-4">
        {page.faqs.map((f) => (
          <Card key={f.q} className="p-5">
            <h2 className="font-semibold">{f.q}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{f.a}</p>
          </Card>
        ))}
      </div>
      <div className="mt-12">
        <Button asChild size="lg">
          <Link href="/analyser">Analyser mon CV — aperçu gratuit</Link>
        </Button>
      </div>
    </div>
  );
}
