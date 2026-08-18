import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { redirect } from "next/navigation";
import { DeleteCvButton } from "@/components/account/delete-cv-button";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  const analyses = await prisma.analysis.findMany({
    where: { userId: session.user.id, status: "COMPLETED" },
    include: { document: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl">Mes CV</h1>
          <p className="mt-2 text-ink-soft">Plusieurs versions, un diagnostic par fichier. Conservation 30 jours, suppression possible à tout moment.</p>
        </div>
        <Button asChild>
          <Link href="/analyser">Analyser un nouveau CV</Link>
        </Button>
      </div>
      <div className="mt-8 grid gap-4">
        {analyses.length === 0 ? (
          <Card className="p-8 text-ink-soft">Aucune analyse pour l’instant.</Card>
        ) : (
          analyses.map((a) => (
            <Card key={a.id} className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-medium">{a.document.deletedAt ? "CV supprimé" : a.document.originalName}</p>
                <p className="text-sm text-ink-soft">
                  {a.overallScore ?? "—"}/100 · {a.targetRole || "Poste non précisé"} ·{" "}
                  {a.createdAt.toLocaleDateString("fr-MA")}
                  {a.reportUnlocked ? " · Rapport débloqué" : ""}
                  {a.optimizerUnlocked ? " · CV optimisé débloqué" : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" asChild>
                  <Link href={a.reportUnlocked ? `/rapport/${a.id}` : `/resultats/${a.id}`}>Voir analyse</Link>
                </Button>
                {a.optimizerUnlocked ? (
                  <Button size="sm" variant="secondary" asChild>
                    <Link href={`/optimiser/${a.id}`}>Optimiser</Link>
                  </Button>
                ) : (
                  <Button size="sm" variant="secondary" asChild>
                    <Link href={`/optimiser/${a.id}`}>CV optimisé (99 DH)</Link>
                  </Button>
                )}
                {!a.document.deletedAt ? <DeleteCvButton analysisId={a.id} /> : null}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
