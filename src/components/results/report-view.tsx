"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { ScoreRing } from "@/components/results/score-ring";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatMad } from "@/lib/utils";
import { products } from "@/lib/pricing";
import type { AnalysisResult, Finding } from "@/lib/analysis/schema";
import { DeleteCvButton } from "@/components/account/delete-cv-button";

export function ReportView({ id }: { id: string }) {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    void (async () => {
      const res = await fetch(`/api/analyses/${id}`, { credentials: "include" });
      const json = await res.json();
      if (!json.unlocked || !json.report) {
        setBlocked(true);
        return;
      }
      setResult(json.report);
    })();
  }, [id]);

  if (blocked) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-display text-3xl">Rapport verrouillé</h1>
        <p className="mt-3 text-ink-soft">Débloquez l’analyse complète pour accéder à ce rapport.</p>
        <Button className="mt-6" asChild>
          <Link href={`/resultats/${id}`}>Retour à l’aperçu</Link>
        </Button>
      </div>
    );
  }
  if (!result) return <p className="px-4 py-16 text-center text-ink-soft">Préparation du rapport…</p>;

  const sections: { title: string; score?: number; body: React.ReactNode }[] = [
    {
      title: "1. ATS",
      score: result.ats_score,
      body: (
        <>
          <p className="text-sm text-ink-soft">{result.ats.disclaimer}</p>
          <List title="Favorable" items={result.ats.favorable} />
          <List title="À surveiller" items={result.ats.unfavorable} />
        </>
      ),
    },
    {
      title: "2. Structure",
      score: result.structure_score,
      body: (
        <>
          <p className="text-sm">Sections présentes : {result.sections.present.join(", ") || "—"}</p>
          <p className="mt-2 text-sm text-ink-soft">Manquantes : {result.sections.missing.join(", ") || "aucune"}</p>
        </>
      ),
    },
    {
      title: "3. Expérience professionnelle",
      score: result.experience_score,
      body: result.experiences.map((exp) => (
        <div key={exp.title} className="mt-3">
          <p className="font-medium">{exp.title}</p>
          <ul className="mt-2 space-y-2 text-sm">
            {exp.bullets.map((b) => (
              <li key={b.original} className="rounded-lg bg-paper-2 p-3">
                <p>{b.original}</p>
                <p className="mt-1 text-xs uppercase text-ink-soft">{b.quality}</p>
                {b.suggestion ? <p className="mt-1 text-ink-soft">{b.suggestion}</p> : null}
              </li>
            ))}
          </ul>
        </div>
      )),
    },
    {
      title: "4. Compétences",
      body: (
        <>
          <p className="text-sm">Techniques : {result.skills.technical.join(", ") || "peu détectées"}</p>
          <p className="mt-2 text-sm text-ink-soft">Manquantes pour le poste : {result.skills.missing_for_role.join(", ") || "—"}</p>
        </>
      ),
    },
    {
      title: "5. Keywords",
      score: result.keyword_score,
      body: (
        <>
          <p className="text-sm">Détectés : {result.detected_keywords.join(", ") || "—"}</p>
          <p className="mt-2 text-sm text-ink-soft">Manquants : {result.missing_keywords.join(", ") || "—"}</p>
        </>
      ),
    },
    {
      title: "6. Profil professionnel",
      body: (
        <>
          <p className="text-sm">{result.summary?.assessment}</p>
          {result.summary?.improved_example ? (
            <p className="mt-3 rounded-xl bg-cedar-light p-3 text-sm">{result.summary.improved_example}</p>
          ) : null}
        </>
      ),
    },
    {
      title: "7. Formation",
      body: <List items={result.education.notes} />,
    },
    {
      title: "8. Langues",
      body: (
        <>
          <p className="text-sm">Détecté : {result.languages.detected.join(", ") || "—"}</p>
          <List items={result.languages.notes} />
        </>
      ),
    },
    {
      title: "9. Présentation",
      score: result.visual_score,
      body: <List items={result.visual.notes} />,
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-sm text-cedar">Rapport complet</p>
      <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-4xl">Score global</h1>
        <DeleteCvButton analysisId={id} />
      </div>
      <div className="mt-6 flex items-center gap-6">
        <ScoreRing score={result.overall_score} size={140} />
        <p className="max-w-sm text-ink-soft">{result.verdict}</p>
      </div>

      <section className="mt-12">
        <h2 className="font-display text-3xl">Les 5 changements les plus importants</h2>
        <div className="mt-6 space-y-4">
          {result.priorities.map((p, i) => (
            <PriorityCard key={p.id ?? i} finding={p} index={i} />
          ))}
        </div>
      </section>

      <div className="mt-12 space-y-6">
        {sections.map((s) => (
          <Card key={s.title} className="p-6">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-display text-2xl">{s.title}</h2>
              {s.score !== undefined ? <p className="tabular-nums text-ink-soft">{s.score}/100</p> : null}
            </div>
            <div className="mt-4">{s.body}</div>
          </Card>
        ))}
      </div>

      <Card className="mt-10 p-8">
        <h2 className="font-display text-2xl">Optimisez maintenant votre CV pour ce poste</h2>
        <p className="mt-2 text-sm text-ink-soft">
          Version ATS-friendly, résumé et expériences reformulés — {formatMad(products.optimized.priceMad)}, paiement unique.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <a href={`/api/analyses/${id}/pdf`}>Télécharger le PDF</a>
          </Button>
          <Button asChild>
            <Link href={`/optimiser/${id}`}>Optimiser mon CV</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href={`/matching/${id}`}>Comparer avec une offre</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}

function List({ title, items }: { title?: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="mt-3">
      {title ? <p className="text-sm font-medium">{title}</p> : null}
      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-ink-soft">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  );
}

function PriorityCard({ finding, index }: { finding: Finding; index: number }) {
  const label = index === 0 ? "Très importante" : index === 1 ? "Importante" : "Moyenne";
  return (
    <Card className="p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-cedar">
        Priorité {index + 1} — {label}
      </p>
      <h3 className="mt-2 font-semibold">{finding.title}</h3>
      <p className="mt-2 text-sm">
        <span className="font-medium">Problème. </span>
        {finding.problem}
      </p>
      <p className="mt-2 text-sm text-ink-soft">
        <span className="font-medium text-ink">Pourquoi. </span>
        {finding.why}
      </p>
      <p className="mt-2 text-sm text-ink-soft">
        <span className="font-medium text-ink">Recommandation. </span>
        {finding.how}
      </p>
      {finding.exampleBefore || finding.exampleAfter ? (
        <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
          {finding.exampleBefore ? (
            <div className="rounded-lg bg-paper-2 p-3">
              <p className="text-xs uppercase text-clay">Avant</p>
              <p className="mt-1">{finding.exampleBefore}</p>
            </div>
          ) : null}
          {finding.exampleAfter ? (
            <div className="rounded-lg bg-cedar-light p-3">
              <p className="text-xs uppercase text-cedar">Après</p>
              <p className="mt-1">{finding.exampleAfter}</p>
            </div>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}
