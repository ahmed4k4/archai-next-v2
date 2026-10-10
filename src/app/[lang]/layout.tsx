import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/motion/ScrollProgress";
import CursorGlow from "@/components/motion/CursorGlow";
import LocaleSync from "@/components/LocaleSync";
import Tracker from "@/components/Tracker";
import { getHome } from "@/lib/data";
import { LOCALES, isLocale, pick } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import { SITE_URL } from "@/lib/supabase";
import {
  organizationSchema,
  websiteSchema,
  jsonLd,
} from "@/lib/structured-data";

export const revalidate = 60;

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: { lang: string };
}) {
  const { lang } = params;
  const { settings } = await getHome();

  const title =
    settings.site_title ||
    (lang === "ar"
      ? "الحلول البرمجية والذكاء الاصطناعي"
      : "Software, AI & Digital Product Engineering");

  const description =
    pick(settings, "home_desc", lang as Locale) ||
    (lang === "ar"
      ? "أركاي للحلول البرمجية: نبني المنتجات الرقمية ومنصات الويب وحلول الذكاء الاصطناعي والأنظمة المدمجة وإنترنت الأشياء."
      : "Archai Solutions designs and builds digital products, web platforms, AI-powered workflows, and embedded/IoT systems.");

  const localizedTitle =
    lang === "ar"
      ? `${title} | أركاي للحلول البرمجية`
      : `${title} | Archai Solutions`;

  const canonical = `${SITE_URL}/${lang}`;
  const keywords =
    lang === "ar"
      ? [
          "أركاي",
          "تطوير برمجيات",
          "تطبيقات ويب",
          "ذكاء اصطناعي",
          "أنظمة مدمجة",
          "إنترنت الأشياء",
          "شركة برمجة مصر",
        ]
      : [
          "Archai Solutions",
          "software development company",
          "web development",
          "AI integration",
          "digital product engineering",
          "embedded systems",
          "IoT solutions",
        ];

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: localizedTitle, template: "%s | Archai Solutions" },
    description,
    keywords,
    applicationName: "Archai Solutions",
    category: "technology",
    authors: [{ name: "Archai Solutions", url: SITE_URL }],
    creator: "Archai Solutions",
    publisher: "Archai Solutions",
    icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }] },
    alternates: {
      canonical,
      languages: {
        ar: `${SITE_URL}/ar`,
        en: `${SITE_URL}/en`,
        "x-default": `${SITE_URL}/en`,
      },
    },
    openGraph: {
      title: localizedTitle,
      description,
      url: canonical,
      siteName: "Archai Solutions",
      type: "website",
      locale: lang === "ar" ? "ar_EG" : "en_US",
      alternateLocale: lang === "ar" ? "en_US" : "ar_EG",
      images: settings.default_seo_image
        ? [
            {
              url: settings.default_seo_image,
              width: 1200,
              height: 630,
              alt: localizedTitle,
            },
          ]
        : [
            {
              url: `${SITE_URL}/${lang}/opengraph-image`,
              width: 1200,
              height: 630,
              alt: localizedTitle,
            },
          ],
    },
    twitter: {
      card: "summary_large_image",
      title: localizedTitle,
      description,
      images: [`${SITE_URL}/${lang}/opengraph-image`],
      creator: "@archaisolutions",
    },
    robots: {
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
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  const { lang } = params;
  if (!isLocale(lang)) notFound();
  const { cats, projects, settings } = await getHome();
  const withProjects = cats.filter((c) =>
    projects.some((p) => p.category_id === c.id)
  );

  return (
    <>
      {/* ============================================================
          Structured data — Organization + Website
          ============================================================ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(organizationSchema(lang, settings)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(websiteSchema(lang)) }}
      />

      {/* ============================================================
          Global layers — each page renders its own WebGL Backdrop.
          ============================================================ */}
      <LocaleSync lang={lang} />
      <ScrollProgress />
      <CursorGlow />
      <Tracker />

      <Header lang={lang} cats={withProjects} />

      <main className="relative pt-[76px]">{children}</main>

      <Footer lang={lang} cats={withProjects} />
    </>
  );
}