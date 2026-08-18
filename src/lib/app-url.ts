function isBuildPhase() {
  return process.env.NEXT_PHASE === "phase-production-build" || process.env.SKIP_ENV_ASSERT === "1";
}

export function publicAppUrl() {
  const raw = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
  const production =
    process.env.MIZANE_ENV === "production" ||
    (process.env.NODE_ENV === "production" && process.env.MIZANE_ENV !== "staging");

  if (raw) {
    if (production && !isBuildPhase() && (raw.includes("localhost") || raw.includes("127.0.0.1") || !raw.startsWith("https://"))) {
      throw new Error("NEXT_PUBLIC_APP_URL must be an https public URL in production.");
    }
    return raw;
  }

  if (production && !isBuildPhase()) {
    throw new Error("NEXT_PUBLIC_APP_URL must be an https public URL in production.");
  }

  return "http://localhost:3000";
}

export function paymentOrigin(fallbackOrigin?: string) {
  const url = publicAppUrl();
  if (url.includes("localhost") && process.env.NODE_ENV === "production") {
    throw new Error("NEXT_PUBLIC_APP_URL is required for payment return and webhook URLs.");
  }
  return url || (fallbackOrigin ?? "http://localhost:3000").replace(/\/$/, "");
}
