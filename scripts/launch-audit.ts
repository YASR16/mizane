/**
 * Code gates vs owner gates. This script does not claim Payzone or CNDP readiness.
 */
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

const root = process.cwd();
const checks: { ok: boolean; label: string }[] = [];

function has(file: string) {
  return existsSync(resolve(root, file));
}

checks.push({ ok: has("Dockerfile"), label: "Dockerfile" });
checks.push({ ok: has("fly.toml"), label: "Fly.io cdg config" });
checks.push({ ok: has("scripts/backup-postgres.sh") && has("scripts/restore-postgres.sh"), label: "pg_dump / restore scripts" });
checks.push({ ok: has("src/lib/storage.ts"), label: "Storage module" });
checks.push({ ok: has("src/app/api/files/[documentId]/route.ts"), label: "Owner file download API" });
checks.push({ ok: has("docs/cndp-owner-checklist.md"), label: "CNDP owner checklist" });
checks.push({ ok: has("src/content/intent-pages.ts"), label: "FR intent pages" });

const envExample = readFileSync(resolve(root, ".env.example"), "utf8");
checks.push({ ok: !envExample.includes("PAYZONE_CALLBACK_URL"), label: ".env.example has no localhost Payzone callback" });
checks.push({ ok: envExample.includes("MIZANE_ENV"), label: "MIZANE_ENV documented" });
checks.push({ ok: envExample.includes("SENTRY_DSN"), label: "Sentry DSN documented" });

const fly = readFileSync(resolve(root, "fly.toml"), "utf8");
checks.push({ ok: fly.includes('primary_region = "cdg"'), label: "Fly primary region Paris (cdg)" });
checks.push({ ok: fly.includes("/api/cron/purge"), label: "Purge cron documented on Fly" });

const failed = checks.filter((c) => !c.ok);
for (const c of checks) {
  console.log(`${c.ok ? "PASS" : "FAIL"} ${c.label}`);
}

console.log("");
console.log("Code production-readiness: scaffolding is in place.");
console.log("GO/NO-GO for inviting paying Moroccan users: NO-GO until the owner has:");
console.log("  1. Live HTTPS domain (NEXT_PUBLIC_APP_URL / AUTH_URL)");
console.log("  2. Postgres + private R2 in the EU");
console.log("  3. A real Payzone sandbox 49 MAD payment (webhook + status + PDF)");
console.log("  4. A pg_dump restore test on that host");
console.log("  5. CNDP filing started (see docs/cndp-owner-checklist.md)");
console.log("Do not claim Google rankings, CNDP compliance, or live Payzone readiness from this repo alone.");

if (failed.length) process.exit(1);
