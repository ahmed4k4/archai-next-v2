import { unstable_cache } from "next/cache";
import type { Locale } from "./types";
import { configured, sbServer } from "./supabase";

export type SitePageContent = {
  id?: string;
  page_key: string;
  locale: Locale;
  eyebrow?: string | null;
  title?: string | null;
  accent?: string | null;
  description?: string | null;
  primary_label?: string | null;
  primary_href?: string | null;
  secondary_label?: string | null;
  secondary_href?: string | null;
  outro_title?: string | null;
  outro_text?: string | null;
  cards?: unknown;
  sections?: Record<string, unknown> | null;
  seo_title?: string | null;
  seo_description?: string | null;
  is_published?: boolean;
  updated_at?: string;
};

const readPageContent = unstable_cache(
  async (pageKey: string, locale: Locale): Promise<SitePageContent | null> => {
    const { data, error } = await sbServer()
      .from("site_page_content")
      .select("*")
      .eq("page_key", pageKey)
      .eq("locale", locale)
      .eq("is_published", true)
      .maybeSingle();

    if (error) throw error;
    return (data as SitePageContent | null) ?? null;
  },
  ["site-page-content-v2"],
  { revalidate: 300, tags: ["content"] },
);

/** CMS records are published backend data; unavailable CMS tables never take down the public site. */
const reportedContentErrors = new Set<string>();

async function withContentDeadline<T>(promise: Promise<T>, timeoutMs = 1_100): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`CMS page content timed out after ${timeoutMs}ms`)), timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function getPageContent(pageKey: string, locale: Locale): Promise<SitePageContent | null> {
  if (!configured || !/^[a-z0-9-]{1,80}$/i.test(pageKey)) return null;
  try {
    // Page-copy content is optional: the localized source copy is always a fast fallback.
    return await withContentDeadline(readPageContent(pageKey, locale));
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    const key = `${pageKey}/${locale}`;
    if (!reportedContentErrors.has(key)) {
      reportedContentErrors.add(key);
      console.warn(`[content] Could not load ${pageKey}/${locale} from CMS:`, detail);
    }
    return null;
  }
}

function safeContentHref(value: string, fallback: unknown): string {
  const clean = value.trim();
  if (clean.startsWith("#") && /^#[A-Za-z][A-Za-z0-9_.:-]{0,120}$/.test(clean)) return clean;
  if (clean.startsWith("/") && !clean.startsWith("//") && !clean.includes("\\") && !/^\/(?:%2f|%5c)/i.test(clean)) return clean;
  try {
    const parsed = new URL(clean);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") return parsed.toString();
  } catch {}
  return typeof fallback === "string" ? fallback : "";
}

/** Merge translated CMS fields onto existing page structure while preserving safe defaults. */
export async function getEditablePageCopy<T extends Record<string, any>>(
  locale: Locale,
  pageKey: string,
  fallback: T,
): Promise<T & Record<string, any>> {
  const cms = await getPageContent(pageKey, locale);
  if (!cms) return fallback;

  const merged: Record<string, any> = { ...fallback };
  const fieldMap: Array<[string, keyof SitePageContent]> = [
    ["eyebrow", "eyebrow"],
    ["title", "title"],
    ["accent", "accent"],
    ["description", "description"],
    ["outroTitle", "outro_title"],
    ["outroText", "outro_text"],
    ["primary", "primary_label"],
    ["primaryHref", "primary_href"],
    ["secondary", "secondary_label"],
    ["secondaryHref", "secondary_href"],
    // Keep SEO CMS fields distinct from visible heading and description copy.
    ["seoTitle", "seo_title"],
    ["seoDescription", "seo_description"],
  ];
  for (const [target, source] of fieldMap) {
    const value = cms[source];
    if (typeof value === "string" && value.trim()) {
      merged[target] = target.endsWith("Href")
        ? safeContentHref(value, fallback[target])
        : value.trim();
    }
  }

  if (Array.isArray(cms.cards)) {
    const safeCards = cms.cards.filter((item): item is Record<string, unknown> =>
      Boolean(item && typeof item === "object" && !Array.isArray(item)
        && typeof (item as Record<string, unknown>).title === "string"
        && typeof (item as Record<string, unknown>).body === "string")
    ).slice(0, 40).map((card) => ({
      ...card,
      number: typeof card.number === "string" ? card.number.slice(0, 40) : "",
      icon: typeof card.icon === "string" ? card.icon.slice(0, 24) : "◇",
      title: String(card.title).slice(0, 240),
      body: String(card.body).slice(0, 4000),
      tags: Array.isArray(card.tags) ? card.tags.filter((tag): tag is string => typeof tag === "string").slice(0, 12).map((tag) => tag.slice(0, 60)) : [],
    }));
    if (safeCards.length || cms.cards.length === 0) merged.cards = safeCards;
  }
  if (cms.sections && typeof cms.sections === "object" && !Array.isArray(cms.sections)) {
    const sections = cms.sections as Record<string, unknown>;
    merged.sections = sections;

    // Keep the structured CMS fields authoritative. A typo or stale JSON key such as
    // { "title": { ... } } must never replace a string rendered by a page heading.
    const reserved = new Set([
      "eyebrow", "title", "accent", "description", "outroTitle", "outroText",
      "primary", "primaryHref", "secondary", "secondaryHref", "cards", "sections",
      "seoTitle", "seoDescription",
    ]);

    for (const [key, value] of Object.entries(sections)) {
      if (reserved.has(key) || value === null || value === undefined) continue;

      const expected = fallback[key];
      if (typeof expected === "string" && typeof value !== "string") continue;
      if (Array.isArray(expected) && !Array.isArray(value)) continue;
      if (expected && typeof expected === "object" && !Array.isArray(expected)) {
        if (!value || typeof value !== "object" || Array.isArray(value)) continue;
      }

      if (typeof value === "string") {
        const clean = value.trim();
        if (clean) merged[key] = clean.slice(0, 12000);
      } else if (Array.isArray(value)) {
        // JSONB is already parsed by Supabase; keep arrays bounded for predictable UI cost.
        if (value.length <= 150) merged[key] = value;
      } else if (typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype) {
        merged[key] = value;
      }
    }
  }
  if (typeof cms.seo_title === "string" && cms.seo_title.trim()) merged.seoTitle = cms.seo_title.trim();
  if (typeof cms.seo_description === "string" && cms.seo_description.trim()) merged.seoDescription = cms.seo_description.trim();
  return merged as T & Record<string, any>;
}
