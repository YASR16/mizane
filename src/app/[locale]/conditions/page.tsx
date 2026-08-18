import { brand } from "@/lib/brand";
import { products } from "@/lib/pricing";
import { hostingRegion } from "@/lib/hosting";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Conditions d’utilisation",
  description: "Conditions d’utilisation de Mizane : diagnostic CV, paiements en MAD, contenu généré, usage acceptable.",
  path: "/conditions",
});

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-[17px] leading-relaxed text-ink-soft">
      <h1 className="font-display text-4xl text-ink">Conditions d’utilisation</h1>
      <p className="mt-6">
        {brand.name} fournit un outil d’aide à la relecture de CV. Ce n’est pas un cabinet de recrutement, ni une garantie
        d’entretien, ni la simulation certifiée d’un ATS d’entreprise.
      </p>
      <h2 className="mt-10 font-display text-2xl text-ink">Hébergement</h2>
      <p className="mt-3">{hostingRegion}. Les fichiers déposés restent privés.</p>
      <h2 className="mt-10 font-display text-2xl text-ink">Paiement</h2>
      <p className="mt-3">
        L’aperçu est gratuit. L’analyse complète coûte {products.analysis.priceMad} DH, paiement unique, sans abonnement. Le
        CV optimisé coûte {products.optimized.priceMad} DH (produit distinct). Le paiement est en MAD via une page Payzone
        hébergée (3-D Secure). Le rapport n’est débloqué qu’après vérification serveur du paiement (webhook et/ou statut
        marchand). Les montants, la commande et le produit sont contrôlés côté serveur.
      </p>
      <h2 className="mt-10 font-display text-2xl text-ink">Contenu généré</h2>
      <p className="mt-3">
        Les recommandations et réécritures sont des suggestions. Vous restez responsable de l’exactitude des informations
        envoyées aux employeurs. N’ajoutez pas de résultats que vous ne pouvez pas justifier.
      </p>
      <h2 className="mt-10 font-display text-2xl text-ink">Usage acceptable</h2>
      <p className="mt-3">
        Pas d’upload de fichiers malveillants, pas de tentative de contourner le paiement ou d’accéder aux analyses d’autrui.
        Le contenu des CV est traité comme une entrée non fiable vis-à-vis de l’IA.
      </p>
      <h2 className="mt-10 font-display text-2xl text-ink">Conservation</h2>
      <p className="mt-3">
        Les CV sont programmés pour suppression après 30 jours, sauf suppression anticipée par vos soins. Détail : page
        Confidentialité.
      </p>
    </div>
  );
}
