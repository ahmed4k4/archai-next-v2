import type { Metadata } from "next";
import { SITE_URL } from "./supabase";
import type { Locale } from "./types";

export function pageSeo(lang: Locale, path: string, title: string, description: string): Metadata {
  const canonical = `${SITE_URL}/${lang}${path ? `/${path.replace(/^\/+|\/+$/g, "")}` : ""}`;
  const alternatePath = path ? `/${path.replace(/^\/+|\/+$/g, "")}` : "";
  const fullTitle = `${title} | Archai Solutions`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ar: `${SITE_URL}/ar${alternatePath}`,
        en: `${SITE_URL}/en${alternatePath}`,
        "x-default": `${SITE_URL}/en${alternatePath}`,
      },
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonical,
      siteName: "Archai Solutions",
      type: "website",
      locale: lang === "ar" ? "ar_EG" : "en_US",
    },
    twitter: { card: "summary_large_image", title: fullTitle, description },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  };
}
