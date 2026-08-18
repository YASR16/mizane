import { describe, expect, it } from "vitest";
import { generateReportPdf } from "@/lib/pdf-report";
import type { AnalysisResult } from "@/lib/analysis/schema";
import { ATS_DISCLAIMER } from "@/lib/analysis/schema";

const sample: AnalysisResult = {
  overall_score: 71,
  ats_score: 64,
  structure_score: 70,
  keyword_score: 60,
  experience_score: 68,
  readability_score: 75,
  professionalism_score: 72,
  visual_score: 66,
  verdict: "Bon potentiel",
  strengths: [],
  issues: [
    {
      id: "i1",
      category: "experience",
      severity: "high",
      isStrength: false,
      title: "Puces faibles",
      problem: "Pas de résultat",
      why: "Les recruteurs veulent de l'impact",
      how: "Ajouter un chiffre",
      exampleAfter: "Reduced bugs by 20%",
      impactRank: 1,
    },
  ],
  recommendations: [],
  missing_keywords: ["playwright"],
  detected_keywords: ["qa"],
  generic_keywords: [],
  contact: { issues: [] },
  sections: { present: ["experience"], missing: ["skills"], order: ["experience"] },
  experiences: [],
  skills: { technical: ["qa"], soft: [], unsupported: [], missing_for_role: ["playwright"] },
  education: { items: [], notes: [] },
  languages: { detected: ["fr"], mixed: false, notes: [] },
  ats: { favorable: ["texte extractible"], unfavorable: [], disclaimer: ATS_DISCLAIMER },
  visual: { notes: [] },
  priorities: [],
  word_count: 220,
  is_scanned: false,
  extraction_quality: "high",
};

describe("PDF report", () => {
  it("generates a downloadable PDF containing scores", async () => {
    const buf = await generateReportPdf(sample, { fileName: "cv.pdf", targetRole: "QA" });
    expect(buf.subarray(0, 5).toString()).toBe("%PDF-");
    expect(buf.length).toBeGreaterThan(400);
    expect(buf.includes(Buffer.from("%PDF-"))).toBe(true);
  });
});
