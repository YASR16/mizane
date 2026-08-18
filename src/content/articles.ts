export type Article = {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string;
  content: string[];
};

export const articles: Article[] = [
  {
    slug: "cv-compatible-ats-maroc",
    title: "Comment savoir si mon CV est compatible ATS ?",
    description: "Ce que les ATS lisent réellement, les erreurs fréquentes au Maroc, et comment tester votre CV sans fausse garantie.",
    category: "ATS",
    date: "2026-03-12",
    content: [
      "Un ATS (Applicant Tracking System) n’est pas un juge magique. C’est un logiciel qui extrait du texte, classe des champs (nom, expériences, compétences) et filtre parfois par mots-clés. Dire « votre CV a 92 % de chances de passer l’ATS de tel cabinet » n’est pas sérieux.",
      "Au Maroc, de plus en plus de grands comptes, de cabinets et de plateformes (dont ReKrute) s’appuient sur de l’extraction automatique. Un PDF scanné, un tableau Word, deux colonnes avec icônes, et le parseur perd votre téléphone ou vos compétences.",
      "Signaux généralement favorables : une colonne, titres de section standards (Expérience, Formation, Compétences), texte sélectionnable, e-mail et téléphone en clair, mots-clés du poste repris dans les puces.",
      "Signaux généralement défavorables : CV Canva très graphique, photo lourde, barres de compétences, en-têtes/pieds de page, polices icônes à la place des mots.",
      "Le bon test : uploadez votre PDF, sélectionnez le texte. Si vous ne pouvez pas copier un paragraphe, un ATS non plus. Mizane mesure ces caractéristiques — sans prétendre simuler un logiciel propriétaire.",
    ],
  },
  {
    slug: "cv-refuse-malgre-competences",
    title: "Pourquoi votre CV est refusé malgré vos compétences",
    description: "Le décalage entre ce que vous savez faire et ce que le recruteur lit en huit secondes.",
    category: "Recherche d'emploi",
    date: "2026-04-02",
    content: [
      "La plupart des profils marocains compétents sont écartés pour une raison simple : le CV décrit des missions, pas des preuves. « Responsible for testing » ne dit rien. « 80 scénarios Playwright, −40 % de régression manuelle » dit quelque chose.",
      "Deuxième cause : le CV n’est pas aligné sur l’offre. Un ingénieur QA qui postule « SDET » sans les mots Playwright, API, CI/CD, sera mal classé — même s’il les maîtrise.",
      "Troisième cause : un e-mail peu professionnel, l’absence de LinkedIn, ou un PDF image. Le recruteur n’a pas le temps de deviner.",
      "Avant d’envoyer, posez trois questions : un ATS peut-il extraire le texte ? Un recruteur comprend-il le métier en 8 secondes ? Chaque puce récente a-t-elle un résultat ?",
    ],
  },
  {
    slug: "erreurs-cv-marocain",
    title: "CV marocain : les erreurs les plus fréquentes",
    description: "Photo, état civil, objectifs vagues, et autres habitudes qui coûtent des entretiens.",
    category: "Carrière au Maroc",
    date: "2026-02-18",
    content: [
      "Le marché marocain a ses codes : français soigné, diplôme visible, parfois photo. Mais beaucoup de CV empilent encore situation familiale, CIN, et un objectif de trois lignes (« je cherche un poste stimulant »).",
      "Retirez ce qui n’aide pas la décision : CIN, situation familiale, photo trop lourde, hobbies génériques. Gardez ville, mobilité, langues (niveau réel), LinkedIn.",
      "Placez le diplôme (Ingénieur d’État, ENCG, EST, etc.) clairement, mais ne laissez pas la formation écraser l’expérience si vous avez déjà 3 ans de terrain.",
      "Évitez le mélange français/anglais dans une même puce. Choisissez la langue de l’offre.",
    ],
  },
  {
    slug: "cv-premier-emploi-maroc",
    title: "Comment rédiger un CV pour un premier emploi ?",
    description: "Stages, projets, associations : comment montrer de la valeur sans expérience longue.",
    category: "CV",
    date: "2026-01-20",
    content: [
      "Sans CDI, le CV se construit sur des preuves alternatives : PFE, stage, projet GitHub, club, freelance, bénévolat. Chaque ligne doit dire ce que vous avez fait, avec quoi, et ce que ça a produit.",
      "Un projet académique devient utile s’il ressemble à du travail : stack, volume, contrainte, résultat. « Projet fin d’études » tout seul ne suffit pas.",
      "Les compétences doivent être démontrées. Inutile de lister 25 outils. Cinq outils vraiment utilisés, repris dans les puces, passent mieux un ATS.",
      "Une page suffit. Le score Mizane pénalise le vide, pas la jeunesse du parcours.",
    ],
  },
  {
    slug: "cv-francais-ou-anglais",
    title: "CV en français ou en anglais : lequel choisir ?",
    description: "Règle simple : la langue de l’offre, avec une exception offshore et international.",
    category: "CV",
    date: "2026-05-09",
    content: [
      "Au Maroc, la majorité des offres corporate et administration s’attendent à un CV en français. Les ESN, l’offshore, les startups produit et les candidatures Canada/Gulf demandent souvent l’anglais.",
      "La règle fiable : rédigez dans la langue de l’annonce. Si l’offre est bilingue, privilégiez la langue du descriptif le plus long.",
      "Ne traduisez pas mot à mot. « Ingénieur d’État » n’est pas toujours « State Engineer ». Adaptez les intitulés au marché cible.",
      "Gardez deux versions dans Mizane : l’une marocaine, l’une internationale. Comparez ensuite chaque version à l’offre.",
    ],
  },
  {
    slug: "tester-cv-ats-sans-mythe",
    title: "Tester un CV ATS : la checklist avant d’envoyer",
    description: "Trois tests concrets — sélection de texte, extraction du contact, mots-clés de l’offre — avant de payer un outil ou un relecteur.",
    category: "ATS",
    date: "2026-06-04",
    content: [
      "Le web est plein de « tests ATS » qui sont des quiz. Ils ne lisent pas votre PDF. Un vrai test commence par le fichier que vous joignez à ReKrute ou à l’e-mail du recruteur.",
      "Test 1 : sélectionnez un paragraphe. Impossible ? Le parseur verra une image. Exportez depuis Word en PDF texte, pas un scan de CV Canva.",
      "Test 2 : le contact. Téléphone, e-mail, LinkedIn doivent être du texte, pas une icône. Un +212 dans un bandeau graphique disparaît souvent.",
      "Test 3 : collez l’offre à côté du CV. Les outils et domaines cités dans l’annonce apparaissent-ils dans vos puces ? Pas dans une liste décorative en bas de page.",
      "Mizane automatise ces trois lectures. Le score n’est pas une promesse d’entretien. C’est un diagnostic du fichier, avec un aperçu gratuit avant 49 DH.",
    ],
  },
  {
    slug: "optimiser-cv-sans-inventer",
    title: "Optimiser un CV sans inventer d’expérience",
    description: "La seule optimisation défendable en entretien : des preuves plus claires, des mots-clés vrais, zéro fiction.",
    category: "CV",
    date: "2026-06-18",
    content: [
      "Optimiser un CV est devenu synonyme de « faire écrire une IA ». Le risque n’est pas le français trop fluide. C’est la mission que vous n’avez jamais faite.",
      "Gardez la structure des postes réels. Changez la façon de les raconter : contexte, action, outil, résultat. Si vous n’avez pas le chiffre, donnez un ordre de grandeur honnête ou décrivez le livrable.",
      "Les mots-clés de l’offre ne s’empilent pas en bas. Ils se placent dans les puces où le travail a eu lieu. Un ATS compte les occurrences ; un manager vous demandera l’exemple.",
      "Chez Mizane, le CV optimisé (99 DH) part du document analysé. Relisez chaque phrase avant d’envoyer. Vous restez responsable du dossier.",
    ],
  },
  {
    slug: "cv-ingenieur-etat-maroc",
    title: "CV d’ingénieur d’État : après le diplôme, les preuves",
    description: "Comment un profil EMI, INPT, EHTP ou ENIM évite le CV « dossier étudiant » une fois en poste.",
    category: "Carrière au Maroc",
    date: "2026-07-02",
    content: [
      "Le titre Ingénieur d’État ouvre des portes au Maroc. Il ne décrit pas votre semaine. Un recruteur industriel ou SI scrolle vers les projets dès la deuxième année d’expérience.",
      "Déplacez le diplôme sous l’expérience récente si vous avez déjà un CDI. Gardez-le visible, pas comme unique bloc de valeur.",
      "Pour chaque poste : site ou équipe, outil (SAP, AutoCAD, Python, GMAO), contrainte, résultat. « Participation aux réunions projet » est du bruit.",
      "Si vous visez la France ou le Canada, traduisez les intitulés avec parcimonie et ajoutez le contexte « Morocco / industry / utilities ». Analysez ensuite la version anglaise comme un fichier distinct.",
    ],
  },
  {
    slug: "cv-developpeur-offshore",
    title: "CV développeur pour l’offshore et les ESN au Maroc",
    description: "Français ou anglais, stack dans les puces, et un GitHub qui ne dessert pas. Ce que les ESN lisent vraiment.",
    category: "CV",
    date: "2026-07-15",
    content: [
      "Les ESN casablancaises et l’offshore lisent vite : stack, années, anglais, disponibilité. Un CV littéraire sur la « passion du code » passe après un PDF qui dit NestJS, PostgreSQL, AWS, 2 ans de prod.",
      "Mettez la stack dans les expériences, pas seulement dans un nuage de compétences. Précisez prod vs tutoriel. Un bootcamp se assume ; il ne se déguise pas en architecte.",
      "Deux fichiers : un français pour les comptes locaux, un anglais pour l’export de services. Ne mélangez pas les langues dans la même puce.",
      "Avant d’envoyer, uploadez la version visée dans Mizane et collez l’offre (Java, React, mobile). Les mots absents de votre fichier — s’ils sont vrais — doivent entrer dans une puce, pas dans une liste fantôme.",
    ],
  },
  {
    slug: "cv-qa-playwright-maroc",
    title: "CV QA au Maroc : de testeur manuel à automation lisible",
    description: "Volumes, outils, frontière manuel/automation : comment un CV QA survit à un filtre ATS et à un lead QA.",
    category: "Recherche d'emploi",
    date: "2026-08-01",
    content: [
      "Les offres QA au Maroc mélangent encore « testeur fonctionnel » et « SDET ». Votre CV doit choisir un centre de gravité, puis montrer le chemin vers l’autre, pas les deux titres en même temps.",
      "Pour le manuel : types de tests, métiers couverts, outils de recette (Jira, TestRail), volume de cas. Pour l’automation : langage, framework (Playwright, Cypress, Selenium), où ça tourne (CI), ce qui reste volontairement manuel.",
      "Un chiffre change la lecture : 80 scénarios, 3 releases par mois, une régression qui passait de deux jours à une demi-journée. Sans chiffre, décrivez le périmètre (paiement, back-office, app mobile).",
      "Collez une offre SDET dans Mizane. Si Playwright apparaît dans l’annonce et nulle part dans vos puces, soit vous l’ajoutez avec une preuve, soit vous ne visez pas ce poste pour l’instant.",
    ],
  },
];

export function getArticle(slug: string) {
  return articles.find((a) => a.slug === slug);
}
