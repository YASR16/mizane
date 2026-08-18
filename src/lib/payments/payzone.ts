import { hmacSign, safeEqual } from "@/lib/security";
import type { InitiatePaymentInput, PaymentProvider, PaymentStatus, VerifiedPayment } from "./types";

const apiUrl = (process.env.PAYZONE_API_URL ?? "https://api.payzone.ma").replace(/\/$/, "");
const pageUrl = (process.env.PAYZONE_PAYMENT_PAGE_URL ?? "https://payment.payzone.ma").replace(/\/$/, "");

function authHeader() {
  const id = process.env.PAYZONE_ORIGINATOR_ID ?? "";
  const password = process.env.PAYZONE_PASSWORD ?? "";
  return "Basic " + Buffer.from(`${id}:${password}`).toString("base64");
}

function mapStatus(data: {
  errorCode?: string;
  status?: string;
  resultCode?: string;
}): PaymentStatus {
  const code = data.errorCode ?? data.resultCode ?? "";
  const status = (data.status ?? "").toLowerCase();
  if (code === "000" || status === "authorized" || status === "captured") return "SUCCEEDED";
  if (status === "expired" || status === "cancelled" || status === "canceled") return "CANCELLED";
  if (status === "pending" || status === "not processed") return "PENDING";
  return "FAILED";
}

function amountToMad(amount?: number) {
  if (amount == null) return undefined;
  return Math.round(amount / 100);
}

export const payzoneProvider: PaymentProvider = {
  name: "payzone",
  async initiate(input: InitiatePaymentInput) {
    const body = {
      currency: "MAD",
      amount: input.amountMad * 100,
      orderID: input.orderId,
      orderDescription: input.description,
      ctrlRedirectURL: input.returnUrl,
      ctrlCallbackURL: input.callbackUrl,
      ctrlCustomData: input.productCode,
      shopper: input.customerEmail ? { email: input.customerEmail } : undefined,
    };
    const res = await fetch(`${apiUrl}/payment/prepare`, {
      method: "POST",
      headers: {
        Authorization: authHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    if (!res.ok) {
      throw new Error(`Payzone initiate failed: ${res.status} ${text}`);
    }
    const data = JSON.parse(text) as {
      code?: string;
      customerToken?: string;
      merchantToken?: string;
    };
    if (data.code && data.code !== "200") {
      throw new Error(`Payzone initiate failed: ${text}`);
    }
    const customerToken = data.customerToken;
    const merchantToken = data.merchantToken;
    if (!customerToken || !merchantToken) {
      throw new Error("Payzone did not return payment tokens");
    }
    return {
      checkoutUrl: `${pageUrl}/payment/${customerToken}`,
      providerRef: merchantToken,
    };
  },
  async verifyByRef(providerRef: string) {
    const res = await fetch(`${apiUrl}/payment/${encodeURIComponent(providerRef)}/status`, {
      headers: { Authorization: authHeader() },
    });
    if (!res.ok) throw new Error("Payzone verify failed");
    const data = (await res.json()) as {
      errorCode?: string;
      resultCode?: string;
      status?: string;
      merchantToken?: string;
      transactionID?: string;
      transactionId?: string;
      orderID?: string;
      order?: { id?: string };
      amount?: number;
      currency?: string;
      ctrlCustomData?: string;
    };
    return {
      orderId: data.orderID ?? data.order?.id ?? "",
      providerRef,
      transactionId: data.transactionID ?? data.transactionId,
      status: mapStatus(data),
      amountMad: amountToMad(data.amount),
      currency: data.currency ?? "MAD",
      productCode: data.ctrlCustomData,
      provider: "payzone",
      raw: data,
    } satisfies VerifiedPayment;
  },
  async parseWebhook(rawBody: string, headers: Headers) {
    const secret = process.env.PAYZONE_WEBHOOK_SECRET ?? "";
    const sig = headers.get("x-payzone-signature") ?? headers.get("x-signature") ?? "";
    if (sig) {
      if (!secret || !safeEqual(sig, hmacSign(rawBody, secret))) {
        throw new Error("INVALID_SIGNATURE");
      }
    }
    let data: Record<string, unknown> = {};
    try {
      data = JSON.parse(rawBody) as Record<string, unknown>;
    } catch {
      data = Object.fromEntries(new URLSearchParams(rawBody));
    }
    const merchantToken = String(data.merchantToken ?? data.merchant_token ?? "");
    if (!merchantToken) {
      throw new Error("MISSING_MERCHANT_TOKEN");
    }
    return {
      orderId: String(data.orderID ?? data.orderId ?? ""),
      providerRef: merchantToken,
      transactionId: String(data.transactionID ?? data.transactionId ?? "") || undefined,
      status: mapStatus({
        errorCode: data.errorCode ? String(data.errorCode) : undefined,
        status: data.status ? String(data.status) : undefined,
      }),
      amountMad: amountToMad(data.amount != null ? Number(data.amount) : undefined),
      currency: data.currency ? String(data.currency) : "MAD",
      productCode: data.ctrlCustomData ? String(data.ctrlCustomData) : undefined,
      provider: "payzone",
      raw: data,
    } satisfies VerifiedPayment;
  },
  async refund(providerRef: string) {
    const res = await fetch(`${apiUrl}/transaction/${encodeURIComponent(providerRef)}/refund`, {
      method: "POST",
      headers: {
        Authorization: authHeader(),
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    return {
      orderId: data.orderID ?? "",
      providerRef,
      transactionId: data.transactionID,
      status: "REFUNDED",
      provider: "payzone",
      raw: data,
    };
  },
};
