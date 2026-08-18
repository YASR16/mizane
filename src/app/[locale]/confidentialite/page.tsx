import { brand, retentionDays } from "@/lib/brand";
import { hostingRegion, processors } from "@/lib/hosting";
import { pageMetadata } from "@/lib/seo";
import { Link } from "@/i18n/routing";

export const metadata = pageMetadata({
  title: "Confidentialité — CV privés, conservation 30 jours",
  description:
    "Comment Mizane traite les CV : hébergement UE, stockage privé, Payzone, conservation 30 jours, suppression, Loi 09-08 / CNDP. Ce n’est pas un certificat de conformité.",
  path: "/confidentialite",
});

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-[17px] leading-relaxed">
      <h1 className="font-display text-4xl">Votre CV reste privé.</h1>
      <p className="mt-6 text-ink-soft">
        Un CV contient des données personnelles. {brand.name} les traite uniquement pour fournir le diagnostic demandé. Cette
        page décrit le traitement tel qu’il est implémenté dans le produit. Elle n’est pas une attestation CNDP ni un avis
        juridique.
      </p>

      <h2 className="mt-10 font-display text-2xl">Responsable et finalité</h2>
      <p className="mt-3 text-ink-soft">
        Responsable : {brand.legalName} ({brand.email}). Finalité : extraire le texte du fichier, analyser la structure,
        scorer, recommander, et — si vous payez — délivrer un rapport ou une version optimisée. Pas de revente de profils,
        pas d’indexation publique, pas d’URL permanente de CV.
      </p>

      <h2 className="mt-10 font-display text-2xl">Hébergement</h2>
      <p className="mt-3 text-ink-soft">
        {hostingRegion}. Les fichiers CV ne sont pas servis comme des pages publiques. En bêta gratuite, le fichier peut
        être stocké en binaire privé dans Postgres (même base UE) jusqu’à la connexion d’un bucket R2. Aucune URL publique
        de CV n’est créée dans les deux cas.
      </p>

      <h2 className="mt-10 font-display text-2xl">Sous-traitants</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-ink-soft">
        {processors.map((p) => (
          <li key={p.name}>
            <span className="font-medium text-ink">{p.name}</span> — {p.role} ({p.region}).
          </li>
        ))}
      </ul>

      <h2 className="mt-10 font-display text-2xl">Durée de conservation</h2>
      <p className="mt-3 text-ink-soft">
        Fichiers, texte extrait et JSON d’analyse associé : suppression automatique après {retentionDays} jours (tâche{" "}
        <code className="text-sm">POST /api/cron/purge</code>
        ). Vous pouvez supprimer plus tôt depuis le tableau de bord (« Supprimer mon CV ») ou en écrivant à{" "}
        {brand.privacyEmail}. Le paiement (identifiant de commande, montant, statut) peut être conservé plus longtemps pour
        la comptabilité et la lutte contre la fraude.
      </p>

      <h2 className="mt-10 font-display text-2xl">Cookies et mesures</h2>
      <p className="mt-3 text-ink-soft">
        Cookie de session (compte) et cookie invité technique pour rattacher une analyse avant inscription. Pas de cookie
        publicitaire. Les événements de funnel (visite, upload, paywall, paiement) sont enregistrés côté serveur sans le
        texte du CV.
      </p>

      <h2 className="mt-10 font-display text-2xl">Vos droits (Loi 09-08)</h2>
      <p className="mt-3 text-ink-soft">
        Accès, rectification, suppression, opposition. Pour exercer un droit : {brand.privacyEmail}. La déclaration ou
        l’autorisation CNDP est une obligation du responsable de traitement ; elle n’est pas « faite par le code ». Voir la{" "}
        <Link href="/lancement" className="text-cedar">
          checklist propriétaire
        </Link>{" "}
        (page non indexée).
      </p>
      <p className="mt-8 text-sm text-ink-soft">Contact : {brand.privacyEmail}</p>
    </div>
  );
}
