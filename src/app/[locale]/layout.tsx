import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { Fraunces, Noto_Naskh_Arabic, Source_Sans_3 } from "next/font/google";
import { notFound } from "next/navigation";
import { ReactNode } from "react";
import { routing } from "@/i18n/routing";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { AnalyticsBeacon } from "@/components/system/analytics-beacon";
import { Providers } from "@/components/system/providers";
import { localeMetadata, organizationJsonLd } from "@/lib/seo";

const sans = Source_Sans_3({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
});

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const arabic = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  variable: "--font-arabic",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return localeMetadata(locale);
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as "fr" | "en" | "ar")) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} className={`${sans.variable} ${display.variable} ${arabic.variable}`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }} />
      </head>
      <body className="min-h-screen antialiased noise">
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <SiteHeader />
            <main>{children}</main>
            <SiteFooter />
            <AnalyticsBeacon />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
