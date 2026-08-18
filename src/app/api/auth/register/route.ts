import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/analytics";
import { attachGuestToUser } from "@/lib/guest";

export async function POST(req: NextRequest) {
  const limited = rateLimit(`register:${clientIp(req)}`, 5, 15 * 60 * 1000);
  if (!limited.ok) return NextResponse.json({ error: "Trop de tentatives." }, { status: 429 });

  const body = (await req.json()) as { name?: string; email?: string; password?: string; locale?: string };
  const email = body.email?.toLowerCase().trim();
  const password = body.password ?? "";
  if (!email || !email.includes("@") || password.length < 8) {
    return NextResponse.json({ error: "E-mail valide et mot de passe de 8 caractères minimum." }, { status: 400 });
  }
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return NextResponse.json({ error: "Un compte existe déjà." }, { status: 409 });

  const user = await prisma.user.create({
    data: {
      email,
      name: body.name?.slice(0, 80),
      passwordHash: await bcrypt.hash(password, 12),
      locale: body.locale ?? "fr",
    },
  });

  const guestToken = (await cookies()).get("mizane_guest")?.value;
  const attached = await attachGuestToUser(user.id, guestToken);

  return NextResponse.json({ id: user.id, attached });
}
