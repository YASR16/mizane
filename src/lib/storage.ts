import { mkdir, writeFile, readFile, unlink } from "fs/promises";
import { dirname, join } from "path";
import { randomBytes } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { mizaneEnv } from "@/lib/env";

const localRoot = join(process.cwd(), "storage", "uploads");
const secret = new TextEncoder().encode(process.env.AUTH_SECRET ?? "mizane-dev-file-secret-change-me");

export type StorageDriverName = "local" | "s3" | "postgres";

export function storageDriver(): StorageDriverName {
  const raw = (process.env.STORAGE_DRIVER ?? "local").toLowerCase();
  if (raw === "s3" || raw === "r2") return "s3";
  if (raw === "postgres") {
    if (mizaneEnv() === "production") {
      throw new Error("STORAGE_DRIVER=postgres is forbidden in production. Use private s3/r2.");
    }
    return "postgres";
  }
  if (raw === "local") {
    if (mizaneEnv() !== "development") {
      throw new Error("STORAGE_DRIVER=local is forbidden outside development.");
    }
    return "local";
  }
  throw new Error(`Unknown STORAGE_DRIVER: ${raw}`);
}

function s3Config() {
  const bucket = process.env.S3_BUCKET || process.env.AWS_S3_BUCKET;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.S3_REGION || process.env.AWS_S3_REGION || "auto";
  const endpoint = process.env.S3_ENDPOINT || process.env.AWS_S3_ENDPOINT;
  if (!bucket || !accessKeyId || !secretAccessKey) {
    throw new Error("S3/R2 storage requires S3_BUCKET, S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY.");
  }
  return { bucket, accessKeyId, secretAccessKey, region, endpoint };
}

function s3Client() {
  const cfg = s3Config();
  return new S3Client({
    region: cfg.region,
    endpoint: cfg.endpoint,
    forcePathStyle: Boolean(cfg.endpoint) || process.env.S3_FORCE_PATH_STYLE === "1",
    credentials: {
      accessKeyId: cfg.accessKeyId,
      secretAccessKey: cfg.secretAccessKey,
    },
  });
}

function assertSafeKey(key: string) {
  if (!key || key.includes("..") || key.startsWith("/") || key.includes("\\") || key.includes("\0")) {
    throw new Error("Invalid storage key");
  }
}

function newObjectKey(ext: string) {
  const safeExt = ext.startsWith(".") ? ext.toLowerCase() : `.${ext.toLowerCase()}`;
  return `${new Date().toISOString().slice(0, 10)}/${randomBytes(16).toString("hex")}${safeExt}`;
}

async function pg() {
  const { prisma } = await import("@/lib/db");
  return prisma;
}

export async function storePrivateFile(buffer: Buffer, ext: string) {
  const key = newObjectKey(ext);
  const driver = storageDriver();
  if (driver === "local") {
    const full = join(localRoot, key);
    await mkdir(dirname(full), { recursive: true });
    await writeFile(full, buffer);
    return key;
  }
  if (driver === "postgres") {
    const prisma = await pg();
    await prisma.privateObject.create({ data: { key, bytes: new Uint8Array(buffer) } });
    return key;
  }
  const cfg = s3Config();
  await s3Client().send(
    new PutObjectCommand({
      Bucket: cfg.bucket,
      Key: key,
      Body: buffer,
      ContentType: ext.toLowerCase().includes("pdf") ? "application/pdf" : "application/octet-stream",
      ACL: undefined,
    }),
  );
  return key;
}

export async function readPrivateFile(key: string) {
  assertSafeKey(key);
  const driver = storageDriver();
  if (driver === "local") {
    return readFile(join(localRoot, key));
  }
  if (driver === "postgres") {
    const prisma = await pg();
    const row = await prisma.privateObject.findUnique({ where: { key } });
    if (!row) throw new Error("Missing object");
    return Buffer.from(row.bytes);
  }
  const cfg = s3Config();
  const out = await s3Client().send(new GetObjectCommand({ Bucket: cfg.bucket, Key: key }));
  const bytes = await out.Body?.transformToByteArray();
  if (!bytes) throw new Error("Empty object");
  return Buffer.from(bytes);
}

export async function deletePrivateFile(key: string) {
  if (!key || key.startsWith("deleted/")) return;
  assertSafeKey(key);
  const driver = storageDriver();
  if (driver === "local") {
    try {
      await unlink(join(localRoot, key));
    } catch {
      /* already gone */
    }
    return;
  }
  if (driver === "postgres") {
    const prisma = await pg();
    await prisma.privateObject.deleteMany({ where: { key } });
    return;
  }
  const cfg = s3Config();
  try {
    await s3Client().send(new DeleteObjectCommand({ Bucket: cfg.bucket, Key: key }));
  } catch {
    /* already gone */
  }
}

/** Short-lived GET for an authenticated owner. Never a public bucket URL. */
export async function signedOwnerGetUrl(key: string, expiresSeconds = 15 * 60) {
  assertSafeKey(key);
  if (storageDriver() !== "s3") return null;
  const cfg = s3Config();
  return getSignedUrl(s3Client(), new GetObjectCommand({ Bucket: cfg.bucket, Key: key }), {
    expiresIn: expiresSeconds,
  });
}

export async function signedFileToken(documentId: string, userHint: string) {
  return new SignJWT({ documentId, userHint })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(secret);
}

export async function verifyFileToken(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload as { documentId: string; userHint: string };
}
