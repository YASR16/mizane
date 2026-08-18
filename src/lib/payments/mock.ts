import { mockPaymentsAllowed } from "@/lib/env";
import type { InitiatePaymentInput, PaymentProvider, VerifiedPayment } from "./types";

const memory = new Map<string, VerifiedPayment & { amountMad: number; productCode: string }>();

export const mockProvider: PaymentProvider = {
  name: "mock",
  async initiate(input: InitiatePaymentInput) {
    if (!mockPaymentsAllowed()) {
      throw new Error("Mock payments are disabled.");
    }
    const providerRef = `mock_${input.orderId}`;
    memory.set(providerRef, {
      orderId: input.orderId,
      providerRef,
      status: "PENDING",
      amountMad: input.amountMad,
      currency: "MAD",
      productCode: input.productCode,
      provider: "mock",
      raw: { mock: true },
    });
    const url = new URL(input.returnUrl);
    url.searchParams.set("orderId", input.orderId);
    url.searchParams.set("mock", "1");
    return { checkoutUrl: url.toString(), providerRef };
  },
  async verifyByRef(providerRef: string) {
    if (!mockPaymentsAllowed()) {
      return { orderId: "", providerRef, status: "FAILED", raw: { reason: "mock_disabled" } };
    }
    const current = memory.get(providerRef);
    if (!current) {
      return { orderId: "", providerRef, status: "FAILED", raw: {} };
    }
    const succeeded: VerifiedPayment = {
      ...current,
      status: "SUCCEEDED",
      transactionId: `txn_${providerRef}`,
    };
    memory.set(providerRef, { ...current, ...succeeded, amountMad: current.amountMad, productCode: current.productCode });
    return succeeded;
  },
  async parseWebhook(rawBody: string, headers: Headers) {
    if (!mockPaymentsAllowed()) {
      throw new Error("Mock webhooks disabled");
    }
    const secret = process.env.PAYMENT_WEBHOOK_SECRET ?? "dev-webhook-secret";
    const sig = headers.get("x-mizane-signature") ?? "";
    const { hmacSign, safeEqual } = await import("@/lib/security");
    if (!sig || !safeEqual(sig, hmacSign(rawBody, secret))) {
      throw new Error("INVALID_SIGNATURE");
    }
    return JSON.parse(rawBody) as VerifiedPayment;
  },
  async refund(providerRef: string) {
    return {
      orderId: memory.get(providerRef)?.orderId ?? "",
      providerRef,
      status: "REFUNDED",
      raw: { refunded: true },
    };
  },
};
