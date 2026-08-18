import { writeFileSync } from "fs";
import { join } from "path";

const lines = [
  "Yassine El Fassi",
  "Casablanca, Maroc  +212 6 12 34 56 78  yassine.elfassi@gmail.com",
  "linkedin.com/in/yassine-elfassi",
  "Profil",
  "Ingenieur QA motive et dynamique, team player, cherche une opportunite stimulante.",
  "Experience professionnelle",
  "QA Engineer — Fintech Casablanca — 2022-2026",
  "- Testing web applications.",
  "- Responsible for quality assurance.",
  "- Worked with the team on regression.",
  "Formation",
  "Ingenieur d'Etat, EHTP, Casablanca, 2022",
  "Competences",
  "Java, Communication, Leadership, Excel",
  "Langues",
  "Francais, Anglais",
];

function pdfEscape(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

let y = 760;
const ops = ["BT /F1 11 Tf"];
for (const line of lines) {
  ops.push(`1 0 0 1 50 ${y} Tm (${pdfEscape(line)}) Tj`);
  y -= 18;
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

writeFileSync(join(process.cwd(), "fixtures", "cv-sample.pdf"), body);
console.log("wrote fixtures/cv-sample.pdf");
