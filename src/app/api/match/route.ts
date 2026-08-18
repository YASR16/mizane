import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { canAccessAnalysis } from "@/lib/access";
import { matchJob } from "@/lib/analysis/engine";
import { trackEvent } from "@/lib/analytics";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { analysisId?: string; jobDescription?: string; title?: string };
  if (!body.analysisId || !body.jobDescription?.trim()) {
    return NextResponse.json({ error: "Offre requise." }, { status: 400 });
  }
  const access = await canAccessAnalysis(body.analysisId);
  if (!access.ok || !access.analysis) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const jd = await prisma.jobDescription.create({
    data: { title: body.title, rawText: body.jobDescription.slice(0, 12000) },
  });
  const match = await matchJob({
    cvText: access.analysis.document.extractedText ?? "",
    jobDescription: body.jobDescription,
  });

  const saved = await prisma.jobMatch.create({
    data: {
      analysisId: body.analysisId,
      jobDescriptionId: jd.id,
      userId: access.actor.userId,
      score: match.score,
      matchingSkillsJson: JSON.stringify(match.matchingSkills),
      missingKeywordsJson: JSON.stringify(match.missingKeywords),
      missingRequirementsJson: JSON.stringify(match.missingRequirements),
      unlocked: access.analysis.reportUnlocked,
    },
  });

  await trackEvent({ name: "job_match_used", analysisId: body.analysisId, userId: access.actor.userId });

  return NextResponse.json({
    id: saved.id,
    score: match.score,
    matchingSkills: match.matchingSkills,
    missingKeywords: access.analysis.reportUnlocked ? match.missingKeywords : match.missingKeywords.slice(0, 2),
    missingRequirements: access.analysis.reportUnlocked ? match.missingRequirements : [],
    unlocked: access.analysis.reportUnlocked,
  });
}
