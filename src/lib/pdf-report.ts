import PDFDocument from "pdfkit";
import type { AnalysisResult } from "@/lib/analysis/schema";
import { brand } from "@/lib/brand";

function collect(doc: PDFKit.PDFDocument) {
  const chunks: Buffer[] = [];
  return new Promise<Buffer>((resolve, reject) => {
    doc.on("data", (c) => chunks.push(c as Buffer));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
}

export async function generateReportPdf(result: AnalysisResult, meta: { fileName?: string; targetRole?: string | null }) {
  const doc = new PDFDocument({ size: "A4", margin: 50, info: { Title: `${brand.name} — Rapport CV`, Author: brand.name } });
  const done = collect(doc);

  doc.fontSize(18).text(`${brand.name} — Rapport d'analyse CV`);
  doc.moveDown(0.4);
  doc.fontSize(10).fillColor("#3d4450").text(meta.fileName ?? "CV");
  if (meta.targetRole) doc.text(`Poste visé : ${meta.targetRole}`);
  doc.moveDown();
  doc.fillColor("#14181f").fontSize(28).text(`${result.overall_score}/100`);
  doc.fontSize(11).text(result.verdict);
  doc.moveDown();

  const scores: [string, number][] = [
    ["ATS", result.ats_score],
    ["Structure", result.structure_score],
    ["Mots-clés", result.keyword_score],
    ["Expérience", result.experience_score],
    ["Lisibilité", result.readability_score],
    ["Professionnalisme", result.professionalism_score],
    ["Langue / présentation", result.visual_score],
  ];
  doc.fontSize(14).text("Scores");
  doc.moveDown(0.3);
  doc.fontSize(10);
  for (const [label, value] of scores) {
    doc.text(`${label} : ${value}/100`);
  }

  doc.moveDown();
  doc.fontSize(14).fillColor("#14181f").text("Problèmes principaux");
  doc.moveDown(0.3);
  for (const issue of result.issues.slice(0, 8)) {
    doc.fontSize(11).text(issue.title);
    doc.fontSize(9).fillColor("#3d4450").text(`Problème : ${issue.problem}`);
    doc.text(`Pourquoi : ${issue.why}`);
    doc.text(`Correction : ${issue.how}`);
    if (issue.exampleAfter) doc.text(`Exemple : ${issue.exampleAfter}`);
    doc.fillColor("#14181f").moveDown(0.4);
  }

  doc.fontSize(14).text("Recommandations priorisées");
  doc.moveDown(0.3);
  for (const [i, p] of result.priorities.entries()) {
    doc.fontSize(11).text(`${i + 1}. ${p.title}`);
    doc.fontSize(9).fillColor("#3d4450").text(`Problème : ${p.problem}`);
    doc.text(`Pourquoi : ${p.why}`);
    doc.text(`Correction : ${p.how}`);
    if (p.exampleBefore) doc.text(`Avant : ${p.exampleBefore}`);
    if (p.exampleAfter) doc.text(`Après : ${p.exampleAfter}`);
    doc.fillColor("#14181f").moveDown(0.4);
  }

  if (result.summary?.improved_example) {
    doc.fontSize(14).text("Exemple de profil personnalisé");
    doc.moveDown(0.2);
    doc.fontSize(10).fillColor("#3d4450").text(result.summary.improved_example);
    doc.fillColor("#14181f").moveDown();
  }

  doc.fontSize(14).text("Mots-clés");
  doc.fontSize(10).fillColor("#3d4450").text(`Détectés : ${result.detected_keywords.join(", ") || "—"}`);
  doc.text(`Manquants : ${result.missing_keywords.join(", ") || "—"}`);
  doc.moveDown();
  doc.fontSize(8).text(result.ats.disclaimer);
  doc.end();
  return done;
}
