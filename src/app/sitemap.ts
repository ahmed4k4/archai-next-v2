import type { MetadataRoute } from "next";
import { getHome } from "@/lib/data";
import { LOCALES } from "@/lib/i18n";
import { SITE_URL } from "@/lib/supabase";

const STATIC_PAGES = [
  { path: "services", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "industries", priority: 0.85, changeFrequency: "monthly" as const },
  { path: "about", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "process", priority: 0.75, changeFrequency: "monthly" as const },
  { path: "insights", priority: 0.7, changeFrequency: "weekly" as const },
  { path: "case-studies", priority: 0.75, changeFrequency: "monthly" as const },
  { path: "careers", priority: 0.65, changeFrequency: "monthly" as const },
  { path: "faq", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "contact", priority: 0.85, changeFrequency: "monthly" as const },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { cats, projects } = await getHome();
  const now = new Date();

  return LOCALES.flatMap((lang) => {
    const urls: MetadataRoute.Sitemap = [];

    /* Home */
    urls.push({
      url: `${SITE_URL}/${lang}`,
      lastModified: now,
      priority: 1,
      changeFrequency: "weekly",
      alternates: {
        languages: {
          ar: `${SITE_URL}/ar`,
          en: `${SITE_URL}/en`,
          "x-default": `${SITE_URL}/en`,
        },
      },
    });

    /* Static pages */
    STATIC_PAGES.forEach((page) => {
      urls.push({
        url: `${SITE_URL}/${lang}/${page.path}`,
        lastModified: now,
        priority: page.priority,
        changeFrequency: page.changeFrequency,
        alternates: {
          languages: {
            ar: `${SITE_URL}/ar/${page.path}`,
            en: `${SITE_URL}/en/${page.path}`,
            "x-default": `${SITE_URL}/en/${page.path}`,
          },
        },
      });
    });

    /* Categories */
    cats.forEach((cat) => {
      urls.push({
        url: `${SITE_URL}/${lang}/categories/${cat.slug}`,
        lastModified: now,
        priority: 0.8,
        changeFrequency: "weekly",
        alternates: {
          languages: {
            ar: `${SITE_URL}/ar/categories/${cat.slug}`,
            en: `${SITE_URL}/en/categories/${cat.slug}`,
            "x-default": `${SITE_URL}/en/categories/${cat.slug}`,
          },
        },
      });
    });

    /* Projects — with images */
    projects.forEach((p) => {
      const images = [
        p.cover_image,
        p.featured_image,
        p.hero_image,
        ...(p.project_images?.map((img) => img.public_url) || []),
      ].filter(Boolean) as string[];

      urls.push({
        url: `${SITE_URL}/${lang}/projects/${p.id}`,
        lastModified: p.updated_at || p.created_at || now,
        priority: p.featured ? 0.85 : 0.7,
        changeFrequency: "monthly",
        ...(images.length > 0 && { images: Array.from(new Set(images)) }),
        alternates: {
          languages: {
            ar: `${SITE_URL}/ar/projects/${p.id}`,
            en: `${SITE_URL}/en/projects/${p.id}`,
            "x-default": `${SITE_URL}/en/projects/${p.id}`,
          },
        },
      });
    });

    return urls;
  });
}