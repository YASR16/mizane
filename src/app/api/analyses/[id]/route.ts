import { NextRequest, NextResponse } from "next/server";
import { canAccessAnalysis } from "@/lib/access";
import { publicPreview } from "@/lib/analysis/engine";
import type { AnalysisResult } from "@/lib/analysis/schema";
import { trackEvent } from "@/lib/analytics";
import { paymentsEnabled } from "@/lib/env";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const access = await canAccessAnalysis(id);
  if (!access.ok || !access.analysis) {
    return NextResponse.json({ error: "Analyse introuvable." }, { status: 404 });
  }
  const analysis = access.analysis;
  if (analysis.status !== "COMPLETED" || !analysis.resultJson) {
    return NextResponse.json({
      id: analysis.id,
      status: analysis.status,
      error: analysis.errorMessage,
    });
  }
  const result = JSON.parse(analysis.resultJson) as AnalysisResult;
  const unlocked = analysis.reportUnlocked;
  const preview = publicPreview(result);
  await trackEvent({
    name: unlocked ? "report_unlocked" : "free_result_viewed",
    analysisId: analysis.id,
    userId: access.actor.userId,
  });
  return NextResponse.json({
    id: analysis.id,
    status: analysis.status,
    unlocked,
    optimizerUnlocked: analysis.optimizerUnlocked,
    targetRole: analysis.targetRole,
    documentName: analysis.document.originalName,
    documentDeleted: Boolean(analysis.document.deletedAt),
    isScanned: analysis.document.isScanned,
    createdAt: analysis.createdAt,
    preview,
    report: unlocked ? result : null,
    lockedCount: preview.locked_recommendations,
    lockedItems: preview.locked_items,
    paymentsEnabled: paymentsEnabled(),
  });
}
