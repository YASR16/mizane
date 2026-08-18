import { extractText, getDocumentProxy } from "unpdf";
import mammoth from "mammoth";

export type Extraction = {
  text: string;
  pageCount: number;
  isScanned: boolean;
  quality: "high" | "medium" | "low";
  warnings: string[];
};

function normalize(text: string) {
  return text
    .replace(/\u0000/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function detectScannedPdf(text: string, pageCount: number, buffer: Buffer) {
  const chars = text.replace(/\s/g, "").length;
  if (chars >= 80) return false;
  const sniff = buffer.subarray(0, Math.min(buffer.length, 40_000)).toString("latin1");
  const hasImage = /\/Image|\/XObject|\/DCTDecode|\/JPXDecode/.test(sniff);
  if (chars < 25) return true;
  if (chars < 80 && hasImage) return true;
  if (chars < 12 && pageCount >= 1) return true;
  return false;
}

export async function extractPdf(buffer: Buffer): Promise<Extraction> {
  const warnings: string[] = [];
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text, totalPages } = await extractText(pdf, { mergePages: true });
  const cleaned = normalize(Array.isArray(text) ? text.join("\n") : text);
  const isScanned = detectScannedPdf(cleaned, totalPages, buffer);
  const quality = isScanned ? "low" : cleaned.length < 600 ? "medium" : "high";
  if (isScanned) {
    warnings.push(
      "Votre CV semble être un document scanné. L’analyse peut être moins précise. Nous recommandons une version PDF contenant du texte sélectionnable.",
    );
  }
  return { text: cleaned, pageCount: totalPages, isScanned, quality, warnings };
}

export async function extractDocx(buffer: Buffer): Promise<Extraction> {
  const result = await mammoth.extractRawText({ buffer });
  const cleaned = normalize(result.value);
  const quality = cleaned.length < 400 ? "medium" : "high";
  return {
    text: cleaned,
    pageCount: 1,
    isScanned: false,
    quality,
    warnings: result.messages.map((m) => m.message),
  };
}

export async function extractDocument(buffer: Buffer, mime: string): Promise<Extraction> {
  if (mime === "application/pdf") return extractPdf(buffer);
  if (mime.includes("wordprocessingml")) return extractDocx(buffer);
  throw new Error("UNSUPPORTED_FORMAT");
}
