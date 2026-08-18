import { NextRequest, NextResponse } from "next/server";
import { canAccessAnalysis } from "@/lib/access";
import { deleteCvCompletely } from "@/lib/purge";

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const analysisId = searchParams.get("analysisId");
  if (!analysisId) return NextResponse.json({ error: "analysisId requis" }, { status: 400 });
  const access = await canAccessAnalysis(analysisId);
  if (!access.ok || !access.analysis) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  if (access.analysis.document.deletedAt) {
    return NextResponse.json({ ok: true, alreadyDeleted: true });
  }
  const result = await deleteCvCompletely(access.analysis.documentId);
  if (!result.ok) return NextResponse.json({ error: "Suppression impossible." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
