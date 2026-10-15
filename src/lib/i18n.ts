import dict from "./dict.json";
import type { Locale } from "./types";

export const LOCALES: Locale[] = ["ar", "en"];
export const isLocale = (l: string): l is Locale => LOCALES.includes(l as Locale);
export const dirOf = (l: Locale): "rtl" | "ltr" => (l === "ar" ? "rtl" : "ltr");

const extra = {
  ar: {
    categories: "الأقسام",
    browseCats: "تصفح حسب القسم",
    browseSub: "كل قسم له صفحته الخاصة بمشاريعه",
    projectsWord: "مشروع",
    viewAll: "عرض الكل",
    allInCat: "كل مشاريع القسم",
    otherCats: "أقسام أخرى",
    topInCat: "أبرز مشاريع القسم",
    filterTech: "كل التقنيات",
    setupTitle: "الموقع يحتاج إعداد Supabase",
    setupBody: "أضف NEXT_PUBLIC_SUPABASE_URL و NEXT_PUBLIC_SUPABASE_ANON_KEY في ملف .env.local ثم أعد التشغيل.",
    nfTitle: "الصفحة غير موجودة",
  },
  en: {
    categories: "Categories",
    browseCats: "Browse by category",
    browseSub: "Every category has its own page of projects",
    projectsWord: "projects",
    viewAll: "View all",
    allInCat: "All projects in this category",
    otherCats: "Other categories",
    topInCat: "Top projects in this category",
    filterTech: "All technologies",
    setupTitle: "Supabase setup required",
    setupBody: "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local, then restart.",
    nfTitle: "Page not found",
  },
};

export const tr = (lang: Locale) => (k: string): string => (extra[lang] as Record<string, string>)?.[k] ?? (dict[lang] as Record<string, string>)?.[k] ?? dict.en[k as keyof typeof dict.en] ?? k;
export const pick = (o: Record<string, any> | null | undefined, f: string, lang: Locale): string => o?.[`${f}_${lang}`] || o?.[`${f}_en`] || o?.[`${f}_ar`] || "";
export const safeUrl = (u?: string | null): string | undefined => {
  const value = u?.trim();
  if (!value || !/^https?:\/\//i.test(value)) return undefined;

  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:"
      ? parsed.href
      : undefined;
  } catch {
    return undefined;
  }
};

/**
 * Resolve the best display image for a project, regardless of where the
 * artwork lives (dedicated columns OR the project_images relation).
 * Order: thumb → cover → featured → hero → relation (cover role first).
 */
export const projectCover = (p: any): string =>
  p?.cover_thumb ||
  p?.cover_image ||
  p?.featured_image ||
  p?.hero_image ||
  p?.project_images?.[0]?.public_url ||
  "";

/** Ordered image list for galleries — cover/hero first, then by sort_order. */
export const projectImages = (p: any): { public_url: string; alt_en?: string | null; alt_ar?: string | null }[] => {
  const rel = Array.isArray(p?.project_images)
    ? [...p.project_images].sort((a: any, b: any) => {
        const rank = (r?: string) => (r === "cover" ? 0 : r === "hero" ? 1 : r === "featured" ? 2 : 3);
        return rank(a?.role) - rank(b?.role) || (a?.sort_order ?? 0) - (b?.sort_order ?? 0);
      })
    : [];
  if (rel.length) return rel;
  const single = p?.cover_image || p?.featured_image || p?.hero_image;
  return single ? [{ public_url: single }] : [];
};
