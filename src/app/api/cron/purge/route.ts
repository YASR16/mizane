import { NextRequest, NextResponse } from "next/server";
import { purgeExpiredDocuments } from "@/lib/purge";
import { captureError, logEvent } from "@/lib/monitoring";

export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization") ?? "";
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  try {
    const purged = await purgeExpiredDocuments();
    logEvent("cron.purge", { ok: true, purged });
    return NextResponse.json({ ok: true, purged });
  } catch (error) {
    await captureError(error, { route: "cron.purge" });
    logEvent("cron.purge", { ok: false });
    return NextResponse.json({ ok: false, error: "PURGE_FAILED" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
