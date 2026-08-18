import { NextRequest, NextResponse } from "next/server";
import { canAccessDocument } from "@/lib/access";
import { readPrivateFile, signedOwnerGetUrl } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: Promise<{ documentId: string }> }) {
  const { documentId } = await params;
  const access = await canAccessDocument(documentId);
  if (!access.ok || !access.document) {
    return NextResponse.json({ error: "Fichier introuvable." }, { status: 404 });
  }

  const redirect = req.nextUrl.searchParams.get("redirect") === "1";
  if (redirect) {
    const signed = await signedOwnerGetUrl(access.document.storageKey);
    if (signed) {
      return NextResponse.redirect(signed, 302);
    }
  }

  try {
    const body = await readPrivateFile(access.document.storageKey);
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": access.document.mimeType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${access.document.originalName.replace(/"/g, "")}"`,
        "Cache-Control": "private, no-store",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
      },
    });
  } catch {
    return NextResponse.json({ error: "Fichier indisponible." }, { status: 404 });
  }
}
