import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

mkdirSync(join(process.cwd(), "fixtures"), { recursive: true });

function pdfEscape(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function makePdf(lines: string[], filename: string) {
  let y = 760;
  const ops = ["BT /F1 10 Tf"];
  for (const line of lines) {
    const chunks = line.match(/.{1,90}/g) ?? [line];
    for (const chunk of chunks) {
      ops.push(`1 0 0 1 40 ${y} Tm (${pdfEscape(chunk)}) Tj`);
      y -= 14;
      if (y < 40) break;
    }
  }
  ops.push("ET");
  const content = ops.join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  ];
  let body = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((obj, i) => {
    offsets.push(Buffer.byteLength(body));
    body += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xref = offsets.length - 1;
  const startxref = Buffer.byteLength(body);
  body += `xref\n0 ${xref + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= xref; i++) {
    body += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  body += `trailer << /Size ${xref + 1} /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF`;
  writeFileSync(join(process.cwd(), "fixtures", filename), body);
}

makePdf(
  [
    "Amina Benali",
    "Casablanca, Maroc  +212 6 55 12 34 56  amina.benali@email.com  linkedin.com/in/amina-benali",
    "Profil",
    "QA Automation Engineer, 4 ans. Specialisee Playwright, TypeScript et tests API. J'industrialise la regression.",
    "Experience professionnelle",
    "QA Automation Engineer — Attijariwafa Bank, Casablanca — 2022-2026",
    "- Automated 80+ regression scenarios using Playwright and TypeScript, reducing manual regression effort by 40%.",
    "- Designed API test suite with REST Assured covering 120 endpoints for the mobile banking app.",
    "- Integrated Cypress smoke tests into GitLab CI, cutting release validation from 2 days to 4 hours.",
    "QA Tester — Capgemini, Rabat — 2020-2022",
    "- Executed 200+ manual test cases per sprint and logged defects in Jira with reproducible steps.",
    "Formation",
    "Ingenieur d'Etat Genie Informatique, EMI, Rabat, 2020",
    "Competences",
    "Playwright, Cypress, TypeScript, Java, Selenium, Jira, Git, SQL, Postman, Jenkins",
    "Langues",
    "Francais C1, Anglais B2, Arabe langue maternelle",
  ],
  "cv-good-fr.pdf",
);

makePdf(
  [
    "John Smith",
    "London  john.smith@company.com  +44 7700 900123  linkedin.com/in/johnsmithqa",
    "Summary",
    "Senior QA Automation Engineer with 6 years building Playwright and Cypress suites for fintech products.",
    "Experience",
    "Senior SDET — Acme Pay, London — 2021-2026",
    "- Built 150 Playwright tests in TypeScript, reducing production incidents by 25%.",
    "- Owned CI quality gates on GitHub Actions for 3 microservices.",
    "Skills",
    "Playwright, TypeScript, Cypress, API testing, SQL, Docker, AWS",
    "Education",
    "BSc Computer Science, University of Manchester, 2018",
  ],
  "cv-good-en.pdf",
);

makePdf(
  [
    "Karim",
    "yahoo.com",
    "Je cherche un poste stimulant. Dynamique, motive, team player, polyvalent, passionne.",
    "Experience",
    "Travail dans une societe",
    "Testing web applications.",
    "Responsible for quality.",
    "Formation",
    "Bac",
  ],
  "cv-bad-fr.pdf",
);

makePdf(["SCANNED IMAGE PLACEHOLDER"], "cv-scanned.pdf");

writeFileSync(join(process.cwd(), "fixtures", "not-a-cv.exe.pdf"), Buffer.from("MZ\x90this is not a pdf"));
writeFileSync(join(process.cwd(), "fixtures", "oversized.pdf"), Buffer.concat([Buffer.from("%PDF-1.4\n"), Buffer.alloc(5 * 1024 * 1024 + 100, 65)]));

// Minimal DOCX (ZIP with [Content_Types] + document.xml)
import { execSync } from "child_process";
const docxDir = join(process.cwd(), "fixtures", "_docx");
mkdirSync(join(docxDir, "word"), { recursive: true });
writeFileSync(
  join(docxDir, "[Content_Types].xml"),
  `<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`,
);
mkdirSync(join(docxDir, "_rels"), { recursive: true });
writeFileSync(
  join(docxDir, "_rels", ".rels"),
  `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`,
);
writeFileSync(
  join(docxDir, "word", "document.xml"),
  `<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Sara Idrissi Casablanca sara.idrissi@email.com +212 661112233 linkedin.com/in/sara-idrissi Profil Data Analyst 3 ans Experience Data Analyst - ONCF 2023-2026 - Built Power BI dashboards tracking 12 KPIs, reducing reporting time by 30%. Skills SQL, Python, Excel, Power BI, Tableau Formation ENCG Settat 2022</w:t></w:r></w:p></w:body></w:document>`,
);
try {
  execSync(`tar -a -cf "${join(process.cwd(), "fixtures", "cv-sara.docx.zip")}" -C "${docxDir}" [Content_Types].xml _rels word`, { stdio: "inherit" });
} catch {
  /* windows tar */
}

console.log("fixtures written");
