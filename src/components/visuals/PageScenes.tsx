import type { VisualName } from "./DynamicVisual";

/** A page key shared by the scene map and the backdrop system. */
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

/**
 * Each page gets a scene that reflects its own content:
 * services → connected service graph, about → team helix,
 * process → stage workflow, contact → signal beacon, etc.
 */
export const PAGE_SCENES: Record<PageKey, VisualName> = {
  home: "HeroCore",
  services: "ServiceConstellation",
  industries: "IndustryRings",
  about: "DNAHelix",
  process: "WorkflowGraph",
  insights: "KnowledgeFragments",
  contact: "SignalBeacon",
  "case-studies": "SuccessMetrics",
  careers: "TeamOrbit",
  faq: "QABubbles",
  project: "KnowledgeFragments",
  category: "ServiceConstellation",
};

/**
 * A secondary scene for each page's mid-content strip, so the two scenes on
 * a page always differ while still belonging to the same topic family.
 */
export const PAGE_STRIP: Record<PageKey, [VisualName, VisualName]> = {
  home: ["ServiceConstellation", "SuccessMetrics"],
  services: ["WorkflowGraph", "SuccessMetrics"],
  industries: ["ServiceConstellation", "TeamOrbit"],
  about: ["TeamOrbit", "IndustryRings"],
  process: ["WorkflowGraph", "SuccessMetrics"],
  insights: ["DNAHelix", "KnowledgeFragments"],
  contact: ["SignalBeacon", "TeamOrbit"],
  "case-studies": ["SuccessMetrics", "WorkflowGraph"],
  careers: ["TeamOrbit", "DNAHelix"],
  faq: ["QABubbles", "SignalBeacon"],
  project: ["SuccessMetrics", "IndustryRings"],
  category: ["ServiceConstellation", "WorkflowGraph"],
};

export const sceneFor = (page: PageKey): VisualName =>
  PAGE_SCENES[page] ?? "HeroCore";
export const stripFor = (page: PageKey): [VisualName, VisualName] =>
  PAGE_STRIP[page] ?? ["ServiceConstellation", "WorkflowGraph"];
