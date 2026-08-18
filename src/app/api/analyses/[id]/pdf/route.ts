import { NextRequest, NextResponse } from "next/server";
import { canAccessAnalysis } from "@/lib/access";
import { generateReportPdf } from "@/lib/pdf-report";
import type { AnalysisResult } from "@/lib/analysis/schema";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const access = await canAccessAnalysis(id);
  if (!access.ok || !access.analysis) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }
  if (!access.analysis.reportUnlocked || !access.analysis.resultJson) {
    return NextResponse.json({ error: "Rapport PDF disponible après paiement de l’analyse." }, { status: 402 });
  }
  const result = JSON.parse(access.analysis.resultJson) as AnalysisResult;
  const pdf = await generateReportPdf(result, {
    fileName: access.analysis.document.originalName,
    targetRole: access.analysis.targetRole,
  });
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="mizane-rapport-${id.slice(0, 8)}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
