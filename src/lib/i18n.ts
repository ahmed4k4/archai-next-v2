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
export const safeUrl = (u?: string | null): string => (/^https?:\/\//i.test(u || "") ? u! : "#");
