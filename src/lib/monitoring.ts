export async function captureError(error: unknown, context?: Record<string, unknown>) {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  console.error(
    JSON.stringify({
      level: "error",
      message,
      stack,
      context,
      at: new Date().toISOString(),
    }),
  );

  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;
  try {
    const url = new URL(dsn);
    const key = url.username;
    const projectId = url.pathname.replace(/^\//, "").replace(/\/$/, "");
    if (!key || !projectId) return;
    const store = `${url.protocol}//${url.host}/api/${projectId}/store/`;
    await fetch(store, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Sentry-Auth": `Sentry sentry_version=7, sentry_key=${key}, sentry_client=mizane/1.0`,
      },
      body: JSON.stringify({
        event_id: crypto.randomUUID().replace(/-/g, ""),
        timestamp: Date.now() / 1000,
        platform: "node",
        level: "error",
        environment: process.env.MIZANE_ENV ?? process.env.NODE_ENV,
        exception: {
          values: [{ type: error instanceof Error ? error.name : "Error", value: message }],
        },
        extra: { ...context, stack },
      }),
    });
  } catch {
    /* monitoring must never break the product path */
  }
}

export function logEvent(event: string, data: Record<string, unknown> = {}) {
  console.info(JSON.stringify({ event, ...data, at: new Date().toISOString() }));
}
