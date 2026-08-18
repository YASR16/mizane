import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getActor, guestCookieHeader } from "@/lib/access";
import { retentionDays } from "@/lib/brand";
import { extractDocument } from "@/lib/extraction";
import { runAnalysis, publicPreview } from "@/lib/analysis/engine";
import { storePrivateFile } from "@/lib/storage";
import { clientIp, rateLimit, trackEvent } from "@/lib/analytics";
import { sanitizeFilename, sha256 } from "@/lib/security";
import { UploadRejected, validateUpload } from "@/lib/files";
import { captureError } from "@/lib/monitoring";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const limited = rateLimit(`upload:${ip}`, 8, 10 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Trop de tentatives. Réessayez dans quelques minutes." }, { status: 429 });
  }

  const actor = await getActor();
  const form = await req.formData();
  const file = form.get("file");
  const targetRole = String(form.get("targetRole") ?? "").slice(0, 120);
  const jobDescription = String(form.get("jobDescription") ?? "").slice(0, 8000);
  const locale = String(form.get("locale") ?? "fr").slice(0, 5);
  const targetCountry = String(form.get("targetCountry") ?? "").slice(0, 8).toUpperCase();

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  let kind: "pdf" | "docx";
  let mime: string;
  try {
    const validated = validateUpload(buffer, file.name, file.size);
    kind = validated.kind;
    mime = validated.mime;
  } catch (error) {
    if (error instanceof UploadRejected) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 400 });
    }
    throw error;
  }

  await trackEvent({
    name: "upload_completed",
    userId: actor.userId,
    sessionId: actor.guestToken,
    locale,
  });

  let extraction;
  try {
    extraction = await extractDocument(buffer, mime);
  } catch {
    return NextResponse.json({ error: "Impossible d’extraire le contenu de ce fichier." }, { status: 422 });
  }

  if (!extraction.text && !extraction.isScanned) {
    return NextResponse.json({ error: "Ce CV semble vide." }, { status: 422 });
  }

  const checksum = sha256(buffer);
  const ext = kind === "pdf" ? ".pdf" : ".docx";
  let storageKey: string;
  try {
    storageKey = await storePrivateFile(buffer, ext);
  } catch (error) {
    await captureError(error, { route: "analyses.upload" });
    return NextResponse.json({ error: "Impossible d’enregistrer le fichier." }, { status: 500 });
  }
  const purgeAt = new Date(Date.now() + retentionDays * 24 * 60 * 60 * 1000);

  const document = await prisma.cvDocument.create({
    data: {
      userId: actor.userId,
      guestToken: actor.guestToken,
      originalName: sanitizeFilename(file.name),
      mimeType: mime,
      sizeBytes: file.size,
      storageKey,
      checksum,
      extractedText: extraction.text,
      pageCount: extraction.pageCount,
      isScanned: extraction.isScanned,
      purgeAt,
    },
  });

  const analysis = await prisma.analysis.create({
    data: {
      documentId: document.id,
      userId: actor.userId,
      guestToken: actor.guestToken,
      status: "RUNNING",
      targetRole: targetRole || null,
      jobDescription: jobDescription || null,
      targetLanguage: locale,
      targetCountry: targetCountry || "UNSET",
    },
  });

  await trackEvent({
    name: "analysis_started",
    userId: actor.userId,
    analysisId: analysis.id,
    sessionId: actor.guestToken,
  });

  try {
    const { result, engine, usage } = await runAnalysis({
      text: extraction.text,
      isScanned: extraction.isScanned,
      quality: extraction.quality,
      targetRole,
      jobDescription,
      filename: file.name,
      locale,
      targetCountry: targetCountry || undefined,
    });

    await prisma.$transaction([
      prisma.analysis.update({
        where: { id: analysis.id },
        data: {
          status: "COMPLETED",
          engine,
          overallScore: result.overall_score,
          resultJson: JSON.stringify(result),
          promptTokens: usage.prompt,
          completionTokens: usage.completion,
          estimatedCostUsd: (usage.prompt * 0.15 + usage.completion * 0.6) / 1_000_000,
          completedAt: new Date(),
        },
      }),
      prisma.analysisScore.create({
        data: {
          analysisId: analysis.id,
          ats: result.ats_score,
          structure: result.structure_score,
          keywords: result.keyword_score,
          experience: result.experience_score,
          readability: result.readability_score,
          professionalism: result.professionalism_score,
          visual: result.visual_score,
          jobMatch: result.job_match_score,
        },
      }),
      prisma.recommendation.createMany({
        data: [
          ...result.strengths.map((f, i) => ({
            analysisId: analysis.id,
            category: f.category,
            severity: f.severity,
            isLocked: false,
            isStrength: true,
            title: f.title,
            problem: f.problem,
            why: f.why,
            how: f.how,
            exampleBefore: f.exampleBefore,
            exampleAfter: f.exampleAfter,
            impactRank: f.impactRank ?? 80 + i,
          })),
          ...result.issues.map((f, i) => ({
            analysisId: analysis.id,
            category: f.category,
            severity: f.severity,
            isLocked: i >= 2,
            isStrength: false,
            title: f.title,
            problem: f.problem,
            why: f.why,
            how: f.how,
            exampleBefore: f.exampleBefore,
            exampleAfter: f.exampleAfter,
            impactRank: f.impactRank ?? i + 1,
          })),
        ],
      }),
    ]);

    await trackEvent({
      name: "analysis_completed",
      userId: actor.userId,
      analysisId: analysis.id,
      sessionId: actor.guestToken,
    });

    const response = NextResponse.json({
      id: analysis.id,
      preview: publicPreview(result),
      warnings: extraction.warnings,
    });
    if (actor.setGuestCookie && actor.guestToken) {
      response.headers.append("Set-Cookie", guestCookieHeader(actor.guestToken));
    }
    return response;
  } catch (error) {
    await captureError(error, { route: "analyses.create", analysisId: analysis.id });
    await prisma.analysis.update({
      where: { id: analysis.id },
      data: { status: "FAILED", errorCode: "AI_TIMEOUT", errorMessage: "L’analyse a échoué." },
    });
    return NextResponse.json({ error: "L’analyse a pris trop de temps. Réessayez." }, { status: 504 });
  }
}
