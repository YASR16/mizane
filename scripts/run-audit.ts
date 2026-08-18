/**
 * Production-readiness live audit. Prints JSON summary.
 */
import { readFileSync, existsSync, writeFileSync } from "fs";
import { join } from "path";

const BASE = "http://localhost:3000";
const out: Record<string, unknown> = { pages: {}, analyses: {}, security: {}, payments: {}, seo: {}, timings: {} };

async function page(path: string) {
  const t0 = Date.now();
  const res = await fetch(BASE + path);
  const html = await res.text();
  (out.pages as Record<string, unknown>)[path] = {
    status: res.status,
    ms: Date.now() - t0,
    bytes: html.length,
    title: html.match(/<title>([^<]+)<\/title>/)?.[1] ?? null,
    hasOg: html.includes("og:"),
    hasCanonical: html.includes("rel=\"canonical\""),
    hasJsonLd: html.includes("application/ld+json"),
    hasViewport: html.includes("viewport"),
  };
  return html;
}

async function upload(filePath: string, extra: Record<string, string> = {}) {
  const buf = readFileSync(filePath);
  const form = new FormData();
  const name = filePath.split(/[/\\]/).pop()!;
  form.append("file", new Blob([buf]), name);
  for (const [k, v] of Object.entries(extra)) form.append(k, v);
  const t0 = Date.now();
  const res = await fetch(BASE + "/api/analyses", { method: "POST", body: form });
  const setCookie = res.headers.get("set-cookie");
  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
    json = { parseError: true };
  }
  return {
    file: name,
    status: res.status,
    ms: Date.now() - t0,
    cookie: setCookie,
    json,
  };
}

async function main() {
  for (const p of [
    "/",
    "/analyser",
    "/tarifs",
    "/faq",
    "/blog",
    "/blog/cv-compatible-ats-maroc",
    "/confidentialite",
    "/conditions",
    "/a-propos",
    "/comment-ca-marche",
    "/connexion",
    "/inscription",
    "/dashboard",
    "/admin",
    "/en",
    "/ar",
    "/robots.txt",
    "/sitemap.xml",
    "/this-page-does-not-exist",
  ]) {
    await page(p);
  }

  const html = await page("/");
  (out.seo as Record<string, unknown>).homeCtaCount = (html.match(/Analyser mon CV/g) || []).length;
  (out.seo as Record<string, unknown>).robots = await (await fetch(BASE + "/robots.txt")).text();
  (out.seo as Record<string, unknown>).sitemapHead = (await (await fetch(BASE + "/sitemap.xml")).text()).slice(0, 800);

  const fixtures = {
    bad: "fixtures/cv-sample.pdf",
    goodFr: "fixtures/cv-good-fr.pdf",
    goodEn: "fixtures/cv-good-en.pdf",
    badFr: "fixtures/cv-bad-fr.pdf",
    scanned: "fixtures/cv-scanned.pdf",
    exe: "fixtures/not-a-cv.exe.pdf",
    oversized: "fixtures/oversized.pdf",
  };

  const analyses: Record<string, unknown> = {};
  for (const [key, path] of Object.entries(fixtures)) {
    if (!existsSync(path)) {
      analyses[key] = { missing: true };
      continue;
    }
    analyses[key] = await upload(path, {
      targetRole: key === "goodEn" ? "QA Automation Engineer" : key === "goodFr" ? "QA Automation Engineer" : "Data Analyst",
    });
  }

  // DOCX if present
  const docxCandidates = ["fixtures/cv-sara.docx", "fixtures/cv-sara.docx.zip"];
  for (const d of docxCandidates) {
    if (existsSync(d)) analyses.docx = await upload(d, { targetRole: "Data Analyst" });
  }

  out.analyses = analyses;

  // Security: unauthorized access
  const good = analyses.goodFr as { json?: { id?: string }; cookie?: string | null };
  const id = good?.json?.id;
  const cookie = (good?.cookie || "").split(";")[0];
  if (id) {
    const unauth = await fetch(BASE + "/api/analyses/" + id);
    const unauthJson = await unauth.json();
    (out.security as Record<string, unknown>).unauthGet = { status: unauth.status, body: unauthJson };

    const authd = await fetch(BASE + "/api/analyses/" + id, { headers: { Cookie: cookie } });
    (out.security as Record<string, unknown>).ownerGet = { status: authd.status, unlocked: (await authd.json()).unlocked };

    const txt = await upload("package.json"); // wrong type via json renamed? package.json is not pdf
    (out.security as Record<string, unknown>).jsonUpload = { status: txt.status, json: txt.json };
  }

  // Rate limit probe (few extra, not 8+)
  (out.security as Record<string, unknown>).rateLimitNote = "Upload limiter is 8/10min in-memory";

  // Payments
  if (id && cookie) {
    const init1 = await fetch(BASE + "/api/payments/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ analysisId: id, productCode: "ANALYSIS" }),
    });
    const i1 = await init1.json();
    const init2 = await fetch(BASE + "/api/payments/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ analysisId: id, productCode: "ANALYSIS" }),
    });
    const i2 = await init2.json();
    (out.payments as Record<string, unknown>).duplicateInit = {
      first: i1,
      second: i2,
      differentOrders: i1.orderId !== i2.orderId,
    };

    // Verify without cookie (anyone with orderId)
    const vNoCookie = await fetch(BASE + "/api/payments/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: i1.orderId }),
    });
    const v1 = await vNoCookie.json();
    (out.payments as Record<string, unknown>).verifyWithoutAuth = { status: vNoCookie.status, body: v1 };

    // Failed webhook
    const failWh = await fetch(BASE + "/api/payments/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderID: i2.orderId, errorCode: "999" }),
    });
    (out.payments as Record<string, unknown>).failedWebhook = { status: failWh.status, body: await failWh.json() };

    // Spoof success webhook for a made-up order
    const spoof = await fetch(BASE + "/api/payments/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderID: i2.orderId, errorCode: "000", transactionID: "spoof" }),
    });
    (out.payments as Record<string, unknown>).spoofWebhook = { status: spoof.status, body: await spoof.json() };

    const afterSpoof = await fetch(BASE + "/api/analyses/" + id, { headers: { Cookie: cookie } });
    const after = await afterSpoof.json();
    (out.payments as Record<string, unknown>).unlockedAfterSpoof = { unlocked: after.unlocked };

    // Optimize after analysis unlock (should succeed without OPTIMIZED_CV payment)
    const opt = await fetch(BASE + "/api/optimize", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ analysisId: id, targetRole: "QA" }),
    });
    (out.payments as Record<string, unknown>).optimizeWithoutOptimizedProduct = { status: opt.status, body: await opt.json() };

    // Frontend-claimed success without verify: GET report
    // already covered by unlockedAfterSpoof
  }

  // Admin without auth
  const admin = await fetch(BASE + "/api/admin/stats");
  (out.security as Record<string, unknown>).adminUnauth = { status: admin.status, body: await admin.json() };

  writeFileSync(join(process.cwd(), "fixtures", "audit-results.json"), JSON.stringify(out, null, 2));
  console.log(JSON.stringify(out, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
