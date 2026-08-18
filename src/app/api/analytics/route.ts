import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { requestContext, trackEvent } from "@/lib/analytics";

export async function POST(req: NextRequest) {
  const session = await auth();
  const body = (await req.json().catch(() => ({}))) as {
    name?: string;
    path?: string;
    analysisId?: string;
    meta?: Record<string, unknown>;
  };
  if (!body.name) return NextResponse.json({ ok: false }, { status: 400 });
  const ctx = requestContext(req);
  await trackEvent({
    name: body.name.slice(0, 80),
    path: body.path,
    analysisId: body.analysisId,
    userId: session?.user?.id,
    locale: ctx.locale,
    meta: {
      ...(body.meta ?? {}),
      device: ctx.device,
      country: ctx.country,
    },
  });
  return NextResponse.json({ ok: true });
}
