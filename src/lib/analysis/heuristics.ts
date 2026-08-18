import { clampScore } from "@/lib/utils";
import { ATS_DISCLAIMER, type AnalysisResult, type Finding } from "./schema";
import { ROLE_PACKS, detectRoleFamily, type RoleFamily } from "./roles";

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const LINKEDIN_RE = /linkedin\.com\/in\/[A-Za-z0-9\-_%]+/i;
const GITHUB_RE = /github\.com\/[A-Za-z0-9\-]+/i;
const UNPROFESSIONAL_EMAIL = /(hotmail|yahoo|aol|wanadoo|live)\./i;

const SECTION_ALIASES: Record<string, string[]> = {
  summary: ["profil", "à propos", "a propos", "résumé", "resume", "summary", "objectif", "about"],
  experience: ["expérience", "experience", "parcours", "emploi", "work history", "professional experience"],
  education: ["formation", "éducation", "education", "diplôme", "diplomes", "academic"],
  skills: ["compétences", "competences", "skills", "technologies", "outils", "stack"],
  languages: ["langues", "languages", "langue"],
  projects: ["projets", "projects", "réalisations", "realisations"],
  certifications: ["certifications", "certificats", "certificates"],
  contact: ["contact", "coordonnées", "coordonnees"],
};

const ACTION_VERBS =
  /\b(développé|developpe|automated|automatisé|dirigé|mené|conçu|concu|optimisé|optimise|réduit|reduit|augmenté|augmente|mis en place|créé|cree|implemented|led|built|designed|improved|reduced|increased|delivered|owned|migrated|ran|owned|closed)\b/i;

