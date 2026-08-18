import { cookies } from "next/headers";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { guestToken } from "@/lib/security";

export async function getActor() {
  const session = await auth();
  const jar = await cookies();
  let guest = jar.get("mizane_guest")?.value ?? null;
  if (!session?.user?.id && !guest) {
    guest = guestToken();
  }
  return {
    userId: session?.user?.id ?? null,
    role: session?.user?.role ?? "USER",
    guestToken: guest,
    setGuestCookie: !session?.user?.id && guest && !jar.get("mizane_guest"),
  };
}

export function guestCookieHeader(token: string) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `mizane_guest=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}${secure}`;
}

export async function canAccessAnalysis(analysisId: string) {
  const actor = await getActor();
  const analysis = await prisma.analysis.findUnique({
    where: { id: analysisId },
    include: { document: true, scores: true, recommendations: true, payments: true },
  });
  if (!analysis) return { ok: false as const, actor, analysis: null };
  if (analysis.document.deletedAt) return { ok: false as const, actor, analysis: null };
  const owns =
    (actor.userId && analysis.userId === actor.userId) ||
    (actor.guestToken && analysis.guestToken === actor.guestToken);
  if (!owns) return { ok: false as const, actor, analysis: null };
  return { ok: true as const, actor, analysis };
}

export async function canAccessDocument(documentId: string) {
  const actor = await getActor();
  const document = await prisma.cvDocument.findUnique({ where: { id: documentId } });
  if (!document || document.deletedAt) return { ok: false as const, actor, document: null };
  const owns =
    (actor.userId && document.userId === actor.userId) ||
    (actor.guestToken && document.guestToken === actor.guestToken);
  if (!owns) return { ok: false as const, actor, document: null };
  return { ok: true as const, actor, document };
}
