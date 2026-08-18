import { looksLikeDocx, looksLikePdf } from "@/lib/security";
import { fileLimits } from "@/lib/brand";

export type FileKind = "pdf" | "docx";

export class UploadRejected extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export function detectKind(buffer: Buffer): FileKind | null {
  if (looksLikePdf(buffer)) return "pdf";
  if (looksLikeDocx(buffer) && isDocxZip(buffer)) return "docx";
  return null;
}

function isDocxZip(buffer: Buffer) {
  const head = buffer.subarray(0, Math.min(buffer.length, 8000)).toString("binary");
  return head.includes("word/") || head.includes("[Content_Types].xml") || head.includes("wordprocessingml");
}

export function validateUpload(buffer: Buffer, filename: string, declaredSize?: number) {
  const size = declaredSize ?? buffer.length;
  if (size > fileLimits.maxSizeBytes) {
    throw new UploadRejected("TOO_LARGE", `Fichier trop volumineux (max ${fileLimits.maxSizeLabel}).`);
  }
  if (buffer.length < 8) {
    throw new UploadRejected("EMPTY", "Fichier vide ou corrompu.");
  }
  if (buffer[0] === 0x4d && buffer[1] === 0x5a) {
    throw new UploadRejected("EXECUTABLE", "Fichier exécutable refusé.");
  }
  const kind = detectKind(buffer);
  if (!kind) {
    throw new UploadRejected("INVALID_TYPE", "Formats acceptés : PDF ou DOCX valides (le nom de fichier ne suffit pas).");
  }
  const lower = filename.toLowerCase();
  if (kind === "pdf" && !lower.endsWith(".pdf")) {
    throw new UploadRejected("EXTENSION_MISMATCH", "Le contenu est un PDF mais l’extension ne correspond pas.");
  }
  if (kind === "docx" && !lower.endsWith(".docx")) {
    throw new UploadRejected("EXTENSION_MISMATCH", "Le contenu est un DOCX mais l’extension ne correspond pas.");
  }
  return {
    kind,
    mime:
      kind === "pdf"
        ? "application/pdf"
        : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };
}
