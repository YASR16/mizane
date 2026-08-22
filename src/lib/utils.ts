import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMad(amount: number, locale = "fr-MA") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function scoreLabel(score: number, locale: string = "fr") {
  const bands =
    locale === "en"
      ? [
          [85, "Strong CV"],
          [70, "Good potential"],
          [55, "Needs work"],
          [0, "Significant gaps"],
        ]
      : locale === "ar"
        ? [
            [85, "سيرة ذاتية قوية"],
            [70, "إمكانيات جيدة"],
            [55, "يحتاج إلى تحسين"],
            [0, "ثغرات مهمة"],
          ]
        : [
            [85, "CV solide"],
            [70, "Bon potentiel"],
            [55, "À améliorer"],
            [0, "Lacunes importantes"],
          ];

  for (const [min, label] of bands) {
    if (score >= Number(min)) return String(label);
  }
  return String(bands[bands.length - 1][1]);
}

export function bulletQualityLabel(quality: string, locale: string = "fr") {
  const map: Record<string, Record<string, string>> = {
    fr: { weak: "Faible", average: "Moyen", strong: "Fort" },
    en: { weak: "Weak", average: "Average", strong: "Strong" },
    ar: { weak: "ضعيف", average: "متوسط", strong: "قوي" },
  };
  return (map[locale] ?? map.fr)[quality] ?? quality;
}

export function paywallHeadline(score: number, locale: string = "fr") {
  if (locale === "en") {
    if (score >= 85) return "A strong base — unlock the full action plan.";
    if (score >= 70) return "Good potential — see exactly what to fix next.";
    if (score >= 55) return "Clear gaps — unlock the prioritised diagnosis.";
    return "Significant gaps — unlock concrete rewrites.";
  }
  if (locale === "ar") {
    if (score >= 85) return "أساس قوي — افتح خطة العمل الكاملة.";
    if (score >= 70) return "إمكانيات جيدة — اعرف ماذا تصلّح بالضبط.";
    if (score >= 55) return "ثغرات واضحة — افتح التشخيص حسب الأولوية.";
    return "ثغرات مهمة — افتح إعادة الصياغة الملموسة.";
  }
  if (score >= 85) return "Base solide — débloquez le plan d’action complet.";
  if (score >= 70) return "Bon potentiel — voyez exactement quoi corriger.";
  if (score >= 55) return "Des écarts clairs — débloquez le diagnostic priorisé.";
  return "Des lacunes importantes — débloquez des réécritures concrètes.";
}

export function clampScore(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function initials(name?: string | null) {
  if (!name) return "M";
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}
