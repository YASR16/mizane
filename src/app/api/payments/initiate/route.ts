import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { canAccessAnalysis } from "@/lib/access";
import { getPaymentProvider } from "@/lib/payments";
import { getProduct } from "@/lib/pricing";
import { orderId } from "@/lib/security";
import { trackEvent } from "@/lib/analytics";
import { brand } from "@/lib/brand";
import { paymentOrigin } from "@/lib/app-url";
import { captureError } from "@/lib/monitoring";
import { paymentsEnabled } from "@/lib/env";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { analysisId?: string; productCode?: string };
  const product = getProduct(body.productCode ?? "ANALYSIS");
  if (!product || !body.analysisId) {
    return NextResponse.json({ error: "Produit invalide." }, { status: 400 });
  }
  const access = await canAccessAnalysis(body.analysisId);
  if (!access.ok || !access.analysis) {
    return NextResponse.json({ error: "Analyse introuvable." }, { status: 404 });
  }

  if (product.code === "ANALYSIS" && access.analysis.reportUnlocked) {
    return NextResponse.json({ alreadyUnlocked: true, analysisId: body.analysisId });
  }
  if (product.code === "OPTIMIZED_CV" && access.analysis.optimizerUnlocked) {
    return NextResponse.json({ alreadyUnlocked: true, analysisId: body.analysisId, product: "OPTIMIZED_CV" });
  }

  if (!paymentsEnabled()) {
    await trackEvent({
      name: "checkout_started",
      analysisId: body.analysisId,
      userId: access.actor.userId,
      meta: { product: product.code, disabled: true },
    });
    return NextResponse.json(
      {
        error: "Paiement bientôt disponible",
        code: "PAYMENTS_DISABLED",
        paymentsEnabled: false,
      },
      { status: 503 },
    );
  }

  const existing = await prisma.payment.findFirst({
    where: {
      analysisId: body.analysisId,
      productCode: product.code,
      status: "PENDING",
    },
    orderBy: { createdAt: "desc" },
  });
  if (existing?.checkoutUrl) {
    return NextResponse.json({
      orderId: existing.orderId,
      checkoutUrl: existing.checkoutUrl,
      amountMad: existing.amountMad,
      reused: true,
    });
  }

  const oid = orderId();
  const origin = paymentOrigin(req.nextUrl.origin);
  const payment = await prisma.payment.create({
    data: {
      orderId: oid,
      userId: access.actor.userId,
      analysisId: body.analysisId,
      guestToken: access.actor.guestToken,
      productCode: product.code,
      amountMad: product.priceMad,
      status: "PENDING",
      provider: getPaymentProvider().name,
    },
  });

  await trackEvent({
    name: "checkout_started",
    analysisId: body.analysisId,
    userId: access.actor.userId,
    meta: { product: product.code, amountMad: product.priceMad },
  });

  const provider = getPaymentProvider();
  try {
    const initiated = await provider.initiate({
      orderId: oid,
      amountMad: product.priceMad,
      productCode: product.code,
      returnUrl: `${origin}/paiement/retour?orderId=${oid}`,
      callbackUrl: `${origin}/api/payments/webhook`,
      description: `${brand.name} — ${product.code}`,
    });

    await prisma.payment.update({
      where: { id: payment.id },
      data: { providerRef: initiated.providerRef, checkoutUrl: initiated.checkoutUrl },
    });

    return NextResponse.json({
      orderId: oid,
      checkoutUrl: initiated.checkoutUrl,
      amountMad: product.priceMad,
    });
  } catch (error) {
    await captureError(error, { route: "payments.initiate", orderId: oid, product: product.code });
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED", failureReason: "INITIATE_FAILED" },
    });
    return NextResponse.json({ error: "Impossible de démarrer le paiement." }, { status: 502 });
  }
}
