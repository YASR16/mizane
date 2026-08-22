import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Comment ça marche — analyse CV Mizane",
  description:
    "Upload PDF/DOCX, extraction réelle, analyse structurée, aperçu gratuit, rapport 49 DH après paiement vérifié.",
  path: "/comment-ca-marche",
});

export default function HowPage() {
  const steps = [
    ["Déposez", "PDF ou DOCX. Ajoutez le poste visé ou une offre si vous l’avez."],
    ["Extraction réelle", "Nous lisons le fichier. Un scan image est signalé, pas maquillé."],
    ["Analyse structurée", "Contact, structure, ATS, mots-clés, expériences, langues. Résultat JSON, pas un paragraphe vague."],
    ["Aperçu gratuit", "Score + 2 forces + 2 problèmes. Assez pour juger si l’outil a vu juste."],
    ["Rapport", "Si vous débloquez : priorités, exemples avant/après, PDF. Paiement unique."],
  ];
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="font-display text-4xl">Comment ça marche</h1>
      <ol className="mt-10 space-y-8">
        {steps.map(([t, b], i) => (
          <li key={t}>
            <p className="font-display text-2xl text-cedar">{String(i + 1).padStart(2, "0")}</p>
            <h2 className="mt-1 font-semibold">{t}</h2>
            <p className="mt-1 text-ink-soft">{b}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
