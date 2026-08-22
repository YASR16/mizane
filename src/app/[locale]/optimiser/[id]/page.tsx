"use client";

import { use, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "@/i18n/routing";
import { products } from "@/lib/pricing";
import { formatMad } from "@/lib/utils";

export default function OptimizePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [role, setRole] = useState("");
  const [language, setLanguage] = useState("fr");
  const [country, setCountry] = useState("");
  const [jd, setJd] = useState("");
  const [locked, setLocked] = useState<boolean | null>(null);
  const [result, setResult] = useState<{
    summary?: string;
    experiences?: { title: string; bullets: string[] }[];
    skills?: string[];
    notes?: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paymentsEnabled, setPaymentsEnabled] = useState(true);

  useEffect(() => {
    void (async () => {
      const res = await fetch(`/api/analyses/${id}`, { credentials: "include" });
      const json = await res.json();
      if (!res.ok) {
        setLocked(true);
        setError(json.error ?? "Analyse introuvable.");
        return;
      }
      setLocked(!json.optimizerUnlocked);
      if (json.paymentsEnabled === false) setPaymentsEnabled(false);
      void fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "optimizer_viewed", analysisId: id, path: `/optimiser/${id}` }),
      });
      if (!json.optimizerUnlocked) {
        void fetch("/api/analytics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "paywall_view", analysisId: id, path: `/optimiser/${id}` }),
        });
      }
      if (json.targetRole) setRole(json.targetRole);
    })();
  }, [id]);

  async function payOptimizer() {
    setPaying(true);
    const res = await fetch("/api/payments/initiate", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ analysisId: id, productCode: "OPTIMIZED_CV" }),
    });
    const json = await res.json();
    if (json.alreadyUnlocked) {
      setLocked(false);
      setPaying(false);
      return;
    }
    if (json.checkoutUrl) window.location.href = json.checkoutUrl;
    else setPaying(false);
  }

  async function run() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/optimize", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ analysisId: id, targetRole: role, language, targetCountry: country, jobDescription: jd }),
    });
    const json = await res.json();
    setBusy(false);
    if (res.status === 402) {
      setLocked(true);
      setError(json.error);
      return;
    }
    if (!res.ok) {
      setError(json.error ?? "Optimisation impossible");
      return;
    }
    setResult(json.content);
  }

  if (locked === null) {
    return <p className="px-4 py-16 text-center text-ink-soft">Chargement…</p>;
  }

  if (locked) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-display text-3xl">CV Optimisé</h1>
        <p className="mt-3 text-ink-soft">
          L’analyse payante ne débloque pas le CV optimisé. Ce produit est séparé ({formatMad(products.optimized.priceMad)}).
        </p>
        {error ? <p className="mt-3 text-sm text-clay">{error}</p> : null}
        {paymentsEnabled ? (
          <Button className="mt-6" onClick={payOptimizer} disabled={paying}>
            {paying ? "Redirection…" : `Débloquer le CV optimisé — ${formatMad(products.optimized.priceMad)}`}
          </Button>
        ) : (
          <p className="mt-6 font-semibold">Paiement bientôt disponible</p>
        )}
        <p className="mt-4">
          <Link href={`/rapport/${id}`} className="text-sm text-cedar">
            Retour au rapport
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-display text-4xl">Optimisez automatiquement votre CV</h1>
      <p className="mt-3 max-w-2xl text-ink-soft">
        Nous reformulons à partir de votre document. Aucune expérience, diplôme ou compétence n’est inventé.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium">
          Intitulé de poste
          <input value={role} onChange={(e) => setRole(e.target.value)} className="mt-1 w-full rounded-xl border border-line px-3 py-2.5" />
        </label>
        <label className="text-sm font-medium">
          Langue
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className="mt-1 w-full rounded-xl border border-line px-3 py-2.5">
            <option value="fr">Français</option>
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </select>
        </label>
        <label className="text-sm font-medium">
          Pays cible
          <select value={country} onChange={(e) => setCountry(e.target.value)} className="mt-1 w-full rounded-xl border border-line px-3 py-2.5">
            <option value="">Non précisé</option>
            <option value="MA">Maroc</option>
            <option value="FR">France</option>
            <option value="GB">United Kingdom</option>
            <option value="CA">Canada</option>
            <option value="AE">UAE / Gulf</option>
          </select>
        </label>
      </div>
      <label className="mt-4 block text-sm font-medium">
        Offre d’emploi (optionnel)
        <textarea value={jd} onChange={(e) => setJd(e.target.value)} rows={6} className="mt-1 w-full rounded-xl border border-line px-3 py-2.5" />
      </label>
      {error ? <p className="mt-4 text-sm text-clay">{error}</p> : null}
      <Button className="mt-6" onClick={run} disabled={busy}>
        {busy ? "Génération…" : "Générer la version optimisée"}
      </Button>

      {result ? (
        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <Card className="p-6">
            <p className="text-xs uppercase text-ink-soft">Original</p>
            <p className="mt-3 text-sm text-ink-soft">Votre fichier source reste la référence des faits.</p>
            <Link href={`/rapport/${id}`} className="mt-3 inline-block text-sm text-cedar">
              Revoir le diagnostic
            </Link>
          </Card>
          <Card className="p-6">
            <p className="text-xs uppercase text-cedar">Version optimisée</p>
            <h2 className="mt-3 font-semibold">Résumé</h2>
            <p className="mt-2 text-sm leading-relaxed">{result.summary}</p>
            {result.experiences?.map((e) => (
              <div key={e.title} className="mt-4">
                <h3 className="font-medium">{e.title}</h3>
                <ul className="mt-2 list-disc pl-5 text-sm text-ink-soft">
                  {e.bullets?.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
            {result.skills?.length ? (
              <p className="mt-4 text-sm">Compétences : {result.skills.join(" · ")}</p>
            ) : null}
          </Card>
        </div>
      ) : null}
    </div>
  );
}
