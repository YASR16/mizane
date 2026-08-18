"use client";

import { use, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScoreRing } from "@/components/results/score-ring";

export default function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [jd, setJd] = useState("");
  const [result, setResult] = useState<{
    score: number;
    matchingSkills: string[];
    missingKeywords: string[];
    missingRequirements: string[];
    unlocked: boolean;
  } | null>(null);
  const [busy, setBusy] = useState(false);

  async function run() {
    setBusy(true);
    const res = await fetch("/api/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ analysisId: id, jobDescription: jd }),
    });
    setResult(await res.json());
    setBusy(false);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-4xl">Votre CV correspond-il à cette offre ?</h1>
      <p className="mt-3 text-ink-soft">Collez l’annonce. Nous calculons un score de correspondance — pas une promesse d’entretien.</p>
      <textarea
        value={jd}
        onChange={(e) => setJd(e.target.value)}
        rows={10}
        className="mt-6 w-full rounded-2xl border border-line p-4 text-sm"
        placeholder="Collez ici l’offre d’emploi…"
      />
      <Button className="mt-4" onClick={run} disabled={busy || jd.length < 40}>
        Calculer le match
      </Button>
      {result?.score !== undefined ? (
        <Card className="mt-8 p-6">
          <div className="flex items-center gap-6">
            <ScoreRing score={result.score} size={128} />
            <div>
              <p className="font-display text-2xl">Match Score</p>
              <p className="text-sm text-ink-soft">Basé sur les mots-clés et exigences extraits de l’offre.</p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <p className="font-medium">✓ Compétences alignées</p>
              <p className="mt-2 text-sm text-ink-soft">{result.matchingSkills.slice(0, 18).join(", ") || "—"}</p>
            </div>
            <div>
              <p className="font-medium">⚠ Mots-clés manquants</p>
              <p className="mt-2 text-sm text-ink-soft">{result.missingKeywords.join(", ") || "—"}</p>
            </div>
          </div>
          {!result.unlocked ? (
            <p className="mt-4 text-sm text-ink-soft">Le détail des exigences non couvertes est dans le rapport complet.</p>
          ) : (
            <p className="mt-4 text-sm">Exigences insuffisamment démontrées : {result.missingRequirements.join(", ") || "—"}</p>
          )}
        </Card>
      ) : null}
    </div>
  );
}
