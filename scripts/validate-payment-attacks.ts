import { readFileSync } from "fs";

const BASE = process.env.AUDIT_BASE ?? "http://localhost:3005";

async function json(path: string, init?: RequestInit) {
  const res = await fetch(BASE + path, init);
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  return { status: res.status, body };
}

async function main() {
  const results: Record<string, unknown> = {};

  const form = new FormData();
  const pdf = new Blob([readFileSync("fixtures/cv-good-fr.pdf")], { type: "application/pdf" });
  form.append("file", pdf, "cv-good-fr.pdf");
  form.append("targetRole", "QA Automation Engineer");
  form.append("targetCountry", "MA");
  const uploadRes = await fetch(BASE + "/api/analyses", { method: "POST", body: form });
  const cookie = (uploadRes.headers.get("set-cookie") || "").split(";")[0];
  const uploaded = await uploadRes.json();
  results.upload = { status: uploadRes.status, id: uploaded.id };

  const id = uploaded.id as string | undefined;
  if (!id) {
    console.log(JSON.stringify(results, null, 2));
    throw new Error("upload failed; cannot run live attacks");
  }

  const { prisma } = await import("../src/lib/db");
  const planted = await prisma.payment.create({
    data: {
      orderId: `MZ-ATK-${Date.now()}`,
      analysisId: id,
      guestToken: cookie.replace("mizane_guest=", ""),
      productCode: "ANALYSIS",
      amountMad: 49,
      currency: "MAD",
      status: "PENDING",
      provider: "payzone",
      providerRef: "planted-merchant-token",
    },
  });

  results.attack1_verifyNoAuth = await json("/api/payments/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId: planted.orderId }),
  });

  results.attack6_forgedWebhook = await json("/api/payments/webhook", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-payzone-signature": "deadbeef" },
    body: JSON.stringify({
      merchantToken: "forged",
      orderID: "MZ-FAKE",
      errorCode: "000",
      amount: 1,
      currency: "MAD",
    }),
  });

  results.attack7_pdfWithoutPayment = await json(`/api/analyses/${id}/pdf`, {
    headers: cookie ? { Cookie: cookie } : undefined,
  });

  results.attack8_optimizerWithoutProduct = await json("/api/optimize", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(cookie ? { Cookie: cookie } : {}) },
    body: JSON.stringify({ analysisId: id }),
  });

  const preview = await json(`/api/analyses/${id}`, {
    headers: cookie ? { Cookie: cookie } : undefined,
  });
  results.reportLockedWithoutPayment = {
    status: preview.status,
    unlocked: (preview.body as { unlocked?: boolean })?.unlocked,
  };

  results.initiateUsesPayzoneNotMock = await json("/api/payments/initiate", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(cookie ? { Cookie: cookie } : {}) },
    body: JSON.stringify({ analysisId: id, productCode: "ANALYSIS" }),
  });

  console.log(JSON.stringify(results, null, 2));
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
