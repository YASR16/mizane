import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { canAccessAnalysis } from "@/lib/access";
import { optimizeCv } from "@/lib/analysis/engine";
import type { AnalysisResult } from "@/lib/analysis/schema";
import { trackEvent } from "@/lib/analytics";
import { getProduct } from "@/lib/pricing";
import { captureError } from "@/lib/monitoring";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    analysisId?: string;
    language?: string;
    targetRole?: string;
    targetCountry?: string;
    jobDescription?: string;
  };
  if (!body.analysisId) return NextResponse.json({ error: "analysisId requis" }, { status: 400 });
  const access = await canAccessAnalysis(body.analysisId);
  if (!access.ok || !access.analysis) return NextResponse.json({ error: "Introuvable" }, { status: 403 });

  const paidOptimize = await prisma.payment.findFirst({
    where: {
      analysisId: body.analysisId,
      productCode: "OPTIMIZED_CV",
      status: "SUCCEEDED",
    },
  });
  if (!access.analysis.optimizerUnlocked && !paidOptimize) {
    return NextResponse.json(
      { error: "Le CV optimisé nécessite un paiement distinct.", code: "OPTIMIZER_LOCKED" },
      { status: 402 },
    );
  }

  if (!access.analysis.resultJson) {
    return NextResponse.json({ error: "Analyse indisponible." }, { status: 409 });
  }

  const result = JSON.parse(access.analysis.resultJson) as AnalysisResult;
  try {
    const content = await optimizeCv({
      text: access.analysis.document.extractedText ?? "",
      analysis: result,
      language: body.language,
      targetRole: body.targetRole ?? access.analysis.targetRole ?? undefined,
      targetCountry: body.targetCountry,
      jobDescription: body.jobDescription,
    });

    const generated = await prisma.generatedCv.create({
      data: {
        analysisId: body.analysisId,
        userId: access.actor.userId,
        language: body.language ?? "fr",
        targetRole: body.targetRole,
        targetCountry: body.targetCountry ?? access.analysis.targetCountry ?? "UNSET",
        contentJson: JSON.stringify(content),
      },
    });

    await trackEvent({ name: "cv_optimized", analysisId: body.analysisId, userId: access.actor.userId });
    return NextResponse.json({ id: generated.id, content, product: getProduct("OPTIMIZED_CV") });
  } catch (error) {
    await captureError(error, { route: "optimize", analysisId: body.analysisId });
    return NextResponse.json({ error: "Optimisation impossible." }, { status: 500 });
  }
}
