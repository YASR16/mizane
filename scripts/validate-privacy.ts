import { existsSync } from "fs";
import { readFile, writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { prisma } from "../src/lib/db";
import { storePrivateFile, deletePrivateFile } from "../src/lib/storage";
import { deleteCvCompletely, purgeExpiredDocuments } from "../src/lib/purge";

async function main() {
  const buffer = Buffer.from("%PDF-1.4 privacy-test-file %%EOF");
  const storageKey = await storePrivateFile(buffer, ".pdf");
  const full = join(process.cwd(), "storage", "uploads", storageKey);
  if (!existsSync(full)) throw new Error("FAIL storage write");

  const doc = await prisma.cvDocument.create({
    data: {
      originalName: "privacy-test.pdf",
      mimeType: "application/pdf",
      sizeBytes: buffer.length,
      storageKey,
      checksum: "privacy-test",
      extractedText: "SECRET CV TEXT",
      purgeAt: new Date(Date.now() - 1000),
    },
  });
  const analysis = await prisma.analysis.create({
    data: {
      documentId: doc.id,
      status: "COMPLETED",
      resultJson: JSON.stringify({ overall_score: 10 }),
      reportUnlocked: true,
    },
  });

  const deleted = await deleteCvCompletely(doc.id);
  if (!deleted.ok) throw new Error("FAIL deleteCvCompletely");
  if (existsSync(full)) throw new Error("FAIL stored file still exists after delete");

  const after = await prisma.cvDocument.findUnique({ where: { id: doc.id } });
  if (!after?.deletedAt) throw new Error("FAIL deletedAt not set");
  if (after.extractedText) throw new Error("FAIL extracted text still present");

  const analysisAfter = await prisma.analysis.findUnique({ where: { id: analysis.id } });
  if (analysisAfter?.resultJson) throw new Error("FAIL analysis JSON still present");
  if (analysisAfter?.reportUnlocked) throw new Error("FAIL report still unlocked");

  const extraKey = await storePrivateFile(Buffer.from("%PDF-1.4 purge %%EOF"), ".pdf");
  const extraFull = join(process.cwd(), "storage", "uploads", extraKey);
  const extra = await prisma.cvDocument.create({
    data: {
      originalName: "purge-test.pdf",
      mimeType: "application/pdf",
      sizeBytes: 20,
      storageKey: extraKey,
      checksum: "purge-test",
      extractedText: "PURGE ME",
      purgeAt: new Date(Date.now() - 1000),
    },
  });
  const purged = await purgeExpiredDocuments();
  if (purged < 1) throw new Error("FAIL purge deleted nothing");
  if (existsSync(extraFull)) throw new Error("FAIL purge left the file on disk");
  const extraAfter = await prisma.cvDocument.findUnique({ where: { id: extra.id } });
  if (extraAfter?.extractedText) throw new Error("FAIL purge left extracted text");

  await prisma.analysis.deleteMany({ where: { documentId: { in: [doc.id, extra.id] } } });
  await prisma.cvDocument.deleteMany({ where: { id: { in: [doc.id, extra.id] } } });
  console.log("PASS privacy deletion and purge (file + text actually removed)");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
