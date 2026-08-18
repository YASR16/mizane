import type { PaymentStatus, VerifiedPayment } from "./types";

export type StoredPayment = {
  orderId: string;
  amountMad: number;
  currency: string;
  productCode: string;
  status: PaymentStatus;
  provider: string;
};

export type FulfillDecision =
  | { ok: true; replay: boolean }
  | { ok: false; reason: string };

export function evaluateFulfillment(payment: StoredPayment, verified: VerifiedPayment): FulfillDecision {
  if (payment.status === "SUCCEEDED") {
    return { ok: true, replay: true };
  }
  if (verified.status === "CANCELLED") {
    return { ok: false, reason: "CANCELLED" };
  }
  if (verified.status === "REFUNDED") {
    return { ok: false, reason: "REFUNDED" };
  }
  if (verified.status !== "SUCCEEDED") {
    return { ok: false, reason: "NOT_SUCCEEDED" };
  }
  if (!verified.orderId || verified.orderId !== payment.orderId) {
    return { ok: false, reason: "ORDER_MISMATCH" };
  }
  if (verified.amountMad == null || verified.amountMad !== payment.amountMad) {
    return { ok: false, reason: "AMOUNT_MISMATCH" };
  }
  if (!verified.currency || verified.currency !== payment.currency) {
    return { ok: false, reason: "CURRENCY_MISMATCH" };
  }
  if (verified.productCode && verified.productCode !== payment.productCode) {
    return { ok: false, reason: "PRODUCT_MISMATCH" };
  }
  return { ok: true, replay: false };
}

export function unlockFlags(productCode: string) {
  return {
    report: productCode === "ANALYSIS" || productCode === "OPTIMIZED_CV",
    optimizer: productCode === "OPTIMIZED_CV",
  };
}
