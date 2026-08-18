import { prisma } from "@/lib/db";
import { trackEvent } from "@/lib/analytics";
import { sha256 } from "@/lib/security";
import { evaluateFulfillment, unlockFlags, type StoredPayment } from "./rules";
import type { VerifiedPayment } from "./types";

export async function fulfillVerifiedPayment(verified: VerifiedPayment, rawBody?: string) {
  if (!verified.orderId) {
    return { ok: false as const, reason: "MISSING_ORDER" };
  }

  const eventHash = rawBody ? sha256(rawBody) : null;
  if (eventHash) {
    const existing = await prisma.webhookEvent.findUnique({ where: { eventHash } });
    if (existing) {
      const payment = await prisma.payment.findUnique({ where: { orderId: verified.orderId } });
      if (payment?.status === "SUCCEEDED") {
        return { ok: true as const, replay: true, payment };
      }
      return { ok: false as const, reason: "REPLAY_REJECTED" };
    }
  }

  const payment = await prisma.payment.findUnique({ where: { orderId: verified.orderId } });
  if (!payment) return { ok: false as const, reason: "UNKNOWN_ORDER" };

  const stored: StoredPayment = {
    orderId: payment.orderId,
    amountMad: payment.amountMad,
    currency: payment.currency,
    productCode: payment.productCode,
    status: payment.status as StoredPayment["status"],
    provider: payment.provider,
  };
  const decision = evaluateFulfillment(stored, verified);
  if (!decision.ok) {
    if (decision.reason === "CANCELLED" || decision.reason === "NOT_SUCCEEDED") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: verified.status === "CANCELLED" ? "CANCELLED" : "FAILED", failureReason: decision.reason },
      });
    }
    if (decision.reason === "REFUNDED") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "REFUNDED", refundedAt: new Date() },
      });
    }
    await trackEvent({ name: "payment_failed", analysisId: payment.analysisId, meta: { reason: decision.reason } });
    return { ok: false as const, reason: decision.reason };
  }

  if (decision.replay) {
    return { ok: true as const, replay: true, payment };
  }

  const updated = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "SUCCEEDED",
      transactionId: verified.transactionId,
      paidAt: new Date(),
      webhookHash: eventHash ?? payment.webhookHash,
    },
  });

  if (eventHash) {
    await prisma.webhookEvent.create({
      data: {
        provider: verified.provider ?? payment.provider,
        eventHash,
        orderId: verified.orderId,
      },
    });
  }

  const flags = unlockFlags(payment.productCode);
  if (payment.analysisId) {
    await prisma.analysis.update({
      where: { id: payment.analysisId },
      data: {
        ...(flags.report ? { reportUnlocked: true } : {}),
        ...(flags.optimizer ? { optimizerUnlocked: true } : {}),
      },
    });
    if (flags.report) {
      await prisma.recommendation.updateMany({
        where: { analysisId: payment.analysisId },
        data: { isLocked: false },
      });
    }
  }

  await trackEvent({
    name: "payment_success",
    analysisId: payment.analysisId,
    userId: payment.userId,
    meta: { orderId: payment.orderId, product: payment.productCode },
  });
  if (flags.report) {
    await trackEvent({
      name: "report_unlocked",
      analysisId: payment.analysisId,
      userId: payment.userId,
      meta: { orderId: payment.orderId },
    });
  }
  if (flags.optimizer) {
    await trackEvent({
      name: "optimizer_purchase",
      analysisId: payment.analysisId,
      userId: payment.userId,
      meta: { orderId: payment.orderId },
    });
  }

  return { ok: true as const, replay: false, payment: updated };
}
