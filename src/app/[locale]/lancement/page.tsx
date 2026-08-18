import { brand, retentionDays } from "@/lib/brand";
import { processors, hostingRegion } from "@/lib/hosting";

export default function LaunchChecklistPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-[17px] leading-relaxed">
      <p className="text-xs uppercase tracking-wide text-clay">Non indexé · usage interne</p>
      <h1 className="mt-2 font-display text-4xl">Checklist propriétaire — lancement Maroc</h1>
      <p className="mt-6 text-ink-soft">
        Le logiciel peut être prêt. Inviter des clients payants exige des actes hors code. Cette page n’est pas une
        déclaration CNDP et ne signifie pas « nous sommes conformes ».
      </p>
      <h2 className="mt-10 font-display text-2xl">Technique (hôte)</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-ink-soft">
        <li>
          Domaine en HTTPS (Cloudflare) ; <code>NEXT_PUBLIC_APP_URL</code> et <code>AUTH_URL</code> identiques, https
          uniquement.
        </li>
        <li>App + Postgres en UE ({hostingRegion}).</li>
        <li>
          Bucket R2 privé, <code>STORAGE_DRIVER=s3</code> ; jamais de disque local en production.
        </li>
        <li>
          Cron quotidien vers <code>POST /api/cron/purge</code> avec <code>CRON_SECRET</code> (rétention {retentionDays}{" "}
          jours).
        </li>
        <li>
          Sauvegarde Postgres : <code>pg_dump</code> testé par un restore sur une instance jetable.
        </li>
        <li>
          Sentry : <code>SENTRY_DSN</code> pour paiements, upload, webhook, cron.
        </li>
      </ul>
      <h2 className="mt-10 font-display text-2xl">Paiement</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-ink-soft">
        <li>Compte Payzone : d’abord sandbox, puis identifiants live.</li>
        <li>Un paiement sandbox réel de {brand.name} à 49 MAD : webhook + statut + PDF débloqué.</li>
        <li>
          Production : <code>MIZANE_ENV=production</code>, <code>PAYZONE_SANDBOX</code> absent, marchand live. Staging :
          sandbox + URL publique HTTPS.
        </li>
      </ul>
      <h2 className="mt-10 font-display text-2xl">CNDP / Loi 09-08</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-ink-soft">
        <li>
          Déclaration (ou formalité applicable) du traitement auprès de la CNDP — à déposer par le responsable, pas par
          cette page.
        </li>
        <li>Autorisation si transfert du CV vers un LLM hors Maroc (OpenAI) ou si CIN / données sensibles.</li>
        <li>Registre interne : finalités, durées, sous-traitants ci-dessous, exercice des droits ({brand.privacyEmail}).</li>
      </ul>
      <h2 className="mt-10 font-display text-2xl">Sous-traitants à déclarer</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-ink-soft">
        {processors.map((p) => (
          <li key={p.name}>
            {p.name} — {p.role} ({p.region})
          </li>
        ))}
      </ul>
      <h2 className="mt-10 font-display text-2xl">SEO (sans promesse de classement)</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-ink-soft">
        <li>
          Search Console et Bing : coller <code>GOOGLE_SITE_VERIFICATION</code> / <code>BING_SITE_VERIFICATION</code>.
        </li>
        <li>
          IndexNow optionnel (<code>INDEXNOW_KEY</code>) — soumission ponctuelle, pas de spam.
        </li>
        <li>Google décide de l’indexation et du rang. Le code ne revendique pas la première place.</li>
      </ul>
    </div>
  );
}
