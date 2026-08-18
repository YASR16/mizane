import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { brand } from "@/lib/brand";

export async function SiteFooter() {
  const t = await getTranslations("footer");
  return (
    <footer className="mt-24 border-t border-line bg-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-4">
        <div>
          <p className="font-display text-2xl">{brand.name}</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-soft">{t("blurb")}</p>
        </div>
        <div>
          <p className="text-sm font-semibold">{t("product")}</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-soft">
            <li>
              <Link href="/analyser">{t("analyze")}</Link>
            </li>
            <li>
              <Link href="/analyse-cv">Analyse CV</Link>
            </li>
            <li>
              <Link href="/cv-ats">CV ATS</Link>
            </li>
            <li>
              <Link href="/tarifs">{t("pricing")}</Link>
            </li>
            <li>
              <Link href="/comment-ca-marche">{t("how")}</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">{t("resources")}</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-soft">
            <li>
              <Link href="/blog">{t("blog")}</Link>
            </li>
            <li>
              <Link href="/faq">{t("faq")}</Link>
            </li>
            <li>
              <Link href="/a-propos">{t("about")}</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">{t("legal")}</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-soft">
            <li>
              <Link href="/confidentialite">{t("privacy")}</Link>
            </li>
            <li>
              <Link href="/conditions">{t("terms")}</Link>
            </li>
            <li>
              <a href={`mailto:${brand.privacyEmail}`}>{brand.privacyEmail}</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line py-5 text-center text-xs text-ink-soft">
        © {new Date().getFullYear()} {brand.name}. {t("rights")}
      </div>
    </footer>
  );
}
