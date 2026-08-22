import { getTranslations } from "next-intl/server";
import { CvUploader } from "@/components/upload/cv-uploader";
import { Card } from "@/components/ui/card";
import { ScoreBars } from "@/components/results/score-bars";
import { ScoreRing } from "@/components/results/score-ring";
import { products } from "@/lib/pricing";
import { formatMad } from "@/lib/utils";
import { ScanSearch, KeyRound, Briefcase, Layers3, Eye, Sparkles, Lock, ShieldCheck } from "lucide-react";

const ICONS = [ScanSearch, KeyRound, Briefcase, Layers3, Eye, Sparkles];

export default async function HomePage() {
  const t = await getTranslations();

  const criteria = t.raw("home.criteria") as { title: string; body: string }[];
  const steps = t.raw("home.steps") as { title: string; body: string }[];
  const checklist = t.raw("home.checklist") as string[];
  const faqs = t.raw("home.faqs") as { q: string; a: string }[];
  const analysisIncludes = t.raw("pricing.analysisIncludes") as string[];
  const optimizedIncludes = t.raw("pricing.optimizedIncludes") as string[];

  return (
    <>
      <section className="mx-auto grid max-w-6xl items-start gap-12 px-4 pb-8 pt-12 lg:grid-cols-[1.05fr_0.95fr] lg:pt-16">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cedar">{t("hero.kicker")}</p>
          <h1 className="mt-4 font-display text-4xl leading-[1.12] tracking-tight md:text-6xl">{t("hero.title")}</h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">{t("hero.sub")}</p>
          <p className="mt-5 flex items-center gap-2 text-sm text-ink-soft">
            <ShieldCheck className="h-4 w-4 text-cedar" />
            {t("hero.privacy")}
          </p>
        </div>
        <div id="upload">
          <CvUploader compact />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="max-w-2xl font-display text-3xl md:text-4xl">{t("trust.title")}</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {criteria.map((c, i) => {
            const Icon = ICONS[i] ?? ScanSearch;
            return (
              <Card key={c.title} className="p-6">
                <Icon className="h-5 w-5 text-cedar" />
                <h3 className="mt-4 font-semibold">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{c.body}</p>
              </Card>
            );
          })}
        </div>
        <p className="mt-8 max-w-3xl text-sm text-ink-soft">{t("trust.disclaimer")}</p>
      </section>

      <section id="fonctionnement" className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-display text-3xl md:text-4xl">{t("home.howTitle")}</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s.title}>
                <p className="font-display text-3xl text-cedar">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-3 font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-ink-soft">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="font-display text-3xl md:text-4xl">{t("home.analyzeTitle")}</h2>
        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {checklist.map((item) => (
            <div key={item} className="flex gap-3 rounded-xl border border-line bg-white px-4 py-3 text-sm">
              <ScanSearch className="mt-0.5 h-4 w-4 shrink-0 text-cedar" />
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl md:text-4xl">{t("home.reportTitle")}</h2>
            <p className="mt-4 text-ink-soft">{t("home.reportBody")}</p>
            <ul className="mt-6 space-y-3 text-sm">
              <li>✓ {t("home.freeStrengths")}</li>
              <li>✓ {t("home.freeIssues")}</li>
              <li className="flex items-center gap-2">
                <Lock className="h-4 w-4" /> {t("home.paidHint")}
              </li>
            </ul>
          </div>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-ink-soft">{t("home.sampleLabel")}</p>
              <ScoreRing score={72} size={96} />
            </div>
            <div className="mt-5">
              <ScoreBars
                items={[
                  { label: "ATS", value: 64 },
                  { label: "Structure", value: 78 },
                  { label: "Mots-clés", value: 61 },
                ]}
              />
            </div>
          </Card>
        </div>
      </section>

      <section id="tarifs" className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-display text-3xl md:text-4xl">{t("home.pricingTitle")}</h2>
          <p className="mt-3 max-w-2xl text-ink-soft">{t("home.pricingSub")}</p>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <Card className="p-8">
              <p className="text-sm font-medium text-cedar">{t("pricing.analysis")}</p>
              <p className="mt-2 text-sm text-ink-soft line-through">{formatMad(products.analysis.compareAtMad)}</p>
              <p className="font-display text-5xl">{formatMad(products.analysis.priceMad)}</p>
              <ul className="mt-6 space-y-2 text-sm text-ink-soft">
                {analysisIncludes.map((i) => (
                  <li key={i}>✓ {i}</li>
                ))}
              </ul>
            </Card>
            <Card className="p-8">
              <p className="text-sm font-medium text-cedar">{t("pricing.optimized")}</p>
              <p className="mt-2 text-sm text-ink-soft line-through">{formatMad(products.optimized.compareAtMad)}</p>
              <p className="font-display text-5xl">{formatMad(products.optimized.priceMad)}</p>
              <ul className="mt-6 space-y-2 text-sm text-ink-soft">
                {optimizedIncludes.map((i) => (
                  <li key={i}>✓ {i}</li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-20">
        <h2 className="font-display text-3xl md:text-4xl">{t("home.faqTitle")}</h2>
        <div className="mt-8 space-y-4">
          {faqs.map((f) => (
            <Card key={f.q} className="p-5">
              <h3 className="font-semibold">{f.q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{f.a}</p>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
