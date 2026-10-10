import type { Metadata } from "next";
import { SITE_URL } from "./supabase";
import type { Locale } from "./types";

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

export function pageSeo(
  lang: Locale,
  path: string,
  title: string,
  description: string,
  options: SeoOptions = {}
): Metadata {
  const cleanPath = path.replace(/^\/+|\/+$/g, "");
  const urlPath = cleanPath ? `/${cleanPath}` : "";
  const canonical = `${SITE_URL}/${lang}${urlPath}`;
  const fullTitle = title.includes("Archai") ? title : `${title} | Archai Solutions`;

  const ogImage =
    options.images?.[0] || `${SITE_URL}/${lang}${urlPath}/opengraph-image`;
  const ogImages = options.images || [ogImage];

  return {
    title,
    description,
    keywords: options.keywords,
    authors: [{ name: "Archai Solutions", url: SITE_URL }],
    creator: "Archai Solutions",
    publisher: "Archai Solutions",
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
      siteName: "Archai Solutions",
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
      creator: "@archaisolutions",
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