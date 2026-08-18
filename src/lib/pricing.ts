export const products = {
  analysis: {
    code: "ANALYSIS",
    priceMad: 49,
    compareAtMad: 79,
    includes: [
      "Analyse ATS complète",
      "Analyse détaillée des expériences",
      "Mots-clés détectés et manquants",
      "Corrections prioritaires",
      "Recommandations personnalisées",
      "Analyse du profil professionnel",
      "Rapport PDF",
    ],
  },
  optimized: {
    code: "OPTIMIZED_CV",
    priceMad: 99,
    compareAtMad: 149,
    includes: [
      "Tout le rapport d'analyse",
      "CV réécrit par IA",
      "Version ATS-friendly",
      "Résumé professionnel amélioré",
      "Expériences reformulées",
      "Optimisation des mots-clés",
      "Téléchargement du CV",
    ],
  },
  jobMatch: {
    code: "JOB_MATCH",
    priceMad: 29,
    compareAtMad: 49,
    includes: [
      "Score de correspondance",
      "Compétences alignées",
      "Mots-clés manquants",
      "Exigences non couvertes",
    ],
  },
} as const;

export type ProductCode = (typeof products)[keyof typeof products]["code"];

export function getProduct(code: string) {
  return Object.values(products).find((p) => p.code === code) ?? null;
}

export const pricingRationale = {
  analysisMad: 49,
  optimizedMad: 99,
  notes: [
    "Rédaction humaine de CV ATS au Maroc : 249–499 DH. Mizane reste 5× moins cher.",
    "Salaire médian privé ~3 400 DH : 49 DH = un achat impulsif, pas un abonnement.",
    "29 DH sous-positionne un outil de carrière. 79 DH seul freine trop les étudiants.",
    "Ancre 79 DH → 49 DH : valeur perçue professionnelle, friction de paiement faible.",
  ],
};
