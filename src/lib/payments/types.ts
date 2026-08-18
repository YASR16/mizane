export type PaymentStatus =
  | "PENDING"
  | "REQUIRES_ACTION"
  | "SUCCEEDED"
  | "FAILED"
  | "REFUNDED"
  | "CANCELLED";

export type InitiatePaymentInput = {
  orderId: string;
  amountMad: number;
  productCode: string;
  customerEmail?: string;
  returnUrl: string;
  callbackUrl: string;
  description: string;
};

export type InitiatePaymentResult = {
  checkoutUrl: string;
  providerRef: string;
};

export type VerifiedPayment = {
  orderId: string;
  providerRef: string;
  transactionId?: string;
  status: PaymentStatus;
  amountMad?: number;
  currency?: string;
  productCode?: string;
  provider?: string;
  raw: unknown;
};

export interface PaymentProvider {
  name: string;
  initiate(input: InitiatePaymentInput): Promise<InitiatePaymentResult>;
  verifyByRef(providerRef: string): Promise<VerifiedPayment>;
  parseWebhook(rawBody: string, headers: Headers): Promise<VerifiedPayment>;
  refund(providerRef: string): Promise<VerifiedPayment>;
}
