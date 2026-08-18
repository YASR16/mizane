import { brand } from "@/lib/brand";
import { publicAppUrl } from "@/lib/app-url";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";

const copy: Record<string, { title: string; description: string }> = {
  fr: {
    title: "Mizane — Analyse CV et score ATS au Maroc",
    description:
      "Analysez votre CV avant de l'envoyer. Score ATS, structure, mots-clés et recommandations concrètes pour le marché marocain.",
  },
  en: {
    title: "Mizane — CV analysis and ATS score",
    description:
      "Analyze your CV before you send it. ATS score, structure, keywords and concrete recommendations for Morocco and international roles.",
  },
  ar: {
    title: "ميزان — تحليل السيرة ودرجة ATS",
    description:
      "حلّل سيرتك قبل إرسالها. درجة ATS، البنية، الكلمات المفتاحية وتوصيات عملية للسوق المغربي والدولي.",
  },
};

export const noindexMetadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export function localeMetadata(locale: string): Metadata {
  const base = publicAppUrl();
  const texts = copy[locale] ?? copy.fr;
  const path = locale === routing.defaultLocale ? "" : `/${locale}`;
  const canonical = `${base}${path || "/"}`;
  const languages: Record<string, string> = {
    fr: `${base}/`,
    en: `${base}/en`,
    ar: `${base}/ar`,
    "x-default": `${base}/`,
  };

  return {
    metadataBase: new URL(base),
    title: texts.title,
    description: texts.description,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      type: "website",
      locale: locale === "ar" ? "ar_MA" : locale === "en" ? "en_GB" : "fr_MA",
      url: canonical,
      siteName: brand.name,
      title: texts.title,
      description: texts.description,
    },
    twitter: {
      card: "summary_large_image",
      title: texts.title,
      description: texts.description,
    },
    robots: { index: true, follow: true },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
      other: process.env.BING_SITE_VERIFICATION
        ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION }
        : undefined,
    },
  };
}

export function pageMetadata(input: {
  title: string;
  description: string;
  path: string;
  locale?: string;
  index?: boolean;
}): Metadata {
  const base = publicAppUrl();
  const locale = input.locale ?? "fr";
  const canonical = `${base}${input.path}`;
  const index = input.index !== false;
  return {
    title: input.title,
    description: input.description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: locale === "ar" ? "ar_MA" : locale === "en" ? "en_GB" : "fr_MA",
      url: canonical,
      siteName: brand.name,
      title: input.title,
      description: input.description,
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
    },
    robots: index ? { index: true, follow: true } : { index: false, follow: false },
  };
}

export function organizationJsonLd() {
  const base = publicAppUrl();
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: brand.name,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: base,
    offers: {
      "@type": "Offer",
      priceCurrency: "MAD",
      price: "49",
    },
  };
}

export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function articleJsonLd(input: { title: string; description: string; path: string; date: string }) {
  const base = publicAppUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    datePublished: input.date,
    url: `${base}${input.path}`,
    publisher: { "@type": "Organization", name: brand.name, url: base },
  };
}
