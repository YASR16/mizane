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
