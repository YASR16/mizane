export const hostingRegion =
  "Union européenne (bêta gratuite : Koyeb Francfort + Neon UE ; production prévue : Fly.io Paris)";

export const processors = [
  {
    name: "Koyeb (Francfort, instance Free) ou Fly.io (Paris) selon l’environnement",
    role: "Hébergement de l’application Next.js",
    region: "UE",
  },
  {
    name: "PostgreSQL managé (Neon Free en bêta, ou Postgres du même hôte en production)",
    role: "Comptes, analyses, paiements (métadonnées). En bêta, fichiers CV possibles en BYTEA privé.",
    region: "UE",
  },
  {
    name: "Cloudflare R2 (bucket privé) — optionnel en bêta",
    role: "Stockage objet des CV. Sinon binaire privé en base. Jamais d’URL publique.",
    region: "UE",
  },
  {
    name: "Cloudflare (DNS / HTTPS) — quand un domaine est branché",
    role: "Certificat TLS, redirection HTTP → HTTPS",
    region: "Réseau Cloudflare",
  },
  {
    name: "Payzone",
    role: "Paiement MAD (sandbox puis live). Désactivé en bêta publique (« Paiement bientôt disponible »).",
    region: "Maroc",
  },
  {
    name: "OpenAI (uniquement si une clé API est configurée)",
    role: "Enrichissement optionnel. Non utilisé tant qu’aucune clé n’est fournie.",
    region: "Hors Maroc / hors UE possible",
  },
] as const;
