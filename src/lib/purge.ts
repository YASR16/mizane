import { prisma } from "@/lib/db";
import { deletePrivateFile } from "@/lib/storage";

export async function deleteCvCompletely(documentId: string) {
  const doc = await prisma.cvDocument.findUnique({
    where: { id: documentId },
    include: { analyses: { select: { id: true } } },
  });
  if (!doc) return { ok: false as const };
  await deletePrivateFile(doc.storageKey);
  await prisma.cvDocument.update({
    where: { id: documentId },
    data: {
      deletedAt: new Date(),
      extractedText: null,
      storageKey: `deleted/${doc.id}`,
    },
  });
  await prisma.analysis.updateMany({
    where: { documentId },
    data: { resultJson: null, reportUnlocked: false, optimizerUnlocked: false },
  });
  await prisma.auditLog.create({
    data: {
      action: "cv.delete",
      entity: "CvDocument",
      entityId: documentId,
      userId: doc.userId,
      meta: JSON.stringify({ analyses: doc.analyses.length }),
    },
  });
  return { ok: true as const };
}

export async function purgeExpiredDocuments() {
  const due = await prisma.cvDocument.findMany({
    where: { deletedAt: null, purgeAt: { lte: new Date() } },
    select: { id: true },
  });
  let purged = 0;
  for (const doc of due) {
    const result = await deleteCvCompletely(doc.id);
    if (result.ok) purged += 1;
  }
  await prisma.auditLog.create({
    data: {
      action: "cv.purge",
      entity: "CvDocument",
      meta: JSON.stringify({ purged, scanned: due.length }),
    },
  });
  return purged;
}
