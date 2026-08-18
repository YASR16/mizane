import { getTranslations } from "next-intl/server";
import { Card } from "@/components/ui/card";
import { faqJsonLd, pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const prefix = locale === "fr" ? "" : `/${locale}`;
  return pageMetadata({
    title: "FAQ — analyse CV, ATS et paiement au Maroc",
    description:
      "Questions fréquentes sur Mizane : score ATS, conservation des CV, paiement 49 DH, CV optimisé, confidentialité.",
    path: `${prefix}/faq`,
    locale,
  });
}

export default async function FaqPage() {
  const t = await getTranslations("home");
  const faqs = t.raw("faqs") as { q: string; a: string }[];
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }} />
      <h1 className="font-display text-4xl">{t("faqTitle")}</h1>
      <div className="mt-8 space-y-4">
        {faqs.map((f) => (
          <Card key={f.q} className="p-5">
            <h2 className="font-semibold">{f.q}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{f.a}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
