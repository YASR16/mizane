const WEAK_ADMIN = new Set(["change-me-now", "changeme", "admin", "password", "12345678"]);

export type MizaneEnv = "development" | "staging" | "production";

export function mizaneEnv(env: NodeJS.ProcessEnv = process.env): MizaneEnv {
  const raw = (env.MIZANE_ENV ?? "").toLowerCase();
  if (raw === "staging") return "staging";
  if (raw === "production" || env.NODE_ENV === "production") return "production";
  return "development";
}

export function isProduction() {
  return mizaneEnv() === "production";
}

export function isSqliteUrl(url = process.env.DATABASE_URL ?? "") {
  return url.startsWith("file:") || url.includes("mode=memory") || url.startsWith("sqlite");
}

function isLocalhostUrl(url: string) {
  return !url || url.includes("localhost") || url.includes("127.0.0.1");
}

function isHttpsUrl(url: string) {
  return url.startsWith("https://");
}

function storageDriverName(env: NodeJS.ProcessEnv) {
  return (env.STORAGE_DRIVER ?? "local").toLowerCase();
}

function hasObjectStorageCreds(env: NodeJS.ProcessEnv) {
  const bucket = env.S3_BUCKET || env.AWS_S3_BUCKET;
  const key = env.S3_ACCESS_KEY_ID || env.AWS_ACCESS_KEY_ID;
  const secret = env.S3_SECRET_ACCESS_KEY || env.AWS_SECRET_ACCESS_KEY;
  return Boolean(bucket && key && secret);
}

export function paymentsEnabled(env: NodeJS.ProcessEnv = process.env) {
  const provider = env.PAYMENT_PROVIDER ?? "mock";
  if (provider === "disabled") return false;
  if (provider === "mock") return mockPaymentsAllowed(env);
  return provider === "payzone";
}

export function assertRuntimeEnv(env: NodeJS.ProcessEnv = process.env) {
  const mode = mizaneEnv(env);
  const errors: string[] = [];

  if (mode !== "development" && isSqliteUrl(env.DATABASE_URL)) {
    errors.push("Staging/production refuses SQLite. Set DATABASE_URL to PostgreSQL.");
  }

  if (mode !== "development") {
    const appUrl = (env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
    if (!isHttpsUrl(appUrl) || isLocalhostUrl(appUrl)) {
      errors.push("NEXT_PUBLIC_APP_URL must be the public https domain (not localhost).");
    }

    const authUrl = (env.AUTH_URL ?? "").replace(/\/$/, "");
    if (authUrl && authUrl !== appUrl) {
      errors.push("AUTH_URL must equal NEXT_PUBLIC_APP_URL.");
    }

    if (mode === "production" && (env.PAYZONE_SANDBOX === "1" || env.PAYZONE_SANDBOX === "true")) {
      errors.push("PAYZONE_SANDBOX is forbidden when MIZANE_ENV=production. Use the live merchant account.");
    }

    const storage = storageDriverName(env);
    if (storage === "local") {
      errors.push("STORAGE_DRIVER=local is forbidden in staging/production.");
    }
    if (storage === "postgres" && mode === "production") {
      errors.push("STORAGE_DRIVER=postgres is staging-only. Production requires private s3/r2.");
    }
    if (storage === "s3" || storage === "r2") {
      if (!hasObjectStorageCreds(env)) {
        errors.push("Private object storage requires S3_BUCKET, S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY.");
      }
    } else if (storage !== "postgres" && storage !== "local") {
      errors.push(`Unknown STORAGE_DRIVER: ${storage}`);
    }

    if (!env.AUTH_SECRET || env.AUTH_SECRET.length < 32 || env.AUTH_SECRET.includes("replace-with")) {
      errors.push("AUTH_SECRET must be a strong secret (32+ chars) in staging/production.");
    }

    const provider = env.PAYMENT_PROVIDER ?? "mock";
    if (provider === "mock") {
      errors.push("PAYMENT_PROVIDER=mock is forbidden in staging/production.");
    } else if (provider === "disabled") {
      if (mode === "production") {
        errors.push("PAYMENT_PROVIDER=disabled is forbidden in production. Use live Payzone.");
      }
    } else if (provider === "payzone") {
      if (!env.PAYZONE_ORIGINATOR_ID || !env.PAYZONE_PASSWORD) {
        errors.push("Payzone requires PAYZONE_ORIGINATOR_ID and PAYZONE_PASSWORD.");
      }
      if (!env.PAYZONE_WEBHOOK_SECRET) {
        errors.push("Payzone requires PAYZONE_WEBHOOK_SECRET.");
      }
    } else {
      errors.push(`Unknown PAYMENT_PROVIDER: ${provider}`);
    }

    if (!env.CRON_SECRET || env.CRON_SECRET.includes("replace-with")) {
      errors.push("CRON_SECRET is required in staging/production.");
    }

    const adminPassword = env.ADMIN_PASSWORD ?? "";
    if (!adminPassword || WEAK_ADMIN.has(adminPassword) || adminPassword.length < 12) {
      errors.push("ADMIN_PASSWORD is missing, default (e.g. change-me-now), or too weak.");
    }
  }

  if (errors.length) {
    throw new Error(`Mizane runtime env invalid:\n- ${errors.join("\n- ")}`);
  }
}

export function mockPaymentsAllowed(env: NodeJS.ProcessEnv = process.env) {
  if (mizaneEnv(env) !== "development") return false;
  return (env.PAYMENT_PROVIDER ?? "mock") === "mock";
}
