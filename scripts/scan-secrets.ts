/**
 * Fails if tracked git files look like they contain live secrets.
 */
import { execSync } from "child_process";
import { readFileSync } from "fs";

const tracked = execSync("git ls-files", { encoding: "utf8" }).split(/\r?\n/).filter(Boolean);
const forbiddenName = /(\.pem|\.p12|credentials\.json|id_rsa)$/i;

let failed = 0;
for (const file of tracked) {
  if (file === ".env" || file.endsWith(".env.local") || file.endsWith(".env.production.local")) {
    console.error(`FAIL tracked env file: ${file}`);
    failed += 1;
    continue;
  }
  if (forbiddenName.test(file)) {
    console.error(`FAIL secret-like filename tracked: ${file}`);
    failed += 1;
  }
}

if (tracked.includes(".env.example")) {
  const text = readFileSync(".env.example", "utf8");
  if (/ADMIN_PASSWORD="change-me-now"/.test(text)) {
    console.error("FAIL .env.example still defaults ADMIN_PASSWORD to change-me-now");
    failed += 1;
  }
}

if (failed) process.exit(1);
console.log(`PASS git secret scan (${tracked.length} tracked files)`);
