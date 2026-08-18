const fs = require("fs");
const crypto = require("crypto");

const secret = crypto.randomBytes(32).toString("hex");
const admin = crypto.randomBytes(12).toString("base64url");
const cron = crypto.randomBytes(16).toString("hex");

const body = [
  "NODE_ENV=production",
  "PAYZONE_SANDBOX=1",
  "NEXT_PUBLIC_APP_URL=http://localhost:3000",
  "DATABASE_URL=postgresql://mizane:mizane@localhost:5432/mizane",
  `AUTH_SECRET=${secret}`,
  "AUTH_URL=http://localhost:3000",
  "AUTH_TRUST_HOST=true",
  "PAYMENT_PROVIDER=payzone",
  "PAYZONE_ORIGINATOR_ID=",
  "PAYZONE_PASSWORD=",
  "PAYZONE_WEBHOOK_SECRET=",
  "PAYZONE_API_URL=https://api.payzone.ma",
  "PAYZONE_PAYMENT_PAGE_URL=https://payment.payzone.ma",
  "STORAGE_DRIVER=local",
  "CV_RETENTION_DAYS=30",
  `CRON_SECRET=${cron}`,
  "ADMIN_EMAIL=admin@mizane.ma",
  `ADMIN_PASSWORD=${admin}`,
  "",
].join("\n");

fs.writeFileSync(".env.production.local", body);

const env = fs.readFileSync(".env", "utf8").replace(
  /^DATABASE_URL=.*$/m,
  'DATABASE_URL="postgresql://mizane:mizane@localhost:5432/mizane"',
);
fs.writeFileSync(".env", env);
console.log("wrote .env.production.local and switched DATABASE_URL to postgres");
