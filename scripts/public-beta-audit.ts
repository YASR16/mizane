/**
 * Full public-beta journey against AUDIT_BASE (default: staging URL).
 * Never prints secrets. Safe for free Back4App staging with payments disabled.
 */
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const BASE = (process.env.AUDIT_BASE ?? "https://mizane-4bcpaj3l.b4a.run").replace(/\/$/, "");
const stamp = Date.now();
const email = `beta.${stamp}@mizane.test`;
const password = `BetaTest!${stamp.toString().slice(-6)}`;

type Check = { area: string; result: "PASS" | "FAIL" | "SKIP"; detail?: string };
const checks: Check[] = [];

function record(area: string, ok: boolean, detail?: string) {
  checks.push({ area, result: ok ? "PASS" : "FAIL", detail });
  console.log(`${ok ? "PASS" : "FAIL"} ${area}${detail ? ` — ${detail}` : ""}`);
}

async function req(path: string, init?: RequestInit) {
  const res = await fetch(BASE + path, init);
  const text = await res.text();
  let body: unknown = text;
  try {
    body = JSON.parse(text);
  } catch {
    /* html */
  }
  return { status: res.status, headers: res.headers, body, text };
}

function cookieFrom(res: { headers: Headers }) {
  const raw = res.headers.getSetCookie?.() ?? [];
  if (raw.length) return raw.map((c) => c.split(";")[0]).join("; ");
  const single = res.headers.get("set-cookie");
  return single ? single.split(";")[0] : "";
}

