"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

type Stats = {
  kpis: {
    users: number;
    cvAnalyzed: number;
    conversionRate: number;
    revenueMad: number;
    averageOrderValue: number;
    aiCostUsd: number;
    profitPerAnalysisMad: number;
    freeAnalyses: number;
    paidAnalyses: number;
    averageCvScore: number;
  };
  funnel: { name: string; _count: number }[];
  popularRoles: [string, number][];
  languages: [string, number][];
};

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  useEffect(() => {
    void fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats);
  }, []);
  if (!stats?.kpis) return <p className="px-4 py-16">Chargement…</p>;
  const k = stats.kpis;
  const cards = [
    ["Utilisateurs", k.users],
    ["CV analysés", k.cvAnalyzed],
    ["Conversion", `${k.conversionRate}%`],
    ["Revenu", `${k.revenueMad} DH`],
    ["Panier moyen", `${k.averageOrderValue} DH`],
    ["Coût IA / analyse", `$${k.aiCostUsd}`],
    ["Analyses gratuites", k.freeAnalyses],
    ["Analyses payantes", k.paidAnalyses],
    ["Score moyen", k.averageCvScore],
  ];
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-4xl">Pilotage</h1>
      <p className="mt-2 text-ink-soft">Données réelles uniquement. Aucune statistique inventée.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(([label, value]) => (
          <Card key={String(label)} className="p-5">
            <p className="text-sm text-ink-soft">{label}</p>
            <p className="mt-1 font-display text-3xl">{value}</p>
          </Card>
        ))}
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-semibold">Entonnoir</h2>
          <ul className="mt-3 space-y-1 text-sm text-ink-soft">
            {stats.funnel.map((e) => (
              <li key={e.name}>
                {e.name}: {e._count}
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-5">
          <h2 className="font-semibold">Postes visés</h2>
          <ul className="mt-3 space-y-1 text-sm text-ink-soft">
            {stats.popularRoles.map(([role, n]) => (
              <li key={role}>
                {role}: {n}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