const TECH =
  /\b(java|spring|python|javascript|typescript|react|node|sql|playwright|cypress|selenium|aws|azure|docker|kubernetes|excel|sap|power bi|tableau|figma|salesforce|jira|git|linux|php|laravel|\.net|c#|swift|kotlin|postman|jenkins)\b/i;

const GENERIC = [
  "dynamique",
  "motivé",
  "motive",
  "team player",
  "esprit d'équipe",
  "rigoureux",
  "polyvalent",
  "passionné",
  "passionne",
  "hard working",
  "responsible",
  "responsable",
];

const PHONE_PATTERNS: { market: string; re: RegExp }[] = [
  { market: "MA", re: /(\+212|00212)[\s.-]*[5-7]\d{8}|0[5-7](?:[\s.-]?\d){8}/ },
  { market: "FR", re: /(\+33|0033)[\s.-]*[1-9](?:[\s.-]?\d){8}/ },
  { market: "GB", re: /(\+44|0044)[\s.-]*\d{9,10}/ },
  { market: "US", re: /(\+1)[\s.-]*\d{10}/ },
  { market: "AE", re: /(\+971)[\s.-]*\d{7,9}/ },
  { market: "INTL", re: /\+\d{1,3}[\s.-]?\d{6,12}/ },
];

const CITIES: Record<string, string> = {
  casablanca: "MA",
  rabat: "MA",
  marrakech: "MA",
  tanger: "MA",
  london: "GB",
  manchester: "GB",
  paris: "FR",
  lyon: "FR",
  dubai: "AE",
  montreal: "CA",
  toronto: "CA",
};

function findSections(text: string) {
  const lower = text.toLowerCase();
  const present: string[] = [];
  const missing: string[] = [];
  const order: { name: string; index: number }[] = [];
  for (const [name, aliases] of Object.entries(SECTION_ALIASES)) {
    const idx = aliases
      .map((a) => lower.indexOf(a))
      .filter((i) => i >= 0)
      .sort((a, b) => a - b)[0];
    if (idx === undefined) missing.push(name);
    else {
      present.push(name);
      order.push({ name, index: idx });
    }
  }
  return { present, missing, order: order.sort((a, b) => a.index - b.index).map((s) => s.name) };
}

function extractExperiences(text: string) {
  const lines = text.split(/\n/).map((l) => l.trim()).filter(Boolean);
  const bullets = lines.filter((l) => /^[-•●▪‣*]/.test(l) || /^\d+\./.test(l));
  const blocks = bullets.length
    ? [
        {
          title: "Expériences détectées",
          bullets: bullets.slice(0, 20).map((original) => {
            const hasMetric = /\d/.test(original);
            const hasActionVerb = ACTION_VERBS.test(original);
            const hasTechnology = TECH.test(original);
            const quality =
              hasMetric && hasActionVerb ? "strong" : hasActionVerb || hasMetric ? "average" : "weak";
            return {
              original,
              quality: quality as "weak" | "average" | "strong",
              hasMetric,
              hasActionVerb,
              hasTechnology,
            };
          }),
          score: 0,
        },
      ]
    : [];
  if (blocks[0]) {
    const b = blocks[0].bullets;
    const strong = b.filter((x) => x.quality === "strong").length;
    blocks[0].score = clampScore((strong / Math.max(b.length, 1)) * 100);
  }
  return blocks;
}

function finding(partial: Omit<Finding, "id"> & { id?: string }): Finding {
  return { id: partial.id ?? crypto.randomUUID(), ...partial };
}

function keywordPresent(text: string, keyword: string) {
  const lower = text.toLowerCase();
  if (lower.includes(keyword.toLowerCase())) return true;
  return keyword
    .toLowerCase()
    .split(/\s+/)
    .every((token) => new RegExp(`\\b${token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(text));
}

export function inferMarket(input: {
  targetCountry?: string;
  jobDescription?: string;
  text: string;
  locale?: string;
}) {
  const explicit = (input.targetCountry ?? "").toUpperCase();
  if (["MA", "FR", "GB", "UK", "US", "CA", "AE"].includes(explicit)) {
    return explicit === "UK" ? "GB" : explicit;
  }
  const blob = `${input.jobDescription ?? ""} ${input.text}`.toLowerCase();
  for (const [city, market] of Object.entries(CITIES)) {
    if (blob.includes(city)) return market;
  }
  const phone = detectPhone(input.text);
  if (phone?.market && phone.market !== "INTL") return phone.market;
  return "UNSET";
}

export function detectPhone(text: string) {
  for (const p of PHONE_PATTERNS) {
    const m = text.match(p.re);
    if (m) return { value: m[0], market: p.market };
  }
  return null;
}

export function computeAtsScore(input: {
  wordCount: number;
  isScanned: boolean;
  quality: "high" | "medium" | "low";
  sectionsPresent: string[];
  sectionsMissing: string[];
  hasEmail: boolean;
  hasPhone: boolean;
  formattingRisks: number;
  keywordHitRate: number;
  standardSectionNames: number;
}) {
  let score = 28;
  if (!input.isScanned && input.quality !== "low") score += 10;
  if (input.quality === "high") score += 4;
  if (input.sectionsPresent.includes("experience")) score += 8;
  if (input.sectionsPresent.includes("education")) score += 5;
  if (input.sectionsPresent.includes("skills")) score += 7;
  if (input.sectionsPresent.includes("summary")) score += 3;
  if (input.hasEmail) score += 5;
  if (input.hasPhone) score += 3;
  score += Math.min(8, input.standardSectionNames * 2);
  score += Math.round(input.keywordHitRate * 8);
  score -= input.formattingRisks * 12;
  if (input.isScanned) score -= 32;
  if (input.wordCount < 80) score -= 18;
  else if (input.wordCount < 140) score -= 8;
  else if (input.wordCount > 1100) score -= 6;
  if (input.sectionsMissing.includes("experience")) score -= 12;
  if (input.sectionsMissing.includes("skills")) score -= 6;
  if (!input.hasEmail) score = Math.min(score, 62);
  if (input.wordCount < 100) score = Math.min(score, 58);
  if (input.formattingRisks >= 2) score = Math.min(score, 55);
  return clampScore(score);
}

export function analyzeCvText(input: {
  text: string;
  isScanned: boolean;
  quality: "high" | "medium" | "low";
  targetRole?: string;
  targetCountry?: string;
  jobDescription?: string;
  filename?: string;
  locale?: string;
}): AnalysisResult {
  const text = input.text || "";
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const sections = findSections(text);
  const email = text.match(EMAIL_RE)?.[0];
  const linkedin = text.match(LINKEDIN_RE)?.[0];
  const github = text.match(GITHUB_RE)?.[0];
  const market = inferMarket(input);
  const phone = detectPhone(text);
  const locationMatch = text.match(
    /\b(Casablanca|Rabat|Marrakech|Tanger|Fès|Fes|Agadir|London|Paris|Lyon|Dubai|Montreal|Toronto|Maroc|Morocco|France|Canada|UK|United Kingdom|Remote|Hybride)\b/i,
  );

  const contactIssues: string[] = [];
  if (!email) contactIssues.push("Adresse e-mail introuvable.");
  else if (UNPROFESSIONAL_EMAIL.test(email)) contactIssues.push("L’adresse e-mail paraît peu professionnelle.");
  if (!phone) contactIssues.push("Numéro de téléphone introuvable.");
  else if (market === "MA" && phone.market !== "MA") {
    contactIssues.push("Pour une candidature au Maroc, un numéro +212 est plus facile à rappeler.");
  } else if (market === "GB" && phone.market !== "GB" && phone.market !== "INTL") {
    contactIssues.push("Pour le Royaume-Uni, un numéro +44 est préférable.");
  } else if (market === "FR" && phone.market !== "FR" && phone.market !== "INTL") {
    contactIssues.push("Pour la France, un numéro +33 est préférable.");
  }
  if (!linkedin) contactIssues.push("Profil LinkedIn absent.");
  if (!locationMatch) contactIssues.push("Localisation non identifiée.");

  const experiences = extractExperiences(text);
  const family: RoleFamily = detectRoleFamily(input.targetRole);
  const pack = ROLE_PACKS[family];
  const expected = pack.keywords;
  const detected = expected.filter((k) => keywordPresent(text, k));
  const missingKw = expected.filter((k) => !keywordPresent(text, k));
  const genericFound = GENERIC.filter((g) => text.toLowerCase().includes(g));
  const lower = text.toLowerCase();

  const skillTokens = (input.jobDescription ?? "")
    .toLowerCase()
    .split(/[^a-zA-Zàâçéèêëîïôùûü0-9+#.]+/)
    .filter((t) => t.length > 4 && !["avec", "pour", "dans", "vous", "nous", "votre"].includes(t));
  const jobTokens = Array.from(new Set(skillTokens)).slice(0, 40);
  const jobMissing = jobTokens.filter((t) => !lower.includes(t)).slice(0, 12);
  const jobMatched = jobTokens.filter((t) => lower.includes(t)).length;
  const jobMatchScore = jobTokens.length ? clampScore((jobMatched / jobTokens.length) * 100) : undefined;

  const formattingRisks =
    (/[│┃▌█■◆]/.test(text) ? 1 : 0) +
    (text.includes("\t\t") ? 1 : 0) +
    (input.isScanned ? 1 : 0) +
    (/( {8,}|\t{2,})/.test(text) ? 1 : 0) +
    (/\|.+\|/.test(text) ? 1 : 0);
  const atsUnfavorable: string[] = [];
  const atsFavorable: string[] = [];
  if (input.isScanned) atsUnfavorable.push("Document probablement scanné : extraction texte limitée.");
  else if (wordCount >= 80) atsFavorable.push("Le texte du CV a pu être extrait.");
  if (sections.present.includes("experience") && sections.present.includes("education")) {
    atsFavorable.push("Sections standards identifiables (expérience, formation).");
  }
  if (formattingRisks) atsUnfavorable.push("Mise en page à risque (graphiques, tabulations, colonnes, scan).");
  if (/\|.+\|/.test(text)) atsUnfavorable.push("Tableaux détectés : beaucoup d’ATS extraient mal les cellules.");
  if (/( {8,}|\t{2,})/.test(text)) atsUnfavorable.push("Colonnes ou tabulations multiples : risque de parsing.");
  if (sections.missing.includes("skills")) atsUnfavorable.push("Section compétences non identifiée clairement.");
  if (wordCount < 80) atsUnfavorable.push("Volume de texte trop faible pour un parsing ATS fiable.");

  const issues: Finding[] = [];
  const strengths: Finding[] = [];
  const phoneHint =
    market === "GB" ? "+44" : market === "FR" ? "+33" : market === "MA" ? "+212" : "international (+indicatif)";

  if (contactIssues.length) {
    issues.push(
      finding({
        category: "contact",
        severity: "high",
        isStrength: false,
        title: "Informations de contact incomplètes",
        problem: contactIssues.join(" "),
        why: "Un recruteur ou un ATS qui ne peut pas vous joindre écarte le profil, même compétent.",
        how: `Ajoutez e-mail, téléphone ${phoneHint}, ville et LinkedIn sur une seule ligne d’en-tête.`,
        exampleBefore: locationMatch?.[0] ? `${locationMatch[0]}` : "Nom — ville",
        exampleAfter: `${email ?? "prenom.nom@email.com"} · ${phone?.value ?? phoneHint} · ${locationMatch?.[0] ?? "Ville"} · linkedin.com/in/profil`,
        impactRank: 2,
      }),
    );
  } else {
    strengths.push(
      finding({
        category: "contact",
        severity: "low",
        isStrength: true,
        title: "Coordonnées facilement identifiables",
        problem: "Les informations de contact sont présentes.",
        why: "Le recruteur peut vous relancer sans friction.",
        how: "Conservez cet en-tête simple, sur une seule colonne.",
        impactRank: 90,
      }),
    );
  }

  if (sections.missing.includes("summary")) {
    issues.push(
      finding({
        category: "summary",
        severity: "medium",
        isStrength: false,
        title: "Profil professionnel absent ou trop discret",
        problem: "Aucun résumé / profil n’a été clairement détecté.",
        why: "Les recruteurs scannent le haut du CV en quelques secondes.",
        how: "Ajoutez 3–4 lignes : métier, années, spécialisation, valeur, mots-clés du poste visé.",
        exampleBefore: "Jeune diplômé motivé cherchant une opportunité.",
        exampleAfter: pack.summary,
        impactRank: 4,
      }),
    );
  }

  if (sections.missing.includes("skills")) {
    issues.push(
      finding({
        category: "skills",
        severity: "high",
        isStrength: false,
        title: "Compétences peu exploitables par un ATS",
        problem: "Les compétences ne sont pas regroupées dans une section clairement nommée.",
        why: "Les ATS indexent souvent une section « Compétences / Skills ».",
        how: `Créez une liste courte alignée sur ${input.targetRole || "le poste visé"} : ${expected.slice(0, 6).join(", ") || "outils réellement utilisés"}.`,
        exampleBefore: "Soft skills uniquement.",
        exampleAfter: expected.slice(0, 8).join(" · ") || "Outil 1 · Outil 2 · Outil 3",
        impactRank: 3,
      }),
    );
  } else {
    strengths.push(
      finding({
        category: "structure",
        severity: "low",
        isStrength: true,
        title: "Structure globalement lisible",
        problem: "Des sections standards ont été identifiées.",
        why: "Une hiérarchie claire aide le recruteur et l’ATS.",
        how: "Gardez un ordre : profil, expérience, compétences, formation, langues.",
        impactRank: 91,
      }),
    );
  }

  const weakBullets = experiences[0]?.bullets.filter((b) => b.quality === "weak").length ?? 0;
  if (weakBullets >= 2 || !experiences[0]) {
    const sample = experiences[0]?.bullets.find((b) => b.quality === "weak")?.original ?? pack.exampleBefore;
    issues.push(
      finding({
        category: "experience",
        severity: "critical",
        isStrength: false,
        title: "Expériences trop descriptives, peu de résultats",
        problem: "Plusieurs puces décrivent des missions sans impact mesurable.",
        why: "Les recruteurs cherchent la preuve de valeur, pas la liste des tâches.",
        how: "Utilisez le schéma Action + Tâche + Technologie + Résultat, avec les outils de votre métier.",
        exampleBefore: sample,
        exampleAfter: pack.exampleAfter,
        impactRank: 1,
      }),
    );
  }

  const missingRatio = expected.length ? missingKw.length / expected.length : 0;
  if (expected.length >= 4 && missingRatio >= 0.45) {
    issues.push(
      finding({
        category: "keywords",
        severity: "high",
        isStrength: false,
        title: "Mots-clés importants absents pour le poste visé",
        problem: `Pour un profil ${input.targetRole || family}, il manque notamment : ${missingKw.slice(0, 6).join(", ")}.`,
        why: "Sans ces mots-clés, le CV peut être mal classé par un ATS ou un recruteur pressé.",
        how: "Intégrez uniquement les compétences que vous maîtrisez vraiment, dans les puces et la section compétences.",
        exampleBefore: detected.slice(0, 3).join(", ") || "Liste générique",
        exampleAfter: [...detected, ...missingKw.slice(0, 4)].join(" · "),
        impactRank: 3,
      }),
    );
  }

  if (wordCount < 80) {
    issues.push(
      finding({
        category: "readability",
        severity: "critical",
        isStrength: false,
        title: "Contenu trop mince",
        problem: input.isScanned
          ? "Peu de texte extractible : le fichier est peut-être un scan image."
          : "Le CV contient trop peu de contenu exploitable.",
        why: "Un ATS ne peut pas scorer un document qu’il ne lit pas.",
        how: "Développez vos expériences avec des puces concrètes. Si c’est un scan, exportez un PDF texte.",
        impactRank: 1,
      }),
    );
  }

  if (genericFound.length >= 2) {
    issues.push(
      finding({
        category: "language",
        severity: "medium",
        isStrength: false,
        title: "Formulations génériques peu convaincantes",
        problem: `Le CV s’appuie sur des termes vagues (${genericFound.slice(0, 3).join(", ")}).`,
        why: "Ces mots n’aident ni l’ATS ni le recruteur à vous différencier.",
        how: "Remplacez-les par des preuves : outils, volumes, délais, résultats.",
        exampleBefore: genericFound.slice(0, 2).join(", "),
        exampleAfter: pack.exampleAfter,
        impactRank: 6,
      }),
    );
  }

  if (wordCount >= 80 && sections.present.includes("experience")) {
    strengths.push(
      finding({
        category: "readability",
        severity: "low",
        isStrength: true,
        title: "Volume de contenu suffisant pour une lecture ATS",
        problem: "Le document contient assez de texte pour une analyse.",
        why: "Les systèmes d’extraction ont de la matière à indexer.",
        how: "Veillez à rester sur 1 page (jeune profil) ou 2 pages maximum.",
        impactRank: 92,
      }),
    );
  }

  const recommendations = [...issues].sort((a, b) => a.impactRank - b.impactRank);
  const atsScore = computeAtsScore({
    wordCount,
    isScanned: input.isScanned,
    quality: input.quality,
    sectionsPresent: sections.present,
    sectionsMissing: sections.missing,
    hasEmail: Boolean(email),
    hasPhone: Boolean(phone),
    formattingRisks,
    keywordHitRate: expected.length ? detected.length / expected.length : 0.4,
    standardSectionNames: sections.present.length,
  });
  const structureScore = clampScore(40 + sections.present.length * 8 - sections.missing.length * 6);
  const keywordScore = clampScore(expected.length ? (detected.length / expected.length) * 100 : 62);
  const experienceScore = clampScore(experiences[0]?.score ?? (wordCount > 250 ? 55 : 38));
  const readabilityScore = clampScore(
    90 - (wordCount < 80 ? 30 : 0) - (wordCount > 900 ? 12 : 0) - (input.quality === "low" ? 20 : 0),
  );
  const professionalismScore = clampScore(
    80 - contactIssues.length * 6 - genericFound.length * 4 + (linkedin ? 4 : 0),
  );
  const visualScore = clampScore(
    70 - (input.isScanned ? 20 : 0) - formattingRisks * 8 + (sections.present.length > 4 ? 6 : 0),
  );
  const overall = clampScore(
    atsScore * 0.2 +
      structureScore * 0.15 +
      keywordScore * 0.15 +
      experienceScore * 0.2 +
      readabilityScore * 0.1 +
      professionalismScore * 0.1 +
      visualScore * 0.1,
  );

  const verdict =
    overall >= 85
      ? "CV solide — quelques ajustements peuvent encore le renforcer."
      : overall >= 70
        ? "Bon potentiel — plusieurs améliorations peuvent renforcer votre CV."
        : overall >= 55
          ? "Base correcte, mais des lacunes importantes réduisent vos chances."
          : "Des problèmes structurels et de contenu limitent fortement l’impact du CV.";

  const technical = Array.from(new Set(text.match(new RegExp(TECH, "gi")) ?? [])).slice(0, 20);

  const paidPriorities = [
    ...recommendations,
    finding({
      category: "summary",
      severity: "medium",
      isStrength: false,
      title: "Réécriture du profil professionnel",
      problem: "Le résumé peut encore clarifier métier, spécialisation et valeur.",
      why: "C’est la première phrase lue par un recruteur.",
      how: "Gardez 3–4 lignes, sans clichés, avec les mots-clés du poste.",
      exampleAfter: pack.summary,
      impactRank: 20,
    }),
    finding({
      category: "experience",
      severity: "medium",
      isStrength: false,
      title: "Reformulation ATS des expériences",
      problem: "Certaines puces peuvent être plus lisibles par un ATS et plus convaincantes.",
      why: "Les verbes d’action + outils + chiffres survivent mieux au parsing.",
      how: "Réécrivez chaque puce récente avec un résultat.",
      exampleBefore: pack.exampleBefore,
      exampleAfter: pack.exampleAfter,
      impactRank: 21,
    }),
    finding({
      category: "keywords",
      severity: "medium",
      isStrength: false,
      title: "Alignement mots-clés du poste",
      problem: missingKw.length
        ? `Écarts restants : ${missingKw.slice(0, 8).join(", ")}.`
        : "Les mots-clés sont présents ; le rapport détaille où les placer.",
      why: "Le matching offre / CV se joue souvent sur ces termes.",
      how: "Placez-les dans les puces d’expérience, pas seulement en liste.",
      exampleAfter: expected.slice(0, 8).join(" · "),
      impactRank: 22,
    }),
  ].slice(0, 5);

  return {
    overall_score: overall,
    ats_score: atsScore,
    structure_score: structureScore,
    keyword_score: keywordScore,
    experience_score: experienceScore,
    readability_score: readabilityScore,
    professionalism_score: professionalismScore,
    visual_score: visualScore,
    job_match_score: jobMatchScore,
    verdict,
    strengths: strengths.slice(0, 4),
    issues,
    recommendations,
    missing_keywords: Array.from(new Set([...missingKw, ...jobMissing])).slice(0, 16),
    detected_keywords: Array.from(new Set([...detected, ...technical])).slice(0, 24),
    generic_keywords: genericFound,
    contact: {
      email,
      phone: phone?.value,
      location: locationMatch?.[0],
      linkedin,
      github,
      issues: contactIssues,
    },
    sections: { present: sections.present, missing: sections.missing, order: sections.order },
    experiences,
    summary: {
      original: undefined,
      assessment: sections.present.includes("summary")
        ? "Un bloc profil a été détecté. Vérifiez qu’il contient métier, spécialisation et valeur."
        : "Aucun profil professionnel clairement identifié.",
      improved_example: pack.summary,
    },
    skills: {
      technical,
      soft: GENERIC.filter((g) => lower.includes(g)),
      unsupported: [],
      missing_for_role: missingKw,
    },
    education: {
      items: sections.present.includes("education") ? ["Section formation détectée"] : [],
      notes: sections.missing.includes("education")
        ? ["Ajoutez diplôme, établissement, ville et année."]
        : ["Précisez le diplôme exact plutôt qu’un intitulé vague."],
    },
    languages: {
      detected: [
        /[éèàùç]/.test(text) ? "fr" : "",
        /\b(the|and|experience|skills)\b/i.test(text) ? "en" : "",
        /[\u0600-\u06FF]/.test(text) ? "ar" : "",
      ].filter(Boolean),
      mixed: /[éèàùç]/.test(text) && /\b(the|experience)\b/i.test(text),
      notes: [
        "Évitez de mélanger français et anglais dans une même puce.",
        "Alignez la langue du CV sur celle de l’offre.",
      ],
    },
    ats: {
      favorable: atsFavorable,
      unfavorable: atsUnfavorable,
      disclaimer: ATS_DISCLAIMER,
    },
    visual: {
      notes: [
        "Priorité : lisibilité, hiérarchie, une colonne, marges aérées.",
        "Les CV très décoratifs (icônes, deux colonnes, graphiques) sont souvent pénalisés par les ATS.",
      ],
    },
    priorities: paidPriorities,
    word_count: wordCount,
    is_scanned: input.isScanned,
    extraction_quality: input.quality,
  };
}
