import type { MetadataRoute } from "next";
import { getHome } from "../lib/data";
import { LOCALES } from "../lib/i18n";
import { SITE_URL } from "../lib/supabase";

const STATIC_PAGES = ["services", "industries", "about", "process", "insights", "case-studies", "careers", "faq", "contact"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { cats, projects } = await getHome();
  return LOCALES.flatMap((lang) => [
    { url: `${SITE_URL}/${lang}`, priority: 1, changeFrequency: "weekly" as const, alternates: { languages: { ar: `${SITE_URL}/ar`, en: `${SITE_URL}/en`, "x-default": `${SITE_URL}/en` } } },
    ...STATIC_PAGES.map((page) => ({
      url: `${SITE_URL}/${lang}/${page}`,
      priority: ["services", "industries", "contact"].includes(page) ? 0.85 : 0.7,
      changeFrequency: "monthly" as const,
      alternates: { languages: { ar: `${SITE_URL}/ar/${page}`, en: `${SITE_URL}/en/${page}`, "x-default": `${SITE_URL}/en/${page}` } },
    })),
    ...cats.map((category) => ({
      url: `${SITE_URL}/${lang}/categories/${category.slug}`,
      priority: 0.8,
      changeFrequency: "weekly" as const,
      alternates: { languages: { ar: `${SITE_URL}/ar/categories/${category.slug}`, en: `${SITE_URL}/en/categories/${category.slug}`, "x-default": `${SITE_URL}/en/categories/${category.slug}` } },
    })),
    ...projects.map((project) => ({
      url: `${SITE_URL}/${lang}/projects/${project.id}`,
      priority: project.featured ? 0.8 : 0.65,
      changeFrequency: "monthly" as const,
      alternates: { languages: { ar: `${SITE_URL}/ar/projects/${project.id}`, en: `${SITE_URL}/en/projects/${project.id}`, "x-default": `${SITE_URL}/en/projects/${project.id}` } },
    })),
  ]);
}
