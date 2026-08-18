export type RoleFamily = "qa" | "developer" | "data" | "finance" | "marketing" | "sales" | "generic";

export const ROLE_PACKS: Record<
  RoleFamily,
  { keywords: string[]; exampleBefore: string; exampleAfter: string; summary: string }
> = {
  qa: {
    keywords: [
      "qa",
      "test",
      "testing",
      "automation",
      "playwright",
      "cypress",
      "selenium",
      "junit",
      "api",
      "regression",
      "quality",
      "ci",
    ],
    exampleBefore: "Testing web applications.",
    exampleAfter:
      "Automated 80+ regression scenarios with Playwright and TypeScript, reducing manual regression effort by about 40%.",
    summary:
      "QA Automation Engineer with hands-on coverage of UI and API tests, CI quality gates, and measurable defect reduction.",
  },
  developer: {
    keywords: ["javascript", "typescript", "react", "node", "java", "spring", "api", "git", "sql", "docker"],
    exampleBefore: "Developed web applications.",
    exampleAfter:
      "Shipped a React/TypeScript checkout flow used by 12k monthly users, cutting payment errors by 18%.",
    summary: "Software engineer focused on reliable APIs and front-end delivery with measurable product impact.",
  },
  data: {
    keywords: ["sql", "python", "excel", "power bi", "tableau", "etl", "dashboard", "kpi", "statistics"],
    exampleBefore: "Created reports for management.",
    exampleAfter:
      "Built Power BI dashboards tracking 12 operational KPIs, reducing weekly reporting time by about 30%.",
    summary: "Data analyst turning operational data into decisions through SQL, Python and executive dashboards.",
  },
  finance: {
    keywords: ["ifrs", "excel", "sap", "consolidation", "audit", "budget", "reporting", "treasury"],
    exampleBefore: "Responsible for accounting tasks.",
    exampleAfter:
      "Closed monthly IFRS reporting in SAP for 3 entities, cutting closing delay from 12 to 8 days.",
    summary: "Finance professional with IFRS reporting, budget control and audit-ready documentation.",
  },
  marketing: {
    keywords: ["seo", "sea", "google ads", "analytics", "content", "crm", "hubspot", "campaign"],
    exampleBefore: "Managed social media.",
    exampleAfter:
      "Ran Google Ads and SEO for 4 product lines, lifting qualified leads by 22% in two quarters.",
    summary: "Marketing manager combining acquisition, content and CRM to grow qualified demand.",
  },
  sales: {
    keywords: ["crm", "pipeline", "negotiation", "prospection", "quota", "b2b", "closing"],
    exampleBefore: "Sold products to clients.",
    exampleAfter:
      "Owned a B2B pipeline of 40 accounts in CRM, closing 1.2M MAD against a 1.0M quota.",
    summary: "Sales professional with documented pipeline discipline and quota attainment.",
  },
  generic: {
    keywords: [],
    exampleBefore: "Responsible for daily tasks.",
    exampleAfter: "Delivered [project] using [tool], resulting in [measurable outcome].",
    summary: "Professional with a clear specialisation, tools used, and evidence of impact.",
  },
};

export function detectRoleFamily(role?: string): RoleFamily {
  const r = (role ?? "").toLowerCase();
  if (!r.trim()) return "generic";
  if (/qa|test|qualité|qualite|sdet/.test(r)) return "qa";
  if (/dev|ingénieur logiciel|ingenieur logiciel|software|fullstack|front|back/.test(r)) return "developer";
  if (/data|analyste|bi |machine learning|power bi/.test(r)) return "data";
  if (/finance|comptable|audit|trésor|tresor/.test(r)) return "finance";
  if (/market|communication|digital|seo/.test(r)) return "marketing";
  if (/commercial|sales|business develop/.test(r)) return "sales";
  return "generic";
}
