import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const WEAK = new Set(["change-me-now", "changeme", "admin", "password", "12345678"]);

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.log("Skipping admin seed: set ADMIN_EMAIL and ADMIN_PASSWORD.");
    return;
  }
  if (WEAK.has(password) || password.length < 12) {
    throw new Error("ADMIN_PASSWORD is too weak. Do not use change-me-now or short passwords.");
  }
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { email },
    update: { role: "ADMIN", passwordHash },
    create: { email, name: "Admin Mizane", role: "ADMIN", passwordHash },
  });
  console.log(`Admin ready: ${email}`);
}

main().finally(() => prisma.$disconnect());
