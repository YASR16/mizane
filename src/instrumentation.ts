export async function register() {
  if (!process.env.AUTH_URL && process.env.NEXT_PUBLIC_APP_URL) {
    process.env.AUTH_URL = process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (process.env.SKIP_ENV_ASSERT === "1") return;
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  const { assertRuntimeEnv } = await import("@/lib/env");
  assertRuntimeEnv();
}
