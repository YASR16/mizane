import { NextRequest } from "next/server";
import { prisma } from "./db";

const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }
  if (current.count >= limit) {
    return { ok: false, remaining: 0 };
  }
  current.count += 1;
  return { ok: true, remaining: limit - current.count };
}

export function clientIp(req: NextRequest) {
  return (
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function requestContext(req?: NextRequest | Headers) {
  const headers = req instanceof Headers ? req : req?.headers;
  const ua = headers?.get("user-agent") ?? "";
  const country =
    headers?.get("cf-ipcountry") ||
    headers?.get("x-vercel-ip-country") ||
    headers?.get("x-country") ||
    null;
  const accept = headers?.get("accept-language")?.split(",")[0]?.slice(0, 8) ?? null;
  const device = /iPad|Tablet/i.test(ua) ? "tablet" : /Mobile|Android|iPhone/i.test(ua) ? "mobile" : "desktop";
  return {
    device,
    country: country && country !== "XX" ? country.toUpperCase() : null,
    locale: accept,
  };
}

const aliases: Record<string, string> = {
  landing_view: "landing_visit",
  paywall_viewed: "paywall_view",
};

export async function trackEvent(input: {
  name: string;
  sessionId?: string | null;
  userId?: string | null;
  analysisId?: string | null;
  locale?: string | null;
  path?: string | null;
  meta?: Record<string, unknown>;
}) {
  const name = aliases[input.name] ?? input.name;
  try {
    await prisma.analyticsEvent.create({
      data: {
        name: name.slice(0, 80),
        sessionId: input.sessionId ?? undefined,
        userId: input.userId ?? undefined,
        analysisId: input.analysisId ?? undefined,
        locale: input.locale ?? undefined,
        path: input.path ?? undefined,
        meta: input.meta ? JSON.stringify(input.meta) : undefined,
      },
    });
  } catch {
    // Analytics must never block the product path.
  }
}

export const funnelEvents = [
  "landing_visit",
  "upload_started",
  "upload_completed",
  "analysis_started",
  "analysis_completed",
  "free_result_viewed",
  "paywall_view",
  "checkout_started",
  "payment_success",
  "payment_failed",
  "report_unlocked",
  "optimizer_purchase",
  "job_match_used",
] as const;

export type FunnelEvent = (typeof funnelEvents)[number];
