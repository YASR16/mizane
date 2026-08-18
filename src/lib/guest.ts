import { prisma } from "@/lib/db";

export async function attachGuestToUser(userId: string, guestToken?: string | null) {
  if (!guestToken) return { analyses: 0, payments: 0, documents: 0 };
  const [analyses, payments, documents] = await prisma.$transaction([
    prisma.analysis.updateMany({
      where: { guestToken, userId: null },
      data: { userId },
    }),
    prisma.payment.updateMany({
      where: { guestToken, userId: null },
      data: { userId },
    }),
    prisma.cvDocument.updateMany({
      where: { guestToken, userId: null },
      data: { userId },
    }),
  ]);
  return { analyses: analyses.count, payments: payments.count, documents: documents.count };
}
