import { assertRuntimeEnv } from "../src/lib/env";

function expectThrow(label: string, env: NodeJS.ProcessEnv, pattern: RegExp) {
  try {
    assertRuntimeEnv(env);
    throw new Error(`FAIL ${label}: expected throw`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.startsWith("FAIL")) throw error;
    if (!pattern.test(message)) {
      throw new Error(`FAIL ${label}: threw but did not match ${pattern}\n${message}`);
    }
    console.log(`PASS ${label}`);
  }
}

const base = {
  NODE_ENV: "production",
  MIZANE_ENV: "production",
  DATABASE_URL: "postgresql://mizane:mizane@db:5432/mizane",
  NEXT_PUBLIC_APP_URL: "https://mizane.ma",
  AUTH_URL: "https://mizane.ma",
  AUTH_SECRET: "x".repeat(32),
  PAYMENT_PROVIDER: "payzone",
  PAYZONE_ORIGINATOR_ID: "originator",
  PAYZONE_PASSWORD: "secret-pass",
  PAYZONE_WEBHOOK_SECRET: "webhook-secret",
  ADMIN_PASSWORD: "a-very-strong-admin-pass",
  CRON_SECRET: "cron-secret-value",
  STORAGE_DRIVER: "s3",
  S3_BUCKET: "mizane-cvs",
  S3_ACCESS_KEY_ID: "key",
  S3_SECRET_ACCESS_KEY: "secret",
} as NodeJS.ProcessEnv;

expectThrow("production+sqlite", { ...base, DATABASE_URL: "file:./dev.db" }, /SQLite/);
expectThrow("production+mock", { ...base, PAYMENT_PROVIDER: "mock" }, /mock/);
expectThrow(
  "missing-payzone-credentials",
  { ...base, PAYZONE_ORIGINATOR_ID: "", PAYZONE_PASSWORD: "" },
  /PAYZONE_ORIGINATOR_ID/,
);
expectThrow("missing-webhook-secret", { ...base, PAYZONE_WEBHOOK_SECRET: "" }, /PAYZONE_WEBHOOK_SECRET/);
expectThrow("production+sandbox", { ...base, PAYZONE_SANDBOX: "1" }, /PAYZONE_SANDBOX/);
expectThrow("production+local-disk", { ...base, STORAGE_DRIVER: "local" }, /STORAGE_DRIVER/);
expectThrow(
  "production+localhost",
  { ...base, NEXT_PUBLIC_APP_URL: "http://localhost:3000", AUTH_URL: "http://localhost:3000" },
  /NEXT_PUBLIC_APP_URL/,
);

assertRuntimeEnv(base);
console.log("PASS production-like valid env");

assertRuntimeEnv({
  ...base,
  MIZANE_ENV: "staging",
  PAYMENT_PROVIDER: "disabled",
  STORAGE_DRIVER: "postgres",
  NEXT_PUBLIC_APP_URL: "https://mizane-org.koyeb.app",
  AUTH_URL: "https://mizane-org.koyeb.app",
});
console.log("PASS staging disabled payments + postgres storage");
