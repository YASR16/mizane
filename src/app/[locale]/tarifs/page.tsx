import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { products } from "@/lib/pricing";
import { formatMad } from "@/lib/utils";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const prefix = locale === "fr" ? "" : `/${locale}`;
  return pageMetadata({
    title: "Tarifs — analyse CV 49 DH, CV optimisé 99 DH",
    description:
      "Aperçu gratuit, analyse complète 49 DH, CV optimisé 99 DH. Paiement unique en MAD, sans abonnement.",
    path: `${prefix}/tarifs`,
    locale,
  });
}

export default async function PricingPage() {
  const t = await getTranslations("pricing");
  const home = await getTranslations("home");
  const analysisIncludes = t.raw("analysisIncludes") as string[];
  const optimizedIncludes = t.raw("optimizedIncludes") as string[];
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="font-display text-4xl">{t("analysis")}</h1>
      <p className="mt-3 max-w-2xl text-ink-soft">{home("pricingSub")}</p>
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <Card className="border-cedar/30 p-6">
          <p className="text-sm font-medium text-cedar">{t("analysis")}</p>
          <p className="mt-1 text-sm text-ink-soft line-through">{formatMad(products.analysis.compareAtMad)}</p>
          <p className="font-display text-4xl">{formatMad(products.analysis.priceMad)}</p>
          <ul className="mt-4 space-y-2 text-sm text-ink-soft">
            {analysisIncludes.map((i) => (
              <li key={i}>✓ {i}</li>
            ))}
          </ul>
          <Button className="mt-6 w-full" asChild>
            <Link href="/analyser">{t("start")}</Link>
          </Button>
        </Card>
        <Card className="p-6">
          <p className="text-sm font-medium">{t("optimized")}</p>
          <p className="mt-1 text-sm text-ink-soft line-through">{formatMad(products.optimized.compareAtMad)}</p>
          <p className="font-display text-4xl">{formatMad(products.optimized.priceMad)}</p>
          <ul className="mt-4 space-y-2 text-sm text-ink-soft">
            {optimizedIncludes.map((i) => (
              <li key={i}>✓ {i}</li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
