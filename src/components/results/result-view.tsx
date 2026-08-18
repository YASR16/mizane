"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/routing";
import { ScoreRing } from "@/components/results/score-ring";
import { ScoreBars } from "@/components/results/score-bars";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { products } from "@/lib/pricing";
import { formatMad, scoreLabel } from "@/lib/utils";
import { Lock, ShieldAlert } from "lucide-react";
import { DeleteCvButton } from "@/components/account/delete-cv-button";

type Preview = {
  overall_score: number;
  verdict: string;
  ats_score: number;
  structure_score: number;
  keyword_score: number;
  experience_score: number;
  readability_score: number;
  professionalism_score: number;
  visual_score: number;
  job_match_score?: number;
  strengths: { title: string; problem: string }[];
  issues: { title: string; problem: string; why?: string }[];
  locked_items?: string[];
  is_scanned: boolean;
  ats_disclaimer: string;
};

export function ResultView({ id }: { id: string }) {
  const router = useRouter();
  const [data, setData] = useState<{
    preview: Preview;
    unlocked: boolean;
    lockedCount: number;
    lockedItems?: string[];
    documentName: string;
    paymentsEnabled?: boolean;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const res = await fetch(`/api/analyses/${id}`, { credentials: "include" });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Impossible de charger l’analyse.");
        return;
      }
      if (json.unlocked) {
        router.replace(`/rapport/${id}`);
        return;
      }
      setData(json);
      void fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "free_result_viewed", analysisId: id, path: `/resultats/${id}` }),
      });
      void fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "paywall_view", analysisId: id, path: `/resultats/${id}` }),
      });
    })();
  }, [id, router]);

  async function unlock() {
    setPaying(true);
    setPayError(null);
    await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "checkout_started", analysisId: id }),
    });
    const res = await fetch("/api/payments/initiate", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ analysisId: id, productCode: "ANALYSIS" }),
    });
    const json = await res.json();
    if (json.alreadyUnlocked) {
      router.push(`/rapport/${id}`);
      return;
    }
    if (json.code === "PAYMENTS_DISABLED") {
      setPayError("Paiement bientôt disponible");
      setPaying(false);
      return;
    }
    if (json.checkoutUrl) window.location.href = json.checkoutUrl;
    else {
      setPayError(json.error ?? "Impossible de démarrer le paiement.");
      setPaying(false);
    }
  }

  if (error) {
    return <p className="text-clay">{error}</p>;
  }
  if (!data) {
    return <p className="text-ink-soft">Chargement du diagnostic…</p>;
  }

  const p = data.preview;
  const lockedItems = data.lockedItems ?? p.locked_items ?? [];
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-ink-soft">{data.documentName}</p>
          <h1 className="mt-1 font-display text-4xl">Votre score CV</h1>
        </div>
        <DeleteCvButton analysisId={id} onDeleted={() => router.push("/")} />
      </div>
      <div className="mt-8 flex flex-col items-center">
        <ScoreRing score={p.overall_score} />
        <p className="mt-4 text-lg font-medium">{scoreLabel(p.overall_score)}</p>
        <p className="mt-1 max-w-md text-center text-ink-soft">{p.verdict}</p>
      </div>

      {p.is_scanned ? (
        <p className="mt-6 flex gap-2 rounded-xl bg-[#f8ebe6] px-4 py-3 text-sm text-clay">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          Votre CV semble être un document scanné. L’analyse peut être moins précise. Nous recommandons une version PDF contenant du texte sélectionnable.
        </p>
      ) : null}

      <Card className="mt-10 p-6">
        <h2 className="font-semibold">Scores</h2>
        <div className="mt-4">
          <ScoreBars
            items={[
              { label: "ATS", value: p.ats_score },
              { label: "Structure", value: p.structure_score },
              { label: "Keywords", value: p.keyword_score },
              { label: "Expérience", value: p.experience_score },
              { label: "Lisibilité", value: p.readability_score },
              { label: "Professionnalisme", value: p.professionalism_score },
            ]}
          />
        </div>
        <p className="mt-4 text-xs text-ink-soft">{p.ats_disclaimer}</p>
      </Card>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-semibold">✓ {p.strengths.length} points forts</h2>
          <ul className="mt-3 space-y-2 text-sm text-ink-soft">
            {p.strengths.map((s) => (
              <li key={s.title}>{s.title}</li>
            ))}
          </ul>
        </Card>
        <Card className="p-5">
          <h2 className="font-semibold">⚠ Problèmes détectés</h2>
          <ul className="mt-3 space-y-3 text-sm">
            {p.issues.map((s) => (
              <li key={s.title}>
                <p className="font-medium">{s.title}</p>
                <p className="text-ink-soft">{s.problem}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="mt-6 p-5">
        <h2 className="flex items-center gap-2 font-semibold">
          <Lock className="h-4 w-4" />
          Inclus dans le rapport complet
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-ink-soft">
          {lockedItems.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-ink-soft">
          L’aperçu ci-dessus est réel. Le rapport payant ajoute les réécritures, le plan priorisé, l’alignement poste et le PDF.
        </p>
      </Card>

      <Card className="mt-10 p-8 text-center">
        <h2 className="font-display text-3xl">Votre CV peut encore être amélioré.</h2>
        <p className="mx-auto mt-3 max-w-lg text-ink-soft">
          Nous avons identifié plusieurs opportunités d’amélioration. Débloquez le diagnostic complet pour savoir exactement quoi modifier.
        </p>
        <ul className="mx-auto mt-6 max-w-md space-y-2 text-left text-sm text-ink-soft">
          {products.analysis.includes.map((i) => (
            <li key={i}>✓ {i}</li>
          ))}
        </ul>
        {data.paymentsEnabled === false ? (
          <>
            <p className="mt-8 text-lg font-semibold">Paiement bientôt disponible</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
              L’aperçu ci-dessus est réel. Le rapport payant n’est pas encore ouvert au public. Aucun paiement n’est
              accepté pour le moment.
            </p>
          </>
        ) : (
          <>
            {payError ? <p className="mt-4 text-sm text-clay">{payError}</p> : null}
            <Button className="mt-8" size="lg" onClick={unlock} disabled={paying}>
              {paying ? "Redirection vers le paiement…" : `Débloquer mon rapport — ${formatMad(products.analysis.priceMad)}`}
            </Button>
            <p className="mt-3 text-xs text-ink-soft">Paiement unique • Aucun abonnement</p>
          </>
        )}
      </Card>
    </div>
  );
}
