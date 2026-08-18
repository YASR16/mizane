export type IntentPage = {
  slug: string;
  title: string;
  description: string;
  h1: string;
  sections: { heading: string; paragraphs: string[] }[];
  faqs: { q: string; a: string }[];
};

export const intentPages: IntentPage[] = [
  {
    slug: "analyse-cv",
    title: "Analyse CV au Maroc — score, structure et plan d’action",
    description:
      "Faites analyser votre CV avant de postuler. Mizane lit le fichier, note la structure, l’ATS et les mots-clés, puis indique quoi corriger. Aperçu gratuit, rapport 49 DH.",
    h1: "Analyse de CV : ce que Mizane lit vraiment",
    sections: [
      {
        heading: "Une analyse de fichier, pas un avis générique",
        paragraphs: [
          "Beaucoup d’outils « d’analyse de CV » collent les mêmes conseils à tout le monde : ajoutez des verbes d’action, mettez une photo, raccourcissez. Ça n’aide pas un ingénieur QA à Casablanca ni un développeur qui vise l’offshore.",
          "Mizane part du fichier. PDF ou DOCX, texte extractible ou scan. On mesure ce qu’un recruteur et un parseur peuvent réellement lire : contact, sections, puces, mots-clés du poste, densité d’expérience.",
        ],
      },
      {
        heading: "Ce que vous voyez tout de suite",
        paragraphs: [
          "L’aperçu gratuit montre un score global, des barres (ATS, structure, mots-clés, expérience) et des problèmes déjà visibles dans votre document. Ce n’est pas un teaser vide : si le PDF est une image, on le dit. Si le téléphone est absent, on le dit.",
          "Le rapport payant (49 DH, paiement unique) ajoute les réécritures, le plan priorisé et le PDF. Rien n’est débloqué sur un succès affiché dans le navigateur : le serveur vérifie Payzone.",
        ],
      },
    ],
    faqs: [
      {
        q: "L’analyse remplace-t-elle un relecteur humain ?",
        a: "Non. C’est un diagnostic avant envoi. Un humain reste utile pour le positionnement métier. Mizane accélère la partie technique : lisibilité ATS, preuves, alignement offre.",
      },
      {
        q: "Combien coûte l’analyse complète ?",
        a: "49 DH, une fois. Pas d’abonnement. L’aperçu reste gratuit.",
      },
    ],
  },
  {
    slug: "cv-ats",
    title: "CV ATS au Maroc : ce que les logiciels lisent (et ignorent)",
    description:
      "Un CV ATS, ce n’est pas un score magique. C’est un document que les parseurs peuvent extraire : une colonne, titres clairs, texte sélectionnable, mots-clés du poste.",
    h1: "CV compatible ATS : règles utiles, sans mythologie",
    sections: [
      {
        heading: "Un ATS n’est pas un juge unique",
        paragraphs: [
          "ATS veut dire Applicant Tracking System. Le logiciel range des candidatures, extrait des champs, filtre parfois par mots-clés. Il n’existe pas « le » ATS marocain unique. ReKrute, les SIRH des grands comptes et les outils des ESN n’ont pas le même parseur.",
          "Promettre « 94 % de chances de passer l’ATS de telle entreprise » n’est pas sérieux. Mizane mesure des caractéristiques observables : texte extractible, sections standard, contact en clair, absence de tableaux décoratifs.",
        ],
      },
      {
        heading: "Ce qui casse souvent un CV ATS",
        paragraphs: [
          "PDF scanné, deux colonnes Canva, icônes à la place des mots, barres de compétences, en-têtes graphiques. Le recruteur voit un bel objet ; le parseur perd le téléphone ou les dates.",
          "La correction n’est pas de tout rendre laid. Une colonne, des titres (Expérience, Formation, Compétences), des puces avec outils et résultats : ça passe mieux un ATS tout en restant lisible pour un humain en huit secondes.",
        ],
      },
    ],
    faqs: [
      {
        q: "Faut-il un CV 100 % texte, sans aucune mise en forme ?",
        a: "Non. Il faut du texte sélectionnable et une hiérarchie simple. Une mise en page sobre tient. Un poster visuel, non.",
      },
      {
        q: "Mizane simule-t-il Workday ou Taleo ?",
        a: "Non. On ne prétend pas cloner un logiciel propriétaire. On teste la lisibilité réelle de votre fichier.",
      },
    ],
  },
  {
    slug: "test-cv-ats",
    title: "Tester son CV ATS : un vrai test fichier, pas un quiz",
    description:
      "Le meilleur test ATS : uploader le PDF et voir si le texte, le téléphone et les compétences sont extraits. Mizane le fait à partir du document, pas d’un formulaire.",
    h1: "Comment tester un CV ATS sans se mentir",
    sections: [
      {
        heading: "Le test de la sélection de texte",
        paragraphs: [
          "Ouvrez votre PDF. Sélectionnez un paragraphe d’expérience. Si vous ne pouvez pas copier, un ATS non plus. C’est le test le plus honnête, et il ne coûte rien.",
          "Ensuite vient l’extraction : e-mail, téléphone marocain ou international, LinkedIn, sections. Un CV peut « avoir l’air ATS » et perdre le +212 parce qu’il est dans un bandeau image.",
        ],
      },
      {
        heading: "Ce que Mizane ajoute au test manuel",
        paragraphs: [
          "On lit le fichier (PDF/DOCX), on signale un scan, on note la structure et l’alignement avec un poste si vous le collez. Le score ATS est un indicateur de lisibilité, pas une prédiction d’embauche.",
          "Pour un test utile : uploadez la version que vous envoyez vraiment, pas un Word interne. Ajoutez l’intitulé visé. Comparez ensuite les mots-clés manquants avec l’offre, pas avec une liste universelle.",
        ],
      },
    ],
    faqs: [
      {
        q: "Puis-je tester plusieurs versions ?",
        a: "Oui. Chaque fichier est une analyse. Les CV sont privés, sans URL publique, et programmés pour suppression après 30 jours.",
      },
    ],
  },
  {
    slug: "optimiser-cv",
    title: "Optimiser un CV : réécrire les preuves, pas inventer un parcours",
    description:
      "Optimiser un CV, ce n’est pas générer une fiction. C’est clarifier les résultats, aligner les mots-clés du poste, et garder uniquement ce que vous pouvez justifier en entretien.",
    h1: "Optimiser son CV sans mentir au recruteur",
    sections: [
      {
        heading: "La mauvaise optimisation",
        paragraphs: [
          "Les générateurs qui « remplissent » un CV ajoutent des missions que vous n’avez pas faites. Ça se voit en entretien. Au Maroc comme à l’étranger, un écart entre le PDF et la conversation casse la confiance plus vite qu’un score ATS médiocre.",
          "Optimiser, c’est reformuler ce qui est déjà vrai : remplacer « responsable des tests » par un volume, un outil, un effet. Playwright, 80 scénarios, moins de régression : ça se défend. « Expert automation world-class » non.",
        ],
      },
      {
        heading: "Le produit CV Optimisé chez Mizane",
        paragraphs: [
          "Le rapport d’analyse (49 DH) et le CV optimisé (99 DH) sont deux produits. L’analyse dit quoi changer ; l’optimisation propose une version réécrite à partir de votre document, sans inventer diplômes ni expériences.",
          "Vous restez responsable du texte envoyé. Relisez chaque puce. Si une formulation est trop forte, baissez-la avant de postuler.",
        ],
      },
    ],
    faqs: [
      {
        q: "L’analyse 49 DH inclut-elle le CV optimisé ?",
        a: "Non. Ce sont deux paiements distincts. L’analyse débloque le diagnostic ; le CV optimisé est optionnel.",
      },
    ],
  },
  {
    slug: "cv-maroc",
    title: "CV au Maroc : codes locaux, ATS et candidatures internationales",
    description:
      "Un CV marocain n’est pas un CV américain. Français soigné, diplôme visible, parfois photo — mais plus de CIN ni de situation familiale. Mizane est conçu pour ce marché.",
    h1: "Rédiger un CV pour le marché marocain",
    sections: [
      {
        heading: "Ce que les recruteurs marocains regardent encore",
        paragraphs: [
          "Ville, mobilité, langues avec un niveau réel, diplôme (Ingénieur d’État, ENCG, EST, licence pro), et surtout des preuves d’expérience. Le français doit être propre si l’offre est en français.",
          "La photo n’est ni obligatoire ni interdite partout. Si vous la mettez, qu’elle ne pèse pas le fichier et n’empêche pas l’extraction du texte. Retirez CIN, situation familiale, et l’objectif de trois lignes creux.",
        ],
      },
      {
        heading: "Maroc d’abord, international ensuite",
        paragraphs: [
          "Les grands comptes et l’administration attendent souvent un CV en français. L’offshore, les startups produit et le Canada demandent l’anglais. La règle : la langue de l’offre.",
          "Mizane note les codes marocains (téléphone, langues, structure) et permet de viser MA, FR, GB, CA ou le Golfe. Ce n’est pas Jobscan : le prix est en dirhams, le contenu part du fichier réel.",
        ],
      },
    ],
    faqs: [
      {
        q: "Faut-il encore mettre la photo ?",
        a: "Seulement si le secteur s’y attend encore et si le fichier reste léger et extractible. Pour l’ATS et l’international, beaucoup s’en passent.",
      },
    ],
  },
  {
    slug: "cv-ingenieur",
    title: "CV ingénieur au Maroc : projets, preuves et ATS",
    description:
      "Un CV d’ingénieur se juge sur les projets, la stack et l’impact — pas sur une liste de logiciels. Structure ATS, puces mesurables, diplôme visible.",
    h1: "CV ingénieur : montrer le terrain, pas seulement le diplôme",
    sections: [
      {
        heading: "Le diplôme n’écrase pas l’expérience",
        paragraphs: [
          "Ingénieur d’État reste un signal fort au Maroc. Après deux ou trois ans, les recruteurs veulent le terrain : site, usine, SI, chantier, labo, projet. Un CV qui s’arrête à l’EMI ou l’INPT sans puces concrètes passe pour un dossier étudiant.",
          "Placez le diplôme clairement, puis donnez le poids à l’expérience. PFE et stage comptent s’ils ressemblent à du travail : contrainte, outils, livrable.",
        ],
      },
      {
        heading: "Puces qui passent un ATS ingénieur",
        paragraphs: [
          "Outil + action + résultat. « Déploiement GMAO sur 3 sites, −20 % de temps d’arrêt » se parse et se lit. « Participation à divers projets transverses » disparaît dans le bruit.",
          "Reprenez les mots de l’offre (maintenance, qualité, data, process, AutoCAD, Python) seulement s’ils sont vrais. Mizane aligne le fichier sur le poste visé sans inventer une stack.",
        ],
      },
    ],
    faqs: [
      {
        q: "Une ou deux pages pour un ingénieur ?",
        a: "Une page suffit souvent avant 8–10 ans. Deux pages si les projets sont denses et lisibles, pas pour répéter le même verbe.",
      },
    ],
  },
  {
    slug: "cv-developpeur",
    title: "CV développeur : stack réelle, GitHub et mots-clés ATS",
    description:
      "Un CV développeur ATS liste les langages vraiment utilisés, des puces de production, et un lien GitHub ou démo. Pas vingt frameworks décoratifs.",
    h1: "CV développeur : moins de buzzwords, plus de production",
    sections: [
      {
        heading: "La stack doit apparaître dans les puces",
        paragraphs: [
          "Une colonne « Compétences » avec 25 logos ne suffit pas. Un ATS et un tech lead veulent TypeScript, PostgreSQL, CI dans les expériences. Si React n’est que dans la liste et jamais dans une puce, il pèse peu.",
          "Indiquez le contexte : prod, volume, équipe. « API NestJS, 12 endpoints, auth JWT, tests e2e Playwright » est plus utile que « passionné du web ».",
        ],
      },
      {
        heading: "Offshore et Maroc",
        paragraphs: [
          "Les ESN marocaines et l’offshore lisent souvent en français et recrutent en anglais. Gardez deux versions. Le CV anglais n’est pas une traduction mot à mot des intitulés administratifs.",
          "Mizane peut analyser chaque version. Ajoutez l’offre (Java, Node, SAP, mobile) pour voir les mots-clés manquants — ceux que vous maîtrisez vraiment.",
        ],
      },
    ],
    faqs: [
      {
        q: "Faut-il un GitHub sur le CV ?",
        a: "Oui s’il montre du code lisible. Un dépôt vide ou des forks sans README dessert plus qu’il n’aide.",
      },
    ],
  },
  {
    slug: "cv-qa",
    title: "CV QA / testeur au Maroc : manuels, automation, preuves",
    description:
      "Un CV QA efficace sépare le test manuel de l’automation, cite les outils (Playwright, Cypress, Postman) et des volumes : cas, bugs, régression.",
    h1: "CV QA : montrer comment vous testez, pas que vous « assurez la qualité »",
    sections: [
      {
        heading: "QA n’est pas un mot magique",
        paragraphs: [
          "« Responsible for quality assurance » ne dit rien. Un recruteur QA veut le type de tests (fonctionnel, API, perf, mobile), le niveau d’automation, et si vous écrivez des cas ou exécutez une checklist.",
          "Au Maroc, beaucoup de profils mixtes (manuel + un peu de Selenium) visent des postes SDET. Le CV doit être honnête : ce qui est automatisé, ce qui ne l’est pas. Mizane pénalise le flou, pas le niveau junior.",
        ],
      },
      {
        heading: "Mots-clés utiles — s’ils sont vrais",
        paragraphs: [
          "Playwright, Cypress, Selenium, Postman, Jira, TestRail, CI/CD, API, régression. Reprenez ceux de l’offre. Ajoutez un chiffre : 80 scénarios, 3 releases / mois, −40 % de régression manuelle.",
          "Uploadez le CV et collez l’offre SDET ou « testeur fonctionnel ». L’analyse montre l’écart. Le rapport détaille quoi réécrire avant d’envoyer.",
        ],
      },
    ],
    faqs: [
      {
        q: "Un testeur manuel peut-il viser un poste automation ?",
        a: "Oui si le CV montre le chemin (cours, projet, 10 scripts) sans se prétendre SDET senior. L’entretien ira chercher la preuve.",
      },
    ],
  },
];

export function getIntentPage(slug: string) {
  return intentPages.find((p) => p.slug === slug);
}

export const intentSlugs = intentPages.map((p) => p.slug);
