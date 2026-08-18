import { NextRequest, NextResponse } from "next/server";
import { getPaymentProvider } from "@/lib/payments";
import { fulfillVerifiedPayment } from "@/lib/payments/fulfill";
import { captureError } from "@/lib/monitoring";
import { paymentsEnabled } from "@/lib/env";

export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (!paymentsEnabled()) {
    return NextResponse.json({ ok: false, reason: "PAYMENTS_DISABLED" }, { status: 403 });
  }
  try {
    const parsed = await getPaymentProvider().parseWebhook(raw, req.headers);
    const verified = parsed.providerRef
      ? await getPaymentProvider().verifyByRef(parsed.providerRef)
      : parsed;
    if (!verified.orderId) verified.orderId = parsed.orderId;
    if (!verified.productCode) verified.productCode = parsed.productCode;
    const result = await fulfillVerifiedPayment(verified, raw);
    if (!result.ok) {
      return NextResponse.json({ ok: false, reason: result.reason }, { status: 400 });
    }
    return NextResponse.json({ ok: true, replay: result.replay });
  } catch (error) {
    await captureError(error, { route: "payments.webhook" });
    return NextResponse.json({ ok: false, reason: "INVALID_WEBHOOK" }, { status: 400 });
  }
}
