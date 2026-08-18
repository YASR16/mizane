import { describe, expect, it } from "vitest";
import { UploadRejected, validateUpload } from "@/lib/files";

describe("upload magic-byte validation", () => {
  it("rejects an EXE renamed as PDF", () => {
    const exe = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00, 0x04]);
    expect(() => validateUpload(exe, "cv.pdf")).toThrow(UploadRejected);
    try {
      validateUpload(exe, "cv.pdf");
    } catch (e) {
      expect((e as UploadRejected).code).toBe("EXECUTABLE");
    }
  });

  it("rejects a non-PDF with a .pdf name", () => {
    const junk = Buffer.from("this is not a pdf file!!!!");
    expect(() => validateUpload(junk, "cv.pdf")).toThrow(/PDF ou DOCX/);
  });

  it("rejects a truncated/invalid DOCX zip", () => {
    const zipOnly = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00]);
    expect(() => validateUpload(zipOnly, "cv.docx")).toThrow(UploadRejected);
  });

  it("accepts a PDF header with matching extension", () => {
    const pdf = Buffer.from("%PDF-1.4\n%\xe2\xe3\xcf\xd3\ntrailer\n%%EOF\n");
    expect(validateUpload(pdf, "cv.pdf").kind).toBe("pdf");
  });

  it("rejects oversized files without storing them", () => {
    const pdf = Buffer.concat([Buffer.from("%PDF-1.4\n"), Buffer.alloc(6 * 1024 * 1024, 65)]);
    try {
      validateUpload(pdf, "cv.pdf", pdf.length);
      throw new Error("expected reject");
    } catch (e) {
      expect((e as UploadRejected).code).toBe("TOO_LARGE");
    }
  });
});

import { sanitizeFilename } from "@/lib/security";

describe("filename sanitization", () => {
  it("strips path traversal and control characters", () => {
    expect(sanitizeFilename("../../etc/passwd")).not.toMatch(/\.\./);
    expect(sanitizeFilename("cv.pdf\u0000.exe")).not.toContain("\u0000");
    expect(sanitizeFilename("a".repeat(500)).length).toBeLessThanOrEqual(120);
  });
});
