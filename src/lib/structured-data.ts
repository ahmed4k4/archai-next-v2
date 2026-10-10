import { SITE_URL } from "./supabase";
import type { Locale, Project, Category, SiteSettings } from "./types";
import { pick } from "./i18n";

const LOCALE_MAP: Record<Locale, string> = {
  ar: "ar-EG",
  en: "en-US",
};

/* ============================================================
   ORGANIZATION — Root organization schema
   ============================================================ */
export function organizationSchema(lang: Locale, settings?: SiteSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: settings?.company_name || "Archai Solutions",
    alternateName: lang === "ar" ? "أركاي للحلول البرمجية" : "Archai Integrated Systems",
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/assets/logo.png`,
      width: 512,
      height: 512,
    },
    image: `${SITE_URL}/opengraph-image`,
    description:
      lang === "ar"
        ? "أركاي للحلول البرمجية: تطوير المنتجات الرقمية ومنصات الويب وتكامل الذكاء الاصطناعي والأنظمة المدمجة وإنترنت الأشياء."
        : "Archai Solutions designs and builds digital products, web platforms, AI-powered workflows, and embedded/IoT systems.",
    ...(settings?.contact_email ? { email: String(settings.contact_email) } : {}),
    ...(settings?.address_city || settings?.address_country ? {
      address: {
        "@type": "PostalAddress",
        ...(settings.address_city ? { addressLocality: String(settings.address_city) } : {}),
        ...(settings.address_country ? { addressCountry: String(settings.address_country) } : {}),
      },
    } : {}),
    areaServed: [
      { "@type": "Country", name: "Egypt" },
      { "@type": "Place", name: "Middle East" },
      { "@type": "Place", name: "Worldwide" },
    ],
    knowsAbout: [
      "Software Development",
      "Web Applications",
      "AI Integration",
      "Embedded Systems",
      "Internet of Things",
      "Digital Product Engineering",
      "SaaS Platforms",
      "Mobile Applications",
      "Cloud Architecture",
    ],
    sameAs: [
      settings?.linkedin_url,
      settings?.facebook_url,
      settings?.instagram_url,
      settings?.github_url,
      settings?.twitter_url,
    ].filter((value): value is string => typeof value === "string" && value.length > 0),
  };
}

/* ============================================================
   WEBSITE — Root website schema with SearchAction
   ============================================================ */
export function websiteSchema(lang: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: `${SITE_URL}/${lang}`,
    name: "Archai Solutions",
    inLanguage: LOCALE_MAP[lang],
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/${lang}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/* ============================================================
   BREADCRUMB
   ============================================================ */
export function breadcrumbSchema(
  lang: Locale,
  items: { name: string; url?: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.url ? { item: item.url } : {}),
    })),
  };
}

/* ============================================================
   CREATIVE WORK — Project schema
   ============================================================ */
export function projectSchema(
  lang: Locale,
  project: Project,
  categoryName?: string
) {
  const title = pick(project, "title", lang);
  const summary = pick(project, "summary", lang);
  const description = pick(project, "description", lang) || summary;
  const url = `${SITE_URL}/${lang}/projects/${project.id}`;
  const images = [
    project.cover_image,
    project.featured_image,
    project.hero_image,
  ].filter(Boolean) as string[];

  return {
    "@context": "https://schema.org",
    "@type": ["CreativeWork", "SoftwareApplication"],
    "@id": `${url}/#creativework`,
    name: title,
    description,
    url,
    inLanguage: LOCALE_MAP[lang],
    ...(images.length > 0 && {
      image: images.map((url) => ({
        "@type": "ImageObject",
        url,
      })),
    }),
    ...(project.live_url && { sameAs: [project.live_url] }),
    ...(categoryName && { genre: categoryName }),
    ...(project.project_technologies?.length && {
      keywords: project.project_technologies.map((t) => t.technology).join(", "),
    }),
    ...(project.project_industries?.length && {
      about: project.project_industries.map((i) => ({
        "@type": "Thing",
        name: i.industry,
      })),
    }),
    creator: { "@id": `${SITE_URL}/#organization` },
    datePublished: (project as any).created_at,
    dateModified: (project as any).updated_at,
  };
}

/* ============================================================
   SERVICE / OFFER CATALOG
   ============================================================ */
export function servicesSchema(
  lang: Locale,
  services: { name: string; description: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    "@id": `${SITE_URL}/${lang}/services/#offercatalog`,
    name: lang === "ar" ? "خدمات أركاي" : "Archai Services",
    itemListElement: services.map((s, i) => ({
      "@type": "Offer",
      position: i + 1,
      itemOffered: {
        "@type": "Service",
        name: s.name,
        description: s.description,
        provider: { "@id": `${SITE_URL}/#organization` },
        areaServed: { "@type": "Place", name: "Worldwide" },
      },
    })),
  };
}

/* ============================================================
   FAQ PAGE
   ============================================================ */
export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

/* ============================================================
   HOW-TO (for /process page)
   ============================================================ */
export function howToSchema(
  lang: Locale,
  name: string,
  description: string,
  steps: { name: string; text: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    inLanguage: LOCALE_MAP[lang],
    step: steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

/* ============================================================
   COLLECTION PAGE — Category listing
   ============================================================ */
export function collectionPageSchema(
  lang: Locale,
  name: string,
  description: string,
  url: string,
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url,
    inLanguage: LOCALE_MAP[lang],
    isPartOf: { "@id": `${SITE_URL}/#website` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: item.name,
        url: item.url,
      })),
    },
  };
}

/* ============================================================
   JSON-LD SCRIPT HELPER — safe injection
   ============================================================ */
export function jsonLd(data: object | object[]): string {
  return JSON.stringify(data).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");
}