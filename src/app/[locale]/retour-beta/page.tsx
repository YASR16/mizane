"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function BetaFeedbackPage() {
  const [rating, setRating] = useState(4);
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [scenario, setScenario] = useState("analyse");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, message, contact: contact || undefined, scenario }),
    });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(json.error ?? "Envoi impossible.");
      return;
    }
    setDone(true);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="font-display text-4xl">Retour bêta</h1>
      <p className="mt-3 text-sm text-ink-soft">
        Merci de tester Mizane. Ne joignez pas de CV ici — décrivez seulement votre expérience. Pas de données de
        paiement (le paiement est désactivé).
      </p>
      {done ? (
        <Card className="mt-8 p-6 text-sm text-ink-soft">Message envoyé. Merci — on lit chaque retour.</Card>
      ) : (
        <Card className="mt-8 p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block text-sm font-medium">
              Note globale (1–5)
              <input
                type="number"
                min={1}
                max={5}
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-line px-3 py-2.5"
              />
            </label>
            <label className="block text-sm font-medium">
              Scénario
              <select
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                className="mt-1 w-full rounded-xl border border-line px-3 py-2.5"
              >
                <option value="analyse">Analyse CV</option>
                <option value="inscription">Inscription</option>
                <option value="mobile">Mobile</option>
                <option value="paywall">Compréhension 49 / 99 DH</option>
                <option value="bug">Bug</option>
              </select>
            </label>
            <label className="block text-sm font-medium">
              Votre retour
              <textarea
                required
                minLength={8}
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-1 w-full rounded-xl border border-line px-3 py-2.5"
                placeholder="Ce qui était clair, ce qui bloquait, idée d’amélioration…"
              />
            </label>
            <label className="block text-sm font-medium">
              E-mail (optionnel, pour vous répondre)
              <input
                type="email"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="mt-1 w-full rounded-xl border border-line px-3 py-2.5"
              />
            </label>
            {error ? <p className="text-sm text-clay">{error}</p> : null}
            <Button className="w-full" type="submit" disabled={busy}>
              {busy ? "Envoi…" : "Envoyer mon retour"}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
