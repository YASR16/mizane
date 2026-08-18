import { getTranslations } from "next-intl/server";
import { CvUploader } from "@/components/upload/cv-uploader";
import { ShieldCheck } from "lucide-react";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const prefix = locale === "fr" ? "" : `/${locale}`;
  return pageMetadata({
    title: "Analyser un CV — aperçu gratuit, rapport 49 DH",
    description:
      "Uploadez un PDF ou DOCX. Mizane extrait le texte, note l’ATS et la structure, et montre un aperçu réel avant paiement.",
    path: `${prefix}/analyser`,
    locale,
  });
}

export default async function AnalyserPage() {
  const t = await getTranslations("analyser");
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-display text-4xl tracking-tight">{t("title")}</h1>
      <p className="mt-3 text-ink-soft">{t("sub")}</p>
      <div className="mt-8">
        <CvUploader />
      </div>
      <p className="mt-6 flex items-center gap-2 text-sm text-ink-soft">
        <ShieldCheck className="h-4 w-4 text-cedar" />
        {t("privacy")}
      </p>
    </div>
  );
}
