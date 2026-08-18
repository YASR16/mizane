import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getActor } from "@/lib/access";
import { getPaymentProvider } from "@/lib/payments";
import { fulfillVerifiedPayment } from "@/lib/payments/fulfill";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { orderId?: string };
  if (!body.orderId) return NextResponse.json({ error: "orderId requis" }, { status: 400 });

  const actor = await getActor();
  const payment = await prisma.payment.findUnique({ where: { orderId: body.orderId } });
  if (!payment) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });

  const owns =
    (actor.userId && payment.userId === actor.userId) ||
    (actor.guestToken && payment.guestToken === actor.guestToken);
  if (!owns) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }

  if (payment.status === "SUCCEEDED") {
    return NextResponse.json({ status: "SUCCEEDED", analysisId: payment.analysisId, productCode: payment.productCode });
  }
  if (!payment.providerRef) {
    return NextResponse.json({ status: payment.status });
  }

  const verified = await getPaymentProvider().verifyByRef(payment.providerRef);
  if (!verified.orderId) verified.orderId = payment.orderId;
  if (!verified.productCode) verified.productCode = payment.productCode;

  const result = await fulfillVerifiedPayment(verified);
  if (!result.ok) {
    return NextResponse.json({ status: "FAILED", reason: result.reason });
  }
  return NextResponse.json({
    status: "SUCCEEDED",
    analysisId: payment.analysisId,
    productCode: payment.productCode,
    replay: result.replay,
  });
}
