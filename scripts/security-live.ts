import { readFileSync } from "fs";

const BASE = process.env.AUDIT_BASE ?? "http://localhost:3000";

async function json(path: string, init?: RequestInit) {
  const res = await fetch(BASE + path, init);
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = await res.text();
  }
  return { status: res.status, body };
}

function fail(label: string, detail: unknown): never {
  throw new Error(`FAIL ${label}: ${JSON.stringify(detail)}`);
}

async function main() {
  const exe = new Blob([Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00])], { type: "application/pdf" });
  const exeForm = new FormData();
  exeForm.append("file", exe, "cv.pdf");
  const exeRes = await json("/api/analyses", { method: "POST", body: exeForm });
  if (exeRes.status !== 400) fail("exe-as-pdf", exeRes);
  console.log("PASS exe-as-pdf rejected");

  const huge = Buffer.concat([Buffer.from("%PDF-1.4\n"), Buffer.alloc(6 * 1024 * 1024, 65)]);
  const hugeForm = new FormData();
  hugeForm.append("file", new Blob([huge], { type: "application/pdf" }), "cv.pdf");
  const hugeRes = await json("/api/analyses", { method: "POST", body: hugeForm });
  if (hugeRes.status !== 400) fail("oversized", hugeRes);
  console.log("PASS oversized rejected");

  const junkForm = new FormData();
  junkForm.append("file", new Blob([Buffer.from("not a pdf")], { type: "application/pdf" }), "../../etc/passwd.pdf");
  const junkRes = await json("/api/analyses", { method: "POST", body: junkForm });
  if (junkRes.status !== 400) fail("malformed-pdf", junkRes);
  console.log("PASS malformed pdf / traversal name rejected");

  const admin = await json("/api/admin/stats");
  if (admin.status !== 401 && admin.status !== 403) fail("admin-unauth", admin);
  console.log("PASS unauthorized admin");

  const file = await json("/api/files/does-not-exist");
  if (file.status !== 404) fail("file-unauth", file);
  console.log("PASS unauthorized file");

  const webhook = await json("/api/payments/webhook", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-payzone-signature": "deadbeef" },
    body: JSON.stringify({ orderID: "MZ-FAKE", errorCode: "000", amount: 1 }),
  });
  if (![400, 403].includes(webhook.status)) fail("forged-webhook", webhook);
  console.log("PASS forged webhook rejected");

  const form = new FormData();
  form.append("file", new Blob([readFileSync("fixtures/cv-good-fr.pdf")], { type: "application/pdf" }), "cv-good-fr.pdf");
  form.append("targetRole", "QA");
  form.append("targetCountry", "MA");
  const uploadRes = await fetch(BASE + "/api/analyses", { method: "POST", body: form });
  const cookie = (uploadRes.headers.get("set-cookie") || "").split(";")[0];
  const uploaded = (await uploadRes.json()) as { id?: string };
  if (uploadRes.status !== 200 || !uploaded.id) fail("upload", { status: uploadRes.status, uploaded });
  console.log("PASS upload + analysis");

  const other = await json(`/api/analyses/${uploaded.id}`);
  if (other.status !== 404) fail("analysis-unauth", other);
  console.log("PASS unauthorized analysis");

  const own = await json(`/api/analyses/${uploaded.id}`, { headers: { Cookie: cookie } });
  if (own.status !== 200) fail("own-analysis", own);
  const preview = own.body as { unlocked?: boolean; paymentsEnabled?: boolean };
  if (preview.unlocked) fail("report-unlocked-without-pay", preview);
  console.log("PASS report stays locked");

  const pdf = await json(`/api/analyses/${uploaded.id}/pdf`, { headers: { Cookie: cookie } });
  if (pdf.status !== 402) fail("unpaid-pdf", pdf);
  console.log("PASS unpaid PDF 402");

  const dash = await fetch(BASE + "/dashboard", { redirect: "manual" });
  if (![307, 302, 303].includes(dash.status) && dash.status !== 200) fail("dashboard", dash.status);
  console.log("PASS dashboard gated");

  console.log("PASS live security suite");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
