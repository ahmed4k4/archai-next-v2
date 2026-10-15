export type SiteNavigationItem = {
  /** A known internal route segment; never an arbitrary external URL. */
  href: string;
  labelAr: string;
  labelEn: string;
  enabled?: boolean;
};

export const DEFAULT_SITE_NAVIGATION: SiteNavigationItem[] = [
  { href: "about", labelAr: "عن الشركة", labelEn: "About" },
  { href: "services", labelAr: "الخدمات", labelEn: "Services" },
  { href: "projects", labelAr: "المشروعات", labelEn: "Projects" },
  { href: "industries", labelAr: "الصناعات", labelEn: "Industries" },
  { href: "process", labelAr: "منهجية العمل", labelEn: "Our process" },
  { href: "insights", labelAr: "الرؤى والمقالات", labelEn: "Insights" },
  { href: "case-studies", labelAr: "دراسات الحالة", labelEn: "Case studies" },
  { href: "careers", labelAr: "الوظائف", labelEn: "Careers" },
  { href: "faq", labelAr: "الأسئلة الشائعة", labelEn: "FAQ" },
  { href: "contact", labelAr: "تواصل معنا", labelEn: "Contact" },
];

const ALLOWED_ROUTES = new Set(DEFAULT_SITE_NAVIGATION.map((item) => item.href));

/**
 * Parse navigation safely from the CMS. Navigation may reorder, relabel, or
 * hide known internal pages, but it cannot inject arbitrary external URLs.
 * Missing/unmigrated settings fall back to the site defaults.
 */
export function resolveSiteNavigation(value: unknown): SiteNavigationItem[] {
  if (!Array.isArray(value)) return DEFAULT_SITE_NAVIGATION.map((item) => ({ ...item }));

  const seen = new Set<string>();
  const resolved = value.flatMap((entry): SiteNavigationItem[] => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return [];
    const row = entry as Record<string, unknown>;
    const href = typeof row.href === "string" ? row.href.trim().replace(/^\/+|\/+$/g, "") : "";
    if (!ALLOWED_ROUTES.has(href) || seen.has(href) || row.enabled === false) return [];
    seen.add(href);

    const base = DEFAULT_SITE_NAVIGATION.find((item) => item.href === href)!;
    const labelAr = typeof row.labelAr === "string" && row.labelAr.trim() ? row.labelAr.trim().slice(0, 80) : base.labelAr;
    const labelEn = typeof row.labelEn === "string" && row.labelEn.trim() ? row.labelEn.trim().slice(0, 80) : base.labelEn;
    return [{ href, labelAr, labelEn }];
  });
  // An empty or malformed menu must never strand visitors without site navigation.
  return resolved.length ? resolved : DEFAULT_SITE_NAVIGATION.map((item) => ({ ...item }));
}
