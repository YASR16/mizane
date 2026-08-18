import { brand } from "@/lib/brand";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "À propos de Mizane",
  description:
    "Mizane pèse un CV avant l’envoi : diagnostic ATS et structure pour le marché marocain, en dirhams, sans générateur décoratif.",
  path: "/a-propos",
});

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="font-display text-4xl">À propos de {brand.name}</h1>
      <p className="mt-6 text-lg leading-relaxed text-ink-soft">
        Mizane signifie la balance. L’idée est simple : peser un CV avant de l’envoyer, comme on vérifie un dossier avant un
        entretien.
      </p>
      <p className="mt-4 leading-relaxed text-ink-soft">
        Le produit est conçu pour le Maroc d’abord — français, dirhams, codes locaux, ATS des grands comptes et des
        plateformes — puis pour les candidatures francophones et internationales. Ce n’est pas un générateur de CV décoratif.
        C’est un diagnostic : score, problèmes réels, plan d’action.
      </p>
    </div>
  );
}
