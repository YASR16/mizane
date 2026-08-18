export type Finding = {
  id: string;
  category:
    | "contact"
    | "structure"
    | "ats"
    | "keywords"
    | "experience"
    | "summary"
    | "skills"
    | "education"
    | "language"
    | "visual"
    | "readability";
  severity: "critical" | "high" | "medium" | "low";
  isStrength: boolean;
  title: string;
  problem: string;
  why: string;
  how: string;
  exampleBefore?: string;
  exampleAfter?: string;
  impactRank: number;
};

export type ExperienceBullet = {
  original: string;
  quality: "weak" | "average" | "strong";
  hasMetric: boolean;
  hasActionVerb: boolean;
  hasTechnology: boolean;
  suggestion?: string;
};

export type ExperienceBlock = {
  title: string;
  company?: string;
  period?: string;
  bullets: ExperienceBullet[];
  score: number;
};

export type AnalysisResult = {
  overall_score: number;
  ats_score: number;
  structure_score: number;
  keyword_score: number;
  experience_score: number;
  readability_score: number;
  professionalism_score: number;
  visual_score: number;
  job_match_score?: number;
  verdict: string;
  strengths: Finding[];
  issues: Finding[];
  recommendations: Finding[];
  missing_keywords: string[];
  detected_keywords: string[];
  generic_keywords: string[];
  contact: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    issues: string[];
  };
  sections: {
    present: string[];
    missing: string[];
    order: string[];
  };
  experiences: ExperienceBlock[];
  summary?: {
    original?: string;
    assessment: string;
    improved_example?: string;
  };
  skills: {
    technical: string[];
    soft: string[];
    unsupported: string[];
    missing_for_role: string[];
  };
  education: {
    items: string[];
    notes: string[];
  };
  languages: {
    detected: string[];
    mixed: boolean;
    notes: string[];
  };
  ats: {
    favorable: string[];
    unfavorable: string[];
    disclaimer: string;
  };
  visual: {
    notes: string[];
  };
  priorities: Finding[];
  word_count: number;
  is_scanned: boolean;
  extraction_quality: "high" | "medium" | "low";
};

export const ATS_DISCLAIMER =
  "Votre CV présente plusieurs caractéristiques généralement favorables ou défavorables aux systèmes ATS. Ceci n’est pas le score d’un ATS d’entreprise spécifique.";
