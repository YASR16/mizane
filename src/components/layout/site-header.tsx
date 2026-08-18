"use client";

import { useTranslations, useLocale } from "next-intl";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, usePathname } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { brand } from "@/lib/brand";

export function SiteHeader() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/#fonctionnement", label: t("how") },
    { href: "/tarifs", label: t("pricing") },
    { href: "/blog", label: t("blog") },
    { href: "/faq", label: t("faq") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-cedar text-sm font-semibold text-white">
            M
          </span>
          <span className="font-display text-xl tracking-tight">{brand.name}</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-ink-soft md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-ink">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <LocaleSwitch locale={locale} pathname={pathname} />
          <Button variant="ghost" size="sm" asChild>
            <Link href="/connexion">{t("login")}</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/analyser">{t("cta")}</Link>
          </Button>
        </div>
        <button
          className="md:hidden"
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open ? (
        <div className="border-t border-line bg-paper px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3 text-sm">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ))}
            <LocaleSwitch locale={locale} pathname={pathname} />
            <Button asChild>
              <Link href="/analyser">{t("cta")}</Link>
            </Button>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function LocaleSwitch({ locale, pathname }: { locale: string; pathname: string }) {
  return (
    <div className="flex gap-1 text-xs font-medium text-ink-soft">
      {(["fr", "en", "ar"] as const).map((l) => (
        <Link
          key={l}
          href={pathname || "/"}
          locale={l}
          className={`rounded-full px-2 py-1 ${locale === l ? "bg-white text-ink" : ""}`}
        >
          {l.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
