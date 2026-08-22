import { NextRequest, NextResponse } from "next/server";
import { clientIp, rateLimit, trackEvent } from "@/lib/analytics";

export async function POST(req: NextRequest) {
  const limited = rateLimit(`feedback:${clientIp(req)}`, 8, 60 * 60 * 1000);
  if (!limited.ok) return NextResponse.json({ error: "Trop de messages." }, { status: 429 });

  const body = (await req.json()) as {
    rating?: number;
    message?: string;
    contact?: string;
    scenario?: string;
  };
  const message = String(body.message ?? "").trim().slice(0, 2000);
  if (message.length < 8) {
    return NextResponse.json({ error: "Message trop court." }, { status: 400 });
  }
  const rating = typeof body.rating === "number" ? Math.max(1, Math.min(5, Math.round(body.rating))) : null;

  await trackEvent({
    name: "beta_feedback",
    path: "/retour-beta",
    meta: {
      rating,
      scenario: String(body.scenario ?? "").slice(0, 80) || null,
      contactPresent: Boolean(body.contact?.includes("@")),
      // Store message for owner review in analytics DB — never CV content.
      message,
    },
  });

  return NextResponse.json({ ok: true });
}