function mergeCookie(prev: string, next: string) {
  if (!next) return prev;
  const map = new Map<string, string>();
  for (const part of `${prev}; ${next}`.split(";").map((s) => s.trim()).filter(Boolean)) {
    const i = part.indexOf("=");
    if (i > 0) map.set(part.slice(0, i), part.slice(i + 1));
  }
  return [...map.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}

async function main() {
  console.log(`AUDIT_BASE=${BASE}`);
  console.log(`email=${email}`);

  // Phase 1 — surface
  const health = await req("/api/health");
  const h = health.body as { ok?: boolean; env?: string; paymentsEnabled?: boolean };
  record(
    "Health",
    health.status === 200 && h.ok === true && h.env === "staging" && h.paymentsEnabled === false,
    JSON.stringify(h),
  );
  for (const p of ["/", "/fr", "/en", "/ar", "/connexion", "/analyser", "/robots.txt", "/sitemap.xml"]) {
    const r = await req(p);
    const ok = r.status === 200 || (p === "/fr" && r.status === 307);
    record(`GET ${p}`, ok, `HTTP ${r.status}`);
  }

  // Phase 3 — auth
  const reg = await req("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Beta User", email, password, locale: "fr" }),
  });
  record("Registration", reg.status === 200, `HTTP ${reg.status}`);

  const dup = await req("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  record("Duplicate registration", dup.status === 409, `HTTP ${dup.status}`);

  const badLogin = await req("/api/auth/callback/credentials", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      email,
      password: "wrong-password-xx",
      csrfToken: "x",
      callbackUrl: `${BASE}/dashboard`,
      json: "true",
    }),
    redirect: "manual",
  });
  record("Invalid credentials", badLogin.status === 401 || badLogin.status === 302 || badLogin.status === 200, `HTTP ${badLogin.status}`);

  // Auth.js credentials via CSRF flow
  const csrf = await req("/api/auth/csrf");
  const csrfToken = (csrf.body as { csrfToken?: string }).csrfToken ?? "";
  let jar = cookieFrom(csrf);

  const login = await fetch(BASE + "/api/auth/callback/credentials", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: jar,
    },
    body: new URLSearchParams({
      csrfToken,
      email,
      password,
      callbackUrl: `${BASE}/dashboard`,
      json: "true",
    }),
    redirect: "manual",
  });
  jar = mergeCookie(jar, cookieFrom(login));
  const session = await req("/api/auth/session", { headers: { Cookie: jar } });
  const sess = session.body as { user?: { email?: string } };
  record("Login + session", Boolean(sess?.user?.email === email), JSON.stringify(sess?.user?.email ?? sess));

  const dash = await req("/dashboard", { headers: { Cookie: jar }, redirect: "manual" });
  record("Dashboard authenticated", dash.status === 200 || dash.status === 307 || dash.status === 302, `HTTP ${dash.status}`);

  const dashAnon = await req("/dashboard", { redirect: "manual" });
  record("Dashboard unauthenticated", dashAnon.status === 307 || dashAnon.status === 302 || dashAnon.status === 401, `HTTP ${dashAnon.status}`);

  // Phase 4 — CV pipeline (guest + auth)
  const fixtures = [
    { file: "cv-good-fr.pdf", label: "FR CV" },
    { file: "cv-good-en.pdf", label: "EN CV" },
    { file: "cv-ar-short.pdf", label: "AR CV" },
    { file: "cv-sample.pdf", label: "short CV" },
  ];
  let lastAnalysisId = "";
  let rateLimited = false;
  for (const f of fixtures) {
    if (rateLimited) {
      record(`Upload+analysis ${f.label}`, false, "skipped after 429");
      continue;
    }
    const path = join(process.cwd(), "fixtures", f.file);
    if (!existsSync(path)) {
      record(f.label, false, "fixture missing");
      continue;
    }
    const form = new FormData();
    form.append("file", new Blob([readFileSync(path)], { type: "application/pdf" }), f.file);
    form.append("targetRole", f.label.includes("AR") ? "مهندس ضمان الجودة" : "QA Engineer");
    form.append("targetCountry", "MA");
    form.append("locale", f.label.includes("AR") ? "ar" : "fr");
    const up = await fetch(BASE + "/api/analyses", { method: "POST", body: form, headers: { Cookie: jar } });
    jar = mergeCookie(jar, cookieFrom(up));
    const body = (await up.json()) as { id?: string; error?: string };
    if (up.status === 429) {
      rateLimited = true;
      record(`Upload+analysis ${f.label}`, false, `429 ${body.error}`);
      continue;
    }
    const ok = up.status === 200 && Boolean(body.id);
    record(`Upload+analysis ${f.label}`, ok, ok ? body.id : `${up.status} ${body.error}`);
    if (body.id) lastAnalysisId = body.id;
  }

  // Hostile uploads
  {
    const form = new FormData();
    form.append("file", new Blob([Buffer.from([0x4d, 0x5a])], { type: "application/pdf" }), "cv.pdf");
    const r = await req("/api/analyses", { method: "POST", body: form, headers: { Cookie: jar } });
    record("EXE-as-PDF rejected", r.status === 400, `HTTP ${r.status}`);
  }
  {
    const huge = Buffer.concat([Buffer.from("%PDF-1.4\n"), Buffer.alloc(6 * 1024 * 1024, 65)]);
    const form = new FormData();
    form.append("file", new Blob([huge], { type: "application/pdf" }), "huge.pdf");
    const r = await req("/api/analyses", { method: "POST", body: form, headers: { Cookie: jar } });
    record("Oversized rejected", r.status === 400, `HTTP ${r.status}`);
  }
  {
    const form = new FormData();
    form.append("file", new Blob([Buffer.from("not a pdf")], { type: "application/pdf" }), "bad.pdf");
    const r = await req("/api/analyses", { method: "POST", body: form, headers: { Cookie: jar } });
    record("Malformed PDF rejected", r.status === 400, `HTTP ${r.status}`);
  }

  // Phase 7 — payment lock
  if (lastAnalysisId) {
    const report = await req(`/api/analyses/${lastAnalysisId}`, { headers: { Cookie: jar } });
    const preview = report.body as { unlocked?: boolean; paymentsEnabled?: boolean; overallScore?: number };
    record(
      "Report locked / payments disabled",
      report.status === 200 && preview.unlocked !== true,
      `unlocked=${preview.unlocked} score=${preview.overallScore}`,
    );
    const pdf = await req(`/api/analyses/${lastAnalysisId}/pdf`, { headers: { Cookie: jar } });
    record("Unpaid PDF locked", pdf.status === 402 || pdf.status === 403, `HTTP ${pdf.status}`);
    const pay = await req("/api/payments/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: jar },
      body: JSON.stringify({ analysisId: lastAnalysisId, product: "ANALYSIS" }),
    });
    record("Payment initiate disabled", pay.status === 503 || pay.status === 403, `HTTP ${pay.status}`);
    const wh = await req("/api/payments/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-payzone-signature": "deadbeef" },
      body: JSON.stringify({ orderID: "MZ-FAKE", errorCode: "000", amount: 1 }),
    });
    record("Webhook rejected", [400, 403].includes(wh.status), `HTTP ${wh.status}`);
  }

  // Security
  const admin = await req("/api/admin/stats");
  record("Admin unauth", admin.status === 401 || admin.status === 403, `HTTP ${admin.status}`);
  if (lastAnalysisId) {
    const idor = await req(`/api/analyses/${lastAnalysisId}`);
    record("Analysis IDOR blocked", idor.status === 404 || idor.status === 401, `HTTP ${idor.status}`);
  }

  // Phase 8 — privacy delete via /api/account/cv
  if (lastAnalysisId) {
    const del = await req(`/api/account/cv?analysisId=${encodeURIComponent(lastAnalysisId)}`, {
      method: "DELETE",
      headers: { Cookie: jar },
    });
    record("Delete analysis", del.status === 200, `HTTP ${del.status}`);
    const after = await req(`/api/analyses/${lastAnalysisId}`, { headers: { Cookie: jar } });
    record("Deleted inaccessible", after.status === 404, `HTTP ${after.status}`);
  }

  // SEO noindex on private
  const conn = await req("/connexion");
  const robots = conn.headers.get("x-robots-tag") ?? "";
  record("Connexion noindex", /noindex/i.test(robots) || conn.text.includes("noindex"), robots || "meta check");

  const failed = checks.filter((c) => c.result === "FAIL");
  console.log("\n=== SUMMARY ===");
  console.log(`PASS ${checks.filter((c) => c.result === "PASS").length}/${checks.length}`);
  if (failed.length) {
    console.log("FAILED:");
    for (const f of failed) console.log(` - ${f.area}: ${f.detail ?? ""}`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
