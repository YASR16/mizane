import { payzoneProvider } from "../src/lib/payments/payzone";

async function main() {
  const id = process.env.PAYZONE_ORIGINATOR_ID ?? "";
  const password = process.env.PAYZONE_PASSWORD ?? "";
  if (!id || !password) {
    console.log("FAIL Payzone sandbox credentials: PAYZONE_ORIGINATOR_ID / PAYZONE_PASSWORD are empty");
    process.exit(2);
  }
  try {
    const result = await payzoneProvider.initiate({
      orderId: `MZ-SANDBOX-${Date.now()}`,
      amountMad: 49,
      productCode: "ANALYSIS",
      returnUrl: "http://localhost:3000/paiement/retour",
      callbackUrl: "http://localhost:3000/api/payments/webhook",
      description: "Mizane ANALYSIS sandbox",
    });
    console.log("PASS Payzone initiate");
    console.log(JSON.stringify({ checkoutHost: new URL(result.checkoutUrl).host, hasRef: Boolean(result.providerRef) }));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log("FAIL Payzone initiate:", message.slice(0, 300));
    process.exit(1);
  }
}

main();
