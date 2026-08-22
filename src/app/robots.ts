import { MetadataRoute } from "next";
import { publicAppUrl } from "@/lib/app-url";

export default function robots(): MetadataRoute.Robots {
  const base = publicAppUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard",
          "/admin",
          "/rapport/",
          "/resultats/",
          "/optimiser/",
          "/paiement/",
          "/connexion",
          "/inscription",
          "/retour-beta",
          "/storage/",
          "/en/dashboard",
          "/en/admin",
          "/en/rapport/",
          "/en/resultats/",
          "/en/optimiser/",
          "/en/paiement/",
          "/en/connexion",
          "/en/inscription",
          "/en/retour-beta",
          "/ar/dashboard",
          "/ar/admin",
          "/ar/rapport/",
          "/ar/resultats/",
          "/ar/optimiser/",
          "/ar/paiement/",
          "/ar/connexion",
          "/ar/inscription",
          "/ar/retour-beta",
          "/lancement",
          "/en/lancement",
          "/ar/lancement",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
