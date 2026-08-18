import { mockPaymentsAllowed } from "@/lib/env";
import { mockProvider } from "./mock";
import { payzoneProvider } from "./payzone";
import { disabledProvider } from "./disabled";
import type { PaymentProvider } from "./types";

export function getPaymentProvider(): PaymentProvider {
  const name = process.env.PAYMENT_PROVIDER ?? "mock";
  if (name === "disabled") return disabledProvider;
  if (name === "payzone") return payzoneProvider;
  if (name === "mock" && mockPaymentsAllowed()) return mockProvider;
  throw new Error("No payment provider available for this environment.");
}
