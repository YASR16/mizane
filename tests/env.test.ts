import { describe, expect, it } from "vitest";
import { assertRuntimeEnv, mizaneEnv, mockPaymentsAllowed, paymentsEnabled } from "@/lib/env";

const prodBase = {
  NODE_ENV: "production",
  MIZANE_ENV: "production",
  DATABASE_URL: "postgresql://mizane:mizane@db:5432/mizane",
  NEXT_PUBLIC_APP_URL: "https://mizane.ma",
  AUTH_URL: "https://mizane.ma",
  AUTH_SECRET: "x".repeat(32),
  PAYMENT_PROVIDER: "payzone",
  PAYZONE_ORIGINATOR_ID: "id",
  PAYZONE_PASSWORD: "pass",
  PAYZONE_WEBHOOK_SECRET: "whsec",
  ADMIN_PASSWORD: "a-very-strong-admin-pass",
  CRON_SECRET: "cron-secret-value",
  STORAGE_DRIVER: "s3",
  S3_BUCKET: "mizane-cvs",
  S3_ACCESS_KEY_ID: "key",
  S3_SECRET_ACCESS_KEY: "secret",
} as NodeJS.ProcessEnv;

describe("runtime env guards", () => {
  it("treats NODE_ENV=production as production even without MIZANE_ENV", () => {
    expect(mizaneEnv({ NODE_ENV: "production" } as NodeJS.ProcessEnv)).toBe("production");
    expect(mizaneEnv({ NODE_ENV: "production", MIZANE_ENV: "staging" } as NodeJS.ProcessEnv)).toBe("staging");
    expect(mizaneEnv({ NODE_ENV: "development" } as NodeJS.ProcessEnv)).toBe("development");
  });

  it("allows sqlite and mock outside production", () => {
    expect(() =>
      assertRuntimeEnv({
        NODE_ENV: "development",
        MIZANE_ENV: "development",
        DATABASE_URL: "file:./dev.db",
        PAYMENT_PROVIDER: "mock",
        STORAGE_DRIVER: "local",
      } as NodeJS.ProcessEnv),
    ).not.toThrow();
    expect(mockPaymentsAllowed({ NODE_ENV: "development", PAYMENT_PROVIDER: "mock" } as NodeJS.ProcessEnv)).toBe(true);
    expect(paymentsEnabled({ NODE_ENV: "development", PAYMENT_PROVIDER: "disabled" } as NodeJS.ProcessEnv)).toBe(false);
  });

  it("refuses sqlite in production", () => {
    expect(() =>
      assertRuntimeEnv({
        ...prodBase,
        DATABASE_URL: "file:./dev.db",
      }),
    ).toThrow(/SQLite/);
  });

  it("refuses mock payments in production", () => {
    expect(mockPaymentsAllowed({ NODE_ENV: "production", PAYMENT_PROVIDER: "mock" } as NodeJS.ProcessEnv)).toBe(false);
    expect(() =>
      assertRuntimeEnv({
        ...prodBase,
        PAYMENT_PROVIDER: "mock",
      }),
    ).toThrow(/mock/);
  });

  it("refuses Payzone sandbox and local disk in production", () => {
    expect(() => assertRuntimeEnv({ ...prodBase, PAYZONE_SANDBOX: "1" })).toThrow(/PAYZONE_SANDBOX/);
    expect(() => assertRuntimeEnv({ ...prodBase, STORAGE_DRIVER: "local" })).toThrow(/STORAGE_DRIVER/);
  });

  it("refuses localhost URLs even with a sandbox flag in production", () => {
    expect(() =>
      assertRuntimeEnv({
        ...prodBase,
        NEXT_PUBLIC_APP_URL: "http://localhost:3000",
        AUTH_URL: "http://localhost:3000",
        PAYZONE_SANDBOX: "1",
      }),
    ).toThrow(/NEXT_PUBLIC_APP_URL/);
  });

  it("allows staging with payments disabled and postgres blob storage", () => {
    expect(() =>
      assertRuntimeEnv({
        ...prodBase,
        MIZANE_ENV: "staging",
        PAYMENT_PROVIDER: "disabled",
        PAYZONE_ORIGINATOR_ID: "",
        PAYZONE_PASSWORD: "",
        PAYZONE_WEBHOOK_SECRET: "",
        STORAGE_DRIVER: "postgres",
        NEXT_PUBLIC_APP_URL: "https://mizane.onrender.com",
        AUTH_URL: "https://mizane.onrender.com",
      }),
    ).not.toThrow();
  });

  it("refuses disabled payments and postgres storage in production", () => {
    expect(() => assertRuntimeEnv({ ...prodBase, PAYMENT_PROVIDER: "disabled" })).toThrow(/disabled/);
    expect(() => assertRuntimeEnv({ ...prodBase, STORAGE_DRIVER: "postgres" })).toThrow(/postgres/);
  });

  it("refuses missing Payzone webhook secret", () => {
    expect(() =>
      assertRuntimeEnv({
        ...prodBase,
        PAYZONE_WEBHOOK_SECRET: "",
      }),
    ).toThrow(/PAYZONE_WEBHOOK_SECRET/);
  });

  it("refuses default admin password and mismatched AUTH_URL", () => {
    expect(() =>
      assertRuntimeEnv({
        ...prodBase,
        ADMIN_PASSWORD: "change-me-now",
        AUTH_URL: "https://other.example",
      }),
    ).toThrow(/AUTH_URL|ADMIN_PASSWORD/);
  });
});
