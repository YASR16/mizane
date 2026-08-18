import { describe, expect, it } from "vitest";
import { analyzeCvText, inferMarket } from "@/lib/analysis/heuristics";
import { publicPreview } from "@/lib/analysis/engine";
import { detectScannedPdf } from "@/lib/extraction";
import { detectRoleFamily } from "@/lib/analysis/roles";

const STRONG_FR = `
Jean Dupont
Casablanca
jean.dupont@gmail.com
+212 661 00 00 00
linkedin.com/in/jeandupont

Profil
Ingénieur QA Automation avec 6 ans d'expérience Playwright, Cypress, API testing et CI.

Expérience
QA Automation Engineer — Bank ABC, Casablanca
- Automated 120 regression scenarios with Playwright and TypeScript, reducing manual regression by 40%.
- Implemented API contract tests in CI (Jenkins) catching 15 regressions before release.

Formation
Master Informatique, ENSIAS, 2018

Compétences
Playwright, Cypress, Selenium, JUnit, API, Jenkins, Git, SQL
`;

const WEAK_FR = `
CV
Je suis dynamique, motivé, team player et passionné.
Recherche un poste.
`;

const STRONG_EN = `
Sarah Bennett
London
sarah.bennett@email.com
+44 7700 900123
linkedin.com/in/sarahbennett

Summary
QA Automation Engineer specialised in Playwright, Cypress and API testing.

Experience
Senior QA Automation Engineer — Fintech Ltd, London
- Automated 80+ regression scenarios using Playwright and TypeScript, reducing manual regression effort by 40%.
- Owned CI quality gates in GitHub Actions for UI and API suites.

Education
BSc Computer Science, UCL, 2016

Skills
Playwright, Cypress, Selenium, REST API, CI, TypeScript, Jira
`;

const DATA_ANALYST = `
Karim El Fassi
Rabat
karim.elfassi@email.com
+212 662223344
linkedin.com/in/karimelfassi

Profil
Data Analyst SQL, Python, Power BI.

Expérience
Data Analyst — Retail MA
- Built Power BI dashboards tracking 12 operational KPIs, reducing weekly reporting time by 30%.
- Wrote SQL and Python ETL for daily sales extracts.

Formation
Master Data, 2020

Compétences
SQL, Python, Excel, Power BI, Tableau, KPI, ETL
`;

const MARKETING = `
Lina Martin
Paris
lina.martin@email.com
+33 6 12 34 56 78
linkedin.com/in/linamartin

Profil
Marketing Manager SEO SEA CRM.

Expérience
Marketing Manager — Brand
- Ran Google Ads and SEO for 4 product lines, lifting qualified leads by 22%.

Formation
Master Marketing

Compétences
SEO, SEA, Google Ads, Analytics, HubSpot, CRM, content
`;

describe("CV analysis quality", () => {
  it("does not give a weak French CV an unrealistically high ATS score", () => {
    const weak = analyzeCvText({ text: WEAK_FR, isScanned: false, quality: "medium", targetRole: "Data Analyst", locale: "fr" });
    const strong = analyzeCvText({ text: STRONG_FR, isScanned: false, quality: "high", targetRole: "QA Automation Engineer", targetCountry: "MA", locale: "fr" });
    expect(weak.ats_score).toBeLessThan(70);
    expect(strong.ats_score).toBeGreaterThan(weak.ats_score);
    expect(weak.ats_score).not.toBeGreaterThanOrEqual(90);
  });

  it("keeps a strong English QA CV from generic ChatGPT advice and uses QA examples", () => {
    const r = analyzeCvText({
      text: STRONG_EN,
      isScanned: false,
      quality: "high",
      targetRole: "QA Automation Engineer",
      targetCountry: "GB",
      locale: "en",
    });
    const blob = JSON.stringify(r.priorities);
    expect(blob.toLowerCase()).toMatch(/playwright|cypress|regression|qa/);
    expect(r.priorities.length).toBeGreaterThanOrEqual(3);
    r.priorities.forEach((p) => {
      expect(p.problem.length).toBeGreaterThan(10);
      expect(p.why.length).toBeGreaterThan(10);
      expect(p.how.length).toBeGreaterThan(10);
    });
  });

  it("does not require a Moroccan phone on a UK CV", () => {
    const r = analyzeCvText({
      text: STRONG_EN,
      isScanned: false,
      quality: "high",
      targetRole: "QA Automation Engineer",
      targetCountry: "GB",
    });
    expect(JSON.stringify(r.contact.issues)).not.toMatch(/\+212/);
    expect(inferMarket({ targetCountry: "GB", text: STRONG_EN })).toBe("GB");
  });

  it("recommends Moroccan phone only when Morocco is the target", () => {
    const withoutPhone = STRONG_FR.replace("+212 661 00 00 00", "");
    const r = analyzeCvText({
      text: withoutPhone,
      isScanned: false,
      quality: "high",
      targetRole: "QA Automation Engineer",
      targetCountry: "MA",
    });
    expect(JSON.stringify(r)).toMatch(/\+212/);
  });

  it("uses data-analyst keywords for a Data Analyst role", () => {
    const r = analyzeCvText({
      text: DATA_ANALYST,
      isScanned: false,
      quality: "high",
      targetRole: "Data Analyst",
      targetCountry: "MA",
    });
    expect(detectRoleFamily("Data Analyst")).toBe("data");
    expect(r.detected_keywords.join(" ").toLowerCase()).toMatch(/sql|power bi|python/);
  });

  it("uses marketing keywords for a Marketing Manager role", () => {
    expect(detectRoleFamily("Marketing Manager")).toBe("marketing");
    const r = analyzeCvText({
      text: MARKETING,
      isScanned: false,
      quality: "high",
      targetRole: "Marketing Manager",
      targetCountry: "FR",
    });
    expect(JSON.stringify(r).toLowerCase()).toMatch(/seo|google ads|crm/);
  });

  it("does not classify a short text CV as scanned", () => {
    const short = "Amina El Idrissi\nRabat\namina@email.com\n+212612345678\nProfil court d'une page.\nExpérience\n- Géré un magasin.\nFormation\nLicence.";
    const r = analyzeCvText({ text: short, isScanned: false, quality: "medium", targetRole: "Sales", locale: "fr" });
    expect(r.is_scanned).toBe(false);
    const pdfLike = Buffer.from("%PDF-1.4 text stream Hello CV");
    expect(detectScannedPdf(short, 1, pdfLike)).toBe(false);
  });

  it("always exposes genuine paid content on a strong CV", () => {
    const r = analyzeCvText({
      text: STRONG_FR,
      isScanned: false,
      quality: "high",
      targetRole: "QA Automation Engineer",
      targetCountry: "MA",
    });
    const preview = publicPreview(r);
    expect(preview.locked_recommendations).toBeGreaterThan(0);
    expect(preview.locked_items.length).toBeGreaterThan(0);
    expect(preview.issues[0]).not.toHaveProperty("how");
  });
});
