import type { Category, Project } from "@/lib/types";
import type { VisualName } from "./DynamicVisual";

/** Route keys shared by marketing content and its semantic 3D scene. */
export type PageKey =
  | "home"
  | "services"
  | "industries"
  | "about"
  | "process"
  | "insights"
  | "contact"
  | "case-studies"
  | "careers"
  | "faq"
  | "project"
  | "category";

/** One intentional metaphor per route; avoid reusing decorative shapes without meaning. */
export const PAGE_SCENES: Record<PageKey, VisualName> = {
  home: "HeroCore",                    // digital ecosystem / planetary core
  services: "ServiceConstellation",   // connected capabilities
  industries: "IndustryRings",        // connected sectors
  about: "TeamOrbit",                 // people around a shared center
  process: "WorkflowGraph",           // sequence and dependencies
  insights: "KnowledgeFragments",     // ideas and knowledge connections
  contact: "SignalBeacon",            // reaching / connecting
  "case-studies": "ProjectOrbit",    // product interfaces and project work
  careers: "TeamOrbit",               // people and collaboration
  faq: "QABubbles",                   // questions and responses
  project: "ProjectOrbit",             // generic project overview, refined by record metadata below
  category: "ServiceConstellation",   // refined by backend category metadata below
};

export const PAGE_STRIP: Record<PageKey, [VisualName, VisualName]> = {
  home: ["ServiceConstellation", "WorkflowGraph"],
  services: ["WorkflowGraph", "KnowledgeFragments"],
  industries: ["WorkflowGraph", "TeamOrbit"],
  about: ["WorkflowGraph", "ServiceConstellation"],
  process: ["ServiceConstellation", "SignalBeacon"],
  insights: ["SignalBeacon", "WorkflowGraph"],
  contact: ["TeamOrbit", "WorkflowGraph"],
  "case-studies": ["WorkflowGraph", "ServiceConstellation"],
  careers: ["WorkflowGraph", "SignalBeacon"],
  faq: ["SignalBeacon", "ServiceConstellation"],
  project: ["ServiceConstellation", "WorkflowGraph"],
  category: ["ServiceConstellation", "WorkflowGraph"],
};

const normalized = (values: unknown[]) => values
  .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
  .join(" ")
  .toLocaleLowerCase("en-US");

const hasEnglish = (text: string, pattern: RegExp) => pattern.test(text);
const hasArabic = (text: string, terms: string[]) => terms.some((term) => text.includes(term));

/**
 * Choose a scene from real backend-owned taxonomy/technology values. These are
 * visual rules, not project content: names, descriptions, images and URLs remain DB-driven.
 */
export function sceneForProject(project: Partial<Project>): VisualName {
  const technologyNames = Array.isArray(project.project_technologies)
    ? project.project_technologies.map((item) => item?.technology)
    : [];
  const industryNames = Array.isArray(project.project_industries)
    ? project.project_industries.map((item) => item?.industry)
    : [];
  const text = normalized([
    project.categories?.slug,
    project.categories?.name_ar,
    project.categories?.name_en,
    project.title_ar,
    project.title_en,
    ...technologyNames,
    ...industryNames,
  ]);

  if (hasEnglish(text, /(^|[^a-z])(iot|embedded|nfc|hardware|firmware|sensor|device|connected)([^a-z]|$)/) || hasArabic(text, ["مدمج", "مضمن", "أجهزة", "حساس", "اتصال", "بطاقات ذكية"])) return "SignalBeacon";
  if (hasEnglish(text, /(^|[^a-z])(ai|artificial intelligence|machine learning|llm|analytics|data science|knowledge)([^a-z]|$)/) || hasArabic(text, ["ذكاء اصطناعي", "تعلم آلي", "تحليلات", "بيانات"])) return "KnowledgeFragments";
  if (hasEnglish(text, /(^|[^a-z])(commerce|ecommerce|affiliate|campaign|marketing|growth|payment|store)([^a-z]|$)/) || hasArabic(text, ["تجارة", "حملة", "تسويق", "نمو", "مدفوعات"])) return "IndustryRings";
  if (hasEnglish(text, /(^|[^a-z])(erp|crm|dashboard|workflow|operations|management|task|business systems?|enterprise)([^a-z]|$)/) || hasArabic(text, ["إدارة", "مهام", "تشغيل", "نظام أعمال", "مؤسسة"])) return "WorkflowGraph";
  if (hasEnglish(text, /(^|[^a-z])(team|collaboration|people|hr|recruitment)([^a-z]|$)/) || hasArabic(text, ["فريق", "تعاون", "موارد بشرية", "توظيف"])) return "TeamOrbit";
  if (hasEnglish(text, /(^|[^a-z])(api|integration|network|platform|web|mobile|software|digital product)([^a-z]|$)/) || hasArabic(text, ["منصة", "تكامل", "ويب", "تطبيق", "منتج رقمي"])) return "ServiceConstellation";
  return "ProjectOrbit";
}

/** Category hero selected using the category's backend-provided name/slug/description. */
export function sceneForCategory(category: Partial<Category>): VisualName {
  const text = normalized([category.slug, category.name_ar, category.name_en, category.description_ar, category.description_en]);
  if (hasEnglish(text, /(^|[^a-z])(iot|embedded|nfc|hardware|firmware|sensor|device|connected)([^a-z]|$)/) || hasArabic(text, ["مدمج", "مضمن", "أجهزة", "حساس"])) return "SignalBeacon";
  if (hasEnglish(text, /(^|[^a-z])(ai|artificial intelligence|machine learning|analytics|data)([^a-z]|$)/) || hasArabic(text, ["ذكاء اصطناعي", "تحليلات", "بيانات"])) return "KnowledgeFragments";
  if (hasEnglish(text, /(^|[^a-z])(commerce|ecommerce|affiliate|campaign|marketing|growth)([^a-z]|$)/) || hasArabic(text, ["تجارة", "حملة", "تسويق", "نمو"])) return "IndustryRings";
  if (hasEnglish(text, /(^|[^a-z])(erp|crm|business|workflow|operations|management|task)([^a-z]|$)/) || hasArabic(text, ["إدارة", "تشغيل", "مهام", "أعمال"])) return "WorkflowGraph";
  if (hasEnglish(text, /(^|[^a-z])(team|people|careers)([^a-z]|$)/) || hasArabic(text, ["توظيف", "فريق"])) return "TeamOrbit";
  if (hasEnglish(text, /(^|[^a-z])(platform|digital|web|software)([^a-z]|$)/) || hasArabic(text, ["منصة", "رقمي", "ويب", "برمجيات"])) return "ServiceConstellation";
  return "ProjectOrbit";
}

export const sceneFor = (page: PageKey): VisualName => PAGE_SCENES[page] ?? "ProjectOrbit";
export const stripFor = (page: PageKey): [VisualName, VisualName] => PAGE_STRIP[page] ?? ["ProjectOrbit", "ServiceConstellation"];
