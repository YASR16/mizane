import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="font-display text-4xl">Page introuvable</h1>
      <p className="mt-3 text-ink-soft">Ce lien n’existe pas — ou le document a été supprimé.</p>
      <Button className="mt-8" asChild>
        <Link href="/">Retour à l’accueil</Link>
      </Button>
    </div>
  );
}
