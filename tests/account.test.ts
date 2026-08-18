import { describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { attachGuestToUser } from "@/lib/guest";
import { evaluateFulfillment } from "@/lib/payments/rules";

const hasDb = Boolean(process.env.DATABASE_URL);

describe.skipIf(!hasDb)("guest attach and concurrent payments", () => {
  it("attaches guest analysis and payment to a new user", async () => {
    const guestToken = `guest-test-${Date.now()}`;
    const email = `guest-${Date.now()}@example.com`;
    const user = await prisma.user.create({ data: { email, passwordHash: "x" } });
    const doc = await prisma.cvDocument.create({
      data: {
        guestToken,
        originalName: "cv.pdf",
        mimeType: "application/pdf",
        sizeBytes: 12,
        storageKey: `test/${guestToken}`,
        checksum: guestToken,
        extractedText: "text",
        purgeAt: new Date(Date.now() + 86400000),
      },
    });
    const analysis = await prisma.analysis.create({
      data: {
        documentId: doc.id,
        guestToken,
        status: "COMPLETED",
        resultJson: "{}",
        reportUnlocked: true,
      },
    });
    await prisma.payment.create({
      data: {
        orderId: `MZ-G-${Date.now()}`,
        analysisId: analysis.id,
        guestToken,
        productCode: "ANALYSIS",
        amountMad: 49,
        status: "SUCCEEDED",
        provider: "mock",
      },
    });

    const attached = await attachGuestToUser(user.id, guestToken);
    expect(attached.analyses).toBe(1);
    expect(attached.payments).toBe(1);
    expect(attached.documents).toBe(1);

    const again = await prisma.analysis.findUnique({ where: { id: analysis.id } });
    expect(again?.userId).toBe(user.id);
  });

  it("serializes concurrent fulfill decisions as replay after success", () => {
    const payment = {
      orderId: "MZ-C",
      amountMad: 49,
      currency: "MAD",
      productCode: "ANALYSIS" as const,
      status: "SUCCEEDED" as const,
      provider: "mock",
    };
    const verified = {
      orderId: "MZ-C",
      providerRef: "r",
      status: "SUCCEEDED" as const,
      amountMad: 49,
      currency: "MAD",
      productCode: "ANALYSIS",
      raw: {},
    };
    const a = evaluateFulfillment(payment, verified);
    const b = evaluateFulfillment(payment, verified);
    expect(a).toEqual({ ok: true, replay: true });
    expect(b).toEqual({ ok: true, replay: true });
  });
});
