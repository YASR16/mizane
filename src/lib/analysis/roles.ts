export type RoleFamily =
  | "qa"
  | "developer"
  | "data"
  | "finance"
  | "marketing"
  | "sales"
  | "hr"
  | "management"
  | "student"
  | "generic";

export const ROLE_PACKS: Record<
  RoleFamily,
  { keywords: string[]; exampleBefore: string; exampleAfter: string; summary: string }
> = {
  qa: {
    keywords: [
      "qa",
      "test",
      "testing",
      "automatisation",
      "automation",
      "playwright",
      "cypress",
      "selenium",
      "postman",
      "junit",
      "api",
      "régression",
      "regression",
      "qualité",
      "testrail",
      "jira",
      "ci",
      "sdet",
    ],
    exampleBefore: "Tests des applications web.",
    exampleAfter:
      "Automatisé 80 scénarios de régression Playwright/TypeScript, réduisant d’environ 40 % le temps de régression manuelle.",
    summary:
      "Profil QA avec couverture UI/API, portes qualité CI et preuves mesurables de réduction des défauts.",
  },
  developer: {
    keywords: [
      "javascript",
      "typescript",
      "react",
      "node",
      "java",
      "spring",
      "api",
      "git",
      "sql",
      "docker",
      "postgresql",
      "nestjs",
      "microservices",
      "ci/cd",
    ],
    exampleBefore: "Développement d’applications web.",
    exampleAfter:
      "Livré un parcours checkout React/TypeScript utilisé par 12k utilisateurs/mois, réduisant les erreurs de paiement de 18 %.",
    summary:
      "Ingénieur logiciel orienté APIs fiables et livraison front, avec impact produit mesurable.",
  },
  data: {
    keywords: [
      "sql",
      "python",
      "excel",
      "power bi",
      "tableau",
      "etl",
      "dashboard",
      "kpi",
      "statistiques",
      "pandas",
      "reporting",
    ],
    exampleBefore: "Création de rapports pour la direction.",
    exampleAfter:
      "Construit des tableaux Power BI suivant 12 KPI opérationnels, réduisant d’environ 30 % le temps de reporting hebdomadaire.",
    summary:
      "Analyste data transformant les données opérationnelles en décisions via SQL, Python et dashboards.",
  },
  finance: {
    keywords: [
      "ifrs",
      "excel",
      "sap",
      "consolidation",
      "audit",
      "budget",
      "reporting",
      "trésorerie",
      "comptabilité",
      "clôture",
    ],
    exampleBefore: "Responsable de tâches comptables.",
    exampleAfter:
      "Piloté la clôture mensuelle IFRS sous SAP pour 3 entités, passant de 12 à 8 jours de délai.",
    summary:
      "Profil finance avec reporting IFRS, contrôle budgétaire et documentation prête pour audit.",
  },
  marketing: {
    keywords: [
      "seo",
      "sea",
      "google ads",
      "analytics",
      "contenu",
      "content",
      "crm",
      "hubspot",
      "campagne",
      "réseaux sociaux",
      "acquisition",
    ],
    exampleBefore: "Gestion des réseaux sociaux.",
    exampleAfter:
      "Piloté Google Ads et SEO pour 4 lignes produit, augmentant les leads qualifiés de 22 % en deux trimestres.",
    summary:
      "Marketing combinant acquisition, contenu et CRM pour faire croître la demande qualifiée.",
  },
  sales: {
    keywords: [
      "crm",
      "pipeline",
      "négociation",
      "prospection",
      "quota",
      "b2b",
      "closing",
      "commercial",
      "objectifs",
      "clients",
    ],
    exampleBefore: "Vente de produits aux clients.",
    exampleAfter:
      "Géré un pipeline B2B de 40 comptes en CRM, clôturant 1,2 M MAD pour un quota de 1,0 M MAD.",
    summary:
      "Commercial avec discipline de pipeline documentée et atteinte d’objectifs.",
  },
  hr: {
    keywords: [
      "recrutement",
      "rh",
      "hr",
      "sourcing",
      "entretien",
      "onboarding",
      "paie",
      "sirh",
      "talent",
      "formation",
      "gpec",
      "relations sociales",
    ],
    exampleBefore: "Gestion du recrutement.",
    exampleAfter:
      "Recruté 18 profils tech en 6 mois (sourcing LinkedIn + grilles d’entretien), réduisant le délai moyen d’embauche de 45 à 28 jours.",
    summary:
      "Profil RH orienté recrutement et processus, avec délais et volumes mesurables.",
  },
  management: {
    keywords: [
      "management",
      "équipe",
      "leadership",
      "pilotage",
      "roadmap",
      "budget",
      "kpi",
      "stakeholders",
      "delivery",
      "agile",
      "pmo",
    ],
    exampleBefore: "Management d’équipe et suivi des projets.",
    exampleAfter:
      "Piloté une équipe de 8 personnes et une roadmap trimestrielle, livrant 3 jalons majeurs dans le budget alloué.",
    summary:
      "Manager avec pilotage d’équipe, livraison et indicateurs clairs.",
  },
  student: {
    keywords: [
      "stage",
      "projet",
      "pfe",
      "licence",
      "master",
      "ingénieur",
      "université",
      "école",
      "associatif",
      "python",
      "java",
      "excel",
      "anglais",
    ],
    exampleBefore: "Étudiant motivé cherchant un stage.",
    exampleAfter:
      "Projet de fin d’études : API Java/Spring + tests Postman ; stage de 3 mois en support applicatif (tickets Jira, SQL).",
    summary:
      "Profil étudiant / jeune diplômé avec projets concrets, outils et expériences (stage, asso) nommés.",
  },
  generic: {
    keywords: [
      "excel",
      "office",
      "français",
      "anglais",
      "arabe",
      "communication",
      "gestion",
      "projet",
      "client",
      "reporting",
    ],
    exampleBefore: "Responsable des tâches quotidiennes.",
    exampleAfter:
      "Mené [projet] avec [outil], aboutissant à [résultat mesurable : délai, volume, qualité].",
    summary:
      "Professionnel avec spécialisation claire, outils utilisés et preuves d’impact.",
  },
};

export function detectRoleFamily(role?: string): RoleFamily {
  const r = (role ?? "").toLowerCase();
  if (!r.trim()) return "generic";
  if (/stage|étudiant|etudiant|jeune diplôm|jeune diplom|pfe|alternance|premier emploi/.test(r)) {
    return "student";
  }
  if (/qa|test|qualité|qualite|sdet|assurance qualité/.test(r)) return "qa";
  if (
    /d[eé]v|developpeur|développeur|ingénieur logiciel|ingenieur logiciel|software|fullstack|full.?stack|front.?end|back.?end|programmeur|react|node\.?js|typescript/.test(
      r,
    )
  ) {
    return "developer";
  }
  if (/data|analyste|bi |machine learning|power bi|data scientist/.test(r)) return "data";
  if (/finance|comptable|audit|trésor|tresor|contrôle de gestion|controle de gestion/.test(r)) {
    return "finance";
  }
  if (/market|communication|digital|seo|community/.test(r)) return "marketing";
  if (/commercial|sales|business develop|account manager|vendeur/.test(r)) return "sales";
  if (/rh\b|ressources humaines|recrut|talent|hr\b|chargé de recrutement|charge de recrutement/.test(r)) {
    return "hr";
  }
  if (/manager|chef de projet|directeur|responsable d.?équipe|responsable d.?equipe|team lead|management/.test(r)) {
    return "management";
  }
  if (/ingénieur|ingenieur/.test(r)) return "developer";
  return "generic";
}
