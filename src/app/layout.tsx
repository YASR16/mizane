import type { Metadata } from "next";
import { ReactNode } from "react";
import "./globals.css";
import { publicAppUrl } from "@/lib/app-url";

export const metadata: Metadata = {
  metadataBase: new URL(publicAppUrl()),
  title: {
    default: "Mizane — Analyse CV et score ATS au Maroc",
    template: "%s · Mizane",
  },
  description:
    "Analysez votre CV avant de l'envoyer. Score ATS, structure, mots-clés et recommandations concrètes pour le marché marocain.",
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
