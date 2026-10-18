import type { Metadata } from "next";
import { SITE_URL } from "./supabase";
import type { Locale } from "./types";
import { getSiteSettings } from "./data";

type SeoOptions = {
  title?: string;
  description?: string;
  keywords?: string[];
  images?: string[];
  type?: "website" | "article";
  locale?: string;
  noindex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
};

export async function pageSeo(
  lang: Locale,
  path: string,
  title: string,
  description: string,
  options: SeoOptions = {}
): Promise<Metadata> {
  const settings = await getSiteSettings();
  const settingsRoot = (settings || {}) as Record<string, unknown>;
  const configuredCompany = typeof settingsRoot.company_name === "string" ? settingsRoot.company_name.trim() : "";
  const brand = configuredCompany || (lang === "ar" ? "أركاي للأنظمة المتكاملة" : "Archai Integrated Systems");
  const cleanPath = path.replace(/^\/+|\/+$/g, "");
  const urlPath = cleanPath ? `/${cleanPath}` : "";
  const canonical = `${SITE_URL}/${lang}${urlPath}`;
  const normalizedTitle = title.trim();
  const lowerTitle = normalizedTitle.toLocaleLowerCase();
  const lowerBrand = brand.toLocaleLowerCase();
  const fullTitle = lowerTitle.includes("archai") || lowerTitle.includes(lowerBrand)
    ? normalizedTitle
    : `${normalizedTitle} | ${brand}`;

  // Only emit supplied images when at least one is usable; empty project galleries
  // should fall back to the generated locale image rather than producing empty OG tags.
  const configuredFallback = typeof settingsRoot.default_seo_image === "string" ? settingsRoot.default_seo_image.trim() : "";
  const fallbackImage = configuredFallback
    ? configuredFallback.startsWith("/") && !configuredFallback.startsWith("//")
      ? `${SITE_URL}${configuredFallback}`
      : /^https:\/\//i.test(configuredFallback) ? configuredFallback : `${SITE_URL}/${lang}/opengraph-image`
    : `${SITE_URL}/${lang}/opengraph-image`;
  const suppliedImages = (options.images || []).flatMap((image) => {
    if (typeof image !== "string" || !image.trim()) return [];
    const clean = image.trim();
    if (clean.startsWith("/") && !clean.startsWith("//")) return [`${SITE_URL}${clean}`];
    return /^https?:\/\//i.test(clean) ? [clean] : [];
  });
  const ogImages = suppliedImages.length ? suppliedImages : [fallbackImage];

  // Leave the page title unbranded here: the locale layout's title template
  // appends the brand exactly once to document titles. Open Graph uses fullTitle below.
  return {
    title,
    description,
    keywords: options.keywords,
    authors: [{ name: brand, url: SITE_URL }],
    creator: brand,
    publisher: brand,
    alternates: {
      canonical,
      languages: {
        ar: `${SITE_URL}/ar${urlPath}`,
        en: `${SITE_URL}/en${urlPath}`,
        "x-default": `${SITE_URL}/en${urlPath}`,
      },
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonical,
      siteName: brand,
      type: options.type || "website",
      locale: options.locale || (lang === "ar" ? "ar_EG" : "en_US"),
      alternateLocale: lang === "ar" ? "en_US" : "ar_EG",
      images: ogImages.map((url) => ({
        url,
        width: 1200,
        height: 630,
        alt: title,
      })),
      ...(options.publishedTime && { publishedTime: options.publishedTime }),
      ...(options.modifiedTime && { modifiedTime: options.modifiedTime }),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: ogImages,
    },
    robots: options.noindex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  };
}