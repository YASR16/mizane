import { describe, expect, it } from "vitest";
import { evaluateFulfillment, unlockFlags, type StoredPayment } from "@/lib/payments/rules";
import type { VerifiedPayment } from "@/lib/payments/types";
import { hmacSign } from "@/lib/security";

const stored: StoredPayment = {
  orderId: "MZ-1",
  amountMad: 49,
  currency: "MAD",
  productCode: "ANALYSIS",
  status: "PENDING",
  provider: "mock",
};

function verified(over: Partial<VerifiedPayment> = {}): VerifiedPayment {
  return {
    orderId: "MZ-1",
    providerRef: "mock_MZ-1",
    status: "SUCCEEDED",
    amountMad: 49,
    currency: "MAD",
    productCode: "ANALYSIS",
    provider: "mock",
    raw: {},
    ...over,
  };
}

describe("payment fulfillment rules", () => {
  it("accepts a matching succeeded payment", () => {
    expect(evaluateFulfillment(stored, verified())).toEqual({ ok: true, replay: false });
  });

  it("rejects a failed payment", () => {
    const r = evaluateFulfillment(stored, verified({ status: "FAILED" }));
    expect(r).toEqual({ ok: false, reason: "NOT_SUCCEEDED" });
  });

  it("rejects cancelled and refunded", () => {
    expect(evaluateFulfillment(stored, verified({ status: "CANCELLED" }))).toEqual({ ok: false, reason: "CANCELLED" });
    expect(evaluateFulfillment(stored, verified({ status: "REFUNDED" }))).toEqual({ ok: false, reason: "REFUNDED" });
  });

  it("rejects wrong amount", () => {
    expect(evaluateFulfillment(stored, verified({ amountMad: 1 }))).toEqual({ ok: false, reason: "AMOUNT_MISMATCH" });
  });

  it("rejects missing amount (frontend cannot invent success)", () => {
    expect(evaluateFulfillment(stored, verified({ amountMad: undefined }))).toEqual({
      ok: false,
      reason: "AMOUNT_MISMATCH",
    });
  });

  it("rejects wrong order id", () => {
    expect(evaluateFulfillment(stored, verified({ orderId: "OTHER" }))).toEqual({ ok: false, reason: "ORDER_MISMATCH" });
  });

  it("rejects wrong currency", () => {
    expect(evaluateFulfillment(stored, verified({ currency: "EUR" }))).toEqual({
      ok: false,
      reason: "CURRENCY_MISMATCH",
    });
  });

  it("rejects wrong product", () => {
    expect(evaluateFulfillment(stored, verified({ productCode: "OPTIMIZED_CV" }))).toEqual({
      ok: false,
      reason: "PRODUCT_MISMATCH",
    });
  });

  it("treats already succeeded as replay", () => {
    expect(evaluateFulfillment({ ...stored, status: "SUCCEEDED" }, verified())).toEqual({ ok: true, replay: true });
  });

  it("does not unlock optimizer from ANALYSIS", () => {
    expect(unlockFlags("ANALYSIS")).toEqual({ report: true, optimizer: false });
    expect(unlockFlags("OPTIMIZED_CV")).toEqual({ report: true, optimizer: true });
  });
});

describe("disabled payments", () => {
  it("never reports a succeeded checkout", async () => {
    const { disabledProvider } = await import("@/lib/payments/disabled");
    await expect(disabledProvider.initiate()).rejects.toThrow(/PAYMENTS_DISABLED/);
    await expect(disabledProvider.parseWebhook()).rejects.toThrow(/PAYMENTS_DISABLED/);
    await expect(disabledProvider.verifyByRef()).rejects.toThrow(/PAYMENTS_DISABLED/);
  });
});

describe("webhook HMAC", () => {
  it("signs mock webhooks with HMAC", () => {
    const body = JSON.stringify({ orderId: "MZ-1", status: "SUCCEEDED" });
    const sig = hmacSign(body, "dev-webhook-secret");
    expect(sig).toHaveLength(64);
    expect(hmacSign(body, "other")).not.toBe(sig);
  });
});
